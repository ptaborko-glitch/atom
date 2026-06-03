(module
  (global $var0 (mut f64) (f64.const 0))
  (global $var1 (mut f64) (f64.const 0))
  (global $var2 (mut f64) (f64.const 0))

  (func $main (result f64)
    ;; x = ...
    f64.const 42.0
    global.set $var0

    ;; y = ...
    global.get $var0
    f64.const 1.0
    f64.add
    global.set $var1

    ;; z = ...
    global.get $var1
    f64.const 2.0
    f64.mul
    global.set $var2

    ;; Возвращаем z
    global.get $var2
    return
  )
  (export "main" (func $main))
)
