(module
  (global $x (mut f64) (f64.const 0))
  (global $y (mut f64) (f64.const 0))
  (global $z (mut f64) (f64.const 0))
  (func $main (result f64)
    f64.const 100
    global.set $x
    global.get $x
    f64.const 2
    f64.div
    global.set $y
    global.get $y
    f64.const 10
    f64.sub
    global.set $z
    global.get $z
    return
  )
  (export "main" (func $main))
)
