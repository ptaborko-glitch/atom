with open('parser.py', 'r') as f:
    lines = f.readlines()

# Находим строку с "return FuncDef" и убираем лишние отступы после неё
new_lines = []
skip_until = None

for i, line in enumerate(lines):
    if "return FuncDef(name, params, body)" in line:
        new_lines.append(line)
        # Пропускаем следующие строки до "def parse_ident_statement"
        continue
    elif "def parse_ident_statement(self):" in line:
        # Добавляем эту строку без лишних пробелов
        new_lines.append("    def parse_ident_statement(self):\n")
        continue
    elif i > 0 and "def parse_ident_statement" not in line and "return FuncDef" not in lines[i-1] and "def parse_ident_statement" not in lines[i-1]:
        new_lines.append(line)

with open('parser.py', 'w') as f:
    f.writelines(new_lines)

print("✅ Исправлено")
