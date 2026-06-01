# show_main.py
with open('output.wat', 'r') as f:
    lines = f.readlines()

# Находим функцию main
in_main = False
for i, line in enumerate(lines):
    if '(func $main' in line:
        in_main = True
    if in_main:
        print(f"{i}: {line.rstrip()}")
        if line.strip() == ')':
            break