(module
    (import "runtime" "string_char_code_at" (func $string_char_code_at (param i32) (param i32) (result f64)))
    (memory 1)
    (export "memory" (memory 0))
    (global $TOKEN_NUMBER (mut f64) (f64.const 0.0))
    (global $TOKEN_IDENT (mut f64) (f64.const 0.0))
    (global $TOKEN_PLUS (mut f64) (f64.const 0.0))
    (global $TOKEN_MINUS (mut f64) (f64.const 0.0))
    (global $TOKEN_STAR (mut f64) (f64.const 0.0))
    (global $TOKEN_SLASH (mut f64) (f64.const 0.0))
    (global $TOKEN_AT (mut f64) (f64.const 0.0))
    (global $TOKEN_ASSIGN (mut f64) (f64.const 0.0))
    (global $TOKEN_EQ (mut f64) (f64.const 0.0))
    (global $TOKEN_NEQ (mut f64) (f64.const 0.0))
    (global $TOKEN_LT (mut f64) (f64.const 0.0))
    (global $TOKEN_GT (mut f64) (f64.const 0.0))
    (global $TOKEN_LTE (mut f64) (f64.const 0.0))
    (global $TOKEN_GTE (mut f64) (f64.const 0.0))
    (global $TOKEN_LPAREN (mut f64) (f64.const 0.0))
    (global $TOKEN_RPAREN (mut f64) (f64.const 0.0))
    (global $TOKEN_LBRACKET (mut f64) (f64.const 0.0))
    (global $TOKEN_RBRACKET (mut f64) (f64.const 0.0))
    (global $TOKEN_COLON (mut f64) (f64.const 0.0))
    (global $TOKEN_COMMA (mut f64) (f64.const 0.0))
    (global $TOKEN_DOT (mut f64) (f64.const 0.0))
    (global $TOKEN_ARROW (mut f64) (f64.const 0.0))
    (global $TOKEN_NEWLINE (mut f64) (f64.const 0.0))
    (global $TOKEN_KW_AGENT (mut f64) (f64.const 0.0))
    (global $TOKEN_KW_ACT (mut f64) (f64.const 0.0))
    (global $TOKEN_KW_GRAPH (mut f64) (f64.const 0.0))
    (global $TOKEN_KW_RETURN (mut f64) (f64.const 0.0))
    (global $TOKEN_KW_IF (mut f64) (f64.const 0.0))
    (global $TOKEN_KW_ELSE (mut f64) (f64.const 0.0))
    (global $TOKEN_KW_WHILE (mut f64) (f64.const 0.0))
    (global $TOKEN_KW_FOR (mut f64) (f64.const 0.0))
    (global $TOKEN_KW_SPAWN (mut f64) (f64.const 0.0))
    (global $TOKEN_KW_SELF (mut f64) (f64.const 0.0))
    (global $TOKEN_KW_FUNC (mut f64) (f64.const 0.0))
    (global $CHAR_SPACE (mut f64) (f64.const 0.0))
    (global $CHAR_TAB (mut f64) (f64.const 0.0))
    (global $CHAR_NEWLINE (mut f64) (f64.const 0.0))
    (global $CHAR_PLUS (mut f64) (f64.const 0.0))
    (global $CHAR_MINUS (mut f64) (f64.const 0.0))
    (global $CHAR_STAR (mut f64) (f64.const 0.0))
    (global $CHAR_SLASH (mut f64) (f64.const 0.0))
    (global $CHAR_AT (mut f64) (f64.const 0.0))
    (global $CHAR_ASSIGN (mut f64) (f64.const 0.0))
    (global $CHAR_BANG (mut f64) (f64.const 0.0))
    (global $CHAR_LT (mut f64) (f64.const 0.0))
    (global $CHAR_GT (mut f64) (f64.const 0.0))
    (global $CHAR_LPAREN (mut f64) (f64.const 0.0))
    (global $CHAR_RPAREN (mut f64) (f64.const 0.0))
    (global $CHAR_LBRACKET (mut f64) (f64.const 0.0))
    (global $CHAR_RBRACKET (mut f64) (f64.const 0.0))
    (global $CHAR_COLON (mut f64) (f64.const 0.0))
    (global $CHAR_COMMA (mut f64) (f64.const 0.0))
    (global $CHAR_DOT (mut f64) (f64.const 0.0))
    (global $CHAR_QUOTE (mut f64) (f64.const 0.0))
    (global $CHAR_UNDERSCORE (mut f64) (f64.const 0.0))
    (global $CHAR_ZERO (mut f64) (f64.const 0.0))
    (global $CHAR_NINE (mut f64) (f64.const 0.0))
    (global $CHAR_A_UPPER (mut f64) (f64.const 0.0))
    (global $CHAR_Z_UPPER (mut f64) (f64.const 0.0))
    (global $CHAR_A_LOWER (mut f64) (f64.const 0.0))
    (global $CHAR_Z_LOWER (mut f64) (f64.const 0.0))
    (global $lexer_source (mut i32) (i32.const 0))
    (global $lexer_pos (mut f64) (f64.const 0.0))
    (global $lexer_length (mut f64) (f64.const 0.0))
    (global $lexer_line (mut f64) (f64.const 0.0))
    (global $lexer_col (mut f64) (f64.const 0.0))
    (global $lexer_token_value (mut f64) (f64.const 0.0))
    (global $TOKEN_EOF (mut f64) (f64.const 0.0))
    (global $CHAR_EOF (mut f64) (f64.const 0.0))
    (global $ch (mut f64) (f64.const 0.0))
    (global $next_pos (mut f64) (f64.const 0.0))
    (global $result (mut f64) (f64.const 0.0))
    (global $digit (mut f64) (f64.const 0.0))
    (global $next_ch (mut f64) (f64.const 0.0))
    (export "TOKEN_NUMBER" (global $TOKEN_NUMBER))
    (export "TOKEN_IDENT" (global $TOKEN_IDENT))
    (export "TOKEN_PLUS" (global $TOKEN_PLUS))
    (export "TOKEN_MINUS" (global $TOKEN_MINUS))
    (export "TOKEN_STAR" (global $TOKEN_STAR))
    (export "TOKEN_SLASH" (global $TOKEN_SLASH))
    (export "TOKEN_AT" (global $TOKEN_AT))
    (export "TOKEN_ASSIGN" (global $TOKEN_ASSIGN))
    (export "TOKEN_EQ" (global $TOKEN_EQ))
    (export "TOKEN_NEQ" (global $TOKEN_NEQ))
    (export "TOKEN_LT" (global $TOKEN_LT))
    (export "TOKEN_GT" (global $TOKEN_GT))
    (export "TOKEN_LTE" (global $TOKEN_LTE))
    (export "TOKEN_GTE" (global $TOKEN_GTE))
    (export "TOKEN_LPAREN" (global $TOKEN_LPAREN))
    (export "TOKEN_RPAREN" (global $TOKEN_RPAREN))
    (export "TOKEN_LBRACKET" (global $TOKEN_LBRACKET))
    (export "TOKEN_RBRACKET" (global $TOKEN_RBRACKET))
    (export "TOKEN_COLON" (global $TOKEN_COLON))
    (export "TOKEN_COMMA" (global $TOKEN_COMMA))
    (export "TOKEN_DOT" (global $TOKEN_DOT))
    (export "TOKEN_ARROW" (global $TOKEN_ARROW))
    (export "TOKEN_NEWLINE" (global $TOKEN_NEWLINE))
    (export "TOKEN_KW_AGENT" (global $TOKEN_KW_AGENT))
    (export "TOKEN_KW_ACT" (global $TOKEN_KW_ACT))
    (export "TOKEN_KW_GRAPH" (global $TOKEN_KW_GRAPH))
    (export "TOKEN_KW_RETURN" (global $TOKEN_KW_RETURN))
    (export "TOKEN_KW_IF" (global $TOKEN_KW_IF))
    (export "TOKEN_KW_ELSE" (global $TOKEN_KW_ELSE))
    (export "TOKEN_KW_WHILE" (global $TOKEN_KW_WHILE))
    (export "TOKEN_KW_FOR" (global $TOKEN_KW_FOR))
    (export "TOKEN_KW_SPAWN" (global $TOKEN_KW_SPAWN))
    (export "TOKEN_KW_SELF" (global $TOKEN_KW_SELF))
    (export "TOKEN_KW_FUNC" (global $TOKEN_KW_FUNC))
    (export "CHAR_SPACE" (global $CHAR_SPACE))
    (export "CHAR_TAB" (global $CHAR_TAB))
    (export "CHAR_NEWLINE" (global $CHAR_NEWLINE))
    (export "CHAR_PLUS" (global $CHAR_PLUS))
    (export "CHAR_MINUS" (global $CHAR_MINUS))
    (export "CHAR_STAR" (global $CHAR_STAR))
    (export "CHAR_SLASH" (global $CHAR_SLASH))
    (export "CHAR_AT" (global $CHAR_AT))
    (export "CHAR_ASSIGN" (global $CHAR_ASSIGN))
    (export "CHAR_BANG" (global $CHAR_BANG))
    (export "CHAR_LT" (global $CHAR_LT))
    (export "CHAR_GT" (global $CHAR_GT))
    (export "CHAR_LPAREN" (global $CHAR_LPAREN))
    (export "CHAR_RPAREN" (global $CHAR_RPAREN))
    (export "CHAR_LBRACKET" (global $CHAR_LBRACKET))
    (export "CHAR_RBRACKET" (global $CHAR_RBRACKET))
    (export "CHAR_COLON" (global $CHAR_COLON))
    (export "CHAR_COMMA" (global $CHAR_COMMA))
    (export "CHAR_DOT" (global $CHAR_DOT))
    (export "CHAR_QUOTE" (global $CHAR_QUOTE))
    (export "CHAR_UNDERSCORE" (global $CHAR_UNDERSCORE))
    (export "CHAR_ZERO" (global $CHAR_ZERO))
    (export "CHAR_NINE" (global $CHAR_NINE))
    (export "CHAR_A_UPPER" (global $CHAR_A_UPPER))
    (export "CHAR_Z_UPPER" (global $CHAR_Z_UPPER))
    (export "CHAR_A_LOWER" (global $CHAR_A_LOWER))
    (export "CHAR_Z_LOWER" (global $CHAR_Z_LOWER))
    (export "lexer_source" (global $lexer_source))
    (export "lexer_pos" (global $lexer_pos))
    (export "lexer_length" (global $lexer_length))
    (export "lexer_line" (global $lexer_line))
    (export "lexer_col" (global $lexer_col))
    (export "lexer_token_value" (global $lexer_token_value))
    (export "TOKEN_EOF" (global $TOKEN_EOF))
    (export "CHAR_EOF" (global $CHAR_EOF))
    (export "ch" (global $ch))
    (export "next_pos" (global $next_pos))
    (export "result" (global $result))
    (export "digit" (global $digit))
    (export "next_ch" (global $next_ch))
    (func $lexer_set_source (result f64)
        (local $%72 i32)
        (local $%73 f64)
        (local $%74 f64)
        (local $%75 f64)
        (local $%76 f64)
        (local $%77 f64)
        i32.const 0
        local.set $%72
        local.get $%72
        global.set $lexer_source
        f64.const 0.0
        local.set $%73
        local.get $%73
        global.set $lexer_pos
        f64.const 0.0
        local.set $%74
        local.get $%74
        global.set $lexer_length
        f64.const 1.0
        local.set $%75
        local.get $%75
        global.set $lexer_line
        f64.const 1.0
        local.set $%76
        local.get $%76
        global.set $lexer_col
        f64.const 0.0
        local.set $%77
        local.get $%77
        global.set $lexer_token_value
        global.get $lexer_token_value
        return
    )
    (func $lexer_current_char (result f64)
        (local $%78 f64)
        (local $%79 f64)
        (local $%80 i32)
        (local $%81 i32)
        (local $%82 f64)
        (local $%83 f64)
        (local $%84 f64)
        (local $%85 f64)
        global.get $lexer_pos
        local.set $%78
        global.get $lexer_length
        local.set $%79
        local.get $%78
        local.get $%79
        f64.lt
        local.set $%80
        local.get $%80
        if (result f64)
            global.get $lexer_source
            local.set $%81
            global.get $lexer_pos
            local.set $%82
            local.get $%81
            local.get $%82
            i32.trunc_f64_s
            call $string_char_code_at
            local.set $%83
            local.get $%83
            global.set $ch
            global.get $ch
            local.set $%84
            local.get $%84
            return
        else
            global.get $CHAR_EOF
            local.set $%85
            local.get $%85
            return
        end
    )
    (func $lexer_advance (result f64)
        (local $%86 f64)
        (local $%87 f64)
        (local $%89 f64)
        (local $%90 f64)
        (local $%88 f64)
        (local $%91 f64)
        global.get $lexer_pos
        local.set $%86
        f64.const 1.0
        local.set $%87
        local.get $%86
        local.get $%87
        f64.add
        local.set $%88
        local.get $%88
        global.set $lexer_pos
        global.get $lexer_col
        local.set $%89
        f64.const 1.0
        local.set $%90
        local.get $%89
        local.get $%90
        f64.add
        local.set $%91
        local.get $%91
        global.set $lexer_col
        global.get $lexer_col
        return
    )
    (func $lexer_peek (result f64)
        (local $%92 f64)
        (local $%93 f64)
        (local $%96 f64)
        (local $%97 i32)
        (local $%98 i32)
        (local $%100 f64)
        (local $%101 f64)
        (local $%102 f64)
        (local $%94 f64)
        (local $%95 f64)
        (local $%99 f64)
        global.get $lexer_pos
        local.set $%92
        f64.const 1.0
        local.set $%93
        local.get $%92
        local.get $%93
        f64.add
        local.set $%94
        local.get $%94
        global.set $next_pos
        global.get $next_pos
        local.set $%95
        global.get $lexer_length
        local.set $%96
        local.get $%95
        local.get $%96
        f64.lt
        local.set $%97
        local.get $%97
        if (result f64)
            global.get $lexer_source
            local.set $%98
            global.get $next_pos
            local.set $%99
            local.get $%98
            local.get $%99
            i32.trunc_f64_s
            call $string_char_code_at
            local.set $%100
            local.get $%100
            global.set $ch
            global.get $ch
            local.set $%101
            local.get $%101
            return
        else
            global.get $CHAR_EOF
            local.set $%102
            local.get $%102
            return
        end
    )
    (func $lexer_is_digit (result f64)
        (local $%103 f64)
        (local $%104 f64)
        (local $%105 f64)
        (local $%106 i32)
        (local $%107 f64)
        (local $%108 f64)
        (local $%109 i32)
        (local $%110 f64)
        (local $%111 f64)
        call $lexer_current_char
        local.set $%103
        local.get $%103
        global.set $ch
        global.get $ch
        local.set $%104
        global.get $CHAR_ZERO
        local.set $%105
        local.get $%104
        local.get $%105
        f64.ge
        local.set $%106
        local.get $%106
        if
            global.get $ch
            local.set $%107
            global.get $CHAR_NINE
            local.set $%108
            local.get $%107
            local.get $%108
            f64.le
            local.set $%109
            local.get $%109
            if
                f64.const 1.0
                local.set $%110
                local.get $%110
                return
            end
        end
        f64.const 0.0
        local.set $%111
        local.get $%111
        return
    )
    (func $lexer_is_alpha (result f64)
        (local $%112 f64)
        (local $%113 f64)
        (local $%114 f64)
        (local $%115 i32)
        (local $%116 f64)
        (local $%117 f64)
        (local $%118 i32)
        (local $%119 f64)
        (local $%120 f64)
        (local $%121 f64)
        (local $%122 i32)
        (local $%123 f64)
        (local $%124 f64)
        (local $%125 i32)
        (local $%126 f64)
        (local $%127 f64)
        (local $%128 f64)
        (local $%129 i32)
        (local $%130 f64)
        (local $%131 f64)
        call $lexer_current_char
        local.set $%112
        local.get $%112
        global.set $ch
        global.get $ch
        local.set $%113
        global.get $CHAR_A_LOWER
        local.set $%114
        local.get $%113
        local.get $%114
        f64.ge
        local.set $%115
        local.get $%115
        if
            global.get $ch
            local.set $%116
            global.get $CHAR_Z_LOWER
            local.set $%117
            local.get $%116
            local.get $%117
            f64.le
            local.set $%118
            local.get $%118
            if
                f64.const 1.0
                local.set $%119
                local.get $%119
                return
            end
        end
        global.get $ch
        local.set $%120
        global.get $CHAR_A_UPPER
        local.set $%121
        local.get $%120
        local.get $%121
        f64.ge
        local.set $%122
        local.get $%122
        if
            global.get $ch
            local.set $%123
            global.get $CHAR_Z_UPPER
            local.set $%124
            local.get $%123
            local.get $%124
            f64.le
            local.set $%125
            local.get $%125
            if
                f64.const 1.0
                local.set $%126
                local.get $%126
                return
            end
        end
        global.get $ch
        local.set $%127
        global.get $CHAR_UNDERSCORE
        local.set $%128
        local.get $%127
        local.get $%128
        f64.eq
        local.set $%129
        local.get $%129
        if
            f64.const 1.0
            local.set $%130
            local.get $%130
            return
        end
        f64.const 0.0
        local.set $%131
        local.get $%131
        return
    )
    (func $lexer_is_alnum (result f64)
        (local $%132 f64)
        (local $%133 f64)
        (local $%134 i32)
        (local $%135 f64)
        (local $%136 f64)
        (local $%137 f64)
        (local $%138 i32)
        (local $%139 f64)
        (local $%140 f64)
        call $lexer_is_digit
        local.set $%132
        f64.const 0.0
        local.set $%133
        local.get $%132
        local.get $%133
        f64.gt
        local.set $%134
        local.get $%134
        if
            f64.const 1.0
            local.set $%135
            local.get $%135
            return
        end
        call $lexer_is_alpha
        local.set $%136
        f64.const 0.0
        local.set $%137
        local.get $%136
        local.get $%137
        f64.gt
        local.set $%138
        local.get $%138
        if
            f64.const 1.0
            local.set $%139
            local.get $%139
            return
        end
        f64.const 0.0
        local.set $%140
        local.get $%140
        return
    )
    (func $lexer_skip_whitespace (result f64)
        (local $%141 f64)
        (local $%142 f64)
        (local $%143 f64)
        (local $%144 i32)
        (local $%145 f64)
        (local $%146 f64)
        (local $%147 f64)
        (local $%148 f64)
        (local $%149 i32)
        (local $%150 f64)
        (local $%151 f64)
        call $lexer_current_char
        local.set $%141
        local.get $%141
        global.set $ch
        block $L1
            loop $L2
                global.get $ch
                local.set $%142
                global.get $CHAR_SPACE
                local.set $%143
                local.get $%142
                local.get $%143
                f64.eq
                local.set $%144
                local.get $%144
                i32.eqz
                br_if $L1
                call $lexer_advance
                local.set $%145
                call $lexer_current_char
                local.set $%146
                local.get $%146
                global.set $ch
                br $L2
            end
        end
        block $L3
            loop $L4
                global.get $ch
                local.set $%147
                global.get $CHAR_TAB
                local.set $%148
                local.get $%147
                local.get $%148
                f64.eq
                local.set $%149
                local.get $%149
                i32.eqz
                br_if $L3
                call $lexer_advance
                local.set $%150
                call $lexer_current_char
                local.set $%151
                local.get $%151
                global.set $ch
                br $L4
            end
        end
        global.get $ch
        return
    )
    (func $lexer_read_number (result f64)
        (local $%152 f64)
        (local $%153 f64)
        (local $%154 f64)
        (local $%155 f64)
        (local $%156 i32)
        (local $%157 f64)
        (local $%158 f64)
        (local $%160 f64)
        (local $%161 f64)
        (local $%165 f64)
        (local $%166 f64)
        (local $%167 f64)
        (local $%168 f64)
        (local $%159 f64)
        (local $%162 f64)
        (local $%163 f64)
        (local $%164 f64)
        f64.const 0.0
        local.set $%152
        local.get $%152
        global.set $result
        call $lexer_current_char
        local.set $%153
        local.get $%153
        global.set $ch
        block $L5
            loop $L6
                call $lexer_is_digit
                local.set $%154
                f64.const 0.0
                local.set $%155
                local.get $%154
                local.get $%155
                f64.gt
                local.set $%156
                local.get $%156
                i32.eqz
                br_if $L5
                global.get $ch
                local.set $%157
                global.get $CHAR_ZERO
                local.set $%158
                local.get $%157
                local.get $%158
                f64.sub
                local.set $%159
                local.get $%159
                global.set $digit
                global.get $result
                local.set $%160
                f64.const 10.0
                local.set $%161
                local.get $%160
                local.get $%161
                f64.mul
                local.set $%162
                global.get $digit
                local.set $%163
                local.get $%162
                local.get $%163
                f64.add
                local.set $%164
                local.get $%164
                global.set $result
                call $lexer_advance
                local.set $%165
                call $lexer_current_char
                local.set $%166
                local.get $%166
                global.set $ch
                br $L6
            end
        end
        global.get $result
        local.set $%167
        local.get $%167
        global.set $lexer_token_value
        global.get $TOKEN_NUMBER
        local.set $%168
        local.get $%168
        return
    )
    (func $lexer_read_ident (result f64)
        (local $%169 f64)
        (local $%170 f64)
        (local $%171 f64)
        (local $%172 f64)
        (local $%173 i32)
        (local $%174 f64)
        (local $%175 f64)
        (local $%176 f64)
        call $lexer_advance
        local.set $%169
        call $lexer_current_char
        local.set $%170
        local.get $%170
        global.set $ch
        block $L7
            loop $L8
                call $lexer_is_alnum
                local.set $%171
                f64.const 0.0
                local.set $%172
                local.get $%171
                local.get $%172
                f64.gt
                local.set $%173
                local.get $%173
                i32.eqz
                br_if $L7
                call $lexer_advance
                local.set $%174
                call $lexer_current_char
                local.set $%175
                local.get $%175
                global.set $ch
                br $L8
            end
        end
        global.get $TOKEN_IDENT
        local.set $%176
        local.get $%176
        return
    )
    (func $lexer_next_token (result f64)
        (local $%177 f64)
        (local $%178 f64)
        (local $%179 f64)
        (local $%180 f64)
        (local $%181 i32)
        (local $%182 f64)
        (local $%183 f64)
        (local $%184 f64)
        (local $%185 i32)
        (local $%186 f64)
        (local $%187 f64)
        (local $%188 f64)
        (local $%190 f64)
        (local $%191 f64)
        (local $%192 f64)
        (local $%193 f64)
        (local $%194 i32)
        (local $%195 f64)
        (local $%196 f64)
        (local $%197 f64)
        (local $%198 f64)
        (local $%199 i32)
        (local $%200 f64)
        (local $%201 f64)
        (local $%202 f64)
        (local $%203 f64)
        (local $%204 i32)
        (local $%205 f64)
        (local $%206 f64)
        (local $%207 f64)
        (local $%208 f64)
        (local $%209 f64)
        (local $%210 i32)
        (local $%211 f64)
        (local $%212 f64)
        (local $%213 f64)
        (local $%214 f64)
        (local $%215 i32)
        (local $%216 f64)
        (local $%217 f64)
        (local $%218 f64)
        (local $%219 f64)
        (local $%220 i32)
        (local $%221 f64)
        (local $%222 f64)
        (local $%223 f64)
        (local $%224 f64)
        (local $%225 i32)
        (local $%226 f64)
        (local $%227 f64)
        (local $%228 f64)
        (local $%229 f64)
        (local $%230 i32)
        (local $%231 f64)
        (local $%232 f64)
        (local $%233 f64)
        (local $%234 f64)
        (local $%235 f64)
        (local $%236 i32)
        (local $%237 f64)
        (local $%238 f64)
        (local $%239 f64)
        (local $%240 f64)
        (local $%241 i32)
        (local $%242 f64)
        (local $%243 f64)
        (local $%244 f64)
        (local $%245 f64)
        (local $%246 f64)
        (local $%247 i32)
        (local $%248 f64)
        (local $%249 f64)
        (local $%250 f64)
        (local $%251 f64)
        (local $%252 i32)
        (local $%253 f64)
        (local $%254 f64)
        (local $%255 f64)
        (local $%256 f64)
        (local $%257 f64)
        (local $%258 i32)
        (local $%259 f64)
        (local $%260 f64)
        (local $%261 f64)
        (local $%262 f64)
        (local $%263 i32)
        (local $%264 f64)
        (local $%265 f64)
        (local $%266 f64)
        (local $%267 f64)
        (local $%268 f64)
        (local $%269 i32)
        (local $%270 f64)
        (local $%271 f64)
        (local $%272 f64)
        (local $%273 f64)
        (local $%274 i32)
        (local $%275 f64)
        (local $%276 f64)
        (local $%277 f64)
        (local $%278 f64)
        (local $%279 i32)
        (local $%280 f64)
        (local $%281 f64)
        (local $%282 f64)
        (local $%283 f64)
        (local $%284 i32)
        (local $%285 f64)
        (local $%286 f64)
        (local $%287 f64)
        (local $%288 f64)
        (local $%289 i32)
        (local $%290 f64)
        (local $%291 f64)
        (local $%292 f64)
        (local $%293 f64)
        (local $%294 i32)
        (local $%295 f64)
        (local $%296 f64)
        (local $%297 f64)
        (local $%298 f64)
        (local $%299 i32)
        (local $%300 f64)
        (local $%301 f64)
        (local $%302 f64)
        (local $%303 f64)
        (local $%304 i32)
        (local $%305 f64)
        (local $%306 f64)
        (local $%307 f64)
        (local $%308 f64)
        (local $%309 i32)
        (local $%310 f64)
        (local $%311 f64)
        (local $%312 f64)
        (local $%313 i32)
        (local $%314 f64)
        (local $%315 f64)
        (local $%316 f64)
        (local $%189 f64)
        call $lexer_skip_whitespace
        local.set $%177
        call $lexer_current_char
        local.set $%178
        local.get $%178
        global.set $ch
        global.get $ch
        local.set $%179
        global.get $CHAR_EOF
        local.set $%180
        local.get $%179
        local.get $%180
        f64.eq
        local.set $%181
        local.get $%181
        if
            global.get $TOKEN_EOF
            local.set $%182
            local.get $%182
            return
        end
        global.get $ch
        local.set $%183
        global.get $CHAR_NEWLINE
        local.set $%184
        local.get $%183
        local.get $%184
        f64.eq
        local.set $%185
        local.get $%185
        if
            call $lexer_advance
            local.set $%186
            global.get $lexer_line
            local.set $%187
            f64.const 1.0
            local.set $%188
            local.get $%187
            local.get $%188
            f64.add
            local.set $%189
            local.get $%189
            global.set $lexer_line
            f64.const 1.0
            local.set $%190
            local.get $%190
            global.set $lexer_col
            global.get $TOKEN_NEWLINE
            local.set $%191
            local.get $%191
            return
        end
        global.get $ch
        local.set $%192
        global.get $CHAR_PLUS
        local.set $%193
        local.get $%192
        local.get $%193
        f64.eq
        local.set $%194
        local.get $%194
        if
            call $lexer_advance
            local.set $%195
            global.get $TOKEN_PLUS
            local.set $%196
            local.get $%196
            return
        end
        global.get $ch
        local.set $%197
        global.get $CHAR_MINUS
        local.set $%198
        local.get $%197
        local.get $%198
        f64.eq
        local.set $%199
        local.get $%199
        if
            call $lexer_advance
            local.set $%200
            call $lexer_current_char
            local.set $%201
            local.get $%201
            global.set $next_ch
            global.get $next_ch
            local.set $%202
            global.get $CHAR_GT
            local.set $%203
            local.get $%202
            local.get $%203
            f64.eq
            local.set $%204
            local.get $%204
            if
                call $lexer_advance
                local.set $%205
                global.get $TOKEN_ARROW
                local.set $%206
                local.get $%206
                return
            end
            global.get $TOKEN_MINUS
            local.set $%207
            local.get $%207
            return
        end
        global.get $ch
        local.set $%208
        global.get $CHAR_STAR
        local.set $%209
        local.get $%208
        local.get $%209
        f64.eq
        local.set $%210
        local.get $%210
        if
            call $lexer_advance
            local.set $%211
            global.get $TOKEN_STAR
            local.set $%212
            local.get $%212
            return
        end
        global.get $ch
        local.set $%213
        global.get $CHAR_SLASH
        local.set $%214
        local.get $%213
        local.get $%214
        f64.eq
        local.set $%215
        local.get $%215
        if
            call $lexer_advance
            local.set $%216
            global.get $TOKEN_SLASH
            local.set $%217
            local.get $%217
            return
        end
        global.get $ch
        local.set $%218
        global.get $CHAR_AT
        local.set $%219
        local.get $%218
        local.get $%219
        f64.eq
        local.set $%220
        local.get $%220
        if
            call $lexer_advance
            local.set $%221
            global.get $TOKEN_AT
            local.set $%222
            local.get $%222
            return
        end
        global.get $ch
        local.set $%223
        global.get $CHAR_ASSIGN
        local.set $%224
        local.get $%223
        local.get $%224
        f64.eq
        local.set $%225
        local.get $%225
        if
            call $lexer_advance
            local.set $%226
            call $lexer_current_char
            local.set $%227
            local.get $%227
            global.set $next_ch
            global.get $next_ch
            local.set $%228
            global.get $CHAR_ASSIGN
            local.set $%229
            local.get $%228
            local.get $%229
            f64.eq
            local.set $%230
            local.get $%230
            if
                call $lexer_advance
                local.set $%231
                global.get $TOKEN_EQ
                local.set $%232
                local.get $%232
                return
            end
            global.get $TOKEN_ASSIGN
            local.set $%233
            local.get $%233
            return
        end
        global.get $ch
        local.set $%234
        global.get $CHAR_BANG
        local.set $%235
        local.get $%234
        local.get $%235
        f64.eq
        local.set $%236
        local.get $%236
        if
            call $lexer_advance
            local.set $%237
            call $lexer_current_char
            local.set $%238
            local.get $%238
            global.set $next_ch
            global.get $next_ch
            local.set $%239
            global.get $CHAR_ASSIGN
            local.set $%240
            local.get $%239
            local.get $%240
            f64.eq
            local.set $%241
            local.get $%241
            if
                call $lexer_advance
                local.set $%242
                global.get $TOKEN_NEQ
                local.set $%243
                local.get $%243
                return
            end
            global.get $TOKEN_EOF
            local.set $%244
            local.get $%244
            return
        end
        global.get $ch
        local.set $%245
        global.get $CHAR_LT
        local.set $%246
        local.get $%245
        local.get $%246
        f64.eq
        local.set $%247
        local.get $%247
        if
            call $lexer_advance
            local.set $%248
            call $lexer_current_char
            local.set $%249
            local.get $%249
            global.set $next_ch
            global.get $next_ch
            local.set $%250
            global.get $CHAR_ASSIGN
            local.set $%251
            local.get $%250
            local.get $%251
            f64.eq
            local.set $%252
            local.get $%252
            if
                call $lexer_advance
                local.set $%253
                global.get $TOKEN_LTE
                local.set $%254
                local.get $%254
                return
            end
            global.get $TOKEN_LT
            local.set $%255
            local.get $%255
            return
        end
        global.get $ch
        local.set $%256
        global.get $CHAR_GT
        local.set $%257
        local.get $%256
        local.get $%257
        f64.eq
        local.set $%258
        local.get $%258
        if
            call $lexer_advance
            local.set $%259
            call $lexer_current_char
            local.set $%260
            local.get $%260
            global.set $next_ch
            global.get $next_ch
            local.set $%261
            global.get $CHAR_ASSIGN
            local.set $%262
            local.get $%261
            local.get $%262
            f64.eq
            local.set $%263
            local.get $%263
            if
                call $lexer_advance
                local.set $%264
                global.get $TOKEN_GTE
                local.set $%265
                local.get $%265
                return
            end
            global.get $TOKEN_GT
            local.set $%266
            local.get $%266
            return
        end
        global.get $ch
        local.set $%267
        global.get $CHAR_LPAREN
        local.set $%268
        local.get $%267
        local.get $%268
        f64.eq
        local.set $%269
        local.get $%269
        if
            call $lexer_advance
            local.set $%270
            global.get $TOKEN_LPAREN
            local.set $%271
            local.get $%271
            return
        end
        global.get $ch
        local.set $%272
        global.get $CHAR_RPAREN
        local.set $%273
        local.get $%272
        local.get $%273
        f64.eq
        local.set $%274
        local.get $%274
        if
            call $lexer_advance
            local.set $%275
            global.get $TOKEN_RPAREN
            local.set $%276
            local.get $%276
            return
        end
        global.get $ch
        local.set $%277
        global.get $CHAR_LBRACKET
        local.set $%278
        local.get $%277
        local.get $%278
        f64.eq
        local.set $%279
        local.get $%279
        if
            call $lexer_advance
            local.set $%280
            global.get $TOKEN_LBRACKET
            local.set $%281
            local.get $%281
            return
        end
        global.get $ch
        local.set $%282
        global.get $CHAR_RBRACKET
        local.set $%283
        local.get $%282
        local.get $%283
        f64.eq
        local.set $%284
        local.get $%284
        if
            call $lexer_advance
            local.set $%285
            global.get $TOKEN_RBRACKET
            local.set $%286
            local.get $%286
            return
        end
        global.get $ch
        local.set $%287
        global.get $CHAR_COLON
        local.set $%288
        local.get $%287
        local.get $%288
        f64.eq
        local.set $%289
        local.get $%289
        if
            call $lexer_advance
            local.set $%290
            global.get $TOKEN_COLON
            local.set $%291
            local.get $%291
            return
        end
        global.get $ch
        local.set $%292
        global.get $CHAR_COMMA
        local.set $%293
        local.get $%292
        local.get $%293
        f64.eq
        local.set $%294
        local.get $%294
        if
            call $lexer_advance
            local.set $%295
            global.get $TOKEN_COMMA
            local.set $%296
            local.get $%296
            return
        end
        global.get $ch
        local.set $%297
        global.get $CHAR_DOT
        local.set $%298
        local.get $%297
        local.get $%298
        f64.eq
        local.set $%299
        local.get $%299
        if
            call $lexer_advance
            local.set $%300
            global.get $TOKEN_DOT
            local.set $%301
            local.get $%301
            return
        end
        global.get $ch
        local.set $%302
        global.get $CHAR_QUOTE
        local.set $%303
        local.get $%302
        local.get $%303
        f64.eq
        local.set $%304
        local.get $%304
        if
            call $lexer_advance
            local.set $%305
            global.get $TOKEN_IDENT
            local.set $%306
            local.get $%306
            return
        end
        call $lexer_is_digit
        local.set $%307
        f64.const 0.0
        local.set $%308
        local.get $%307
        local.get $%308
        f64.gt
        local.set $%309
        local.get $%309
        if
            call $lexer_read_number
            local.set $%310
            local.get $%310
            return
        end
        call $lexer_is_alpha
        local.set $%311
        f64.const 0.0
        local.set $%312
        local.get $%311
        local.get $%312
        f64.gt
        local.set $%313
        local.get $%313
        if
            call $lexer_read_ident
            local.set $%314
            local.get $%314
            return
        end
        call $lexer_advance
        local.set $%315
        global.get $TOKEN_EOF
        local.set $%316
        local.get $%316
        return
    )
    (export "main" (func $main))
    (export "lexer_set_source" (func $lexer_set_source))
    (export "lexer_current_char" (func $lexer_current_char))
    (export "lexer_advance" (func $lexer_advance))
    (export "lexer_peek" (func $lexer_peek))
    (export "lexer_is_digit" (func $lexer_is_digit))
    (export "lexer_is_alpha" (func $lexer_is_alpha))
    (export "lexer_is_alnum" (func $lexer_is_alnum))
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
        (local $%39 f64)
        (local $%40 f64)
        (local $%41 f64)
        (local $%42 f64)
        (local $%43 f64)
        (local $%44 f64)
        (local $%45 f64)
        (local $%46 f64)
        (local $%47 f64)
        (local $%48 f64)
        (local $%49 f64)
        (local $%50 f64)
        (local $%51 f64)
        (local $%52 f64)
        (local $%53 f64)
        (local $%54 f64)
        (local $%55 f64)
        (local $%56 f64)
        (local $%57 f64)
        (local $%58 f64)
        (local $%59 f64)
        (local $%60 f64)
        (local $%61 f64)
        (local $%62 f64)
        (local $%63 f64)
        (local $%64 f64)
        (local $%65 f64)
        (local $%66 i32)
        (local $%67 f64)
        (local $%68 f64)
        (local $%69 f64)
        (local $%70 f64)
        (local $%71 f64)
        (local $%2 f64)
        (local $%38 f64)
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
        f64.const 6.0
        local.set $%9
        local.get $%9
        global.set $TOKEN_AT
        f64.const 7.0
        local.set $%10
        local.get $%10
        global.set $TOKEN_ASSIGN
        f64.const 8.0
        local.set $%11
        local.get $%11
        global.set $TOKEN_EQ
        f64.const 9.0
        local.set $%12
        local.get $%12
        global.set $TOKEN_NEQ
        f64.const 10.0
        local.set $%13
        local.get $%13
        global.set $TOKEN_LT
        f64.const 11.0
        local.set $%14
        local.get $%14
        global.set $TOKEN_GT
        f64.const 12.0
        local.set $%15
        local.get $%15
        global.set $TOKEN_LTE
        f64.const 13.0
        local.set $%16
        local.get $%16
        global.set $TOKEN_GTE
        f64.const 14.0
        local.set $%17
        local.get $%17
        global.set $TOKEN_LPAREN
        f64.const 15.0
        local.set $%18
        local.get $%18
        global.set $TOKEN_RPAREN
        f64.const 16.0
        local.set $%19
        local.get $%19
        global.set $TOKEN_LBRACKET
        f64.const 17.0
        local.set $%20
        local.get $%20
        global.set $TOKEN_RBRACKET
        f64.const 18.0
        local.set $%21
        local.get $%21
        global.set $TOKEN_COLON
        f64.const 19.0
        local.set $%22
        local.get $%22
        global.set $TOKEN_COMMA
        f64.const 20.0
        local.set $%23
        local.get $%23
        global.set $TOKEN_DOT
        f64.const 21.0
        local.set $%24
        local.get $%24
        global.set $TOKEN_ARROW
        f64.const 22.0
        local.set $%25
        local.get $%25
        global.set $TOKEN_NEWLINE
        f64.const 23.0
        local.set $%26
        local.get $%26
        global.set $TOKEN_KW_AGENT
        f64.const 24.0
        local.set $%27
        local.get $%27
        global.set $TOKEN_KW_ACT
        f64.const 25.0
        local.set $%28
        local.get $%28
        global.set $TOKEN_KW_GRAPH
        f64.const 26.0
        local.set $%29
        local.get $%29
        global.set $TOKEN_KW_RETURN
        f64.const 27.0
        local.set $%30
        local.get $%30
        global.set $TOKEN_KW_IF
        f64.const 28.0
        local.set $%31
        local.get $%31
        global.set $TOKEN_KW_ELSE
        f64.const 29.0
        local.set $%32
        local.get $%32
        global.set $TOKEN_KW_WHILE
        f64.const 30.0
        local.set $%33
        local.get $%33
        global.set $TOKEN_KW_FOR
        f64.const 31.0
        local.set $%34
        local.get $%34
        global.set $TOKEN_KW_SPAWN
        f64.const 32.0
        local.set $%35
        local.get $%35
        global.set $TOKEN_KW_SELF
        f64.const 33.0
        local.set $%36
        local.get $%36
        global.set $TOKEN_KW_FUNC
        f64.const 1.0
        local.set $%37
        f64.const -1.0
        local.get $%37
        f64.mul
        local.set $%38
        local.get $%38
        global.set $CHAR_EOF
        f64.const 32.0
        local.set $%39
        local.get $%39
        global.set $CHAR_SPACE
        f64.const 9.0
        local.set $%40
        local.get $%40
        global.set $CHAR_TAB
        f64.const 10.0
        local.set $%41
        local.get $%41
        global.set $CHAR_NEWLINE
        f64.const 43.0
        local.set $%42
        local.get $%42
        global.set $CHAR_PLUS
        f64.const 45.0
        local.set $%43
        local.get $%43
        global.set $CHAR_MINUS
        f64.const 42.0
        local.set $%44
        local.get $%44
        global.set $CHAR_STAR
        f64.const 47.0
        local.set $%45
        local.get $%45
        global.set $CHAR_SLASH
        f64.const 64.0
        local.set $%46
        local.get $%46
        global.set $CHAR_AT
        f64.const 61.0
        local.set $%47
        local.get $%47
        global.set $CHAR_ASSIGN
        f64.const 33.0
        local.set $%48
        local.get $%48
        global.set $CHAR_BANG
        f64.const 60.0
        local.set $%49
        local.get $%49
        global.set $CHAR_LT
        f64.const 62.0
        local.set $%50
        local.get $%50
        global.set $CHAR_GT
        f64.const 40.0
        local.set $%51
        local.get $%51
        global.set $CHAR_LPAREN
        f64.const 41.0
        local.set $%52
        local.get $%52
        global.set $CHAR_RPAREN
        f64.const 91.0
        local.set $%53
        local.get $%53
        global.set $CHAR_LBRACKET
        f64.const 93.0
        local.set $%54
        local.get $%54
        global.set $CHAR_RBRACKET
        f64.const 58.0
        local.set $%55
        local.get $%55
        global.set $CHAR_COLON
        f64.const 44.0
        local.set $%56
        local.get $%56
        global.set $CHAR_COMMA
        f64.const 46.0
        local.set $%57
        local.get $%57
        global.set $CHAR_DOT
        f64.const 34.0
        local.set $%58
        local.get $%58
        global.set $CHAR_QUOTE
        f64.const 95.0
        local.set $%59
        local.get $%59
        global.set $CHAR_UNDERSCORE
        f64.const 48.0
        local.set $%60
        local.get $%60
        global.set $CHAR_ZERO
        f64.const 57.0
        local.set $%61
        local.get $%61
        global.set $CHAR_NINE
        f64.const 65.0
        local.set $%62
        local.get $%62
        global.set $CHAR_A_UPPER
        f64.const 90.0
        local.set $%63
        local.get $%63
        global.set $CHAR_Z_UPPER
        f64.const 97.0
        local.set $%64
        local.get $%64
        global.set $CHAR_A_LOWER
        f64.const 122.0
        local.set $%65
        local.get $%65
        global.set $CHAR_Z_LOWER
        i32.const 0
        local.set $%66
        local.get $%66
        global.set $lexer_source
        f64.const 0.0
        local.set $%67
        local.get $%67
        global.set $lexer_pos
        f64.const 0.0
        local.set $%68
        local.get $%68
        global.set $lexer_length
        f64.const 1.0
        local.set $%69
        local.get $%69
        global.set $lexer_line
        f64.const 1.0
        local.set $%70
        local.get $%70
        global.set $lexer_col
        f64.const 0.0
        local.set $%71
        local.get $%71
        global.set $lexer_token_value
        global.get $lexer_token_value
        return
    )
)