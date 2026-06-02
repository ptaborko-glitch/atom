with open('parser.py', 'r') as f:
    content = f.read()

# Находим проблемную область и исправляем
import re

# Удаляем лишние строки между return FuncDef и def parse_ident_statement
pattern = r'(return FuncDef\(name, params, body\))\s+(self\.eat\(TokenType\.DOT\).*?)(?=def parse_ident_statement)'
replacement = r'\1\n\n    def parse_ident_statement(self):'
content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open('parser.py', 'w') as f:
    f.write(content)

print("✅ Исправлено")
