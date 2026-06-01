# main_debug.py — упрощённая версия для отладки
import sys
from lexer import Lexer
from parser import Parser
from semantic import SemanticAnalyzer
from hir import HIRBuilder
from wasm_gen import WasmGenerator

# Читаем lexer.atom
with open('lexer.atom', 'r', encoding='utf-8') as f:
    source = f.read()

print(f"Прочитано {len(source)} символов из lexer.atom")
print("Первые 500 символов:")
print(source[:500])
print("\n" + "="*60 + "\n")

# Лексический анализ
print("1. Лексический анализ...")
lexer = Lexer(source)
tokens = lexer.tokenize()
print(f"   Получено {len(tokens)} токенов")
print(f"   Первые 10 токенов: {tokens[:10]}")
print()

# Синтаксический анализ
print("2. Синтаксический анализ...")
parser = Parser(tokens)
try:
    ast = parser.parse()
    print(f"   AST построен")
    print(f"   AST: {ast[:200] if len(str(ast)) > 200 else ast}...")
except Exception as e:
    print(f"   Ошибка: {e}")
    sys.exit(1)
print()

# Семантический анализ
print("3. Семантический анализ...")
semantic = SemanticAnalyzer()
try:
    semantic.analyze(ast)
    print("   OK")
except Exception as e:
    print(f"   Ошибка: {e}")
    sys.exit(1)
print()

# Построение HIR
print("4. Построение HIR...")
hir_builder = HIRBuilder()
try:
    hir = hir_builder.build(ast)
    print(f"   Получено {len(hir)} HIR инструкций")
    print(f"   Первые 20 инструкций:")
    for i, inst in enumerate(hir[:20]):
        print(f"      {i}: {inst}")
except Exception as e:
    print(f"   Ошибка: {e}")
    sys.exit(1)
print()

# Генерация WASM
print("5. Генерация WASM...")
wasm_gen = WasmGenerator()
try:
    wat = wasm_gen.generate(hir)
    with open('output.wat', 'w', encoding='utf-8') as f:
        f.write(wat)
    print(f"   Сгенерирован output.wat ({len(wat)} символов)")
except Exception as e:
    print(f"   Ошибка: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n✅ Готово!")