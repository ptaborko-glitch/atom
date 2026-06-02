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
    if (i >= maxTokens - 1) break;
}

console.log(`5. Получено ${tokens.length} токенов`);

// Обработка токенов вручную
console.log('6. Обработка...');
let result = 0;

// Первая строка: x = 42
if (tokens[0]?.token === 1 && tokens[1]?.token === 7 && tokens[2]?.token === 0) {
    console.log(`   x = ${tokens[2].value}`);
    result = tokens[2].value;
}

// Вторая строка: y = x + 1 (пропускаем, так как x это идентификатор)
// Третья строка: z = y * 2 (пропускаем)

// Генерация WAT
let wat = '(module\n';
wat += '  (func $main (result f64)\n';
wat += `    f64.const ${result}\n`;
wat += '    return\n';
wat += '  )\n';
wat += '  (export "main" (func $main))\n';
wat += ')';

console.log('7. WAT сгенерирован');
console.log(wat);
fs.writeFileSync('program.wat', wat);
console.log('   Сохранён program.wat');
