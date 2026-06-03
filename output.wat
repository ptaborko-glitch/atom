(module
    (import "runtime" "string_char_code_at" (func $string_char_code_at (param i32) (param i32) (result f64)))
    (import "runtime" "string_len" (func $string_len (param i32) (result i32)))
    (import "runtime" "string_substring" (func $string_substring (param i32) (param i32) (param i32) (result i32)))
    (memory 1)
    (export "memory" (memory 0))
    (global $TOKEN_NUMBER (mut f64) (f64.const 0.0))
    (global $TOKEN_IDENT (mut f64) (f64.const 0.0))
    (global $TOKEN_PLUS (mut f64) (f64.const 0.0))
    (global $TOKEN_MINUS (mut f64) (f64.const 0.0))
    (global $TOKEN_STAR (mut f64) (f64.const 0.0))
    (global $TOKEN_SLASH (mut f64) (f64.const 0.0))
    (global $TOKEN_ASSIGN (mut f64) (f64.const 0.0))
    (global $TOKEN_NEWLINE (mut f64) (f64.const 0.0))
    (global $CHAR_SPACE (mut f64) (f64.const 0.0))
    (global $CHAR_NEWLINE (mut f64) (f64.const 0.0))
    (global $CHAR_PLUS (mut f64) (f64.const 0.0))
    (global $CHAR_MINUS (mut f64) (f64.const 0.0))
    (global $CHAR_STAR (mut f64) (f64.const 0.0))
    (global $CHAR_SLASH (mut f64) (f64.const 0.0))
    (global $CHAR_ASSIGN (mut f64) (f64.const 0.0))
    (global $CHAR_ZERO (mut f64) (f64.const 0.0))
    (global $CHAR_NINE (mut f64) (f64.const 0.0))
    (global $CHAR_A_LOWER (mut f64) (f64.const 0.0))
    (global $CHAR_Z_LOWER (mut f64) (f64.const 0.0))
    (global $lexer_source (mut f64) (f64.const 0.0))
    (global $lexer_pos (mut f64) (f64.const 0.0))
    (global $lexer_length (mut f64) (f64.const 0.0))
    (global $lexer_token_value (mut f64) (f64.const 0.0))
    (global $TOKEN_EOF (mut f64) (f64.const 0.0))
    (global $CHAR_EOF (mut f64) (f64.const 0.0))
    (global $source (mut f64) (f64.const 0.0))
    (global $ch (mut f64) (f64.const 0.0))
    (global $result (mut f64) (f64.const 0.0))
    (global $digit (mut f64) (f64.const 0.0))
    (global $start (mut f64) (f64.const 0.0))
    (global $length (mut f64) (f64.const 0.0))
    (export "TOKEN_NUMBER" (global $TOKEN_NUMBER))
    (export "TOKEN_IDENT" (global $TOKEN_IDENT))
    (export "TOKEN_PLUS" (global $TOKEN_PLUS))
    (export "TOKEN_MINUS" (global $TOKEN_MINUS))
    (export "TOKEN_STAR" (global $TOKEN_STAR))
    (export "TOKEN_SLASH" (global $TOKEN_SLASH))
    (export "TOKEN_ASSIGN" (global $TOKEN_ASSIGN))
    (export "TOKEN_NEWLINE" (global $TOKEN_NEWLINE))
    (export "CHAR_SPACE" (global $CHAR_SPACE))
    (export "CHAR_NEWLINE" (global $CHAR_NEWLINE))
    (export "CHAR_PLUS" (global $CHAR_PLUS))
    (export "CHAR_MINUS" (global $CHAR_MINUS))
    (export "CHAR_STAR" (global $CHAR_STAR))
    (export "CHAR_SLASH" (global $CHAR_SLASH))
    (export "CHAR_ASSIGN" (global $CHAR_ASSIGN))
    (export "CHAR_ZERO" (global $CHAR_ZERO))
    (export "CHAR_NINE" (global $CHAR_NINE))
    (export "CHAR_A_LOWER" (global $CHAR_A_LOWER))
    (export "CHAR_Z_LOWER" (global $CHAR_Z_LOWER))
    (export "lexer_source" (global $lexer_source))
    (export "lexer_pos" (global $lexer_pos))
    (export "lexer_length" (global $lexer_length))
    (export "lexer_token_value" (global $lexer_token_value))
    (export "TOKEN_EOF" (global $TOKEN_EOF))
    (export "CHAR_EOF" (global $CHAR_EOF))
    (export "source" (global $source))
    (export "ch" (global $ch))
    (export "result" (global $result))
    (export "digit" (global $digit))
    (export "start" (global $start))
    (export "length" (global $length))
    (func $lexer_set_source (result f64)
        (local $%29 f64)
        (local $%31 i32)
        (local $%28 f64)
        (local $%30 f64)
        global.get $source
        local.set $%28
        local.get $%28
        global.set $lexer_source
        f64.const 0.0
        local.set $%29
        local.get $%29
        global.set $lexer_pos
        global.get $source
        local.set $%30
        local.get $%30
        i32.trunc_f64_s
        call $string_len
        local.set $%31
        local.get $%31
        global.set $lexer_length
        global.get $lexer_length
        f64.convert_i32_s
        return
    )
    (func $lexer_current_char (result f64)
        (local $%32 f64)
        (local $%33 f64)
        (local $%34 i32)
        (local $%35 f64)
        (local $%36 f64)
        (local $%37 f64)
        (local $%38 f64)
        global.get $lexer_pos
        local.set $%32
        global.get $lexer_length
        local.set $%33
        local.get $%32
        local.get $%33
        f64.lt
        local.set $%34
        local.get $%34
        if
            global.get $lexer_source
            local.set $%35
            global.get $lexer_pos
            local.set $%36
            local.get $%35
            i32.trunc_f64_s
            local.get $%36
            i32.trunc_f64_s
            call $string_char_code_at
            local.set $%37
            local.get $%37
            return
        end
        global.get $CHAR_EOF
        local.set $%38
        local.get $%38
        return
    )
    (func $lexer_advance (result f64)
        (local $%39 f64)
        (local $%40 f64)
        (local $%41 f64)
        global.get $lexer_pos
        local.set $%39
        f64.const 1.0
        local.set $%40
        local.get $%39
        local.get $%40
        f64.add
        local.set $%41
        local.get $%41
        global.set $lexer_pos
        global.get $lexer_pos
        return
    )
    (func $lexer_is_digit (result f64)
        (local $%42 f64)
        (local $%43 f64)
        (local $%44 f64)
        (local $%45 i32)
        (local $%46 f64)
        (local $%47 f64)
        (local $%48 i32)
        (local $%49 f64)
        (local $%50 f64)
        call $lexer_current_char
        local.set $%42
        local.get $%42
        global.set $ch
        global.get $ch
        local.set $%43
        global.get $CHAR_ZERO
        local.set $%44
        local.get $%43
        local.get $%44
        f64.ge
        local.set $%45
        local.get $%45
        if
            global.get $ch
            local.set $%46
            global.get $CHAR_NINE
            local.set $%47
            local.get $%46
            local.get $%47
            f64.le
            local.set $%48
            local.get $%48
            if
                f64.const 1.0
                local.set $%49
                local.get $%49
                return
            end
        end
        f64.const 0.0
        local.set $%50
        local.get $%50
        return
    )
    (func $lexer_is_alpha (result f64)
        (local $%51 f64)
        (local $%52 f64)
        (local $%53 f64)
        (local $%54 i32)
        (local $%55 f64)
        (local $%56 f64)
        (local $%57 i32)
        (local $%58 f64)
        (local $%59 f64)
        call $lexer_current_char
        local.set $%51
        local.get $%51
        global.set $ch
        global.get $ch
        local.set $%52
        global.get $CHAR_A_LOWER
        local.set $%53
        local.get $%52
        local.get $%53
        f64.ge
        local.set $%54
        local.get $%54
        if
            global.get $ch
            local.set $%55
            global.get $CHAR_Z_LOWER
            local.set $%56
            local.get $%55
            local.get $%56
            f64.le
            local.set $%57
            local.get $%57
            if
                f64.const 1.0
                local.set $%58
                local.get $%58
                return
            end
        end
        f64.const 0.0
        local.set $%59
        local.get $%59
        return
    )
    (func $lexer_skip_whitespace (result f64)
        (local $%60 f64)
        (local $%61 f64)
        (local $%62 f64)
        (local $%63 i32)
        (local $%64 f64)
        (local $%65 f64)
        call $lexer_current_char
        local.set $%60
        local.get $%60
        global.set $ch
        block $L1
            loop $L2
                global.get $ch
                local.set $%61
                global.get $CHAR_SPACE
                local.set $%62
                local.get $%61
                local.get $%62
                f64.eq
                local.set $%63
                local.get $%63
                i32.eqz
                br_if $L1
                call $lexer_advance
                local.set $%64
                call $lexer_current_char
                local.set $%65
                local.get $%65
                global.set $ch
                br $L2
            end
        end
        global.get $ch
        return
    )
    (func $lexer_read_number (result f64)
        (local $%66 f64)
        (local $%67 f64)
        (local $%68 f64)
        (local $%69 i32)
        (local $%70 f64)
        (local $%71 f64)
        (local $%73 f64)
        (local $%74 f64)
        (local $%78 f64)
        (local $%79 f64)
        (local $%80 f64)
        (local $%72 f64)
        (local $%75 f64)
        (local $%76 f64)
        (local $%77 f64)
        f64.const 0.0
        local.set $%66
        local.get $%66
        global.set $result
        block $L3
            loop $L4
                call $lexer_is_digit
                local.set $%67
                f64.const 0.0
                local.set $%68
                local.get $%67
                local.get $%68
                f64.gt
                local.set $%69
                local.get $%69
                i32.eqz
                br_if $L3
                call $lexer_current_char
                local.set $%70
                global.get $CHAR_ZERO
                local.set $%71
                local.get $%70
                local.get $%71
                f64.sub
                local.set $%72
                local.get $%72
                global.set $digit
                global.get $result
                local.set $%73
                f64.const 10.0
                local.set $%74
                local.get $%73
                local.get $%74
                f64.mul
                local.set $%75
                global.get $digit
                local.set $%76
                local.get $%75
                local.get $%76
                f64.add
                local.set $%77
                local.get $%77
                global.set $result
                call $lexer_advance
                local.set $%78
                br $L4
            end
        end
        global.get $result
        local.set $%79
        local.get $%79
        global.set $lexer_token_value
        global.get $TOKEN_NUMBER
        local.set $%80
        local.get $%80
        return
    )
    (func $lexer_read_ident (result f64)
        (local $%81 f64)
        (local $%82 f64)
        (local $%83 f64)
        (local $%84 i32)
        (local $%85 f64)
        (local $%86 f64)
        (local $%87 f64)
        (local $%89 f64)
        (local $%90 f64)
        (local $%92 i32)
        (local $%93 f64)
        (local $%88 f64)
        (local $%91 f64)
        global.get $lexer_pos
        local.set $%81
        local.get $%81
        global.set $start
        block $L5
            loop $L6
                call $lexer_is_alpha
                local.set $%82
                f64.const 0.0
                local.set $%83
                local.get $%82
                local.get $%83
                f64.gt
                local.set $%84
                local.get $%84
                i32.eqz
                br_if $L5
                call $lexer_advance
                local.set $%85
                br $L6
            end
        end
        global.get $lexer_pos
        local.set $%86
        global.get $start
        local.set $%87
        local.get $%86
        local.get $%87
        f64.sub
        local.set $%88
        local.get $%88
        global.set $length
        global.get $lexer_source
        local.set $%89
        global.get $start
        local.set $%90
        global.get $length
        local.set $%91
        local.get $%89
        local.get $%90
        local.get $%91
        call $string_substring
        local.set $%92
        local.get $%92
        global.set $lexer_token_value
        global.get $TOKEN_IDENT
        local.set $%93
        local.get $%93
        return
    )
    (func $lexer_next_token (result f64)
        (local $%94 f64)
        (local $%95 f64)
        (local $%96 f64)
        (local $%97 f64)
        (local $%98 i32)
        (local $%99 f64)
        (local $%100 f64)
        (local $%101 f64)
        (local $%102 f64)
        (local $%103 i32)
        (local $%104 f64)
        (local $%105 f64)
        (local $%106 f64)
        (local $%107 f64)
        (local $%108 i32)
        (local $%109 f64)
        (local $%110 f64)
        (local $%111 f64)
        (local $%112 f64)
        (local $%113 i32)
        (local $%114 f64)
        (local $%115 f64)
        (local $%116 f64)
        (local $%117 f64)
        (local $%118 i32)
        (local $%119 f64)
        (local $%120 f64)
        (local $%121 f64)
        (local $%122 f64)
        (local $%123 i32)
        (local $%124 f64)
        (local $%125 f64)
        (local $%126 f64)
        (local $%127 f64)
        (local $%128 i32)
        (local $%129 f64)
        (local $%130 f64)
        (local $%131 f64)
        (local $%132 i32)
        (local $%133 f64)
        (local $%134 f64)
        call $lexer_skip_whitespace
        local.set $%94
        call $lexer_current_char
        local.set $%95
        local.get $%95
        global.set $ch
        global.get $ch
        local.set $%96
        global.get $CHAR_NEWLINE
        local.set $%97
        local.get $%96
        local.get $%97
        f64.eq
        local.set $%98
        local.get $%98
        if
            call $lexer_advance
            local.set $%99
            global.get $TOKEN_NEWLINE
            local.set $%100
            local.get $%100
            return
        end
        global.get $ch
        local.set $%101
        global.get $CHAR_PLUS
        local.set $%102
        local.get $%101
        local.get $%102
        f64.eq
        local.set $%103
        local.get $%103
        if
            call $lexer_advance
            local.set $%104
            global.get $TOKEN_PLUS
            local.set $%105
            local.get $%105
            return
        end
        global.get $ch
        local.set $%106
        global.get $CHAR_MINUS
        local.set $%107
        local.get $%106
        local.get $%107
        f64.eq
        local.set $%108
        local.get $%108
        if
            call $lexer_advance
            local.set $%109
            global.get $TOKEN_MINUS
            local.set $%110
            local.get $%110
            return
        end
        global.get $ch
        local.set $%111
        global.get $CHAR_STAR
        local.set $%112
        local.get $%111
        local.get $%112
        f64.eq
        local.set $%113
        local.get $%113
        if
            call $lexer_advance
            local.set $%114
            global.get $TOKEN_STAR
            local.set $%115
            local.get $%115
            return
        end
        global.get $ch
        local.set $%116
        global.get $CHAR_SLASH
        local.set $%117
        local.get $%116
        local.get $%117
        f64.eq
        local.set $%118
        local.get $%118
        if
            call $lexer_advance
            local.set $%119
            global.get $TOKEN_SLASH
            local.set $%120
            local.get $%120
            return
        end
        global.get $ch
        local.set $%121
        global.get $CHAR_ASSIGN
        local.set $%122
        local.get $%121
        local.get $%122
        f64.eq
        local.set $%123
        local.get $%123
        if
            call $lexer_advance
            local.set $%124
            global.get $TOKEN_ASSIGN
            local.set $%125
            local.get $%125
            return
        end
        call $lexer_is_digit
        local.set $%126
        f64.const 0.0
        local.set $%127
        local.get $%126
        local.get $%127
        f64.gt
        local.set $%128
        local.get $%128
        if
            call $lexer_read_number
            local.set $%129
            local.get $%129
            return
        end
        call $lexer_is_alpha
        local.set $%130
        f64.const 0.0
        local.set $%131
        local.get $%130
        local.get $%131
        f64.gt
        local.set $%132
        local.get $%132
        if
            call $lexer_read_ident
            local.set $%133
            local.get $%133
            return
        end
        call $lexer_advance
        local.set $%134
    )
    (export "main" (func $main))
    (export "lexer_set_source" (func $lexer_set_source))
    (export "lexer_current_char" (func $lexer_current_char))
    (export "lexer_advance" (func $lexer_advance))
    (export "lexer_is_digit" (func $lexer_is_digit))
    (export "lexer_is_alpha" (func $lexer_is_alpha))
    (export "lexer_skip_whitespace" (func $lexer_skip_whitespace))
    (export "lexer_read_number" (func $lexer_read_number))
    (export "lexer_read_ident" (func $lexer_read_ident))
    (export "lexer_next_token" (func $lexer_next_token))
    (func $main (result f64)
        (local $%1 f64)
        (local $%3 f64)
        (local $%4 f64)
        (local $%5 f64)
        (local $%6 f64)
        (local $%7 f64)
        (local $%8 f64)
        (local $%9 f64)
        (local $%10 f64)
        (local $%11 f64)
        (local $%13 f64)
        (local $%14 f64)
        (local $%15 f64)
        (local $%16 f64)
        (local $%17 f64)
        (local $%18 f64)
        (local $%19 f64)
        (local $%20 f64)
        (local $%21 f64)
        (local $%22 f64)
        (local $%23 f64)
        (local $%24 f64)
        (local $%25 f64)
        (local $%26 f64)
        (local $%27 f64)
        (local $%2 f64)
        (local $%12 f64)
        f64.const 1.0
        local.set $%1
        f64.const -1.0
        local.get $%1
        f64.mul
        local.set $%2
        local.get $%2
        global.set $TOKEN_EOF
        f64.const 0.0
        local.set $%3
        local.get $%3
        global.set $TOKEN_NUMBER
        f64.const 1.0
        local.set $%4
        local.get $%4
        global.set $TOKEN_IDENT
        f64.const 2.0
        local.set $%5
        local.get $%5
        global.set $TOKEN_PLUS
        f64.const 3.0
        local.set $%6
        local.get $%6
        global.set $TOKEN_MINUS
        f64.const 4.0
        local.set $%7
        local.get $%7
        global.set $TOKEN_STAR
        f64.const 5.0
        local.set $%8
        local.get $%8
        global.set $TOKEN_SLASH
        f64.const 7.0
        local.set $%9
        local.get $%9
        global.set $TOKEN_ASSIGN
        f64.const 22.0
        local.set $%10
        local.get $%10
        global.set $TOKEN_NEWLINE
        f64.const 1.0
        local.set $%11
        f64.const -1.0
        local.get $%11
        f64.mul
        local.set $%12
        local.get $%12
        global.set $CHAR_EOF
        f64.const 32.0
        local.set $%13
        local.get $%13
        global.set $CHAR_SPACE
        f64.const 10.0
        local.set $%14
        local.get $%14
        global.set $CHAR_NEWLINE
        f64.const 43.0
        local.set $%15
        local.get $%15
        global.set $CHAR_PLUS
        f64.const 45.0
        local.set $%16
        local.get $%16
        global.set $CHAR_MINUS
        f64.const 42.0
        local.set $%17
        local.get $%17
        global.set $CHAR_STAR
        f64.const 47.0
        local.set $%18
        local.get $%18
        global.set $CHAR_SLASH
        f64.const 61.0
        local.set $%19
        local.get $%19
        global.set $CHAR_ASSIGN
        f64.const 48.0
        local.set $%20
        local.get $%20
        global.set $CHAR_ZERO
        f64.const 57.0
        local.set $%21
        local.get $%21
        global.set $CHAR_NINE
        f64.const 97.0
        local.set $%22
        local.get $%22
        global.set $CHAR_A_LOWER
        f64.const 122.0
        local.set $%23
        local.get $%23
        global.set $CHAR_Z_LOWER
        f64.const 0.0
        local.set $%24
        local.get $%24
        global.set $lexer_source
        f64.const 0.0
        local.set $%25
        local.get $%25
        global.set $lexer_pos
        f64.const 0.0
        local.set $%26
        local.get $%26
        global.set $lexer_length
        f64.const 0.0
        local.set $%27
        local.get $%27
        global.set $lexer_token_value
        global.get $lexer_token_value
        return
    )
)