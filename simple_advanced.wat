(module
  (global $x (mut f64) (f64.const 0))
  (global $y (mut f64) (f64.const 0))
  (global $z (mut f64) (f64.const 0))
  (func $main (result f64)
    f64.const 42
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
)