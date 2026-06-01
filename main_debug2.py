# main_debug2.py — исправленная версия
import sys
from lexer import Lexer
from parser import Parser
from semantic import SemanticAnalyzer
from hir import HIRBuilder
from wasm_gen import WasmGenerator

# Читаем lexer.atom
try:
    with open('lexer.atom', 'r', encoding='utf-8') as f:
        source = f.read()
    print(f"Прочитано {len(source)} символов из lexer.atom")
except FileNotFoundError:
    print("Ошибка: файл lexer.atom не найден!")
    sys.exit(1)

print("Первые 500 символов:")
print(source[:500])
print("\n" + "=" * 60 + "\n")

# Создаём лексер
print("1. Создание лексера...")
lexer = Lexer(source)
print(f"   Лексер создан")

# Синтаксический анализ
print("2. Синтаксический анализ...")
try:
    parser = Parser(lexer)
    ast = parser.parse()
    print(f"   AST построен")
except Exception as e:
    print(f"   Ошибка: {e}")
    import traceback

    traceback.print_exc()
    sys.exit(1)
print()

# Семантический анализ
print("3. Семантический анализ...")
semantic = SemanticAnalyzer()
try:
    symbol_table = semantic.analyze(ast)
    print("   OK")
    print(f"   Symbol table: {symbol_table}")
except Exception as e:
    print(f"   Ошибка: {e}")
    import traceback

    traceback.print_exc()
    sys.exit(1)
print()

# Построение HIR
print("4. Построение HIR...")
hir_builder = HIRBuilder()
try:
    hir = hir_builder.build(ast, symbol_table)
    print(f"   Получено {len(hir)} HIR инструкций")
    print(f"   Первые 20 инструкций:")
    for i, inst in enumerate(hir[:20]):
        print(f"      {i}: {inst}")
except Exception as e:
    print(f"   Ошибка: {e}")
    import traceback

    traceback.print_exc()
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

    # Также сохраняем как .wasm через wat2wasm (если доступен)
    import subprocess

    try:
        subprocess.run(['wat2wasm', 'output.wat', '-o', 'output.wasm'], check=True)
        print(f"   Скомпилирован output.wasm")
    except FileNotFoundError:
        print(f"   Предупреждение: wat2wasm не найден, пропускаем компиляцию в .wasm")
    except Exception as e:
        print(f"   Ошибка компиляции .wasm: {e}")

except Exception as e:
    print(f"   Ошибка: {e}")
    import traceback

    traceback.print_exc()
    sys.exit(1)

print("\n✅ Готово!")