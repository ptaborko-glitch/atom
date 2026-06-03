import fs from 'fs';

const runtimeWasm = fs.readFileSync('./runtime.wasm');
const runtimeModule = await WebAssembly.compile(runtimeWasm);
const runtimeInstance = await WebAssembly.instantiate(runtimeModule, {});

const memory = runtimeInstance.exports.memory;
const view = new Uint8Array(memory.buffer);

const code = `2 * (3 + 4)`;
const strPtr = 65536;
const len = code.length;

view[strPtr] = len;
for (let i = 0; i < len; i++) {
    view[strPtr + 4 + i] = code.charCodeAt(i);
}

const outputWasm = fs.readFileSync('./output.wasm');
const outputModule = await WebAssembly.compile(outputWasm);
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

const exports = outputInstance.exports;

exports.TOKEN_EOF.value = -1;
exports.TOKEN_NUMBER.value = 0;
exports.TOKEN_PLUS.value = 2;
exports.TOKEN_STAR.value = 4;
exports.TOKEN_LPAREN.value = 14;
exports.TOKEN_RPAREN.value = 15;

exports.CHAR_SPACE.value = 32;
exports.CHAR_PLUS.value = 43;
exports.CHAR_STAR.value = 42;
exports.CHAR_LPAREN.value = 40;
exports.CHAR_RPAREN.value = 41;
exports.CHAR_ZERO.value = 48;
exports.CHAR_NINE.value = 57;

exports.lexer_source.value = strPtr;
exports.lexer_length.value = len;
exports.lexer_pos.value = 0;

console.log('=== Ручной разбор 2 * (3 + 4) ===');

// Читаем все токены
const t0 = exports.lexer_next_token(); const v0 = exports.lexer_token_value.value;
const t1 = exports.lexer_next_token(); const v1 = exports.lexer_token_value.value;
const t2 = exports.lexer_next_token(); const v2 = exports.lexer_token_value.value;
const t3 = exports.lexer_next_token(); const v3 = exports.lexer_token_value.value;
const t4 = exports.lexer_next_token(); const v4 = exports.lexer_token_value.value;
const t5 = exports.lexer_next_token(); const v5 = exports.lexer_token_value.value;
const t6 = exports.lexer_next_token(); const v6 = exports.lexer_token_value.value;

console.log(`0: ${t0},${v0} (2)`);
console.log(`1: ${t1},${v1} (*)`);
console.log(`2: ${t2},${v2} (LPAREN)`);
console.log(`3: ${t3},${v3} (3)`);
console.log(`4: ${t4},${v4} (+)`);
console.log(`5: ${t5},${v5} (4)`);
console.log(`6: ${t6},${v6} (RPAREN)`);

// Вычисляем: (3 + 4) = 7
const parenSum = v3 + v5;
console.log(`\n(3 + 4) = ${parenSum}`);

// Затем: 2 * 7 = 14
const result = v0 * parenSum;
console.log(`2 * ${parenSum} = ${result}`);

const wat = `(module
  (func $main (result f64)
    f64.const ${result}
    return
  )
  (export "main" (func $main))
)`;

fs.writeFileSync('bracket.wat', wat);
console.log('\n✅ bracket.wat создан');
console.log(wat);
