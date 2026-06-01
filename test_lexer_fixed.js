// test_lexer_step.js
import fs from 'fs';

const runtimeWasm = fs.readFileSync('./runtime.wasm');
const runtimeModule = await WebAssembly.compile(runtimeWasm);
const runtimeInstance = await WebAssembly.instantiate(runtimeModule, {});

const memory = runtimeInstance.exports.memory;
const view = new Uint8Array(memory.buffer);

const testString = "+ =";
const strPtr = 65536;
const len = testString.length;

view[strPtr] = len;
for (let i = 0; i < len; i++) {
    view[strPtr + 4 + i] = testString.charCodeAt(i);
}

console.log('Строка:', testString);

const imports = {
    runtime: {
        string_char_code_at: (ptr, index) => {
            const len2 = view[ptr];
            if (index >= len2) return -1;
            const result = view[ptr + 4 + index];
            console.log(`  cc(${ptr},${index})=${result} (${String.fromCharCode(result)})`);
            return result;
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
};

const outputWasm = fs.readFileSync('./output.wasm');
const outputModule = await WebAssembly.compile(outputWasm);
const outputInstance = await WebAssembly.instantiate(outputModule, imports);

const exports = outputInstance.exports;

// Инициализация констант
exports.CHAR_PLUS.value = 43;
exports.CHAR_EOF.value = -1;
exports.CHAR_SPACE.value = 32;
// ... (остальные константы)

exports.TOKEN_PLUS.value = 2;
exports.TOKEN_EOF.value = -1;
// ... (остальные токены)

exports.lexer_source.value = strPtr;
exports.lexer_length.value = len;
exports.lexer_pos.value = 0;
exports.lexer_line.value = 1;
exports.lexer_col.value = 1;

// Пошаговое выполнение
console.log('\n=== Пошаговое выполнение ===');

console.log('1. lexer_current_char() =', exports.lexer_current_char());
console.log('2. lexer_skip_whitespace()');
exports.lexer_skip_whitespace();
console.log('   После skip_whitespace: pos =', exports.lexer_pos.value, 'col =', exports.lexer_col.value);

console.log('3. lexer_current_char() =', exports.lexer_current_char());
console.log('4. CHAR_PLUS =', exports.CHAR_PLUS.value);
console.log('5. Сравнение (ch == CHAR_PLUS):', exports.lexer_current_char() === exports.CHAR_PLUS.value);

console.log('\n=== Вызов lexer_next_token ===');
const result = exports.lexer_next_token();
console.log('Результат:', result);