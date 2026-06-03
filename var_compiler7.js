import fs from 'fs';

const filename = process.argv[2];
if (!filename) {
    console.log('Usage: node var_compiler7.js <file.atom>');
    process.exit(1);
}

const source = fs.readFileSync(filename, 'utf8');
console.log(`Compiling ${filename}...`);
console.log(`Source:\n${source}\n`);

const runtimeWasm = fs.readFileSync('./runtime.wasm');
const runtimeModule = await WebAssembly.compile(runtimeWasm);
const runtimeInstance = await WebAssembly.instantiate(runtimeModule, {});

const memory = runtimeInstance.exports.memory;
const view = new Uint8Array(memory.buffer);

// Функция для чтения строки из памяти
function readString(ptr) {
    const len = view[ptr];
    const chars = [];
    for (let i = 0; i < len; i++) {
        chars.push(String.fromCharCode(view[ptr + 4 + i]));
    }
    return chars.join('');
}

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
exports.TOKEN_NEWLINE.value = 22;

exports.CHAR_EOF.value = -1;
exports.CHAR_SPACE.value = 32;
exports.CHAR_NEWLINE.value = 10;
exports.CHAR_PLUS.value = 43;
exports.CHAR_ASSIGN.value = 61;
exports.CHAR_ZERO.value = 48;
exports.CHAR_NINE.value = 57;
exports.CHAR_A_LOWER.value = 97;
exports.CHAR_Z_LOWER.value = 122;

exports.lexer_source.value = strPtr;
exports.lexer_length.value = len;
exports.lexer_pos.value = 0;

console.log('=== Токены ===');
let tokens = [];
for (let i = 0; i < 100; i++) {
    const token = exports.lexer_next_token();
    const value = exports.lexer_token_value.value;
    if (token === -1) break;
    
    // Для идентификаторов, читаем имя
    let name = null;
    if (token === 1) {
        name = readString(value);
    }
    tokens.push({ token, value, name });
    console.log(`${i}: token=${token}, value=${value}${name ? `, name="${name}"` : ''}`);
}

// Строим отображение указателей на имена переменных
let varMap = new Map();
let varCounter = 0;

for (const t of tokens) {
    if (t.token === 1 && t.name) {
        if (!varMap.has(t.name)) {
            varMap.set(t.name, `var${varCounter++}`);
        }
    }
}

console.log('\nVariable mapping:', Object.fromEntries(varMap));

let pos = 0;

function getVarName(name) {
    return varMap.get(name) || `var${varCounter++}`;
}

function parsePrimary() {
    const t = tokens[pos];
    if (t.token === 0) {
        pos++;
        return { type: 'number', value: t.value };
    }
    if (t.token === 1) {
        const name = getVarName(t.name);
        pos++;
        return { type: 'ident', name };
    }
    return { type: 'number', value: 0 };
}

function parseExpression() {
    let left = parsePrimary();
    if (pos < tokens.length && tokens[pos].token === 2) {
        pos++;
        const right = parsePrimary();
        left = { type: 'binary', op: '+', left, right };
    }
    return left;
}

function parseAssignment() {
    const t = tokens[pos];
    if (t.token === 1) {
        const name = getVarName(t.name);
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
console.log('\nStatements:', statements.map(s => `${s.name} = ${JSON.stringify(s.value)}`));

let wat = '(module\n';
wat += '  (func $main (result f64)\n';

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
        return `${left}\n    ${right}\n    f64.add`;
    }
    return 'f64.const 0';
}

const outfile = filename.replace('.atom', '.wat');
fs.writeFileSync(outfile, wat);
console.log(`\n✅ Compiled to ${outfile}`);
console.log('\nWAT:');
console.log(wat);
