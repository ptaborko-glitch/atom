#!/usr/bin/env node

import fs from 'fs';
import { execSync } from 'child_process';

class AtomCompiler {
    constructor() {
        this.runtime = null;
        this.lexer = null;
        this.memory = null;
        this.view = null;
        this.tokens = [];
        this.pos = 0;
        this.variables = new Map();
        this.varCounter = 0;
        this.stringStorage = new Map();
        this.nextStringPtr = 200000;
    }

    async init() {
        // Загружаем runtime
        const runtimeWasm = fs.readFileSync('./runtime.wasm');
        const runtimeModule = await WebAssembly.compile(runtimeWasm);
        const runtimeInstance = await WebAssembly.instantiate(runtimeModule, {});
        this.runtime = runtimeInstance;
        this.memory = this.runtime.exports.memory;
        this.view = new Uint8Array(this.memory.buffer);

        // Загружаем лексер
        const lexerWasm = fs.readFileSync('./output.wasm');
        const lexerModule = await WebAssembly.compile(lexerWasm);
        
        const imports = {
            runtime: {
                string_char_code_at: (ptr, index) => this.stringCharCodeAt(ptr, index),
                string_len: (ptr) => this.stringLen(ptr),
                string_substring: (ptr, start, length) => this.stringSubstring(ptr, start, length),
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
        this.lexer.TOKEN_LPAREN.value = 14;
        this.lexer.TOKEN_RPAREN.value = 15;

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

    stringCharCodeAt(ptr, index) {
        const len = this.view[ptr];
        if (index >= len) return -1;
        return this.view[ptr + 4 + index];
    }

    stringLen(ptr) {
        return this.view[ptr];
    }

    stringSubstring(ptr, start, length) {
        // Сохраняем строку в наше хранилище
        const chars = [];
        for (let i = 0; i < length; i++) {
            chars.push(String.fromCharCode(this.view[ptr + 4 + start + i]));
        }
        const str = chars.join('');
        
        // Сохраняем во внутреннее хранилище
        const newPtr = this.nextStringPtr++;
        this.stringStorage.set(newPtr, str);
        
        // Также записываем в память для совместимости
        this.view[newPtr] = length;
        for (let i = 0; i < length; i++) {
            this.view[newPtr + 4 + i] = this.view[ptr + 4 + start + i];
        }
        
        return newPtr;
    }

    readString(ptr) {
        if (ptr === 0) return '';
        // Сначала проверяем внутреннее хранилище
        if (this.stringStorage.has(ptr)) {
            return this.stringStorage.get(ptr);
        }
        // Иначе читаем из памяти
        const len = this.view[ptr];
        if (len === 0 || len > 1000) return '';
        const chars = [];
        for (let i = 0; i < len; i++) {
            chars.push(String.fromCharCode(this.view[ptr + 4 + i]));
        }
        return chars.join('');
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
        
        this.tokens = [];
        this.stringStorage.clear();
        this.nextStringPtr = 200000;
        
        for (let i = 0; i < 1000; i++) {
            const token = this.lexer.lexer_next_token();
            const value = this.lexer.lexer_token_value.value;
            if (token === -1) break;
            
            let name = null;
            if (token === 1) {
                name = this.readString(value);
                console.log(`  IDENT: ptr=${value}, name="${name}"`);
            }
            this.tokens.push({ token, value, name });
        }
        
        this.pos = 0;
        this.variables.clear();
        this.varCounter = 0;
        
        // Собираем имена переменных
        for (const t of this.tokens) {
            if (t.token === 1 && t.name && !this.variables.has(t.name)) {
                this.variables.set(t.name, `var${this.varCounter++}`);
            }
        }
        
        console.log('Variables:', Object.fromEntries(this.variables));
        
        const statements = this.parseProgram();
        return this.generateWAT(statements);
    }

    parseProgram() {
        const statements = [];
        while (this.pos < this.tokens.length) {
            while (this.tokens[this.pos] && this.tokens[this.pos].token === 22) {
                this.pos++;
            }
            if (this.pos >= this.tokens.length) break;
            
            const stmt = this.parseAssignment();
            if (stmt) statements.push(stmt);
            else break;
        }
        return statements;
    }

    parseAssignment() {
        const t = this.tokens[this.pos];
        if (t.token === 1 && t.name) {
            const name = this.variables.get(t.name);
            this.pos++;
            if (this.tokens[this.pos] && this.tokens[this.pos].token === 7) {
                this.pos++;
                const value = this.parseExpression();
                return { type: 'assign', name, value };
            }
        }
        return null;
    }

    parseExpression() {
        return this.parseAddition();
    }

    parseAddition() {
        let left = this.parseMultiplication();
        while (this.pos < this.tokens.length) {
            const t = this.tokens[this.pos];
            if (t.token === 2) {
                this.pos++;
                const right = this.parseMultiplication();
                left = { type: 'binary', op: '+', left, right };
            } else if (t.token === 3) {
                this.pos++;
                const right = this.parseMultiplication();
                left = { type: 'binary', op: '-', left, right };
            } else {
                break;
            }
        }
        return left;
    }

    parseMultiplication() {
        let left = this.parsePrimary();
        while (this.pos < this.tokens.length) {
            const t = this.tokens[this.pos];
            if (t.token === 4) {
                this.pos++;
                const right = this.parsePrimary();
                left = { type: 'binary', op: '*', left, right };
            } else if (t.token === 5) {
                this.pos++;
                const right = this.parsePrimary();
                left = { type: 'binary', op: '/', left, right };
            } else {
                break;
            }
        }
        return left;
    }

    parsePrimary() {
        const t = this.tokens[this.pos];
        if (t.token === 0) {
            this.pos++;
            return { type: 'number', value: t.value };
        }
        if (t.token === 1 && t.name) {
            const name = this.variables.get(t.name);
            this.pos++;
            return { type: 'ident', name };
        }
        if (t.token === 14) {
            this.pos++;
            const expr = this.parseExpression();
            if (this.tokens[this.pos] && this.tokens[this.pos].token === 15) {
                this.pos++;
            }
            return expr;
        }
        return { type: 'number', value: 0 };
    }

    generateExpression(expr) {
        if (expr.type === 'number') {
            return `f64.const ${expr.value}`;
        }
        if (expr.type === 'ident') {
            return `local.get $${expr.name}`;
        }
        if (expr.type === 'binary') {
            const left = this.generateExpression(expr.left);
            const right = this.generateExpression(expr.right);
            const opMap = { '+': 'f64.add', '-': 'f64.sub', '*': 'f64.mul', '/': 'f64.div' };
            return `${left}\n    ${right}\n    ${opMap[expr.op]}`;
        }
        return 'f64.const 0';
    }

    generateWAT(statements) {
        let wat = '(module\n';
        wat += '  (func $main (result f64)\n';
        
        for (let i = 0; i < this.varCounter; i++) {
            wat += `    (local $var${i} f64)\n`;
        }
        
        for (const stmt of statements) {
            const code = this.generateExpression(stmt.value);
            wat += `    ;; ${stmt.name} = ${stmt.value.type === 'number' ? stmt.value.value : 'expr'}\n`;
            wat += `    ${code}\n`;
            wat += `    local.set $${stmt.name}\n`;
        }
        
        if (statements.length > 0) {
            const last = statements[statements.length - 1];
            wat += `    local.get $${last.name}\n`;
        } else {
            wat += '    f64.const 0\n';
        }
        wat += '    return\n';
        wat += '  )\n';
        wat += '  (export "main" (func $main))\n';
        wat += ')';
        
        return wat;
    }
}

async function main() {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.error('Usage: node quality_compiler2.js <input.atom>');
        process.exit(1);
    }
    
    const inputFile = args[0];
    const source = fs.readFileSync(inputFile, 'utf8');
    console.log(`Compiling ${inputFile}...`);
    console.log(`Source:\n${source}\n`);
    
    const compiler = new AtomCompiler();
    await compiler.init();
    
    const wat = await compiler.compile(source);
    const outputFile = inputFile.replace('.atom', '.wat');
    fs.writeFileSync(outputFile, wat);
    console.log(`\n✅ Compiled to ${outputFile}`);
    console.log('\nWAT output:');
    console.log(wat);
}

main().catch(console.error);
