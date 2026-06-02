import fs from 'fs';

const runtimeWasm = fs.readFileSync('./runtime.wasm');
const runtimeModule = await WebAssembly.compile(runtimeWasm);
const runtimeInstance = await WebAssembly.instantiate(runtimeModule, {});

const memory = runtimeInstance.exports.memory;
const view = new Uint8Array(memory.buffer);

const code = `x = 42
y = x + 1
z = y * 2`;
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
exports.TOKEN_STAR.value = 4;
exports.TOKEN_ASSIGN.value = 7;
exports.TOKEN_NEWLINE.value = 22;

exports.CHAR_SPACE.value = 32;
exports.CHAR_NEWLINE.value = 10;
exports.CHAR_PLUS.value = 43;
exports.CHAR_STAR.value = 42;
exports.CHAR_ASSIGN.value = 61;
exports.CHAR_ZERO.value = 48;
exports.CHAR_NINE.value = 57;
exports.CHAR_A_LOWER.value = 97;
exports.CHAR_Z_LOWER.value = 122;

exports.lexer_source.value = strPtr;
exports.lexer_length.value = len;
exports.lexer_pos.value = 0;

console.log('=== Компиляция нескольких строк ===');

// Сбор всех токенов
let tokens = [];
for (let i = 0; i < 50; i++) {
    const token = exports.lexer_next_token();
    const value = exports.lexer_token_value.value;
    tokens.push({ token, value });
    console.log(`Токен ${i}: ${token}, значение: ${value}`);
    if (token === -1 || i > 40) break;
}

console.log(`\nВсего токенов: ${tokens.length}`);

// Простой парсер для многострочного кода
let pos = 0;
let variables = new Map();
let varCounter = 0;

function getVarName(ptr) {
    if (!variables.has(ptr)) {
        variables.set(ptr, `var${varCounter++}`);
    }
    return variables.get(ptr);
}

function parseExpression() {
    if (tokens[pos].token === 0) { // NUMBER
        const val = tokens[pos].value;
        pos++;
        return { type: 'number', value: val };
    }
    if (tokens[pos].token === 1) { // IDENT
        const ptr = tokens[pos].value;
        pos++;
        return { type: 'ident', name: getVarName(ptr) };
    }
    return { type: 'number', value: 0 };
}

function parseBinaryOp(left) {
    const op = tokens[pos].token;
    if (op === 2 || op === 4) { // PLUS or STAR
        pos++;
        const right = parseExpression();
        return { type: 'binary', op: op === 2 ? '+' : '*', left, right };
    }
    return left;
}

function parseAssignment() {
    const ptr = tokens[pos].value;
    const name = getVarName(ptr);
    pos++; // IDENT
    if (tokens[pos].token === 7) { // ASSIGN
        pos++;
        let expr = parseExpression();
        expr = parseBinaryOp(expr);
        return { type: 'assign', name, expr };
    }
    return null;
}

const statements = [];
while (pos < tokens.length && tokens[pos].token !== -1) {
    // Пропускаем NEWLINE
    while (pos < tokens.length && tokens[pos].token === 22) {
        pos++;
    }
    if (pos >= tokens.length) break;
    if (tokens[pos].token === 1) {
        const stmt = parseAssignment();
        if (stmt) statements.push(stmt);
        console.log(`Statement: ${JSON.stringify(stmt)}`);
    } else {
        break;
    }
}

console.log(`\nПолучено ${statements.length} statements`);

// Генерация WAT
let wat = '(module\n';
wat += '  (memory 1)\n';
wat += '  (export "memory" (memory 0))\n';

// Объявляем все переменные
for (const [ptr, name] of variables) {
    wat += `  (global $${name} (mut f64) (f64.const 0))\n`;
}
wat += '\n';
wat += '  (func $main (result f64)\n';

for (const stmt of statements) {
    if (stmt.type === 'assign') {
        wat += `    ;; ${stmt.name} = `;
        wat += generateExpression(stmt.expr);
        wat += `\n    global.set $${stmt.name}\n`;
    }
}

if (statements.length > 0) {
    const last = statements[statements.length - 1];
    wat += `    global.get $${last.name}\n`;
    wat += '    return\n';
} else {
    wat += '    f64.const 0\n';
    wat += '    return\n';
}
wat += '  )\n';
wat += '  (export "main" (func $main))\n';
wat += ')';

function generateExpression(expr) {
    if (expr.type === 'number') {
        return `f64.const ${expr.value}`;
    }
    if (expr.type === 'ident') {
        return `global.get $${expr.name}`;
    }
    if (expr.type === 'binary') {
        const left = generateExpression(expr.left);
        const right = generateExpression(expr.right);
        const op = expr.op === '+' ? 'f64.add' : 'f64.mul';
        return `${left}
    ${right}
    ${op}`;
    }
    return 'f64.const 0';
}

console.log('\n=== Сгенерированный WAT ===');
console.log(wat);
fs.writeFileSync('advanced.wat', wat);
console.log('\n✅ advanced.wat создан');
