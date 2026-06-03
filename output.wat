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
    (global $TOKEN_EQ (mut f64) (f64.const 0.0))
    (global $TOKEN_LT (mut f64) (f64.const 0.0))
    (global $TOKEN_GT (mut f64) (f64.const 0.0))
    (global $TOKEN_COLON (mut f64) (f64.const 0.0))
    (global $TOKEN_NEWLINE (mut f64) (f64.const 0.0))
    (global $TOKEN_LPAREN (mut f64) (f64.const 0.0))
    (global $TOKEN_RPAREN (mut f64) (f64.const 0.0))
    (global $CHAR_SPACE (mut f64) (f64.const 0.0))
    (global $CHAR_NEWLINE (mut f64) (f64.const 0.0))
    (global $CHAR_PLUS (mut f64) (f64.const 0.0))
    (global $CHAR_MINUS (mut f64) (f64.const 0.0))
    (global $CHAR_STAR (mut f64) (f64.const 0.0))
    (global $CHAR_SLASH (mut f64) (f64.const 0.0))
    (global $CHAR_ASSIGN (mut f64) (f64.const 0.0))
    (global $CHAR_LT (mut f64) (f64.const 0.0))
    (global $CHAR_GT (mut f64) (f64.const 0.0))
    (global $CHAR_COLON (mut f64) (f64.const 0.0))
    (global $CHAR_LPAREN (mut f64) (f64.const 0.0))
    (global $CHAR_RPAREN (mut f64) (f64.const 0.0))
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
    (export "TOKEN_EQ" (global $TOKEN_EQ))
    (export "TOKEN_LT" (global $TOKEN_LT))
    (export "TOKEN_GT" (global $TOKEN_GT))
    (export "TOKEN_COLON" (global $TOKEN_COLON))
    (export "TOKEN_NEWLINE" (global $TOKEN_NEWLINE))
    (export "TOKEN_LPAREN" (global $TOKEN_LPAREN))
    (export "TOKEN_RPAREN" (global $TOKEN_RPAREN))
    (export "CHAR_SPACE" (global $CHAR_SPACE))
    (export "CHAR_NEWLINE" (global $CHAR_NEWLINE))
    (export "CHAR_PLUS" (global $CHAR_PLUS))
    (export "CHAR_MINUS" (global $CHAR_MINUS))
    (export "CHAR_STAR" (global $CHAR_STAR))
    (export "CHAR_SLASH" (global $CHAR_SLASH))
    (export "CHAR_ASSIGN" (global $CHAR_ASSIGN))
    (export "CHAR_LT" (global $CHAR_LT))
    (export "CHAR_GT" (global $CHAR_GT))
    (export "CHAR_COLON" (global $CHAR_COLON))
    (export "CHAR_LPAREN" (global $CHAR_LPAREN))
    (export "CHAR_RPAREN" (global $CHAR_RPAREN))
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
        (local $%40 f64)
        (local $%42 i32)
        (local $%39 f64)
        (local $%41 f64)
        global.get $source
        local.set $%39
        local.get $%39
        global.set $lexer_source
        f64.const 0.0
        local.set $%40
        local.get $%40
        global.set $lexer_pos
        global.get $source
        local.set $%41
        local.get $%41
        i32.trunc_f64_s
        call $string_len
        local.set $%42
        local.get $%42
        global.set $lexer_length
        global.get $lexer_length
        f64.convert_i32_s
        return
    )
    (func $lexer_current_char (result f64)
        (local $%43 f64)
        (local $%44 f64)
        (local $%45 i32)
        (local $%46 f64)
        (local $%47 f64)
        (local $%48 f64)
        (local $%49 f64)
        global.get $lexer_pos
        local.set $%43
        global.get $lexer_length
        local.set $%44
        local.get $%43
        local.get $%44
        f64.lt
        local.set $%45
        local.get $%45
        if
            global.get $lexer_source
            local.set $%46
            global.get $lexer_pos
            local.set $%47
            local.get $%46
            i32.trunc_f64_s
            local.get $%47
            i32.trunc_f64_s
            call $string_char_code_at
            local.set $%48
            local.get $%48
            return
        end
        global.get $CHAR_EOF
        local.set $%49
        local.get $%49
        return
    )
    (func $lexer_advance (result f64)
        (local $%50 f64)
        (local $%51 f64)
        (local $%52 f64)
        global.get $lexer_pos
        local.set $%50
        f64.const 1.0
        local.set $%51
        local.get $%50
        local.get $%51
        f64.add
        local.set $%52
        local.get $%52
        global.set $lexer_pos
        global.get $lexer_pos
        return
    )
    (func $lexer_is_digit (result f64)
        (local $%53 f64)
        (local $%54 f64)
        (local $%55 f64)
        (local $%56 i32)
        (local $%57 f64)
        (local $%58 f64)
        (local $%59 i32)
        (local $%60 f64)
        (local $%61 f64)
        call $lexer_current_char
        local.set $%53
        local.get $%53
        global.set $ch
        global.get $ch
        local.set $%54
        global.get $CHAR_ZERO
        local.set $%55
        local.get $%54
        local.get $%55
        f64.ge
        local.set $%56
        local.get $%56
        if
            global.get $ch
            local.set $%57
            global.get $CHAR_NINE
            local.set $%58
            local.get $%57
            local.get $%58
            f64.le
            local.set $%59
            local.get $%59
            if
                f64.const 1.0
                local.set $%60
                local.get $%60
                return
            end
        end
        f64.const 0.0
        local.set $%61
        local.get $%61
        return
    )
    (func $lexer_is_alpha (result f64)
        (local $%62 f64)
        (local $%63 f64)
        (local $%64 f64)
        (local $%65 i32)
        (local $%66 f64)
        (local $%67 f64)
        (local $%68 i32)
        (local $%69 f64)
        (local $%70 f64)
        call $lexer_current_char
        local.set $%62
        local.get $%62
        global.set $ch
        global.get $ch
        local.set $%63
        global.get $CHAR_A_LOWER
        local.set $%64
        local.get $%63
        local.get $%64
        f64.ge
        local.set $%65
        local.get $%65
        if
            global.get $ch
            local.set $%66
            global.get $CHAR_Z_LOWER
            local.set $%67
            local.get $%66
            local.get $%67
            f64.le
            local.set $%68
            local.get $%68
            if
                f64.const 1.0
                local.set $%69
                local.get $%69
                return
            end
        end
        f64.const 0.0
        local.set $%70
        local.get $%70
        return
    )
    (func $lexer_skip_whitespace (result f64)
        (local $%71 f64)
        (local $%72 f64)
        (local $%73 f64)
        (local $%74 i32)
        (local $%75 f64)
        (local $%76 f64)
        call $lexer_current_char
        local.set $%71
        local.get $%71
        global.set $ch
        block $L1
            loop $L2
                global.get $ch
                local.set $%72
                global.get $CHAR_SPACE
                local.set $%73
                local.get $%72
                local.get $%73
                f64.eq
                local.set $%74
                local.get $%74
                i32.eqz
                br_if $L1
                call $lexer_advance
                local.set $%75
                call $lexer_current_char
                local.set $%76
                local.get $%76
                global.set $ch
                br $L2
            end
        end
        global.get $ch
        return
    )
    (func $lexer_read_number (result f64)
        (local $%77 f64)
        (local $%78 f64)
        (local $%79 f64)
        (local $%80 i32)
        (local $%81 f64)
        (local $%82 f64)
        (local $%84 f64)
        (local $%85 f64)
        (local $%89 f64)
        (local $%90 f64)
        (local $%91 f64)
        (local $%83 f64)
        (local $%86 f64)
        (local $%87 f64)
        (local $%88 f64)
        f64.const 0.0
        local.set $%77
        local.get $%77
        global.set $result
        block $L3
            loop $L4
                call $lexer_is_digit
                local.set $%78
                f64.const 0.0
                local.set $%79
                local.get $%78
                local.get $%79
                f64.gt
                local.set $%80
                local.get $%80
                i32.eqz
                br_if $L3
                call $lexer_current_char
                local.set $%81
                global.get $CHAR_ZERO
                local.set $%82
                local.get $%81
                local.get $%82
                f64.sub
                local.set $%83
                local.get $%83
                global.set $digit
                global.get $result
                local.set $%84
                f64.const 10.0
                local.set $%85
                local.get $%84
                local.get $%85
                f64.mul
                local.set $%86
                global.get $digit
                local.set $%87
                local.get $%86
                local.get $%87
                f64.add
                local.set $%88
                local.get $%88
                global.set $result
                call $lexer_advance
                local.set $%89
                br $L4
            end
        end
        global.get $result
        local.set $%90
        local.get $%90
        global.set $lexer_token_value
        global.get $TOKEN_NUMBER
        local.set $%91
        local.get $%91
        return
    )
    (func $lexer_read_ident (result f64)
        (local $%92 f64)
        (local $%93 f64)
        (local $%94 f64)
        (local $%95 i32)
        (local $%96 f64)
        (local $%97 f64)
        (local $%98 f64)
        (local $%100 f64)
        (local $%101 f64)
        (local $%103 i32)
        (local $%104 f64)
        (local $%99 f64)
        (local $%102 f64)
        global.get $lexer_pos
        local.set $%92
        local.get $%92
        global.set $start
        block $L5
            loop $L6
                call $lexer_is_alpha
                local.set $%93
                f64.const 0.0
                local.set $%94
                local.get $%93
                local.get $%94
                f64.gt
                local.set $%95
                local.get $%95
                i32.eqz
                br_if $L5
                call $lexer_advance
                local.set $%96
                br $L6
            end
        end
        global.get $lexer_pos
        local.set $%97
        global.get $start
        local.set $%98
        local.get $%97
        local.get $%98
        f64.sub
        local.set $%99
        local.get $%99
        global.set $length
        global.get $lexer_source
        local.set $%100
        global.get $start
        local.set $%101
        global.get $length
        local.set $%102
        local.get $%100
        local.get $%101
        local.get $%102
        call $string_substring
        local.set $%103
        local.get $%103
        global.set $lexer_token_value
        global.get $TOKEN_IDENT
        local.set $%104
        local.get $%104
        return
    )
    (func $lexer_next_token (result f64)
        (local $%105 f64)
        (local $%106 f64)
        (local $%107 f64)
        (local $%108 f64)
        (local $%109 i32)
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
        (local $%132 f64)
        (local $%133 i32)
        (local $%134 f64)
        (local $%135 f64)
        (local $%136 f64)
        (local $%137 f64)
        (local $%138 i32)
        (local $%139 f64)
        (local $%140 f64)
        (local $%141 f64)
        (local $%142 f64)
        (local $%143 i32)
        (local $%144 f64)
        (local $%145 f64)
        (local $%146 f64)
        (local $%147 f64)
        (local $%148 i32)
        (local $%149 f64)
        (local $%150 f64)
        (local $%151 f64)
        (local $%152 f64)
        (local $%153 i32)
        (local $%154 f64)
        (local $%155 f64)
        (local $%156 f64)
        (local $%157 f64)
        (local $%158 i32)
        (local $%159 f64)
        (local $%160 f64)
        (local $%161 f64)
        (local $%162 f64)
        (local $%163 i32)
        (local $%164 f64)
        (local $%165 f64)
        (local $%166 f64)
        (local $%167 f64)
        (local $%168 i32)
        (local $%169 f64)
        (local $%170 f64)
        (local $%171 f64)
        (local $%172 i32)
        (local $%173 f64)
        (local $%174 f64)
        (local $%175 f64)
        call $lexer_skip_whitespace
        local.set $%105
        call $lexer_current_char
        local.set $%106
        local.get $%106
        global.set $ch
        global.get $ch
        local.set $%107
        global.get $CHAR_EOF
        local.set $%108
        local.get $%107
        local.get $%108
        f64.eq
        local.set $%109
        local.get $%109
        if
            global.get $TOKEN_EOF
            local.set $%110
            local.get $%110
            return
        end
        global.get $ch
        local.set $%111
        global.get $CHAR_NEWLINE
        local.set $%112
        local.get $%111
        local.get $%112
        f64.eq
        local.set $%113
        local.get $%113
        if
            call $lexer_advance
            local.set $%114
            global.get $TOKEN_NEWLINE
            local.set $%115
            local.get $%115
            return
        end
        global.get $ch
        local.set $%116
        global.get $CHAR_PLUS
        local.set $%117
        local.get $%116
        local.get $%117
        f64.eq
        local.set $%118
        local.get $%118
        if
            call $lexer_advance
            local.set $%119
            global.get $TOKEN_PLUS
            local.set $%120
            local.get $%120
            return
        end
        global.get $ch
        local.set $%121
        global.get $CHAR_MINUS
        local.set $%122
        local.get $%121
        local.get $%122
        f64.eq
        local.set $%123
        local.get $%123
        if
            call $lexer_advance
            local.set $%124
            global.get $TOKEN_MINUS
            local.set $%125
            local.get $%125
            return
        end
        global.get $ch
        local.set $%126
        global.get $CHAR_STAR
        local.set $%127
        local.get $%126
        local.get $%127
        f64.eq
        local.set $%128
        local.get $%128
        if
            call $lexer_advance
            local.set $%129
            global.get $TOKEN_STAR
            local.set $%130
            local.get $%130
            return
        end
        global.get $ch
        local.set $%131
        global.get $CHAR_SLASH
        local.set $%132
        local.get $%131
        local.get $%132
        f64.eq
        local.set $%133
        local.get $%133
        if
            call $lexer_advance
            local.set $%134
            global.get $TOKEN_SLASH
            local.set $%135
            local.get $%135
            return
        end
        global.get $ch
        local.set $%136
        global.get $CHAR_ASSIGN
        local.set $%137
        local.get $%136
        local.get $%137
        f64.eq
        local.set $%138
        local.get $%138
        if
            call $lexer_advance
            local.set $%139
            global.get $TOKEN_ASSIGN
            local.set $%140
            local.get $%140
            return
        end
        global.get $ch
        local.set $%141
        global.get $CHAR_LT
        local.set $%142
        local.get $%141
        local.get $%142
        f64.eq
        local.set $%143
        local.get $%143
        if
            call $lexer_advance
            local.set $%144
            global.get $TOKEN_LT
            local.set $%145
            local.get $%145
            return
        end
        global.get $ch
        local.set $%146
        global.get $CHAR_GT
        local.set $%147
        local.get $%146
        local.get $%147
        f64.eq
        local.set $%148
        local.get $%148
        if
            call $lexer_advance
            local.set $%149
            global.get $TOKEN_GT
            local.set $%150
            local.get $%150
            return
        end
        global.get $ch
        local.set $%151
        global.get $CHAR_COLON
        local.set $%152
        local.get $%151
        local.get $%152
        f64.eq
        local.set $%153
        local.get $%153
        if
            call $lexer_advance
            local.set $%154
            global.get $TOKEN_COLON
            local.set $%155
            local.get $%155
            return
        end
        global.get $ch
        local.set $%156
        global.get $CHAR_LPAREN
        local.set $%157
        local.get $%156
        local.get $%157
        f64.eq
        local.set $%158
        local.get $%158
        if
            call $lexer_advance
            local.set $%159
            global.get $TOKEN_LPAREN
            local.set $%160
            local.get $%160
            return
        end
        global.get $ch
        local.set $%161
        global.get $CHAR_RPAREN
        local.set $%162
        local.get $%161
        local.get $%162
        f64.eq
        local.set $%163
        local.get $%163
        if
            call $lexer_advance
            local.set $%164
            global.get $TOKEN_RPAREN
            local.set $%165
            local.get $%165
            return
        end
        call $lexer_is_digit
        local.set $%166
        f64.const 0.0
        local.set $%167
        local.get $%166
        local.get $%167
        f64.gt
        local.set $%168
        local.get $%168
        if
            call $lexer_read_number
            local.set $%169
            local.get $%169
            return
        end
        call $lexer_is_alpha
        local.set $%170
        f64.const 0.0
        local.set $%171
        local.get $%170
        local.get $%171
        f64.gt
        local.set $%172
        local.get $%172
        if
            call $lexer_read_ident
            local.set $%173
            local.get $%173
            return
        end
        call $lexer_advance
        local.set $%174
        global.get $TOKEN_EOF
        local.set $%175
        local.get $%175
        return
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
        (local $%12 f64)
        (local $%13 f64)
        (local $%14 f64)
        (local $%15 f64)
        (local $%16 f64)
        (local $%17 f64)
        (local $%19 f64)
        (local $%20 f64)
        (local $%21 f64)
        (local $%22 f64)
        (local $%23 f64)
        (local $%24 f64)
        (local $%25 f64)
        (local $%26 f64)
        (local $%27 f64)
        (local $%28 f64)
        (local $%29 f64)
        (local $%30 f64)
        (local $%31 f64)
        (local $%32 f64)
        (local $%33 f64)
        (local $%34 f64)
        (local $%35 f64)
        (local $%36 f64)
        (local $%37 f64)
        (local $%38 f64)
        (local $%2 f64)
        (local $%18 f64)
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
        f64.const 8.0
        local.set $%10
        local.get $%10
        global.set $TOKEN_EQ
        f64.const 10.0
        local.set $%11
        local.get $%11
        global.set $TOKEN_LT
        f64.const 11.0
        local.set $%12
        local.get $%12
        global.set $TOKEN_GT
        f64.const 18.0
        local.set $%13
        local.get $%13
        global.set $TOKEN_COLON
        f64.const 22.0
        local.set $%14
        local.get $%14
        global.set $TOKEN_NEWLINE
        f64.const 14.0
        local.set $%15
        local.get $%15
        global.set $TOKEN_LPAREN
        f64.const 15.0
        local.set $%16
        local.get $%16
        global.set $TOKEN_RPAREN
        f64.const 1.0
        local.set $%17
        f64.const -1.0
        local.get $%17
        f64.mul
        local.set $%18
        local.get $%18
        global.set $CHAR_EOF
        f64.const 32.0
        local.set $%19
        local.get $%19
        global.set $CHAR_SPACE
        f64.const 10.0
        local.set $%20
        local.get $%20
        global.set $CHAR_NEWLINE
        f64.const 43.0
        local.set $%21
        local.get $%21
        global.set $CHAR_PLUS
        f64.const 45.0
        local.set $%22
        local.get $%22
        global.set $CHAR_MINUS
        f64.const 42.0
        local.set $%23
        local.get $%23
        global.set $CHAR_STAR
        f64.const 47.0
        local.set $%24
        local.get $%24
        global.set $CHAR_SLASH
        f64.const 61.0
        local.set $%25
        local.get $%25
        global.set $CHAR_ASSIGN
        f64.const 60.0
        local.set $%26
        local.get $%26
        global.set $CHAR_LT
        f64.const 62.0
        local.set $%27
        local.get $%27
        global.set $CHAR_GT
        f64.const 58.0
        local.set $%28
        local.get $%28
        global.set $CHAR_COLON
        f64.const 40.0
        local.set $%29
        local.get $%29
        global.set $CHAR_LPAREN
        f64.const 41.0
        local.set $%30
        local.get $%30
        global.set $CHAR_RPAREN
        f64.const 48.0
        local.set $%31
        local.get $%31
        global.set $CHAR_ZERO
        f64.const 57.0
        local.set $%32
        local.get $%32
        global.set $CHAR_NINE
        f64.const 97.0
        local.set $%33
        local.get $%33
        global.set $CHAR_A_LOWER
        f64.const 122.0
        local.set $%34
        local.get $%34
        global.set $CHAR_Z_LOWER
        f64.const 0.0
        local.set $%35
        local.get $%35
        global.set $lexer_source
        f64.const 0.0
        local.set $%36
        local.get $%36
        global.set $lexer_pos
        f64.const 0.0
        local.set $%37
        local.get $%37
        global.set $lexer_length
        f64.const 0.0
        local.set $%38
        local.get $%38
        global.set $lexer_token_value
        global.get $lexer_token_value
        return
    )
)