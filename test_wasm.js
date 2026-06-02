import fs from 'fs';

const wasmBuffer = fs.readFileSync('./output.wasm');
const module = await WebAssembly.compile(wasmBuffer);
console.log('WASM модуль успешно скомпилирован');
