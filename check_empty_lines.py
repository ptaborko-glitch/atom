# check_empty_lines.py
with open('lexer.atom', 'r', encoding='utf-8') as f:
    lines = f.readlines()
    for i in range(195, 202):
        print(f"{i+1:3d}: {repr(lines[i])}")