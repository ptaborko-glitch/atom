with open('output.wat', 'r') as f:
    lines = f.readlines()

# Найдём, где устанавливается CHAR_PLUS
for i, line in enumerate(lines):
    if 'global.set $CHAR_PLUS' in line:
        print(f"Line {i}: {line.rstrip()}")
        # Покажи 3 строки до и после
        for j in range(max(0,i-3), min(len(lines), i+4)):
            print(f"  {j}: {lines[j].rstrip()}")