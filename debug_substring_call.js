import fs from 'fs';

const runtimeWasm = fs.readFileSync('./runtime.wasm');
const runtimeModule = await WebAssembly.compile(runtimeWasm);
const runtimeInstance = await WebAssembly.instantiate(runtimeModule, {});

const memory = runtimeInstance.exports.memory;
const view = new Uint8Array(memory.buffer);

let substringCalled = false;

const outputWasm = fs.readFileSync('./output.wasm');
const outputModule = await WebAssembly.compile(outputWasm);
const outputInstance = await WebAssembly.instantiate(outputModule, {
    runtime: {
        string_char_code_at: (ptr, index) => {
            const len = view[ptr];
            if (index >= len) return -1;
            return view[ptr + 4 + index];
        },
        string_len: (ptr) => view[ptr],
        string_substring: (ptr, start, length) => {
            substringCalled = true;
            console.log(`  ✅ string_substring вызван! ptr=${ptr}, start=${start}, length=${length}`);
            const newPtr = 200000;
            view[newPtr] = length;
            for (let i = 0; i < length; i++) {
                view[newPtr + 4 + i] = view[ptr + 4 + start + i];
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
});

const exports = outputInstance.exports;

exports.TOKEN_EOF.value = -1;
exports.TOKEN_NUMBER.value = 0;
exports.TOKEN_IDENT.value = 1;

exports.CHAR_A_LOWER.value = 97;
exports.CHAR_Z_LOWER.value = 122;

const source = "hello";
const strPtr = 65536;
const len = source.length;

view[strPtr] = len;
for (let i = 0; i < len; i++) {
    view[strPtr + 4 + i] = source.charCodeAt(i);
}

exports.lexer_source.value = strPtr;
exports.lexer_length.value = len;
exports.lexer_pos.value = 0;

console.log('=== Проверка вызова string_substring ===');
console.log('Вызов lexer_read_ident()...');
const token = exports.lexer_read_ident();
console.log(`token=${token}`);
console.log(`string_substring был вызван: ${substringCalled ? '✅ ДА' : '❌ НЕТ'}`);
const val = exports.lexer_token_value.value;
console.log(`value ptr=${val}`);
