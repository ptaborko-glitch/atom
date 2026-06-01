# check_line197.py
with open('lexer.atom', 'r', encoding='utf-8') as f:
    lines = f.readlines()
    print(f"Строка 197: [{repr(lines[196])}]")
    print(f"Символы: {[ord(c) for c in lines[196]]}")