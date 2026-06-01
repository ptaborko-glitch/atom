// test_lexer.js
import fs from 'fs';

// Сначала загружаем runtime.wasm
const runtimeWasm = fs.readFileSync('./runtime.wasm');
const runtimeModule = await WebAssembly.compile(runtimeWasm);
const runtimeInstance = await WebAssembly.instantiate(runtimeModule, {});

// Получаем память runtime
const memory = runtimeInstance.exports.memory;
const view = new Uint8Array(memory.buffer);

// Создаём строку "+ =" в памяти
const strPtr = 65536;
const testString = "+ =";
const len = testString.length;

// Записываем строку в формате: длина (4 байта) + символы
view[strPtr] = len & 0xFF;
view[strPtr + 1] = (len >> 8) & 0xFF;
view[strPtr + 2] = (len >> 16) & 0xFF;
view[strPtr + 3] = (len >> 24) & 0xFF;
for (let i = 0; i < len; i++) {
    view[strPtr + 4 + i] = testString.charCodeAt(i);
}

console.log('Строка создана по адресу:', strPtr);
console.log('Содержимое:', testString);

// Импорты для output.wasm
const imports = {
    runtime: {
        string_char_code_at: (ptr, index) => {
            const len2 = view[ptr] | (view[ptr+1] << 8) | (view[ptr+2] << 16) | (view[ptr+3] << 24);
            if (index < 0 || index >= len2) return -1;
            return view[ptr + 4 + index];
        },
        string_len: (ptr) => {
            return view[ptr] | (view[ptr+1] << 8) | (view[ptr+2] << 16) | (view[ptr+3] << 24);
        },
        // Заглушки для других функций
        string_create: () => 0,
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
    }
};

// Загружаем output.wasm
const outputWasm = fs.readFileSync('./output.wasm');
const outputModule = await WebAssembly.compile(outputWasm);
const outputInstance = await WebAssembly.instantiate(outputModule, imports);

const exports = outputInstance.exports;
console.log('Экспорты:', Object.keys(exports).slice(0, 20), '...');

// Устанавливаем глобальные переменные
if (exports.lexer_source) {
    exports.lexer_source.value = strPtr;
    console.log('lexer_source установлен на', strPtr);
}
if (exports.lexer_length) {
    exports.lexer_length.value = len;
    console.log('lexer_length установлен на', len);
}
if (exports.lexer_pos) {
    exports.lexer_pos.value = 0;
    console.log('lexer_pos установлен на 0');
}
if (exports.lexer_line) {
    exports.lexer_line.value = 1;
    console.log('lexer_line установлен на 1');
}
if (exports.lexer_col) {
    exports.lexer_col.value = 1;
    console.log('lexer_col установлен на 1');
}

// Вызываем main (которая внутри вызывает lexer_next_token)
console.log('\n=== Вызов main ===');
const result = exports.main();
console.log('Результат:', result);

// Интерпретируем результат
const tokens = {
    [-1]: 'TOKEN_EOF',
    0: 'TOKEN_NUMBER',
    1: 'TOKEN_IDENT',
    2: 'TOKEN_PLUS',
    3: 'TOKEN_MINUS',
    4: 'TOKEN_STAR',
    5: 'TOKEN_SLASH',
    6: 'TOKEN_AT',
    7: 'TOKEN_ASSIGN',
    8: 'TOKEN_EQ',
    9: 'TOKEN_NEQ',
    10: 'TOKEN_LT',
    11: 'TOKEN_GT',
    12: 'TOKEN_LTE',
    13: 'TOKEN_GTE',
    14: 'TOKEN_LPAREN',
    15: 'TOKEN_RPAREN',
    22: 'TOKEN_NEWLINE'
};
console.log('Токен:', tokens[result] || 'UNKNOWN');