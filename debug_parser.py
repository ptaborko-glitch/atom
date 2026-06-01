# debug_parser.py
from lexer import Lexer
from parser import Parser

# Читаем lexer.atom
with open('lexer.atom', 'r', encoding='utf-8') as f:
    source = f.read()

lexer = Lexer(source)
print("Последовательные токены до строки 197:")

for i in range(100):
    token = lexer.get_next_token()
    if token is None:
        break
    print(f"{i}: {token}")
    if token.line >= 197 and token.type.value > 5:
        print(f"--- Останов на строке {token.line} ---")
        break