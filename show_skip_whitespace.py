# show_skip_whitespace.py
with open('output.wat', 'r') as f:
    content = f.read()
    lines = content.split('\n')
    in_func = False
    for i, line in enumerate(lines):
        if 'func $lexer_skip_whitespace' in line:
            in_func = True
        if in_func:
            print(f"{i}: {line}")
            if line.strip() == ')' and i > 0 and lines[i-1].strip() != 'local':
                break