import fs from 'fs';

class VarCompiler {
    async init() {
        const runtimeWasm = fs.readFileSync('./runtime.wasm');
        const runtimeModule = await WebAssembly.compile(runtimeWasm);
        this.runtimeInstance = await WebAssembly.instantiate(runtimeModule, {});
        
        this.memory = this.runtimeInstance.exports.memory;
        this.view = new Uint8Array(this.memory.buffer);
        
        const lexerWasm = fs.readFileSync('./output_working.wasm');
        const lexerModule = await WebAssembly.compile(lexerWasm);
        
        const imports = {
            runtime: {
                string_char_code_at: (ptr, index) => {
                    const len = this.view[ptr];
                    if (index >= len) return -1;
                    return this.view[ptr + 4 + index];
                },
                string_len: (ptr) => this.view[ptr],
                string_substring: (ptr, start, length) => {
                    const newPtr = 200000;
                    this.view[newPtr] = length;
                    for (let i = 0; i < length; i++) {
                        this.view[newPtr + 4 + i] = this.view[ptr + 4 + start + i];
                    }
                    return newPtr;
                },
                tensor_create: () => 0, tensor_set: () => {}, tensor_get: () => 0,
                tensor_matmul: () => 0, tensor_add: () => 0, tensor_sub: () => 0,
                tensor_mul_scalar: () => {}, tensor_sigmoid: () => {}, tensor_relu: () => {},
                tensor_tanh: () => {}, tensor_get_element: () => 0, tensor_print: () => {},
                tensor_random: () => {}, tensor_get_rows: () => 0, tensor_get_cols: () => 0,
                agent_alloc: () => 0, mse: () => 0, cross_entropy: () => 0, softmax: () => {},
                sgd_step: () => {}, nn_dense: () => 0, load_csv: () => 0, save_csv: () => {},
                train_test_split: () => {}, sigmoid: (x) => 1/(1+Math.exp(-x)), 
                relu: (x) => Math.max(0, x), tanh: (x) => Math.tanh(x),
                random: () => Math.random() * 2 - 1, exp: (x) => Math.exp(x),
                log: (x) => Math.log(x), print_tensor: () => {}, list_create: () => 0,
                list_add: () => {}, list_get: () => 0, list_len: () => 0, string_create: () => 0,
                string_concat: () => 0, string_set_char: () => {}, string_from_char: () => 0
            }
        };
        
        const lexerInstance = await WebAssembly.instantiate(lexerModule, imports);
        this.lexer = lexerInstance.exports;
        this.initConstants();
        
        this.variables = new Map();
        this.varCounter = 0;
    }

    initConstants() {
        this.lexer.TOKEN_EOF.value = -1;
        this.lexer.TOKEN_NUMBER.value = 0;
        this.lexer.TOKEN_IDENT.value = 1;
        this.lexer.TOKEN_PLUS.value = 2;
        this.lexer.TOKEN_MINUS.value = 3;
        this.lexer.TOKEN_STAR.value = 4;
        this.lexer.TOKEN_SLASH.value = 5;
        this.lexer.TOKEN_ASSIGN.value = 7;
        this.lexer.TOKEN_NEWLINE.value = 22;

        this.lexer.CHAR_EOF.value = -1;
        this.lexer.CHAR_SPACE.value = 32;
        this.lexer.CHAR_NEWLINE.value = 10;
        this.lexer.CHAR_PLUS.value = 43;
        this.lexer.CHAR_MINUS.value = 45;
        this.lexer.CHAR_STAR.value = 42;
        this.lexer.CHAR_SLASH.value = 47;
        this.lexer.CHAR_ASSIGN.value = 61;
        this.lexer.CHAR_ZERO.value = 48;
        this.lexer.CHAR_NINE.value = 57;
        this.lexer.CHAR_A_LOWER.value = 97;
        this.lexer.CHAR_Z_LOWER.value = 122;
    }

