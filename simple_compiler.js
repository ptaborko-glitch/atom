import fs from 'fs';

const runtimeWasm = fs.readFileSync('./runtime.wasm');
const runtimeModule = await WebAssembly.compile(runtimeWasm);
const runtimeInstance = await WebAssembly.instantiate(runtimeModule, {});

const memory = runtimeInstance.exports.memory;
const view = new Uint8Array(memory.buffer);

const code = `x = 42 + 1`;
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
    const name = `var_${currentValue}`;
    eat(exports.TOKEN_IDENT.value);
    return { type: 'Identifier', name };
}

function parsePrimary() {
    if (peek(exports.TOKEN_NUMBER.value)) return parseNumber();
    if (peek(exports.TOKEN_IDENT.value)) return parseIdentifier();
    throw new Error(`Unexpected: ${currentToken}`);
}

function parseExpression() {
    let left = parsePrimary();
    if (peek(exports.TOKEN_PLUS.value)) {
        eat(exports.TOKEN_PLUS.value);
        const right = parsePrimary();
        return { type: 'Binary', operator: '+', left, right };
    }
    return left;
}

function parseAssignment() {
    const name = `var_${currentValue}`;
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
    const stmt = parseAssignment();
    return stmt;
}

console.log('=== Компилятор ===');
const ast = parseProgram();
console.log('AST:', JSON.stringify(ast, null, 2));

let wat = '(module\n';
wat += '  (memory 1)\n';
wat += '  (export "memory" (memory 0))\n';
wat += '  (func $main (result f64)\n';
wat += '    (local $temp f64)\n';

if (ast && ast.type === 'Assign') {
    if (ast.value.type === 'Number') {
        wat += `    f64.const ${ast.value.value}\n`;
    } else if (ast.value.type === 'Binary') {
        wat += `    f64.const ${ast.value.left.value}\n`;
        wat += `    f64.const ${ast.value.right.value}\n`;
        if (ast.value.operator === '+') wat += '    f64.add\n';
    }
    wat += '    return\n';
}

wat += '  )\n';
wat += '  (export "main" (func $main))\n';
wat += ')';

console.log('\n=== WAT ===');
console.log(wat);
fs.writeFileSync('output.wat', wat);
console.log('\n✅ Готово!');
