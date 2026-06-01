# show_wat_for_is_digit_full.py
with open('output.wat', 'r') as f:
    content = f.read()
    # Найдём функцию lexer_is_digit
    import re

    # Ищем от (func $lexer_is_digit до следующей ) на том же уровне вложенности
    lines = content.split('\n')
    in_func = False
    func_lines = []
    brace_count = 0

    for line in lines:
        if 'func $lexer_is_digit' in line:
            in_func = True
        if in_func:
            func_lines.append(line)
            brace_count += line.count('(') - line.count(')')
            if brace_count == 0 and line.strip().startswith(')'):
                break

    if func_lines:
        print('\n'.join(func_lines))
    else:
        print("Функция не найдена")