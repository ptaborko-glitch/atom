import fs from 'fs';

console.log('=== Простой компилятор для 3 строк ===');

const x = 42;
const y = x + 1;
const z = y * 2;

console.log(`x = ${x}`);
console.log(`y = ${y}`);
console.log(`z = ${z}`);

const wat = `(module
  (global $x (mut f64) (f64.const 0))
  (global $y (mut f64) (f64.const 0))
  (global $z (mut f64) (f64.const 0))
  (func $main (result f64)
    f64.const ${x}
    global.set $x
    global.get $x
    f64.const 1
    f64.add
    global.set $y
    global.get $y
    f64.const 2
    f64.mul
    global.set $z
    global.get $z
    return
  )
  (export "main" (func $main))
)`;

fs.writeFileSync('simple_advanced.wat', wat);
console.log('\n✅ simple_advanced.wat создан');
console.log(wat);
