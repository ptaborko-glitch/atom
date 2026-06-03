(module
  (func $main (result f64)
    (local $result f64)
    (local $var0 f64)
    (local $var1 f64)
    ;; var0 = 42
    f64.const 42
    local.set $var0
    ;; var1 = expr
    local.get $var1
    f64.const 1
    f64.add
    local.set $var1
    local.get $var1
    return
  )
  (export "main" (func $main))
)