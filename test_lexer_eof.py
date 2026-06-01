# test_lexer_eof.py
from lexer import Lexer

source = "x = 1"
lexer = Lexer(source)

print("Тестирование get_next_token:")
for i in range(20):
    token = lexer.get_next_token()
    print(f"{i}: {token}")
    if token is None:
        print("Получен None - останавливаемся")
        break
    if hasattr(token, 'type') and token.type == 'EOF':
        print("Получен EOF, но продолжаем...")