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

exports.CHAR_SPACE.value = 32;
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
let step = 0;
let timeout;

function nextToken() {
    return new Promise((resolve) => {
        timeout = setTimeout(() => {
            console.log(`❌ Таймаут: nextToken() не вернул значение`);
            resolve(-1);
        }, 1000);
        
        const token = exports.lexer_next_token();
        clearTimeout(timeout);
        currentToken = token;
        currentValue = exports.lexer_token_value.value;
        step++;
        console.log(`${step}. Токен: ${currentToken}, значение: ${currentValue}`);
        resolve(currentToken);
    });
}

async function eat(expected) {
    if (currentToken !== expected) {
        throw new Error(`Expected ${expected}, got ${currentToken} at step ${step}`);
    }
    return await nextToken();
}

function peek(expected) {
    return currentToken === expected;
}

async function parseNumber() {
    const value = currentValue;
    await eat(exports.TOKEN_NUMBER.value);
    return { type: 'Number', value };
}

function parseIdentifier() {
    const name = readString(currentValue);
    // eat будет вызван асинхронно
    return { type: 'Identifier', name, needEat: true };
}

async function parsePrimary() {
    if (peek(exports.TOKEN_NUMBER.value)) return await parseNumber();
    if (peek(exports.TOKEN_IDENT.value)) {
        const ident = parseIdentifier();
        await eat(exports.TOKEN_IDENT.value);
        return ident;
    }
    throw new Error(`Unexpected token: ${currentToken}`);
}

async function parseUnary() {
    if (peek(exports.TOKEN_MINUS.value)) {
        await eat(exports.TOKEN_MINUS.value);
        const operand = await parseUnary();
        return { type: 'Unary', operator: '-', operand };
    }
    return await parsePrimary();
}

async function parseMultiplication() {
    let left = await parseUnary();
    while (peek(exports.TOKEN_STAR.value) || peek(exports.TOKEN_SLASH.value)) {
        const op = currentToken;
        await eat(op);
        const right = await parseUnary();
        left = { type: 'Binary', operator: op === exports.TOKEN_STAR.value ? '*' : '/', left, right };
    }
    return left;
}

async function parseAddition() {
    let left = await parseMultiplication();
    while (peek(exports.TOKEN_PLUS.value) || peek(exports.TOKEN_MINUS.value)) {
        const op = currentToken;
        await eat(op);
        const right = await parseMultiplication();
        left = { type: 'Binary', operator: op === exports.TOKEN_PLUS.value ? '+' : '-', left, right };
    }
    return left;
}

async function parseExpression() {
    return await parseAddition();
}

async function parseAssignment() {
    const name = readString(currentValue);
    await eat(exports.TOKEN_IDENT.value);
    if (peek(exports.TOKEN_ASSIGN.value)) {
        await eat(exports.TOKEN_ASSIGN.value);
        const value = await parseExpression();
        return { type: 'Assign', name, value };
    }
    return { type: 'Identifier', name };
}

async function parseProgram() {
    console.log('\n=== Начинаем парсинг ===');
    await nextToken(); // первый токен
    
    const statements = [];
    const stmt = await parseAssignment();
    statements.push(stmt);
    
    if (currentToken !== exports.TOKEN_EOF.value) {
        console.log(`Предупреждение: после выражения остались токены: ${currentToken}`);
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
const ast = await parseProgram();
console.log('\nAST:', JSON.stringify(ast, null, 2));

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
