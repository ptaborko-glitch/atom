import fs from 'fs';

const runtimeWasm = fs.readFileSync('./runtime.wasm');
const runtimeModule = await WebAssembly.compile(runtimeWasm);
const runtimeInstance = await WebAssembly.instantiate(runtimeModule, {});

const memory = runtimeInstance.exports.memory;
const view = new Uint8Array(memory.buffer);

const code = `x = 42 + 1
y = x * 2
`;

console.log('Исходный код:');
console.log(code);

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
let varCounter = 0;
let varMap = new Map();

function getVarName(ptr) {
    // Временно генерируем имена переменных
    if (!varMap.has(ptr)) {
        varMap.set(ptr, `var${varCounter++}`);
    }
    return varMap.get(ptr);
}

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
    const ptr = currentValue;
    const name = getVarName(ptr);
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
    const ptr = currentValue;
    const name = getVarName(ptr);
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
        while (peek(exports.TOKEN_NEWLINE.value)) {
            eat(exports.TOKEN_NEWLINE.value);
        }
        if (peek(exports.TOKEN_EOF.value)) break;
        
        const stmt = parseAssignment();
        statements.push(stmt);
        
        if (!peek(exports.TOKEN_EOF.value) && !peek(exports.TOKEN_NEWLINE.value)) {
            throw new Error(`Expected NEWLINE, got ${currentToken}`);
        }
    }
    return { type: 'Program', statements };
}

console.log('\n=== Парсинг ===');
const ast = parseProgram();
console.log('AST:', JSON.stringify(ast, null, 2));

console.log('\n=== Генерация WAT ===');
let watLines = [];
watLines.push('(module');
watLines.push('  (memory 1)');
watLines.push('  (export "memory" (memory 0))');
watLines.push('  (global $result (mut f64) (f64.const 0))');
watLines.push('');

// Глобальные переменные для хранения значений
for (const stmt of ast.statements) {
    if (stmt.type === 'Assign') {
        watLines.push(`  (global $${stmt.name} (mut f64) (f64.const 0))`);
    }
}
watLines.push('');

watLines.push('  (func $main (result f64)');
watLines.push('    (local $temp f64)');

for (const stmt of ast.statements) {
    if (stmt.type === 'Assign') {
        const value = generateExpression(stmt.value);
        watLines.push(`    ;; ${stmt.name} = ${value}`);
        watLines.push(`    f64.const ${value}`);
        watLines.push(`    global.set $${stmt.name}`);
    }
}

watLines.push('    global.get $result');
watLines.push('    return');
watLines.push('  )');
watLines.push('  (export "main" (func $main))');
watLines.push(')');

function generateExpression(expr) {
    if (expr.type === 'Number') {
        return expr.value;
    }
    if (expr.type === 'Identifier') {
        return `(global.get $${expr.name})`;
    }
    if (expr.type === 'Binary') {
        const left = generateExpression(expr.left);
        const right = generateExpression(expr.right);
        return `(${expr.operator} ${left} ${right})`;
    }
    return '0';
}

const wat = watLines.join('\n');
console.log(wat);
fs.writeFileSync('compiled.wat', wat);
console.log('\n✅ Сгенерирован compiled.wat');
console.log('\n🔧 Скомпилируйте его: wat2wasm compiled.wat -o compiled.wasm');
