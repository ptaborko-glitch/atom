# Это изменённая часть parse_func_def, добавьте её в parser.py

    def parse_func_def(self):
        """FuncDef := 'func' IDENT '(' ParamList? ')' ':' NEWLINE INDENT Statement+ DEDENT"""
        self.eat(TokenType.KW_FUNC)
        name = self.eat(TokenType.IDENT).value
        
        # Парсим аргументы в скобках
        self.eat(TokenType.LPAREN)
        params = []
        if not self.peek(TokenType.RPAREN):
            # Первый параметр
            params.append(self.eat(TokenType.IDENT).value)
            # Последующие параметры через запятую
            while self.peek(TokenType.COMMA):
                self.eat(TokenType.COMMA)
                params.append(self.eat(TokenType.IDENT).value)
        self.eat(TokenType.RPAREN)
        
        # Далее как было
        self.eat(TokenType.COLON)
        self.eat(TokenType.NEWLINE)
        self.eat(TokenType.INDENT)
        body = []
        while not self.peek(TokenType.DEDENT):
            if self.peek(TokenType.NEWLINE):
                self.eat(TokenType.NEWLINE)
                continue
            body.append(self.parse_statement())
        self.eat(TokenType.DEDENT)
        return FuncDef(name, params, body)
