from lexer import Lexer
from parser import Parser

source = '''
func test():
    if x:
        return 1
'''

lexer = Lexer(source)
parser = Parser(lexer)
try:
    ast = parser.parse()
    print("AST:", ast)
except Exception as e:
    print(f"Error: {e}")
    print(f"Last token: {parser.current_token}")
