(module
  (global $var0 (mut f64) (f64.const 0))
  (func $main (result f64)
    f64.const 42
    global.set $var0
    global.get $var0
    return
  )
  (export "main" (func $main))
)