# inspect_parser.py
from lexer import Lexer, TokenType
from parser import Parser
import inspect

# Читаем lexer.atom
with open('lexer.atom', 'r', encoding='utf-8') as f:
    source = f.read()

lexer = Lexer(source)
parser = Parser(lexer)

# Пропускаем первые N токенов до INDENT
print("Пропускаем токены до INDENT...")
tokens_before = []
while True:
    token = lexer.get_next_token()
    if token is None:
        break
    tokens_before.append(token)
    print(f"{token.line}: {token.type.name} - {token.value}")
    if token.type == TokenType.INDENT:
        print(f"--- Найден INDENT на строке {token.line} ---")
        break

print(f"\nВсего токенов до INDENT: {len(tokens_before)}")
print(f"Последний токен: {tokens_before[-1] if tokens_before else None}")

# Смотрим метод parse_statement
source_lines = inspect.getsource(Parser.parse_statement)
print("\nМетод parse_statement:")
print(source_lines[:500])