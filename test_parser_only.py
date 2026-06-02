from lexer import Lexer
from parser import Parser

code = """
func add(a, b):
    return a + b

func main:
    x = add(40, 2)
    return x
"""

lexer = Lexer(code)
parser = Parser(lexer)
try:
    ast = parser.parse()
    print("✅ Парсинг успешен!")
    print("AST:", ast)
except Exception as e:
    print(f"❌ Ошибка: {e}")
