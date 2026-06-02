import re

with open('parser.py', 'r') as f:
    lines = f.readlines()

# Находим начало метода parse_func_def (строка 282)
new_method = '''    def parse_func_def(self):
        """FuncDef := 'func' IDENT '(' ParamList? ')' ':' NEWLINE INDENT Statement+ DEDENT"""
        self.eat(TokenType.KW_FUNC)
        name = self.eat(TokenType.IDENT).value
        
        # Парсим аргументы в скобках
        self.eat(TokenType.LPAREN)
        params = []
        if not self.peek(TokenType.RPAREN):
            params.append(self.eat(TokenType.IDENT).value)
            while self.peek(TokenType.COMMA):
                self.eat(TokenType.COMMA)
                params.append(self.eat(TokenType.IDENT).value)
        self.eat(TokenType.RPAREN)
        
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
'''

# Заменяем с 282 по 301 строку (примерно)
new_lines = lines[:281] + [new_method] + lines[301:]

with open('parser.py', 'w') as f:
    f.writelines(new_lines)

print("✅ parse_func_def обновлён")
