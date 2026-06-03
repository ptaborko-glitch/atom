import re

with open('parser.py', 'r') as f:
    content = f.read()

# 1. Исправляем класс FuncDef
old_class = '''class FuncDef(ASTNode):
    def __init__(self, name, body):
        self.name = name
        self.body = body
    def __repr__(self):
        return f"FuncDef({self.name})"'''

new_class = '''class FuncDef(ASTNode):
    def __init__(self, name, params, body):
        self.name = name
        self.params = params if params else []
        self.body = body
    def __repr__(self):
        return f"FuncDef({self.name}, params={self.params})"'''

if old_class in content:
    content = content.replace(old_class, new_class)
    print("✅ FuncDef обновлён")
else:
    print("⚠️ Класс не найден")

# 2. Исправляем метод parse_func_def
old_parse = '''    def parse_func_def(self):
        """FuncDef := 'func' IDENT ':' NEWLINE INDENT Statement+ DEDENT"""
        self.eat(TokenType.KW_FUNC)
        name = self.eat(TokenType.IDENT).value
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
        return FuncDef(name, body)'''

new_parse = '''    def parse_func_def(self):
        """FuncDef := 'func' IDENT '(' ParamList? ')' ':' NEWLINE INDENT Statement+ DEDENT"""
        self.eat(TokenType.KW_FUNC)
        name = self.eat(TokenType.IDENT).value
        
        # Парсим параметры в скобках
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
        return FuncDef(name, params, body)'''

if old_parse in content:
    content = content.replace(old_parse, new_parse)
    print("✅ parse_func_def обновлён")
else:
    print("⚠️ parse_func_def не найден")

with open('parser.py', 'w') as f:
    f.write(content)

print("\n✅ Готово")
