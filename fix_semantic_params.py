with open('semantic.py', 'r') as f:
    content = f.read()

# Добавляем параметры в visit_FuncDef
old_visit_funcdef = '''    def visit_FuncDef(self, node):
        # Сохраняем текущую функцию
        self.current_function = node.name
        # Создаём новый scope для тела функции
        self.symbol_table.enter_scope()
        # Посещаем тело функции
        for stmt in node.body:
            self.visit(stmt)
        # Выходим из scope
        self.symbol_table.exit_scope()
        self.current_function = None'''

new_visit_funcdef = '''    def visit_FuncDef(self, node):
        # Сохраняем текущую функцию
        self.current_function = node.name
        # Создаём новый scope для тела функции
        self.symbol_table.enter_scope()
        # Добавляем параметры в scope
        if hasattr(node, 'params') and node.params:
            for param in node.params:
                self.symbol_table.declare(param, TypeAnnotation("number"))
        # Посещаем тело функции
        for stmt in node.body:
            self.visit(stmt)
        # Выходим из scope
        self.symbol_table.exit_scope()
        self.current_function = None'''

if old_visit_funcdef in content:
    content = content.replace(old_visit_funcdef, new_visit_funcdef)
    with open('semantic.py', 'w') as f:
        f.write(content)
    print("✅ semantic.py обновлён")
else:
    print("⚠️ Метод не найден")
