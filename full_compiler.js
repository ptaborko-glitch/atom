import fs from 'fs';

// ============================================================
// ЗАГРУЗКА ЛЕКСЕРА
// ============================================================

const runtimeWasm = fs.readFileSync('./runtime.wasm');
const runtimeModule = await WebAssembly.compile(runtimeWasm);
const runtimeInstance = await WebAssembly.instantiate(runtimeModule, {});

const memory = runtimeInstance.exports.memory;
const view = new Uint8Array(memory.buffer);

function readString(ptr) {
    const len = view[ptr];
    const chars = [];
    for (let i = 0; i < len; i++) {
        chars.push(String.fromCharCode(view[ptr + 4 + i]));
    }
    return chars.join('');
}

// ============================================================
// НАСТРОЙКА ЛЕКСЕРА
// ============================================================

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
        string_substring: (ptr, start, length) => {
            const newPtr = 131072;
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
        train_test_split: () => {}, sigmoid: (x) => 1/(1+Math.exp(-x)), relu: (x)=>Math.max(0,x),
        tanh: (x)=>Math.tanh(x), random: ()=>Math.random()*2-1, exp: (x)=>Math.exp(x),
        log: (x)=>Math.log(x), print_tensor: () => {}, list_create: () => 0,
        list_add: () => {}, list_get: () => 0, list_len: () => 0, string_create: () => 0,
        string_concat: () => 0, string_set_char: () => {},
        string_from_char: () => 0
    }
});

const exports = outputInstance.exports;

// Инициализация констант
exports.TOKEN_EOF.value = -1;
exports.TOKEN_NUMBER.value = 0;
exports.TOKEN_IDENT.value = 1;
exports.TOKEN_PLUS.value = 2;
exports.TOKEN_MINUS.value = 3;
exports.TOKEN_STAR.value = 4;
exports.TOKEN_SLASH.value = 5;
exports.TOKEN_ASSIGN.value = 7;
exports.TOKEN_NEWLINE.value = 22;

exports.CHAR_SPACE.value = 32;
exports.CHAR_NEWLINE.value = 10;
exports.CHAR_PLUS.value = 43;
exports.CHAR_MINUS.value = 45;
exports.CHAR_STAR.value = 42;
exports.CHAR_SLASH.value = 47;
exports.CHAR_ASSIGN.value = 61;
exports.CHAR_ZERO.value = 48;
exports.CHAR_NINE.value = 57;
exports.CHAR_A_LOWER.value = 97;
exports.CHAR_Z_LOWER.value = 122;

// ============================================================
// ПАРСЕР
// ============================================================

let currentToken;
let currentValue;
let sourceCode = "";

function nextToken() {
    currentToken = exports.lexer_next_token();
    currentValue = exports.lexer_token_value.value;
    return currentToken;
}

function eat(expected) {
    if (currentToken !== expected) {
        throw new Error(`Expected ${expected}, got ${currentToken}`);
    }
    return nextToken();
}

function peek(expected) {
    return currentToken === expected;
}

function parseNumber() {
    const value = currentValue;
    eat(exports.TOKEN_NUMBER.value);
    return { type: 'Number', value };
}

function parseIdentifier() {
    const name = readString(currentValue);
    eat(exports.TOKEN_IDENT.value);
    return { type: 'Identifier', name };
}

function parsePrimary() {
    if (peek(exports.TOKEN_NUMBER.value)) return parseNumber();
    if (peek(exports.TOKEN_IDENT.value)) return parseIdentifier();
    throw new Error(`Unexpected token: ${currentToken}`);
}

function parseUnary() {
    if (peek(exports.TOKEN_MINUS.value)) {
        eat(exports.TOKEN_MINUS.value);
        const operand = parseUnary();
        return { type: 'Unary', operator: '-', operand };
    }
    return parsePrimary();
}

function parseMultiplication() {
    let left = parseUnary();
    while (peek(exports.TOKEN_STAR.value) || peek(exports.TOKEN_SLASH.value)) {
        const op = currentToken;
        eat(op);
        const right = parseUnary();
        left = { type: 'Binary', operator: op === exports.TOKEN_STAR.value ? '*' : '/', left, right };
    }
    return left;
}

function parseAddition() {
    let left = parseMultiplication();
    while (peek(exports.TOKEN_PLUS.value) || peek(exports.TOKEN_MINUS.value)) {
        const op = currentToken;
        eat(op);
        const right = parseMultiplication();
        left = { type: 'Binary', operator: op === exports.TOKEN_PLUS.value ? '+' : '-', left, right };
    }
    return left;
}

