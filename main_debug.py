# main_debug.py — с ограничением на количество токенов
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

# Лексический анализ с ограничением
print("1. Лексический анализ...")
lexer = Lexer(source)
tokens = []
max_tokens = 5000  # Ограничение для предотвращения бесконечного цикла
token_count = 0

while token_count < max_tokens:
    token = lexer.get_next_token()
    token_count += 1
    if token is None:
        print("   get_next_token вернул None - останов")
        break
    tokens.append(token)

    # Проверяем тип токена (если есть атрибут type)
    token_type = getattr(token, 'type', None) or getattr(token, 'token_type', None)
    if token_type == 'EOF':
        print("   Достигнут EOF")
        break

    if token_count % 500 == 0:
        print(f"   ... получено {token_count} токенов, последний: {token}")

if token_count >= max_tokens:
    print(f"⚠️  Достигнут лимит в {max_tokens} токенов - возможно бесконечный цикл!")

print(f"   Получено {len(tokens)} токенов")
if tokens:
    print(f"   Первые 10 токенов: {tokens[:10]}")
    print(f"   Последние 5 токенов: {tokens[-5:]}")
print()

if len(tokens) >= max_tokens:
    print("❌ Слишком много токенов, прерываем выполнение")
    sys.exit(1)

# Синтаксический анализ
print("2. Синтаксический анализ...")
parser = Parser(tokens)
try:
    ast = parser.parse()
    print(f"   AST построен")
    print(f"   AST: {str(ast)[:200]}...")
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
    semantic.analyze(ast)
    print("   OK")
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
    hir = hir_builder.build(ast)
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
except Exception as e:
    print(f"   Ошибка: {e}")
    import traceback

    traceback.print_exc()
    sys.exit(1)

print("\n✅ Готово!")