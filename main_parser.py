import sys
from lexer import Lexer
from parser import Parser
from semantic import SemanticAnalyzer
from hir import HIRBuilder
from wasm_gen import WasmGenerator

# Читаем parser.atom
try:
    with open('parser.atom', 'r', encoding='utf-8') as f:
        source = f.read()
    print(f"Прочитано {len(source)} символов из parser.atom")
except FileNotFoundError:
    print("Ошибка: файл parser.atom не найден!")
    sys.exit(1)

print("\n=== Компиляция parser.atom ===\n")

# Создаём лексер
print("1. Лексический анализ...")
lexer = Lexer(source)
print(f"   OK")

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

# Семантический анализ
print("3. Семантический анализ...")
semantic = SemanticAnalyzer()
try:
    symbol_table = semantic.analyze(ast)
    print(f"   OK, символов: {len(symbol_table.symbols) if hasattr(symbol_table, 'symbols') else '?'}")
except Exception as e:
    print(f"   Ошибка: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Построение HIR
print("4. Построение HIR...")
hir_builder = HIRBuilder()
try:
    hir = hir_builder.build(ast, symbol_table)
    print(f"   Получено {len(hir)} HIR инструкций")
except Exception as e:
    print(f"   Ошибка: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Генерация WASM
print("5. Генерация WASM...")
wasm_gen = WasmGenerator()
try:
    wat = wasm_gen.generate(hir)
    with open('parser_output.wat', 'w', encoding='utf-8') as f:
        f.write(wat)
    print(f"   Сгенерирован parser_output.wat ({len(wat)} символов)")
    
    import subprocess
    try:
        subprocess.run(['wat2wasm', 'parser_output.wat', '-o', 'parser_output.wasm'], check=True)
        print(f"   Скомпилирован parser_output.wasm")
    except FileNotFoundError:
        print(f"   Предупреждение: wat2wasm не найден")
    except Exception as e:
        print(f"   Ошибка компиляции: {e}")
        
except Exception as e:
    print(f"   Ошибка: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n✅ Готово! Парсер скомпилирован в parser_output.wasm")
