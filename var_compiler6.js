import fs from 'fs';

const filename = process.argv[2];
if (!filename) {
    console.log('Usage: node var_compiler6.js <file.atom>');
    process.exit(1);
}

const source = fs.readFileSync(filename, 'utf8');
console.log(`Compiling ${filename}...`);

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
exports.TOKEN_MINUS.value = 3;
exports.TOKEN_STAR.value = 4;
exports.TOKEN_SLASH.value = 5;
exports.TOKEN_ASSIGN.value = 7;
exports.TOKEN_NEWLINE.value = 22;

exports.CHAR_EOF.value = -1;
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

let tokens = [];
for (let i = 0; i < 100; i++) {
    const token = exports.lexer_next_token();
    const value = exports.lexer_token_value.value;
    if (token === -1) break;
    tokens.push({ token, value });
    console.log(`${i}: token=${token}, value=${value}`);
}

// Сначала соберём все идентификаторы и их имена
let varMap = new Map();
let varCounter = 0;

for (const t of tokens) {
    if (t.token === 1) { // IDENT
        if (!varMap.has(t.value)) {
            varMap.set(t.value, `var${varCounter++}`);
        }
    }
}

console.log('\nVariable mapping:', Object.fromEntries(varMap));

let pos = 0;

function getVarName(ptr) {
    return varMap.get(ptr) || `var${varCounter++}`;
}

function parsePrimary() {
    const t = tokens[pos];
    if (t.token === 0) {
        pos++;
        return { type: 'number', value: t.value };
    }
    if (t.token === 1) {
        const name = getVarName(t.value);
        pos++;
        return { type: 'ident', name };
    }
    return { type: 'number', value: 0 };
}

function parseMultiplication() {
    let left = parsePrimary();
    while (pos < tokens.length) {
        const t = tokens[pos];
        if (t.token === 4) {
            pos++;
            const right = parsePrimary();
            left = { type: 'binary', op: '*', left, right };
        } else {
            break;
        }
    }
    return left;
}

function parseAddition() {
    let left = parseMultiplication();
    while (pos < tokens.length) {
        const t = tokens[pos];
        if (t.token === 2) {
            pos++;
            const right = parseMultiplication();
            left = { type: 'binary', op: '+', left, right };
        } else {
            break;
        }
    }
    return left;
}

function parseExpression() {
    return parseAddition();
}

function parseAssignment() {
    const t = tokens[pos];
    if (t.token === 1) {
        const name = getVarName(t.value);
        pos++;
        if (tokens[pos] && tokens[pos].token === 7) {
            pos++;
            const value = parseExpression();
            return { type: 'assign', name, value };
        }
    }
    return null;
}

function parseProgram() {
    const statements = [];
    while (pos < tokens.length) {
        while (tokens[pos] && tokens[pos].token === 22) {
            pos++;
        }
        if (pos >= tokens.length) break;
        
        const stmt = parseAssignment();
        if (stmt) statements.push(stmt);
        else break;
    }
    return statements;
}

const statements = parseProgram();
console.log('Statements:', statements.map(s => `${s.name} = ${JSON.stringify(s.value)}`));

let wat = '(module\n';
wat += '  (func $main (result f64)\n';

// Объявляем локальные переменные
for (let i = 0; i < varCounter; i++) {
    wat += `    (local $var${i} f64)\n`;
}

for (const stmt of statements) {
    const code = generateExpression(stmt.value);
    wat += `    ;; ${stmt.name} = ${stmt.value.type === 'number' ? stmt.value.value : 'expr'}\n`;
    wat += `    ${code}\n`;
    wat += `    local.set $${stmt.name}\n`;
}

if (statements.length > 0) {
    const last = statements[statements.length - 1];
    wat += `    local.get $${last.name}\n`;
} else {
    wat += '    f64.const 0\n';
}
wat += '    return\n';
wat += '  )\n';
wat += '  (export "main" (func $main))\n';
wat += ')';

function generateExpression(expr) {
    if (expr.type === 'number') {
        return `f64.const ${expr.value}`;
    }
    if (expr.type === 'ident') {
        return `local.get $${expr.name}`;
    }
    if (expr.type === 'binary') {
        const left = generateExpression(expr.left);
        const right = generateExpression(expr.right);
        const opMap = { '+': 'f64.add', '*': 'f64.mul' };
        return `${left}\n    ${right}\n    ${opMap[expr.op]}`;
    }
    return 'f64.const 0';
}

const outfile = filename.replace('.atom', '.wat');
fs.writeFileSync(outfile, wat);
console.log(`\n✅ Compiled to ${outfile}`);
console.log('\nWAT:');
console.log(wat);
