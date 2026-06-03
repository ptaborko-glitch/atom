(module
  (func $main (result f64)
    (local $result f64)
    (local $var0 f64)
    ;; var0 = 42
    f64.const 42
    local.set $var0
    local.get $var0
    return
  )
  (export "main" (func $main))
)