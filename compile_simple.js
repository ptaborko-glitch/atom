import fs from 'fs';

const filename = 'test_program.atom';
console.log(`=== Компиляция ${filename} ===`);

const source = fs.readFileSync(filename, 'utf8');
console.log(`Прочитано ${source.length} символов`);
console.log(source);

const runtimeWasm = fs.readFileSync('./runtime.wasm');
const runtimeModule = await WebAssembly.compile(runtimeWasm);
const runtimeInstance = await WebAssembly.instantiate(runtimeModule, {});

const memory = runtimeInstance.exports.memory;
const view = new Uint8Array(memory.buffer);

const strPtr = 65536;
const len = source.length;

view[strPtr] = len;
for (let i = 0; i < len; i++) {
    view[strPtr + 4 + i] = source.charCodeAt(i);
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

// Читаем токены
console.log('\nТокены:');
let tokens = [];
for (let i = 0; i < 30; i++) {
    const token = exports.lexer_next_token();
    const value = exports.lexer_token_value.value;
    tokens.push({ token, value });
    console.log(`  ${i}: ${token}, ${value}`);
    if (token === -1) break;
}

// Простой парсер — ищем последнее число
let lastNumber = 0;
for (const t of tokens) {
    if (t.token === 0) { // NUMBER
        lastNumber = t.value;
    }
}
console.log(`\nПоследнее число: ${lastNumber}`);

// Генерация WAT
const wat = `(module
  (func $main (result f64)
    f64.const ${lastNumber}
    return
  )
  (export "main" (func $main))
)`;

fs.writeFileSync('test_program.wat', wat);
console.log('\n✅ test_program.wat создан');
console.log(wat);
