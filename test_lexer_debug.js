// test_lexer_debug.js
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
};

const outputWasm = fs.readFileSync('./output.wasm');
const outputModule = await WebAssembly.compile(outputWasm);
const outputInstance = await WebAssembly.instantiate(outputModule, imports);

const exports = outputInstance.exports;

exports.lexer_source.value = strPtr;
exports.lexer_length.value = len;
exports.lexer_pos.value = 0;
exports.lexer_line.value = 1;
exports.lexer_col.value = 1;

// Отладка: проверяем каждый шаг
console.log('\n=== Отладка ===');
console.log('lexer_current_char() =', exports.lexer_current_char());
console.log('lexer_is_digit() =', exports.lexer_is_digit());
console.log('lexer_is_alpha() =', exports.lexer_is_alpha());

// Проверяем, что будет после skip_whitespace
console.log('\n=== Вызов lexer_next_token ===');
const result = exports.lexer_next_token();
console.log('Результат:', result);

const tokens = {
    [-1]: 'TOKEN_EOF', 0: 'TOKEN_NUMBER', 1: 'TOKEN_IDENT', 2: 'TOKEN_PLUS',
    3: 'TOKEN_MINUS', 4: 'TOKEN_STAR', 5: 'TOKEN_SLASH', 6: 'TOKEN_AT',
    7: 'TOKEN_ASSIGN', 8: 'TOKEN_EQ', 9: 'TOKEN_NEQ', 10: 'TOKEN_LT',
    11: 'TOKEN_GT', 12: 'TOKEN_LTE', 13: 'TOKEN_GTE', 14: 'TOKEN_LPAREN',
    15: 'TOKEN_RPAREN', 22: 'TOKEN_NEWLINE'
};
console.log('Токен:', tokens[result] || 'UNKNOWN');