import fs from 'fs';

const runtimeWasm = fs.readFileSync('./runtime.wasm');
const runtimeModule = await WebAssembly.compile(runtimeWasm);
const runtimeInstance = await WebAssembly.instantiate(runtimeModule, {});

const memory = runtimeInstance.exports.memory;
const view = new Uint8Array(memory.buffer);

const code = "x = 42 + 1";
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
exports.TOKEN_ASSIGN.value = 7;

exports.CHAR_SPACE.value = 32;
exports.CHAR_PLUS.value = 43;
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
    if (!varMap.has(ptr)) {
        varMap.set(ptr, `var${varCounter++}`);
    }
    return varMap.get(ptr);
}

function nextToken() {
    currentToken = exports.lexer_next_token();
    currentValue = exports.lexer_token_value.value;
    console.log(`  токен: ${currentToken}, значение: ${currentValue}`);
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
    const name = getVarName(currentValue);
    eat(exports.TOKEN_IDENT.value);
    return { type: 'Identifier', name };
}

function parsePrimary() {
    if (peek(exports.TOKEN_NUMBER.value)) return parseNumber();
    if (peek(exports.TOKEN_IDENT.value)) return parseIdentifier();
    throw new Error(`Unexpected token: ${currentToken}`);
}

function parseExpression() {
    let left = parsePrimary();
    while (peek(exports.TOKEN_PLUS.value)) {
        eat(exports.TOKEN_PLUS.value);
        const right = parsePrimary();
        left = { type: 'Binary', operator: '+', left, right };
    }
    return left;
}

function parseAssignment() {
    const name = getVarName(currentValue);
    eat(exports.TOKEN_IDENT.value);
    if (peek(exports.TOKEN_ASSIGN.value)) {
        eat(exports.TOKEN_ASSIGN.value);
        const value = parseExpression();
        return { type: 'Assign', name, value };
    }
    return null;
}

function parseProgram() {
    nextToken();
    const statements = [];
    while (!peek(exports.TOKEN_EOF.value)) {
        const stmt = parseAssignment();
        statements.push(stmt);
        // После каждого statement проверим EOF
        if (peek(exports.TOKEN_EOF.value)) break;
        // Если не EOF, но и не следующий statement (нет NEWLINE), всё равно выходим
        break;
    }
    return { type: 'Program', statements };
}

console.log('\n=== Компилятор переменных ===');
console.log('Код:', code);
console.log('\nТокены:');

const ast = parseProgram();
console.log('\nAST:', JSON.stringify(ast, null, 2));

let wat = '(module\n';
wat += '  (memory 1)\n';
wat += '  (export "memory" (memory 0))\n';

const variables = new Set();
for (const stmt of ast.statements) {
    if (stmt.type === 'Assign') {
        variables.add(stmt.name);
    }
}

for (const varName of variables) {
    wat += `  (global $${varName} (mut f64) (f64.const 0))\n`;
}
wat += '\n';

wat += '  (func $main (result f64)\n';

for (const stmt of ast.statements) {
    if (stmt.type === 'Assign') {
        const value = generateExpression(stmt.value);
        wat += `    ;; ${stmt.name} = ${value}\n`;
        wat += `    ${value}\n`;
        wat += `    global.set $${stmt.name}\n`;
    }
}

if (ast.statements.length > 0) {
    const lastStmt = ast.statements[ast.statements.length - 1];
    if (lastStmt.type === 'Assign') {
        wat += `    global.get $${lastStmt.name}\n`;
        wat += '    return\n';
    } else {
        wat += '    f64.const 0\n';
        wat += '    return\n';
    }
} else {
    wat += '    f64.const 0\n';
    wat += '    return\n';
}

wat += '  )\n';
wat += '  (export "main" (func $main))\n';
wat += ')';

function generateExpression(expr) {
    if (expr.type === 'Number') {
        return `f64.const ${expr.value}`;
    }
    if (expr.type === 'Identifier') {
        return `global.get $${expr.name}`;
    }
    if (expr.type === 'Binary') {
        const left = generateExpression(expr.left);
        const right = generateExpression(expr.right);
        if (expr.operator === '+') {
            return `(${left}\n    ${right}\n    f64.add)`;
        }
    }
    return 'f64.const 0';
}

console.log('\n=== Сгенерированный WAT ===');
console.log(wat);
fs.writeFileSync('variable.wat', wat);
console.log('\n✅ variable.wat создан');
