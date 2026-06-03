with open('semantic.py', 'r') as f:
    content = f.read()

old_funcdef = '''    def visit_FuncDef(self, node):
        existing = self.symbol_table.resolve_local(node.name)
        if existing:
            self.error(f"Function '{node.name}' already defined", node)
            return
        func_sym = Symbol(node.name, "function", node)
        self.symbol_table.define(func_sym)
        self.symbol_table.enter_scope(f"func:{node.name}")
        for stmt in node.body:
            self.visit(stmt)
        self.symbol_table.exit_scope()'''

new_funcdef = '''    def visit_FuncDef(self, node):
        existing = self.symbol_table.resolve_local(node.name)
        if existing:
            self.error(f"Function '{node.name}' already defined", node)
            return
        func_sym = Symbol(node.name, "function", node)
        self.symbol_table.define(func_sym)
        self.symbol_table.enter_scope(f"func:{node.name}")
        # Добавляем параметры как переменные
        if hasattr(node, 'params') and node.params:
            for param in node.params:
                param_sym = Symbol(param, "variable", node)
                param_sym.type_annotation = TypeAnnotation("number")
                self.symbol_table.define(param_sym)
        for stmt in node.body:
            self.visit(stmt)
        self.symbol_table.exit_scope()'''

if old_funcdef in content:
    content = content.replace(old_funcdef, new_funcdef)
    with open('semantic.py', 'w') as f:
        f.write(content)
    print("✅ semantic.py обновлён")
else:
    print("⚠️ Текст не найден")
