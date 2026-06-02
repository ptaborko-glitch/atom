import fs from 'fs';

const runtimeWasm = fs.readFileSync('./runtime.wasm');
const runtimeModule = await WebAssembly.compile(runtimeWasm);
const runtimeInstance = await WebAssembly.instantiate(runtimeModule, {});

const memory = runtimeInstance.exports.memory;
const view = new Uint8Array(memory.buffer);

const code = `x = 42
y = x + 1
z = y * 2`;
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

console.log('=== Чтение токенов ===');
let tokens = [];
let maxTokens = 20;
for (let i = 0; i < maxTokens; i++) {
    const token = exports.lexer_next_token();
    const value = exports.lexer_token_value.value;
    tokens.push({ token, value });
    console.log(`${i}: ${token}, ${value}`);
    if (token === -1) break;
}

console.log(`\nВсего токенов: ${tokens.length}`);

// Ручная обработка для трёх строк
console.log('\n=== Ручная обработка ===');

// x = 42 (токены 0,1,2)
const x_val = tokens[2]?.value;
console.log(`x = ${x_val}`);

// y = x + 1 (токены 4,5,6,7,8)
const y_left = tokens[6]?.value; // x
const y_op = tokens[7]?.token === 2 ? '+' : '?';
const y_right = tokens[8]?.value;
const y_val = (y_op === '+') ? x_val + y_right : 0;
console.log(`y = ${y_left} ${y_op} ${y_right} = ${y_val}`);

// z = y * 2 (токены 10,11,12,13,14)
const z_left = tokens[12]?.value; // y
const z_op = tokens[13]?.token === 4 ? '*' : '?';
const z_right = tokens[14]?.value;
const z_val = (z_op === '*') ? y_val * z_right : 0;
console.log(`z = ${z_left} ${z_op} ${z_right} = ${z_val}`);

// Генерация WAT
const wat = `(module
  (global $x (mut f64) (f64.const 0))
  (global $y (mut f64) (f64.const 0))
  (global $z (mut f64) (f64.const 0))
  (func $main (result f64)
    f64.const ${x_val}
    global.set $x
    global.get $x
    f64.const ${y_right}
    f64.add
    global.set $y
    global.get $y
    f64.const ${z_right}
    f64.mul
    global.set $z
    global.get $z
    return
  )
  (export "main" (func $main))
)`;

fs.writeFileSync('advanced.wat', wat);
console.log('\n✅ advanced.wat создан');
console.log(wat);
