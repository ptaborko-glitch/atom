# check_hir.py
from lexer import Lexer
from parser import Parser
from semantic import SemanticAnalyzer
from hir import HIRBuilder

# Читаем lexer.atom
with open('lexer.atom', 'r', encoding='utf-8') as f:
    source = f.read()

# Лексический и синтаксический анализ
lexer = Lexer(source)
parser = Parser(lexer)
ast = parser.parse()

# Семантический анализ (создаёт symbol_table)
semantic = SemanticAnalyzer()
symbol_table = semantic.analyze(ast)  # Предполагаем, что analyze возвращает symbol_table

print(f"Symbol table type: {type(symbol_table)}")
print(f"Symbol table: {symbol_table}")

# HIR построение
hir_builder = HIRBuilder()
try:
    hir = hir_builder.build(ast, symbol_table)
    print(f"HIR инструкций: {len(hir)}")
    for i, inst in enumerate(hir[:10]):
        print(f"  {i}: {inst}")
except Exception as e:
    print(f"Ошибка: {e}")
    import traceback
    traceback.print_exc()