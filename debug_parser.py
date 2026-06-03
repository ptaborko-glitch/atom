from lexer import Lexer
from parser import Parser

with open('lexer.atom', 'r') as f:
    source = f.read()

lexer = Lexer(source)
parser = Parser(lexer)

print("Пошаговый разбор:")
try:
    ast = parser.parse()
    print("AST:", ast)
except Exception as e:
    print(f"Ошибка: {e}")
    # Выводим последний токен
    print(f"Последний токен: {parser.current_token}")
