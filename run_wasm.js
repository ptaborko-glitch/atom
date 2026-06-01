// run_wasm.js — Финальная версия с доступом к глобальным переменным
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Читаем runtime.wasm
const runtimeWasm = fs.readFileSync(join(__dirname, 'runtime.wasm'));
const runtimeModule = new WebAssembly.Module(runtimeWasm);
const runtimeInstance = new WebAssembly.Instance(runtimeModule, {});

const memory = runtimeInstance.exports.memory;
const view = new Uint8Array(memory.buffer);

// Создаём тестовую строку "+ =" в памяти
const testString = "+ =";
const strPtr = 65536;
const len = testString.length;

view[strPtr] = len & 0xFF;
view[strPtr + 1] = (len >> 8) & 0xFF;
view[strPtr + 2] = (len >> 16) & 0xFF;
view[strPtr + 3] = (len >> 24) & 0xFF;
for (let i = 0; i < len; i++) {
    view[strPtr + 4 + i] = testString.charCodeAt(i);
}
console.log('Строка создана по адресу', strPtr, ':', testString);

// Импорты
const runtimeImports = {
    string_char_code_at: (ptr, index) => {
        const len2 = view[ptr] | (view[ptr+1] << 8) | (view[ptr+2] << 16) | (view[ptr+3] << 24);
        if (index < 0 || index >= len2) return -1;
        return view[ptr + 4 + index];
    },
    string_len: (ptr) => {
        return view[ptr] | (view[ptr+1] << 8) | (view[ptr+2] << 16) | (view[ptr+3] << 24);
    },
    string_create: (len) => 0,
    string_concat: () => 0,
    string_substring: () => 0,
    string_set_char: () => {},
    string_from_char: () => 0,
    list_create: () => 0,
    list_add: () => {},
    list_get: () => 0,
    list_len: () => 0,
    tensor_create: () => 0,
    tensor_get: () => 0,
    tensor_set: () => {},
    tensor_matmul: () => 0,
    tensor_add: () => 0,
    tensor_sub: () => 0,
    tensor_mul_scalar: () => {},
    tensor_sigmoid: () => {},
    tensor_relu: () => {},
    tensor_tanh: () => {},
    tensor_get_element: () => 0,
    tensor_print: () => {},
    tensor_random: () => {},
    tensor_get_rows: () => 0,
    tensor_get_cols: () => 0,
    agent_alloc: () => 0,
    mse: () => 0,
    cross_entropy: () => 0,
    softmax: () => {},
    sgd_step: () => {},
    nn_dense: () => 0,
    load_csv: () => 0,
    save_csv: () => {},
    train_test_split: () => {},
    sigmoid: (x) => 1 / (1 + Math.exp(-x)),
    relu: (x) => Math.max(0, x),
    tanh: (x) => Math.tanh(x),
    random: () => Math.random() * 2 - 1,
    exp: (x) => Math.exp(x),
    log: (x) => Math.log(x),
    print_tensor: () => {}
};

// Читаем output.wasm
const outputWasm = fs.readFileSync(join(__dirname, 'output.wasm'));
const outputModule = new WebAssembly.Module(outputWasm);
const outputInstance = new WebAssembly.Instance(outputModule, { runtime: runtimeImports });

const exports = outputInstance.exports;
console.log('Экспорты:', Object.keys(exports));

// Устанавливаем lexer_source на указатель строки
if (exports.lexer_source) {
    exports.lexer_source.value = strPtr;
    console.log('lexer_source установлен на', strPtr);
} else {
    console.log('ERROR: lexer_source не экспортирован!');
    process.exit(1);
}

// Устанавливаем lexer_length = 3
if (exports.lexer_length) {
    exports.lexer_length.value = len;
    console.log('lexer_length установлен на', len);
}

// Устанавливаем lexer_pos = 0
if (exports.lexer_pos) {
    exports.lexer_pos.value = 0;
    console.log('lexer_pos установлен на 0');
}

// Вызываем lexer_next_token
console.log('\n=== Вызов lexer_next_token ===');
const result = exports.main();
console.log('\n=== Результат ===', result);

// Интерпретируем результат
const tokens = {
    [-1]: 'TOKEN_EOF',
    [0]: 'TOKEN_NUMBER',
    [1]: 'TOKEN_IDENT',
    [2]: 'TOKEN_PLUS',
    [3]: 'TOKEN_MINUS',
    [4]: 'TOKEN_STAR',
    [5]: 'TOKEN_SLASH',
    [6]: 'TOKEN_AT',
    [7]: 'TOKEN_ASSIGN',
    [8]: 'TOKEN_EQ',
    [9]: 'TOKEN_NEQ',
    [10]: 'TOKEN_LT',
    [11]: 'TOKEN_GT',
    [12]: 'TOKEN_LTE',
    [13]: 'TOKEN_GTE',
    [14]: 'TOKEN_LPAREN',
    [15]: 'TOKEN_RPAREN',
    [22]: 'TOKEN_NEWLINE'
};
console.log('Токен:', tokens[result] || 'UNKNOWN');