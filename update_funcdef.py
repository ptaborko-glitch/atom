import re

with open('parser.py', 'r') as f:
    content = f.read()

# Заменяем определение класса FuncDef
old_class = '''class FuncDef(ASTNode):
    """Определение функции: func name: ... тело ..."""
    def __init__(self, name, body):
        self.name = name
        self.body = body
    def __repr__(self):
        return f"FuncDef({self.name})"'''

new_class = '''class FuncDef(ASTNode):
    """Определение функции: func name(params): ... тело ..."""
    def __init__(self, name, params, body):
        self.name = name
        self.params = params
        self.body = body
    def __repr__(self):
        return f"FuncDef({self.name}, params={self.params})"'''

if old_class in content:
    content = content.replace(old_class, new_class)
    with open('parser.py', 'w') as f:
        f.write(content)
    print("✅ FuncDef обновлён")
else:
    print("⚠️ Класс не найден, обновите вручную")
