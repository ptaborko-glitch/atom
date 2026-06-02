import fs from 'fs';

console.log('1. Загрузка runtime.wasm...');
const runtimeWasm = fs.readFileSync('./runtime.wasm');
const runtimeModule = await WebAssembly.compile(runtimeWasm);
const runtimeInstance = await WebAssembly.instantiate(runtimeModule, {});
console.log('   OK');

const memory = runtimeInstance.exports.memory;
const view = new Uint8Array(memory.buffer);

const code = `x = 42
y = x + 1
z = y * 2`;
console.log('2. Код для компиляции:');
console.log(code);

const strPtr = 65536;
const len = code.length;

view[strPtr] = len;
for (let i = 0; i < len; i++) {
    view[strPtr + 4 + i] = code.charCodeAt(i);
}
console.log('   Строка записана в память');

console.log('3. Загрузка output.wasm...');
const outputWasm = fs.readFileSync('./output.wasm');
const outputModule = await WebAssembly.compile(outputWasm);
console.log('   Модуль скомпилирован');

const outputInstance = await WebAssembly.instantiate(outputModule, {
    runtime: {
        string_char_code_at: (ptr, index) => {
            const len2 = view[ptr];
            if (index >= len2) return -1;
            return view[ptr + 4 + index];
        },
        string_len: (ptr) => view[ptr],
        tensor_create: () => 0, tensor_set: () => {}, tensor_get: () => 0,
        tensor_matmul: () => 0, tensor_add: () => 0, tensor_sub: () => 0,
        tensor_mul_scalar: () => {}, tensor_sigmoid: () => {}, tensor_relu: () => {},
        tensor_tanh: () => {}, tensor_get_element: () => 0, tensor_print: () => {},
        tensor_random: () => {}, tensor_get_rows: () => 0, tensor_get_cols: () => 0,
        agent_alloc: () => 0, mse: () => 0, cross_entropy: () => 0, softmax: () => {},
        sgd_step: () => {}, nn_dense: () => 0, load_csv: () => 0, save_csv: () => {},
        train_test_split: () => {}, sigmoid: (x) => 1/(1+Math.exp(-x)), relu: (x)=>Math.max(0,x),
        tanh: (x)=>Math.tanh(x), random: ()=>Math.random()*2-1, exp: (x)=>Math.exp(x),
        log: (x)=>Math.log(x), print_tensor: () => {}, list_create: () => 0,
        list_add: () => {}, list_get: () => 0, list_len: () => 0, string_create: () => 0,
        string_concat: () => 0, string_substring: () => 0, string_set_char: () => {},
        string_from_char: () => 0
    }
});
console.log('   Инстанс создан');

const exports = outputInstance.exports;

exports.TOKEN_EOF.value = -1;
exports.TOKEN_NUMBER.value = 0;
exports.TOKEN_IDENT.value = 1;
exports.TOKEN_PLUS.value = 2;
exports.TOKEN_STAR.value = 4;
exports.TOKEN_ASSIGN.value = 7;
exports.TOKEN_NEWLINE.value = 22;

exports.CHAR_SPACE.value = 32;
exports.CHAR_NEWLINE.value = 10;
exports.CHAR_PLUS.value = 43;
exports.CHAR_STAR.value = 42;
exports.CHAR_ASSIGN.value = 61;
exports.CHAR_ZERO.value = 48;
exports.CHAR_NINE.value = 57;
exports.CHAR_A_LOWER.value = 97;
exports.CHAR_Z_LOWER.value = 122;

exports.lexer_source.value = strPtr;
exports.lexer_length.value = len;
exports.lexer_pos.value = 0;

console.log('4. Чтение токенов...');
let tokens = [];
let maxTokens = 30;

for (let i = 0; i < maxTokens; i++) {
    const token = exports.lexer_next_token();
    const value = exports.lexer_token_value.value;
    tokens.push({ token, value });
    console.log(`   токен ${i}: ${token}, значение ${value}`);
    if (token === -1) break;
    if (i >= maxTokens - 1) {
        console.log(`   достигнут лимит токенов, принудительный выход`);
        break;
    }
}

console.log(`5. Получено ${tokens.length} токенов`);

// Простой парсер
let pos = 0;
function current() { return tokens[pos]; }
function next() { pos++; return current(); }

function parseExpression() {
    if (current().token === 0) {
        const val = current().value;
        next();
        if (current() && current().token === 2) {
            next();
            if (current().token === 0) {
                const val2 = current().value;
                next();
                return val + val2;
            }
        }
        if (current() && current().token === 4) {
            next();
            if (current().token === 0) {
                const val2 = current().value;
                next();
                return val * val2;
            }
        }
        return val;
    }
    if (current().token === 1) {
        const name = current().value;
        next();
        return { type: 'ident', name };
    }
    return 0;
}

function parseAssignment() {
    if (current().token === 1) {
        const name = current().value;
        next();
        if (current().token === 7) {
            next();
            const value = parseExpression();
            return { type: 'assign', name, value };
        }
    }
    return null;
}

console.log('6. Парсинг...');
const statements = [];
while (pos < tokens.length && current().token !== -1) {
    while (current() && current().token === 22) {
        next();
    }
    if (current() && current().token === -1) break;
    if (current() && current().token === 1) {
        const stmt = parseAssignment();
        if (stmt) statements.push(stmt);
        console.log(`   statement: ${JSON.stringify(stmt)}`);
    } else {
        console.log(`   неизвестный токен: ${current().token}, завершаем`);
        break;
    }
}

console.log(`7. Получено ${statements.length} statements`);

// Генерация WAT
let wat = '(module\n';
wat += '  (memory 1)\n';
wat += '  (export "memory" (memory 0))\n';

const vars = new Set();
for (const stmt of statements) {
    if (stmt.type === 'assign') vars.add(stmt.name);
}
for (const v of vars) {
    wat += `  (global $${v} (mut f64) (f64.const 0))\n`;
}
wat += '\n';
wat += '  (func $main (result f64)\n';

for (const stmt of statements) {
    if (stmt.type === 'assign') {
        if (typeof stmt.value === 'number') {
            wat += `    ;; ${stmt.name} = ${stmt.value}\n`;
            wat += `    f64.const ${stmt.value}\n`;
            wat += `    global.set $${stmt.name}\n`;
        } else {
            wat += `    ;; ${stmt.name} = выражение (пока не поддерживается)\n`;
            wat += `    f64.const 0\n`;
            wat += `    global.set $${stmt.name}\n`;
        }
    }
}

if (statements.length > 0) {
    const last = statements[statements.length - 1];
    wat += `    global.get $${last.name}\n`;
    wat += '    return\n';
} else {
    wat += '    f64.const 0\n';
    wat += '    return\n';
}
wat += '  )\n';
wat += '  (export "main" (func $main))\n';
wat += ')';

console.log('8. WAT сгенерирован');
fs.writeFileSync('program.wat', wat);
console.log('   Сохранён program.wat');
console.log('\nСодержимое program.wat:');
console.log(wat);
