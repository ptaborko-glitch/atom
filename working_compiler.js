import fs from 'fs';

const runtimeWasm = fs.readFileSync('./runtime.wasm');
const runtimeModule = await WebAssembly.compile(runtimeWasm);
const runtimeInstance = await WebAssembly.instantiate(runtimeModule, {});

const memory = runtimeInstance.exports.memory;
const view = new Uint8Array(memory.buffer);

const code = "1 + 2";
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
exports.TOKEN_PLUS.value = 2;

exports.CHAR_SPACE.value = 32;
exports.CHAR_PLUS.value = 43;
exports.CHAR_ZERO.value = 48;
exports.CHAR_NINE.value = 57;

exports.lexer_source.value = strPtr;
exports.lexer_length.value = len;
exports.lexer_pos.value = 0;

let currentToken;
let currentValue;

function nextToken() {
    currentToken = exports.lexer_next_token();
    currentValue = exports.lexer_token_value.value;
    console.log(`  токен: ${currentToken}, значение: ${currentValue}`);
    return currentToken;
}

function parseExpression() {
    console.log('  parseExpression: начало');
    if (currentToken === exports.TOKEN_NUMBER.value) {
        const num = currentValue;
        console.log(`  число: ${num}`);
        nextToken();
        if (currentToken === exports.TOKEN_PLUS.value) {
            console.log(`  оператор: +`);
            nextToken();
            if (currentToken === exports.TOKEN_NUMBER.value) {
                const num2 = currentValue;
                console.log(`  число: ${num2}`);
                nextToken();
                const result = num + num2;
                console.log(`  результат: ${result}`);
                return result;
            }
        }
        return num;
    }
    return 0;
}

console.log('\n=== Компилятор ===');
console.log('Код:', code);
console.log('\nТокены:');
nextToken();
const result = parseExpression();
console.log(`\n✅ Результат вычисления: ${result}`);
console.log(`📊 Тип результата: ${typeof result}`);

// Генерация WAT
let wat = '(module\n';
wat += '  (func $main (result f64)\n';
wat += `    f64.const ${result}\n`;
wat += '    return\n';
wat += '  )\n';
wat += '  (export "main" (func $main))\n';
wat += ')';

console.log('\n=== Сгенерированный WAT ===');
console.log(wat);
fs.writeFileSync('working.wat', wat);
console.log('\n✅ working.wat создан');
console.log('\n🔧 Скомпилируйте и запустите:');
console.log('wat2wasm working.wat -o working.wasm');
console.log('node -e "require(\"fs\").readFileSync(\"working.wasm\").then(m => WebAssembly.instantiate(m)).then(i => console.log(i.instance.exports.main()))"');
