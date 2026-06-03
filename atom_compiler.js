import fs from 'fs';

const filename = process.argv[2];
if (!filename) {
    console.log('Usage: node atom_compiler.js <file.atom>');
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
exports.TOKEN_PLUS.value = 2;
exports.TOKEN_MINUS.value = 3;
exports.TOKEN_STAR.value = 4;
exports.TOKEN_SLASH.value = 5;
exports.TOKEN_LPAREN.value = 14;
exports.TOKEN_RPAREN.value = 15;

exports.CHAR_SPACE.value = 32;
exports.CHAR_PLUS.value = 43;
exports.CHAR_MINUS.value = 45;
exports.CHAR_STAR.value = 42;
exports.CHAR_SLASH.value = 47;
exports.CHAR_LPAREN.value = 40;
exports.CHAR_RPAREN.value = 41;
exports.CHAR_ZERO.value = 48;
exports.CHAR_NINE.value = 57;

exports.lexer_source.value = strPtr;
exports.lexer_length.value = len;
exports.lexer_pos.value = 0;

let tokens = [];
for (let i = 0; i < 100; i++) {
    const token = exports.lexer_next_token();
    const value = exports.lexer_token_value.value;
    if (token === -1) break;
    tokens.push({ token, value });
}

let pos = 0;

function parsePrimary() {
    const t = tokens[pos];
    if (t.token === 0) {
        pos++;
        return t.value;
    }
    if (t.token === 14) {
        pos++;
        const expr = parseExpression();
        if (tokens[pos] && tokens[pos].token === 15) pos++;
        return expr;
    }
    return 0;
}

function parseMultiplication() {
    let left = parsePrimary();
    while (pos < tokens.length) {
        const t = tokens[pos];
        if (t.token === 4) {
            pos++;
            left = left * parsePrimary();
        } else if (t.token === 5) {
            pos++;
            left = left / parsePrimary();
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
            left = left + parseMultiplication();
        } else if (t.token === 3) {
            pos++;
            left = left - parseMultiplication();
        } else {
            break;
        }
    }
    return left;
}

function parseExpression() {
    return parseAddition();
}

pos = 0;
const result = parseExpression();

const outfile = filename.replace('.atom', '.wat');
const wat = `(module
  (func $main (result f64)
    f64.const ${result}
    return
  )
  (export "main" (func $main))
)`;

fs.writeFileSync(outfile, wat);
console.log(`✅ Compiled to ${outfile}`);
