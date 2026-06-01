// test_lexer.js — Отладочная версия
import fs from 'fs';

// Загружаем runtime
const runtimeWasm = fs.readFileSync('./runtime.wasm');
const runtimeModule = await WebAssembly.compile(runtimeWasm);
const runtimeInstance = await WebAssembly.instantiate(runtimeModule, {});

const memory = runtimeInstance.exports.memory;
const view = new Uint8Array(memory.buffer);

// Строка "+ ="
const testString = "+ =";
const strPtr = 65536;
const len = testString.length;

// Записываем строку в правильном формате
// Формат строки: [4 байта длина] [байты символов]
view[strPtr] = len & 0xFF;
view[strPtr + 1] = (len >> 8) & 0xFF;
view[strPtr + 2] = (len >> 16) & 0xFF;
view[strPtr + 3] = (len >> 24) & 0xFF;

for (let i = 0; i < len; i++) {
    view[strPtr + 4 + i] = testString.charCodeAt(i);
}

console.log('Строка:', testString);
console.log('Длина:', len);
console.log('Адрес:', strPtr);
console.log('Байты длины:', view[strPtr], view[strPtr+1], view[strPtr+2], view[strPtr+3]);
console.log('Символы:',
    view[strPtr+4], '(+ должен быть 43)',
    view[strPtr+5], '(пробел 32)',
    view[strPtr+6], '(= 61)'
);

// Импорты с отладкой
const imports = {
    runtime: {
        string_char_code_at: (ptr, index) => {
            const len2 = view[ptr] | (view[ptr+1] << 8) | (view[ptr+2] << 16) | (view[ptr+3] << 24);
            const result = (index < 0 || index >= len2) ? -1 : view[ptr + 4 + index];
            console.log(`  string_char_code_at(ptr=${ptr}, index=${index}) -> ${result} (len=${len2})`);
            return result;
        },
        string_len: (ptr) => {
            const result = view[ptr] | (view[ptr+1] << 8) | (view[ptr+2] << 16) | (view[ptr+3] << 24);
            console.log(`  string_len(ptr=${ptr}) -> ${result}`);
            return result;
        },
        // ... остальные заглушки
        tensor_create: () => 0,
        tensor_set: () => {},
        tensor_get: () => 0,
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
        print_tensor: () => {},
        list_create: () => 0,
        list_add: () => {},
        list_get: () => 0,
        list_len: () => 0,
        string_create: () => 0,
        string_concat: () => 0,
        string_substring: () => 0,
        string_set_char: () => {},
        string_from_char: () => 0
    }
};

// Загружаем output.wasm
const outputWasm = fs.readFileSync('./output.wasm');
const outputModule = await WebAssembly.compile(outputWasm);
const outputInstance = await WebAssembly.instantiate(outputModule, imports);

const exports = outputInstance.exports;

// Устанавливаем глобальные переменные
console.log('\n=== Установка глобальных переменных ===');
exports.lexer_source.value = strPtr;
console.log('lexer_source =', exports.lexer_source.value);

exports.lexer_length.value = len;
console.log('lexer_length =', exports.lexer_length.value);

exports.lexer_pos.value = 0;
console.log('lexer_pos =', exports.lexer_pos.value);

exports.lexer_line.value = 1;
console.log('lexer_line =', exports.lexer_line.value);

exports.lexer_col.value = 1;
console.log('lexer_col =', exports.lexer_col.value);

// Вызываем lexer_next_token
console.log('\n=== Вызов lexer_next_token ===');
const result = exports.lexer_next_token();
console.log('\n=== Результат ===', result);

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