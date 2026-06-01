;; runtime.wat — Рантайм для языка Atom
;; Тензорные операции, функции активации, агенты, строки, списки
(module
  (memory (export "memory") 256)

  ;; ============================================================
  ;; ФУНКЦИИ АКТИВАЦИИ (числовые)
  ;; ============================================================

  (func $sigmoid (param $x f64) (result f64)
    f64.const 1.0
    local.get $x
    f64.neg
    call $exp
    f64.const 1.0
    f64.add
    f64.div
  )
  (export "sigmoid" (func $sigmoid))

  (func $relu (param $x f64) (result f64)
    local.get $x
    f64.const 0.0
    f64.max
  )
  (export "relu" (func $relu))

  (func $tanh (param $x f64) (result f64)
    f64.const 2.0
    local.get $x
    f64.mul
    call $exp
    local.tee $x
    f64.const 1.0
    f64.sub
    local.get $x
    f64.const 1.0
    f64.add
    f64.div
  )
  (export "tanh" (func $tanh))

  ;; ============================================================
  ;; ТЕНЗОРНЫЕ ОПЕРАЦИИ
  ;; ============================================================

  (func $tensor_create (param $rows i32) (param $cols i32) (result i32)
    (local $ptr i32)
    (local $size i32)
    local.get $rows
    local.get $cols
    i32.mul
    i32.const 8
    i32.mul
    i32.const 8
    i32.add
    local.set $size
    memory.size
    local.set $ptr
    local.get $ptr
    local.get $size
    i32.const 65535
    i32.add
    i32.const 65536
    i32.div_u
    memory.grow
    drop
    memory.size
    i32.const 65536
    i32.mul
    local.set $ptr
    local.get $ptr
    local.get $rows
    i32.store offset=0
    local.get $ptr
    local.get $cols
    i32.store offset=4
    local.get $ptr
    i32.const 8
    i32.add
    i32.const 0
    local.get $size
    i32.const 8
    i32.sub
    memory.fill
    local.get $ptr
    return
  )
  (export "tensor_create" (func $tensor_create))

  (func $tensor_get (param $ptr i32) (param $row i32) (param $col i32) (result f64)
    (local $cols i32)
    local.get $ptr
    i32.load offset=4
    local.set $cols
    local.get $ptr
    i32.const 8
    i32.add
    local.get $row
    local.get $cols
    i32.mul
    local.get $col
    i32.add
    i32.const 8
    i32.mul
    i32.add
    f64.load
    return
  )
  (export "tensor_get" (func $tensor_get))

  (func $tensor_set (param $ptr i32) (param $row i32) (param $col i32) (param $value f64)
    (local $cols i32)
    local.get $ptr
    i32.load offset=4
    local.set $cols
    local.get $ptr
    i32.const 8
    i32.add
    local.get $row
    local.get $cols
    i32.mul
    local.get $col
    i32.add
    i32.const 8
    i32.mul
    i32.add
    local.get $value
    f64.store
    return
  )
  (export "tensor_set" (func $tensor_set))

  (func $tensor_get_rows (param $ptr i32) (result i32)
    local.get $ptr
    i32.load offset=0
    return
  )
  (export "tensor_get_rows" (func $tensor_get_rows))

  (func $tensor_get_cols (param $ptr i32) (result i32)
    local.get $ptr
    i32.load offset=4
    return
  )
  (export "tensor_get_cols" (func $tensor_get_cols))

  (func $tensor_print (param $ptr i32)
    return
  )
  (export "tensor_print" (func $tensor_print))

  (func $tensor_random (param $ptr i32) (param $seed f64)
    (local $rows i32)
    (local $cols i32)
    (local $total i32)
    (local $i i32)
    (local $value f64)
    local.get $ptr
    i32.load offset=0
    local.set $rows
    local.get $ptr
    i32.load offset=4
    local.set $cols
    local.get $rows
    local.get $cols
    i32.mul
    local.set $total
    i32.const 0
    local.set $i
    block $done
      loop $fill
        local.get $i
        local.get $total
        i32.ge_s
        br_if $done
        local.get $i
        i32.const 1103515245
        i32.mul
        i32.const 12345
        i32.add
        i32.const 2147483647
        i32.and
        f64.convert_i32_s
        f64.const 2147483647.0
        f64.div
        f64.const 2.0
        f64.mul
        f64.const 1.0
        f64.sub
        local.set $value
        local.get $ptr
        i32.const 8
        i32.add
        local.get $i
        i32.const 8
        i32.mul
        i32.add
        local.get $value
        f64.store
        local.get $i
        i32.const 1
        i32.add
        local.set $i
        br $fill
      end
    end
    return
  )
  (export "tensor_random" (func $tensor_random))

  (func $tensor_matmul (param $a_ptr i32) (param $b_ptr i32) (result i32)
    (local $m i32)
    (local $n i32)
    (local $k i32)
    (local $c_ptr i32)
    (local $i i32)
    (local $j i32)
    (local $p i32)
    (local $sum f64)
    (local $a_val f64)
    (local $b_val f64)
    local.get $a_ptr
    i32.load offset=0
    local.set $m
    local.get $a_ptr
    i32.load offset=4
    local.set $n
    local.get $b_ptr
    i32.load offset=4
    local.set $k
    local.get $m
    local.get $k
    call $tensor_create
    local.set $c_ptr
    i32.const 0
    local.set $i
    block $i_done
      loop $i_loop
        local.get $i
        local.get $m
        i32.ge_s
        br_if $i_done
        i32.const 0
        local.set $j
        block $j_done
          loop $j_loop
            local.get $j
            local.get $k
            i32.ge_s
            br_if $j_done
            f64.const 0.0
            local.set $sum
            i32.const 0
            local.set $p
            block $p_done
              loop $p_loop
                local.get $p
                local.get $n
                i32.ge_s
                br_if $p_done
                local.get $a_ptr
                local.get $i
                local.get $p
                call $tensor_get
                local.set $a_val
                local.get $b_ptr
                local.get $p
                local.get $j
                call $tensor_get
                local.set $b_val
                local.get $sum
                local.get $a_val
                local.get $b_val
                f64.mul
                f64.add
                local.set $sum
                local.get $p
                i32.const 1
                i32.add
                local.set $p
                br $p_loop
              end
            end
            local.get $c_ptr
            local.get $i
            local.get $j
            local.get $sum
            call $tensor_set
            local.get $j
            i32.const 1
            i32.add
            local.set $j
            br $j_loop
          end
        end
        local.get $i
        i32.const 1
        i32.add
        local.set $i
        br $i_loop
      end
    end
    local.get $c_ptr
    return
  )
  (export "tensor_matmul" (func $tensor_matmul))

  (func $tensor_add (param $a_ptr i32) (param $b_ptr i32) (result i32)
    (local $rows i32)
    (local $cols i32)
    (local $total i32)
    (local $c_ptr i32)
    (local $i i32)
    local.get $a_ptr
    i32.load offset=0
    local.set $rows
    local.get $a_ptr
    i32.load offset=4
    local.set $cols
    local.get $rows
    local.get $cols
    call $tensor_create
    local.set $c_ptr
    local.get $rows
    local.get $cols
    i32.mul
    local.set $total
    i32.const 0
    local.set $i
    block $add_done
      loop $add_loop
        local.get $i
        local.get $total
        i32.ge_s
        br_if $add_done
        local.get $c_ptr
        i32.const 8
        i32.add
        local.get $i
        i32.const 8
        i32.mul
        i32.add
        local.get $a_ptr
        i32.const 8
        i32.add
        local.get $i
        i32.const 8
        i32.mul
        i32.add
        f64.load
        local.get $b_ptr
        i32.const 8
        i32.add
        local.get $i
        i32.const 8
        i32.mul
        i32.add
        f64.load
        f64.add
        f64.store
        local.get $i
        i32.const 1
        i32.add
        local.set $i
        br $add_loop
      end
    end
    local.get $c_ptr
    return
  )
  (export "tensor_add" (func $tensor_add))

  (func $tensor_sub (param $a_ptr i32) (param $b_ptr i32) (result i32)
    (local $rows i32)
    (local $cols i32)
    (local $total i32)
    (local $c_ptr i32)
    (local $i i32)
    local.get $a_ptr
    i32.load offset=0
    local.set $rows
    local.get $a_ptr
    i32.load offset=4
    local.set $cols
    local.get $rows
    local.get $cols
    call $tensor_create
    local.set $c_ptr
    local.get $rows
    local.get $cols
    i32.mul
    local.set $total
    i32.const 0
    local.set $i
    block $sub_done
      loop $sub_loop
        local.get $i
        local.get $total
        i32.ge_s
        br_if $sub_done
        local.get $c_ptr
        i32.const 8
        i32.add
        local.get $i
        i32.const 8
        i32.mul
        i32.add
        local.get $a_ptr
        i32.const 8
        i32.add
        local.get $i
        i32.const 8
        i32.mul
        i32.add
        f64.load
        local.get $b_ptr
        i32.const 8
        i32.add
        local.get $i
        i32.const 8
        i32.mul
        i32.add
        f64.load
        f64.sub
        f64.store
        local.get $i
        i32.const 1
        i32.add
        local.set $i
        br $sub_loop
      end
    end
    local.get $c_ptr
    return
  )
  (export "tensor_sub" (func $tensor_sub))

  (func $tensor_mul_scalar (param $ptr i32) (param $scalar f64)
    (local $rows i32)
    (local $cols i32)
    (local $total i32)
    (local $i i32)
    (local $addr i32)
    local.get $ptr
    i32.load offset=0
    local.set $rows
    local.get $ptr
    i32.load offset=4
    local.set $cols
    local.get $rows
    local.get $cols
    i32.mul
    local.set $total
    i32.const 0
    local.set $i
    block $mul_done
      loop $mul_loop
        local.get $i
        local.get $total
        i32.ge_s
        br_if $mul_done
        local.get $ptr
        i32.const 8
        i32.add
        local.get $i
        i32.const 8
        i32.mul
        i32.add
        local.set $addr
        local.get $addr
        local.get $addr
        f64.load
        local.get $scalar
        f64.mul
        f64.store
        local.get $i
        i32.const 1
        i32.add
        local.set $i
        br $mul_loop
      end
    end
    return
  )
  (export "tensor_mul_scalar" (func $tensor_mul_scalar))

  (func $tensor_sigmoid (param $ptr i32)
    (local $rows i32)
    (local $cols i32)
    (local $total i32)
    (local $i i32)
    (local $addr i32)
    local.get $ptr
    i32.load offset=0
    local.set $rows
    local.get $ptr
    i32.load offset=4
    local.set $cols
    local.get $rows
    local.get $cols
    i32.mul
    local.set $total
    i32.const 0
    local.set $i
    block $sig_done
      loop $sig_loop
        local.get $i
        local.get $total
        i32.ge_s
        br_if $sig_done
        local.get $ptr
        i32.const 8
        i32.add
        local.get $i
        i32.const 8
        i32.mul
        i32.add
        local.set $addr
        local.get $addr
        local.get $addr
        f64.load
        call $sigmoid
        f64.store
        local.get $i
        i32.const 1
        i32.add
        local.set $i
        br $sig_loop
      end
    end
    return
  )
  (export "tensor_sigmoid" (func $tensor_sigmoid))

  (func $tensor_relu (param $ptr i32)
    (local $rows i32)
    (local $cols i32)
    (local $total i32)
    (local $i i32)
    (local $addr i32)
    local.get $ptr
    i32.load offset=0
    local.set $rows
    local.get $ptr
    i32.load offset=4
    local.set $cols
    local.get $rows
    local.get $cols
    i32.mul
    local.set $total
    i32.const 0
    local.set $i
    block $relu_done
      loop $relu_loop
        local.get $i
        local.get $total
        i32.ge_s
        br_if $relu_done
        local.get $ptr
        i32.const 8
        i32.add
        local.get $i
        i32.const 8
        i32.mul
        i32.add
        local.set $addr
        local.get $addr
        local.get $addr
        f64.load
        call $relu
        f64.store
        local.get $i
        i32.const 1
        i32.add
        local.set $i
        br $relu_loop
      end
    end
    return
  )
  (export "tensor_relu" (func $tensor_relu))

  (func $tensor_tanh (param $ptr i32)
    (local $rows i32)
    (local $cols i32)
    (local $total i32)
    (local $i i32)
    (local $addr i32)
    local.get $ptr
    i32.load offset=0
    local.set $rows
    local.get $ptr
    i32.load offset=4
    local.set $cols
    local.get $rows
    local.get $cols
    i32.mul
    local.set $total
    i32.const 0
    local.set $i
    block $tanh_done
      loop $tanh_loop
        local.get $i
        local.get $total
        i32.ge_s
        br_if $tanh_done
        local.get $ptr
        i32.const 8
        i32.add
        local.get $i
        i32.const 8
        i32.mul
        i32.add
        local.set $addr
        local.get $addr
        local.get $addr
        f64.load
        call $tanh
        f64.store
        local.get $i
        i32.const 1
        i32.add
        local.set $i
        br $tanh_loop
      end
    end
    return
  )
  (export "tensor_tanh" (func $tensor_tanh))

  (func $tensor_get_element (param $ptr i32) (param $index i32) (result f64)
    local.get $ptr
    i32.const 8
    i32.add
    local.get $index
    i32.const 8
    i32.mul
    i32.add
    f64.load
    return
  )
  (export "tensor_get_element" (func $tensor_get_element))

  ;; ============================================================
  ;; АГЕНТЫ
  ;; ============================================================

  (func $agent_alloc (param $size i32) (result i32)
    (local $ptr i32)
    local.get $size
    i32.const 65535
    i32.add
    i32.const 65536
    i32.div_u
    memory.grow
    drop
    memory.size
    i32.const 65536
    i32.mul
    local.set $ptr
    local.get $ptr
    i32.const 0
    local.get $size
    memory.fill
    local.get $ptr
    return
  )
  (export "agent_alloc" (func $agent_alloc))

  ;; ============================================================
  ;; СПИСКИ
  ;; ============================================================

  (func $list_create (param $capacity i32) (result i32)
    (local $ptr i32)
    (local $size i32)
    local.get $capacity
    i32.const 8
    i32.mul
    i32.const 8
    i32.add
    local.set $size
    memory.size
    local.set $ptr
    local.get $ptr
    local.get $size
    i32.const 65535
    i32.add
    i32.const 65536
    i32.div_u
    memory.grow
    drop
    memory.size
    i32.const 65536
    i32.mul
    local.set $ptr
    local.get $ptr
    local.get $capacity
    i32.store offset=0
    local.get $ptr
    i32.const 0
    i32.store offset=4
    local.get $ptr
    return
  )
  (export "list_create" (func $list_create))

  (func $list_add (param $ptr i32) (param $value f64)
    (local $len i32)
    local.get $ptr
    i32.load offset=4
    local.set $len
    local.get $ptr
    i32.const 8
    i32.add
    local.get $len
    i32.const 8
    i32.mul
    i32.add
    local.get $value
    f64.store
    local.get $ptr
    local.get $len
    i32.const 1
    i32.add
    i32.store offset=4
    return
  )
  (export "list_add" (func $list_add))

  (func $list_get (param $ptr i32) (param $index i32) (result f64)
    local.get $ptr
    i32.const 8
    i32.add
    local.get $index
    i32.const 8
    i32.mul
    i32.add
    f64.load
    return
  )
  (export "list_get" (func $list_get))

  (func $list_len (param $ptr i32) (result i32)
    local.get $ptr
    i32.load offset=4
    return
  )
  (export "list_len" (func $list_len))

  ;; ============================================================
  ;; СТРОКИ
  ;; ============================================================

  (func $string_create (param $length i32) (result i32)
    (local $ptr i32)
    (local $size i32)
    local.get $length
    i32.const 4
    i32.add
    local.set $size
    memory.size
    local.set $ptr
    local.get $ptr
    local.get $size
    i32.const 65535
    i32.add
    i32.const 65536
    i32.div_u
    memory.grow
    drop
    memory.size
    i32.const 65536
    i32.mul
    local.set $ptr
    local.get $ptr
    local.get $length
    i32.store offset=0
    local.get $ptr
    i32.const 4
    i32.add
    i32.const 0
    local.get $length
    memory.fill
    local.get $ptr
    return
  )
  (export "string_create" (func $string_create))

  (func $string_len (param $ptr i32) (result i32)
    local.get $ptr
    i32.load offset=0
    return
  )
  (export "string_len" (func $string_len))

  (func $string_char_code_at (param $ptr i32) (param $index i32) (result f64)
    (local $len i32)
    local.get $ptr
    i32.load offset=0
    local.set $len
    local.get $index
    local.get $len
    i32.ge_s
    if
      f64.const -1.0
      return
    end
    local.get $ptr
    i32.const 4
    i32.add
    local.get $index
    i32.add
    i32.load8_u
    f64.convert_i32_u
    return
  )
  (export "string_char_code_at" (func $string_char_code_at))

  (func $string_char_at (param $ptr i32) (param $index i32) (result f64)
    local.get $ptr
    local.get $index
    call $string_char_code_at
    return
  )
  (export "string_char_at" (func $string_char_at))

  (func $string_substring (param $ptr i32) (param $start i32) (param $length i32) (result i32)
    (local $new_ptr i32)
    (local $i i32)
    (local $char_code i32)
    local.get $length
    call $string_create
    local.set $new_ptr
    i32.const 0
    local.set $i
    block $sub_done
      loop $sub_loop
        local.get $i
        local.get $length
        i32.ge_s
        br_if $sub_done
        local.get $ptr
        i32.const 4
        i32.add
        local.get $start
        local.get $i
        i32.add
        i32.add
        i32.load8_u
        local.set $char_code
        local.get $new_ptr
        i32.const 4
        i32.add
        local.get $i
        i32.add
        local.get $char_code
        i32.store8
        local.get $i
        i32.const 1
        i32.add
        local.set $i
        br $sub_loop
      end
    end
    local.get $new_ptr
    return
  )
  (export "string_substring" (func $string_substring))

  (func $string_concat (param $ptr1 i32) (param $ptr2 i32) (result i32)
    (local $len1 i32)
    (local $len2 i32)
    (local $total i32)
    (local $new_ptr i32)
    (local $i i32)
    (local $char_code i32)
    local.get $ptr1
    i32.load offset=0
    local.set $len1
    local.get $ptr2
    i32.load offset=0
    local.set $len2
    local.get $len1
    local.get $len2
    i32.add
    local.set $total
    local.get $total
    call $string_create
    local.set $new_ptr
    i32.const 0
    local.set $i
    block $copy1_done
      loop $copy1_loop
        local.get $i
        local.get $len1
        i32.ge_s
        br_if $copy1_done
        local.get $ptr1
        i32.const 4
        i32.add
        local.get $i
        i32.add
        i32.load8_u
        local.set $char_code
        local.get $new_ptr
        i32.const 4
        i32.add
        local.get $i
        i32.add
        local.get $char_code
        i32.store8
        local.get $i
        i32.const 1
        i32.add
        local.set $i
        br $copy1_loop
      end
    end
    i32.const 0
    local.set $i
    block $copy2_done
      loop $copy2_loop
        local.get $i
        local.get $len2
        i32.ge_s
        br_if $copy2_done
        local.get $ptr2
        i32.const 4
        i32.add
        local.get $i
        i32.add
        i32.load8_u
        local.set $char_code
        local.get $new_ptr
        i32.const 4
        i32.add
        local.get $len1
        local.get $i
        i32.add
        i32.add
        local.get $char_code
        i32.store8
        local.get $i
        i32.const 1
        i32.add
        local.set $i
        br $copy2_loop
      end
    end
    local.get $new_ptr
    return
  )
  (export "string_concat" (func $string_concat))

  (func $string_set_char (param $ptr i32) (param $index i32) (param $char_code f64)
    local.get $ptr
    i32.const 4
    i32.add
    local.get $index
    i32.add
    local.get $char_code
    i32.trunc_f64_s
    i32.store8
    return
  )
  (export "string_set_char" (func $string_set_char))

  (func $string_from_char (param $char_code f64) (result i32)
    (local $ptr i32)
    i32.const 1
    call $string_create
    local.set $ptr
    local.get $ptr
    i32.const 4
    i32.add
    local.get $char_code
    i32.trunc_f64_s
    i32.store8
    local.get $ptr
    return
  )
  (export "string_from_char" (func $string_from_char))

  ;; ============================================================
  ;; ФУНКЦИИ ПОТЕРЬ
  ;; ============================================================

  (func $mse (param $pred_ptr i32) (param $target_ptr i32) (result f64)
    (local $rows i32)
    (local $cols i32)
    (local $total i32)
    (local $i i32)
    (local $diff f64)
    (local $sum f64)
    local.get $pred_ptr
    i32.load offset=0
    local.set $rows
    local.get $pred_ptr
    i32.load offset=4
    local.set $cols
    local.get $rows
    local.get $cols
    i32.mul
    local.set $total
    f64.const 0.0
    local.set $sum
    i32.const 0
    local.set $i
    block $mse_done
      loop $mse_loop
        local.get $i
        local.get $total
        i32.ge_s
        br_if $mse_done
        local.get $pred_ptr
        i32.const 8
        i32.add
        local.get $i
        i32.const 8
        i32.mul
        i32.add
        f64.load
        local.get $target_ptr
        i32.const 8
        i32.add
        local.get $i
        i32.const 8
        i32.mul
        i32.add
        f64.load
        f64.sub
        local.set $diff
        local.get $sum
        local.get $diff
        local.get $diff
        f64.mul
        f64.add
        local.set $sum
        local.get $i
        i32.const 1
        i32.add
        local.set $i
        br $mse_loop
      end
    end
    local.get $sum
    local.get $total
    f64.convert_i32_s
    f64.div
    return
  )
  (export "mse" (func $mse))

  ;; ============================================================
  ;; ОПТИМИЗАТОРЫ
  ;; ============================================================

  (func $sgd_step (param $param_ptr i32) (param $grad_ptr i32) (param $lr f64)
    (local $rows i32)
    (local $cols i32)
    (local $total i32)
    (local $i i32)
    (local $addr i32)
    local.get $param_ptr
    i32.load offset=0
    local.set $rows
    local.get $param_ptr
    i32.load offset=4
    local.set $cols
    local.get $rows
    local.get $cols
    i32.mul
    local.set $total
    i32.const 0
    local.set $i
    block $sgd_done
      loop $sgd_loop
        local.get $i
        local.get $total
        i32.ge_s
        br_if $sgd_done
        local.get $param_ptr
        i32.const 8
        i32.add
        local.get $i
        i32.const 8
        i32.mul
        i32.add
        local.set $addr
        local.get $addr
        local.get $addr
        f64.load
        local.get $grad_ptr
        i32.const 8
        i32.add
        local.get $i
        i32.const 8
        i32.mul
        i32.add
        f64.load
        local.get $lr
        f64.mul
        f64.sub
        f64.store
        local.get $i
        i32.const 1
        i32.add
        local.set $i
        br $sgd_loop
      end
    end
    return
  )
  (export "sgd_step" (func $sgd_step))

  ;; ============================================================
  ;; ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
  ;; ============================================================

  (func $random (result f64)
    i32.const 123456789
    i32.const 1103515245
    i32.mul
    i32.const 12345
    i32.add
    i32.const 2147483647
    i32.and
    f64.convert_i32_s
    f64.const 2147483647.0
    f64.div
    f64.const 2.0
    f64.mul
    f64.const 1.0
    f64.sub
    return
  )
  (export "random" (func $random))

  (func $softmax (param $ptr i32)
    return
  )
  (export "softmax" (func $softmax))

  (func $cross_entropy (param $pred_ptr i32) (param $target_ptr i32) (result f64)
    f64.const 0.0
    return
  )
  (export "cross_entropy" (func $cross_entropy))

  (func $nn_dense (param $input i32) (param $target i32)
                   (param $layers i32) (param $neurons i32)
                   (param $activation i32) (param $epochs i32)
                   (param $lr f64) (result i32)
    i32.const 0
    return
  )
  (export "nn_dense" (func $nn_dense))

  (func $load_csv (param $path_ptr i32) (param $rows i32) (param $cols i32) (result i32)
    local.get $rows
    local.get $cols
    call $tensor_create
    return
  )
  (export "load_csv" (func $load_csv))

  (func $save_csv (param $tensor_ptr i32) (param $path_ptr i32)
    return
  )
  (export "save_csv" (func $save_csv))

  (func $train_test_split (param $data_ptr i32) (param $labels_ptr i32)
                           (param $ratio f64)
                           (param $train_data_out i32) (param $test_data_out i32)
                           (param $train_labels_out i32) (param $test_labels_out i32)
    return
  )
  (export "train_test_split" (func $train_test_split))

  (func $exp (param $x f64) (result f64)
    f64.const 1.0
    local.get $x
    f64.add
    local.get $x
    local.get $x
    f64.mul
    f64.const 0.5
    f64.mul
    f64.add
    local.get $x
    local.get $x
    local.get $x
    f64.mul
    f64.mul
    f64.const 0.16666666666666666
    f64.mul
    f64.add
    return
  )
  (export "exp" (func $exp))

  (func $log (param $x f64) (result f64)
    local.get $x
    f64.const 1.0
    f64.sub
    return
  )
  (export "log" (func $log))
)