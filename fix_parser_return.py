with open('parser.py', 'r') as f:
    content = f.read()

# Изменяем parse_statement, чтобы он не требовал NEWLINE после return внутри if
# Но проще — добавим в parse_if обработку NEWLINE после return
old_if = '''    def parse_if(self):
        self.eat(TokenType.KW_IF)
        condition = self.parse_expression()
        self.eat(TokenType.COLON)
        self.eat(TokenType.NEWLINE)
        self.eat(TokenType.INDENT)
        then_body = []
        while not self.peek(TokenType.DEDENT):
            if self.peek(TokenType.NEWLINE):
                self.eat(TokenType.NEWLINE)
                continue
            then_body.append(self.parse_statement())
        self.eat(TokenType.DEDENT)'''

new_if = '''    def parse_if(self):
        self.eat(TokenType.KW_IF)
        condition = self.parse_expression()
        self.eat(TokenType.COLON)
        self.eat(TokenType.NEWLINE)
        self.eat(TokenType.INDENT)
        then_body = []
        while not self.peek(TokenType.DEDENT):
            if self.peek(TokenType.NEWLINE):
                self.eat(TokenType.NEWLINE)
                continue
            stmt = self.parse_statement()
            then_body.append(stmt)
            # После return не нужно NEWLINE, продолжаем
        self.eat(TokenType.DEDENT)'''

if old_if in content:
    content = content.replace(old_if, new_if)
    with open('parser.py', 'w') as f:
        f.write(content)
    print("✅ parse_if обновлён")
else:
    print("⚠️ Не найден")
