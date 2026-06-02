import fs from 'fs';

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

const code = `x = 42 + 1`;
const strPtr = 65536;
const len = code.length;

view[strPtr] = len;
for (let i = 0; i < len; i++) {
    view[strPtr + 4 + i] = code.charCodeAt(i);
}

const imports = {
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
};

const outputWasm = fs.readFileSync('./output.wasm');
const outputModule = await WebAssembly.compile(outputWasm);
const outputInstance = await WebAssembly.instantiate(outputModule, imports);

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

exports.lexer_source.value = strPtr;
exports.lexer_length.value = len;
exports.lexer_pos.value = 0;

let currentToken;
let currentValue;

function nextToken() {
    currentToken = exports.lexer_next_token();
    currentValue = exports.lexer_token_value.value;
    console.log(`  Токен: ${currentToken}, значение: ${currentValue}`);
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
    console.log('Начинаем парсинг...');
    nextToken();
    const statements = [];
    while (!peek(exports.TOKEN_EOF.value)) {
        // Пропускаем NEWLINE
        while (peek(exports.TOKEN_NEWLINE.value)) {
            eat(exports.TOKEN_NEWLINE.value);
        }
        if (peek(exports.TOKEN_EOF.value)) break;
        
        const stmt = parseAssignment();
        statements.push(stmt);
        
        // После statement ожидаем NEWLINE или EOF (не ошибка, если EOF)
        if (!peek(exports.TOKEN_EOF.value) && !peek(exports.TOKEN_NEWLINE.value)) {
            // Если не EOF и не NEWLINE, проверяем, может быть конец выражения?
            // В нашем случае после числа 1 идёт сразу EOF, это нормально
            if (peek(exports.TOKEN_EOF.value)) {
                break;
            }
        }
    }
    return { type: 'Program', statements };
}

let tempCounter = 0;
let hirInstructions = [];

function newTemp() {
    tempCounter++;
    return `%t${tempCounter}`;
}

function emit(opcode, operands = [], result = null) {
    hirInstructions.push({ opcode, operands, result });
}

function generateHIR(node) {
    if (node.type === 'Number') {
        const temp = newTemp();
        emit('const', [node.value], temp);
        return temp;
    }
    if (node.type === 'Identifier') {
        const temp = newTemp();
        emit('load', [node.name], temp);
        return temp;
    }
    if (node.type === 'Binary') {
        const left = generateHIR(node.left);
        const right = generateHIR(node.right);
        const temp = newTemp();
        const opMap = { '+': 'add', '-': 'sub', '*': 'mul', '/': 'div' };
        emit(opMap[node.operator], [left, right], temp);
        return temp;
    }
    if (node.type === 'Unary') {
        const operand = generateHIR(node.operand);
        const temp = newTemp();
        emit('neg', [operand], temp);
        return temp;
    }
    if (node.type === 'Assign') {
        const value = generateHIR(node.value);
        emit('store', [value, node.name]);
        return null;
    }
    if (node.type === 'Program') {
        for (const stmt of node.statements) {
            generateHIR(stmt);
        }
        return null;
    }
    throw new Error(`Unknown node type: ${node.type}`);
}

console.log('Код:', code);
console.log('\n=== Парсинг ===');
const ast = parseProgram();
console.log('AST:', JSON.stringify(ast, null, 2));

console.log('\n=== Генерация HIR ===');
generateHIR(ast);
console.log('HIR инструкции:');
hirInstructions.forEach((inst, i) => {
    if (inst.result) {
        console.log(`  ${inst.result} = ${inst.opcode} ${inst.operands.join(', ')}`);
    } else {
        console.log(`  ${inst.opcode} ${inst.operands.join(', ')}`);
    }
});