    getVarName(ptr) {
        // Временно: используем ptr как имя
        if (!this.variables.has(ptr)) {
            this.variables.set(ptr, `var${this.varCounter++}`);
        }
        return this.variables.get(ptr);
    }

    async compile(source) {
        const strPtr = 65536;
        const len = source.length;
        
        this.view[strPtr] = len;
        for (let i = 0; i < len; i++) {
            this.view[strPtr + 4 + i] = source.charCodeAt(i);
        }
        
        this.lexer.lexer_source.value = strPtr;
        this.lexer.lexer_length.value = len;
        this.lexer.lexer_pos.value = 0;
        
        // Сбор токенов
        let tokens = [];
        for (let i = 0; i < 50; i++) {
            const token = this.lexer.lexer_next_token();
            const value = this.lexer.lexer_token_value.value;
            if (token === -1) break;
            tokens.push({ token, value });
            console.log(`  Токен ${i}: ${token}, ${value}`);
        }
        
        // Парсинг
        let pos = 0;
        let variables = new Map();
        let varCounter = 0;
        
        const getVarName = (ptr) => {
            if (!variables.has(ptr)) {
                variables.set(ptr, `var${varCounter++}`);
            }
            return variables.get(ptr);
        };
        
        const parsePrimary = () => {
            const t = tokens[pos];
            if (t.token === 0) { // NUMBER
                pos++;
                return { type: 'number', value: t.value };
            }
            if (t.token === 1) { // IDENT
                const name = getVarName(t.value);
                pos++;
                return { type: 'ident', name };
            }
            return { type: 'number', value: 0 };
        };
        
        const parseMultiplication = () => {
            let left = parsePrimary();
            while (pos < tokens.length && tokens[pos].token === 4) {
                pos++;
                const right = parsePrimary();
                left = { type: 'binary', op: '*', left, right };
            }
            return left;
        };
        
        const parseAddition = () => {
            let left = parseMultiplication();
            while (pos < tokens.length && tokens[pos].token === 2) {
                pos++;
                const right = parseMultiplication();
                left = { type: 'binary', op: '+', left, right };
            }
            return left;
        };
        
        const parseAssignment = () => {
            const t = tokens[pos];
            if (t.token === 1) { // IDENT
                const name = getVarName(t.value);
                pos++;
                if (tokens[pos] && tokens[pos].token === 7) { // ASSIGN
                    pos++;
                    const value = parseAddition();
                    return { type: 'assign', name, value };
                }
            }
            return null;
        };
        
        const stmt = parseAssignment();
        console.log('Statement:', stmt);
        
        // Генерация WAT
        let wat = '(module\n';
        
        // Объявляем глобальные переменные
        for (let i = 0; i < varCounter; i++) {
            wat += `  (global $var${i} (mut f64) (f64.const 0))\n`;
        }
        wat += '\n';
        
        wat += '  (func $main (result f64)\n';
        
        if (stmt && stmt.type === 'assign') {
            const value = this.evaluate(stmt.value);
            wat += `    ;; ${stmt.name} = ${value}\n`;
            wat += `    f64.const ${value}\n`;
            wat += `    global.set $${stmt.name}\n`;
            wat += `    global.get $${stmt.name}\n`;
        } else {
            wat += '    f64.const 0\n';
        }
        
        wat += '    return\n';
        wat += '  )\n';
        wat += '  (export "main" (func $main))\n';
        wat += ')';
        
        return wat;
    }

    evaluate(expr) {
        if (expr.type === 'number') return expr.value;
        if (expr.type === 'ident') return 0; // временно
        if (expr.type === 'binary') {
            const left = this.evaluate(expr.left);
            const right = this.evaluate(expr.right);
            if (expr.op === '+') return left + right;
            if (expr.op === '*') return left * right;
        }
        return 0;
    }
}

const compiler = new VarCompiler();
await compiler.init();
const wat = await compiler.compile('x = 42');
console.log('\n=== WAT ===');
console.log(wat);
