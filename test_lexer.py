# test_lexer.py
from lexer import Lexer

# Читаем lexer.atom
with open('lexer.atom', 'r', encoding='utf-8') as f:
    source = f.read()

print(f"Прочитано {len(source)} символов")
print("Методы Lexer:", [m for m in dir(Lexer) if not m.startswith('_')])

# Создаём экземпляр
lexer = Lexer(source)

# Пробуем разные возможные методы
if hasattr(lexer, 'tokenize'):
    tokens = lexer.tokenize()
    print(f"tokenize: {len(tokens)} токенов")
elif hasattr(lexer, 'get_tokens'):
    tokens = lexer.get_tokens()
    print(f"get_tokens: {len(tokens)} токенов")
elif hasattr(lexer, 'next_token'):
    # По одному токену
    tokens = []
    while True:
        tok = lexer.next_token()
        if tok is None or tok.type == 'EOF':
            break
        tokens.append(tok)
    print(f"next_token: {len(tokens)} токенов")
else:
    print("Не удалось найти метод для получения токенов")
    print("Доступные методы:", dir(lexer))