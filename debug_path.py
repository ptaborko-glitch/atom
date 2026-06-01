# debug_path.py — диагностика путей
import sys
import os

print("=" * 60)
print("ДИАГНОСТИКА ПУТЕЙ")
print("=" * 60)

# Где находится этот скрипт
script_dir = os.path.dirname(os.path.abspath(__file__))
print(f"Папка скрипта: {script_dir}")

# Текущая рабочая директория
cwd = os.getcwd()
print(f"Рабочая директория: {cwd}")

# Содержимое sys.path
print(f"\nsys.path:")
for p in sys.path:
    print(f"  {p}")

# Какие .py файлы есть в папке скрипта
print(f"\nФайлы в папке скрипта:")
for f in os.listdir(script_dir):
    print(f"  {f}")

# Пробуем импортировать напрямую
print(f"\nПробуем импорт parser...")
try:
    import parser
    print("  OK! parser импортирован.")
except ModuleNotFoundError as e:
    print(f"  ОШИБКА: {e}")