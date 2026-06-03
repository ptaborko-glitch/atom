with open('parser.py', 'r') as f:
    content = f.read()

# Находим метод parse_return и добавляем обработку NEWLINE
old_return = '''    def parse_return(self):
        self.eat(TokenType.KW_RETURN)
        value = self.parse_expression()
        return ReturnStmt(value)'''

new_return = '''    def parse_return(self):
        self.eat(TokenType.KW_RETURN)
        value = self.parse_expression()
        # После return может быть NEWLINE (который мы пропускаем)
        if self.peek(TokenType.NEWLINE):
            self.eat(TokenType.NEWLINE)
        return ReturnStmt(value)'''

if old_return in content:
    content = content.replace(old_return, new_return)
    with open('parser.py', 'w') as f:
        f.write(content)
    print("✅ parse_return обновлён")
else:
    print("⚠️ Метод не найден")
