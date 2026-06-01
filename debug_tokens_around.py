# debug_tokens_around.py
from lexer import Lexer

with open('lexer.atom', 'r', encoding='utf-8') as f:
    source = f.read()

lexer = Lexer(source)
tokens = []
while True:
    token = lexer.get_next_token()
    if token is None:
        break
    tokens.append(token)
    if token.line >= 196 and token.line <= 200:
        print(f"{token.line}: {token.type.name} - {repr(token.value)}")

print(f"\nВсего токенов: {len(tokens)}")