function parseExpression() {
    return parseAddition();
}

function parseAssignment() {
    const name = readString(currentValue);
    eat(exports.TOKEN_IDENT.value);
    if (peek(exports.TOKEN_ASSIGN.value)) {
        eat(exports.TOKEN_ASSIGN.value);
        const value = parseExpression();
        return { type: 'Assign', name, value };
    }
    return { type: 'Identifier', name };
}

function parseProgram() {
    nextToken();
    const statements = [];
    while (!peek(exports.TOKEN_EOF.value)) {
        while (peek(exports.TOKEN_NEWLINE.value)) eat(exports.TOKEN_NEWLINE.value);
        if (peek(exports.TOKEN_EOF.value)) break;
        const stmt = parseAssignment();
        statements.push(stmt);
        if (peek(exports.TOKEN_NEWLINE.value)) eat(exports.TOKEN_NEWLINE.value);
    }
    return { type: 'Program', statements };
}

// ============================================================
// ГЕНЕРАТОР WASM
// ============================================================

let tempCounter = 0;
let globalCounter = 0;
let globals = new Map();
let watLines = [];

function newTemp() {
    tempCounter++;
    return `%t${tempCounter}`;
}

function newGlobal() {
    globalCounter++;
    return `$g${globalCounter}`;
}

function emit(line) {
    watLines.push(line);
}

function generateWasm(ast) {
    // Начало модуля
    emit('(module');
    emit('  (import "runtime" "string_len" (func $string_len (param i32) (result i32)))');
    emit('  (import "runtime" "string_char_code_at" (func $string_char_code_at (param i32) (param i32) (result f64)))');
    emit('  (memory 1)');
    emit('  (export "memory" (memory 0))');
    
    // Глобальные переменные
    emit('  (global $source (mut i32) (i32.const 0))');
    emit('  (global $pos (mut f64) (f64.const 0))');
    emit('  (global $len (mut i32) (i32.const 0))');
    emit('  (global $line (mut f64) (f64.const 1))');
    emit('  (global $col (mut f64) (f64.const 1))');
    
    // Функция main
    emit('  (func $main (result f64)');
    emit('    (local $result f64)');
    
    // Инициализация
    emit('    i32.const 65536');
    emit('    global.set $source');
    emit('    global.get $source');
    emit('    call $string_len');
    emit('    global.set $len');
    emit('    f64.const 0');
    emit('    global.set $pos');
    
    // Генерируем код для каждого statement
    for (const stmt of ast.statements) {
        generateWasmStatement(stmt);
    }
    
    emit('    f64.const 0');
    emit('    return');
    emit('  )');
    emit('  (export "main" (func $main))');
    emit(')');
}

function generateWasmStatement(stmt) {
    if (stmt.type === 'Assign') {
        // Загружаем значение
        const value = generateWasmExpr(stmt.value);
        emit(`    ;; assign ${stmt.name} = ${value}`);
        // TODO: сохранить в переменную
    }
}

function generateWasmExpr(expr) {
    if (expr.type === 'Number') {
        return `${expr.value}`;
    }
    if (expr.type === 'Identifier') {
        return `0`; // TODO: загрузка из переменной
    }
    if (expr.type === 'Binary') {
        const left = generateWasmExpr(expr.left);
        const right = generateWasmExpr(expr.right);
        const opMap = { '+': 'f64.add', '-': 'f64.sub', '*': 'f64.mul', '/': 'f64.div' };
        emit(`    ${opMap[expr.operator]}`);
        return `(result)`;
    }
    return '0';
}

// ============================================================
// ЗАПУСК
// ============================================================

const code = `x = 42 + 1
y = x * 2`;

console.log('Исходный код:');
console.log(code);
console.log();

// Устанавливаем источник в лексер
const strPtr = 65536;
const len = code.length;
view[strPtr] = len;
for (let i = 0; i < len; i++) {
    view[strPtr + 4 + i] = code.charCodeAt(i);
}

exports.lexer_source.value = strPtr;
exports.lexer_length.value = len;
exports.lexer_pos.value = 0;

// Парсинг
console.log('=== Парсинг ===');
const ast = parseProgram();
console.log('AST:', JSON.stringify(ast, null, 2));

// Генерация Wasm
console.log('\n=== Генерация WebAssembly ===');
generateWasm(ast);
const wat = watLines.join('\n');
console.log('WAT:\n', wat);

// Сохраняем
fs.writeFileSync('generated.wat', wat);
console.log('\n✅ Сгенерирован generated.wat');
