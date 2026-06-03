# semantic.py — Семантический анализатор для Atom

from parser import (
    Program, VarDecl, Assign, AssignField, AgentDef, ActDef, Param,
    NumberLiteral, StringLiteral, BoolLiteral, Identifier,
    SelfAccess, FieldAccess, BinaryOp, UnaryOp, InlineCall, BlockCall,
    MethodCall, SpawnExpr, ReturnStmt, GraphBlock, TypeAnnotation,
    TensorLiteral, TensorAccess, IfStmt, WhileStmt,
    FuncDef, FuncCall
)


class SemanticError(Exception):
    def __init__(self, message, node=None):
        self.message = message
        self.node = node
    def __str__(self):
        return f"SemanticError: {self.message}"


class Symbol:
    def __init__(self, name, symbol_type, node=None):
        self.name = name
        self.symbol_type = symbol_type
        self.node = node
        self.type_annotation = None
        self.params = []
        self.return_type = None
        self.offset = None
        self.agent_size = 0
        self.default_value = None
        self.is_method = False
    def __repr__(self):
        return f"Symbol({self.name}, {self.symbol_type})"


class Scope:
    def __init__(self, name="global", parent=None):
        self.name = name
        self.parent = parent
        self.symbols = {}
    def define(self, symbol):
        if symbol.name in self.symbols:
            raise SemanticError(f"Duplicate definition of '{symbol.name}'")
        self.symbols[symbol.name] = symbol
    def resolve(self, name):
        if name in self.symbols:
            return self.symbols[name]
        if self.parent is not None:
            return self.parent.resolve(name)
        return None
    def resolve_local(self, name):
        return self.symbols.get(name)
    def __repr__(self):
        return f"Scope({self.name})"


class SymbolTable:
    def __init__(self):
        self.global_scope = Scope(name="global")
        self.current_scope = self.global_scope
        self._init_builtins()
    def _init_builtins(self):
        builtins = [
            ("random", "builtin_function"), ("sigmoid", "builtin_function"),
            ("relu", "builtin_function"), ("tanh", "builtin_function"),
            ("softmax", "builtin_function"), ("matmul", "builtin_function"),
            ("load_csv", "builtin_function"), ("save_csv", "builtin_function"),
            ("print", "builtin_function"), ("mse", "builtin_function"),
            ("cross_entropy", "builtin_function"), ("sgd_step", "builtin_function"),
            ("nn_dense", "builtin_function"),
            ("list_create", "builtin_function"), ("list_add", "builtin_function"),
            ("list_get", "builtin_function"), ("list_len", "builtin_function"),
            ("string_create", "builtin_function"), ("string_len", "builtin_function"),
            ("string_char_at", "builtin_function"), ("string_char_code_at", "builtin_function"),
            ("string_substring", "builtin_function"), ("string_concat", "builtin_function"),
            ("string_set_char", "builtin_function"), ("string_from_char", "builtin_function"),
            ("tensor", "type"), ("number", "type"), ("string", "type"), ("bool", "type"),
        ]
        for name, kind in builtins:
            self.global_scope.define(Symbol(name, kind))
    def enter_scope(self, name="block"):
        new_scope = Scope(name=name, parent=self.current_scope)
        self.current_scope = new_scope
        return new_scope
    def exit_scope(self):
        if self.current_scope.parent is not None:
            self.current_scope = self.current_scope.parent
        else:
            raise SemanticError("Cannot exit global scope")
    def define(self, symbol):
        self.current_scope.define(symbol)
    def resolve(self, name):
        return self.current_scope.resolve(name)
    def resolve_local(self, name):
        return self.current_scope.resolve_local(name)
    def get_agent_name(self):
        scope = self.current_scope
        while scope:
            if scope.name.startswith("agent:"):
                return scope.name[6:]
            scope = scope.parent
        return None
    def __repr__(self):
        return f"SymbolTable(current={self.current_scope.name})"


class SemanticAnalyzer:
    def __init__(self):
        self.symbol_table = SymbolTable()
        self.errors = []
        self.current_agent = None
        self.current_agent_scope = None
        self.current_method = None
    def error(self, message, node=None):
        self.errors.append(SemanticError(message, node))
    def analyze(self, program):
        for statement in program.statements:
            self.visit(statement)
        if self.errors:
            for err in self.errors:
                print(f"  ERROR: {err}")
            raise self.errors[0]
        return self.symbol_table
    def visit(self, node):
        method_name = 'visit_' + type(node).__name__
        visitor = getattr(self, method_name, self.generic_visit)
        return visitor(node)
    def generic_visit(self, node):
        raise NotImplementedError(f"No visitor for {type(node).__name__}")

    def visit_AgentDef(self, node):
        existing = self.symbol_table.resolve_local(node.name)
        if existing:
            self.error(f"Agent '{node.name}' already defined", node)
            return
        agent_sym = Symbol(node.name, "agent", node)
        self.symbol_table.define(agent_sym)
        agent_scope = self.symbol_table.enter_scope(f"agent:{node.name}")
        self.current_agent = node.name
        self.current_agent_scope = agent_scope
        offset = 4
        for field in node.fields:
            self.visit(field)
            field_sym = self.symbol_table.resolve_local(field.name)
            if field_sym:
                field_sym.offset = offset
                if field.type_annotation and field.type_annotation.type_name == "tensor":
                    offset += 4
                else:
                    offset += 8
        agent_sym.agent_size = offset
        for method in node.methods:
            self.visit(method)
        self.current_agent = None
        self.current_agent_scope = None
        self.symbol_table.exit_scope()

    def visit_FuncDef(self, node):
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
        self.symbol_table.exit_scope()

    def visit_VarDecl(self, node):
        existing = self.symbol_table.resolve_local(node.name)
        if existing:
            self.error(f"Variable '{node.name}' already defined", node)
            return
        type_ann = node.type_annotation
        expr_type = self.visit_expression(node.value)
        if type_ann is None and expr_type is not None:
            type_ann = expr_type
        if type_ann and expr_type:
            if not self.types_compatible(type_ann, expr_type):
                self.error(f"Type mismatch: cannot assign {expr_type} to {type_ann}", node)
        sym = Symbol(node.name, "variable", node)
        sym.type_annotation = type_ann
        sym.default_value = node.value
        self.symbol_table.define(sym)

    def visit_Assign(self, node):
        sym = self.symbol_table.resolve(node.name)
        if sym is None:
            expr_type = self.visit_expression(node.value)
            sym = Symbol(node.name, "variable", node)
            sym.type_annotation = expr_type
            self.symbol_table.define(sym)
            return
        expr_type = self.visit_expression(node.value)
        if sym.type_annotation and expr_type:
            if not self.types_compatible(sym.type_annotation, expr_type):
                self.error(f"Type mismatch: cannot assign {expr_type} to {sym.type_annotation}", node)

    def visit_AssignField(self, node):
        obj_sym = self.symbol_table.resolve(node.object_name)
        if obj_sym is None:
            self.error(f"Undefined variable '{node.object_name}'", node)
            return
        self.visit_expression(node.value)

    def visit_ActDef(self, node):
        existing = self.symbol_table.resolve_local(node.name)
        if existing:
            self.error(f"Method '{node.name}' already defined", node)
            return
        method_sym = Symbol(node.name, "method", node)
        method_sym.return_type = node.return_type
        method_sym.params = node.params
        method_sym.is_method = True
        self.symbol_table.define(method_sym)
        self.symbol_table.enter_scope(f"method:{node.name}")
        prev_method = self.current_method
        self.current_method = method_sym
        for param in node.params:
            self.visit(param)
        for stmt in node.body:
            self.visit(stmt)
        self.current_method = prev_method
        self.symbol_table.exit_scope()

    def visit_Param(self, node):
        existing = self.symbol_table.resolve_local(node.name)
        if existing:
            self.error(f"Parameter '{node.name}' already defined", node)
            return
        sym = Symbol(node.name, "variable", node)
        sym.type_annotation = node.type_annotation
        self.symbol_table.define(sym)

    def visit_GraphBlock(self, node):
        self.symbol_table.enter_scope("graph")
        for stmt in node.body:
            self.visit(stmt)
        self.symbol_table.exit_scope()

    def visit_ReturnStmt(self, node):
        return_type = self.visit_expression(node.value)
        if self.current_method is not None:
            declared_return = self.current_method.return_type
            if declared_return is not None and return_type is not None:
                if not self.types_compatible(declared_return, return_type):
                    self.error(f"Return type mismatch: expected {declared_return}, got {return_type}", node)
        return return_type

    def visit_IfStmt(self, node):
        self.visit_expression(node.condition)
        self.symbol_table.enter_scope("if")
        for stmt in node.then_body:
            self.visit(stmt)
        self.symbol_table.exit_scope()
        if node.else_body:
            self.symbol_table.enter_scope("else")
            for stmt in node.else_body:
                self.visit(stmt)
            self.symbol_table.exit_scope()

    def visit_WhileStmt(self, node):
        self.visit_expression(node.condition)
        self.symbol_table.enter_scope("while")
        for stmt in node.body:
            self.visit(stmt)
        self.symbol_table.exit_scope()

    def visit_expression(self, node):
        if isinstance(node, NumberLiteral):
            return TypeAnnotation("number")
        elif isinstance(node, StringLiteral):
            return TypeAnnotation("string")
        elif isinstance(node, BoolLiteral):
            return TypeAnnotation("bool")
        elif isinstance(node, TensorLiteral):
            return self.visit_TensorLiteral(node)
        elif isinstance(node, Identifier):
            return self.visit_Identifier(node)
        elif isinstance(node, SelfAccess):
            return self.visit_SelfAccess(node)
        elif isinstance(node, FieldAccess):
            return self.visit_FieldAccess(node)
        elif isinstance(node, BinaryOp):
            return self.visit_BinaryOp(node)
        elif isinstance(node, UnaryOp):
            return self.visit_UnaryOp(node)
        elif isinstance(node, InlineCall):
            return self.visit_InlineCall(node)
        elif isinstance(node, BlockCall):
            return self.visit_BlockCall(node)
        elif isinstance(node, MethodCall):
            return self.visit_MethodCall(node)
        elif isinstance(node, SpawnExpr):
            return self.visit_SpawnExpr(node)
        elif isinstance(node, TensorAccess):
            return self.visit_TensorAccess(node)
        elif isinstance(node, FuncCall):
            return self.visit_FuncCall(node)
        else:
            self.error(f"Unknown expression: {type(node).__name__}", node)
            return None

    def visit_FuncCall(self, node):
        sym = self.symbol_table.resolve(node.name)
        if sym is None:
            self.error(f"Undefined function '{node.name}'", node)
            return None
        for arg in node.arguments:
            self.visit_expression(arg)
        return sym.type_annotation

    def visit_TensorLiteral(self, node):
        rows_count = len(node.rows)
        cols_count = len(node.rows[0]) if rows_count > 0 else 0
        for row in node.rows:
            if len(row) != cols_count:
                self.error("Inconsistent row lengths in tensor literal", node)
                return None
        return TypeAnnotation("tensor", [rows_count, cols_count])

    def visit_Identifier(self, node):
        sym = self.symbol_table.resolve(node.name)
        if sym is None:
            self.error(f"Undefined name '{node.name}'", node)
            return None
        return sym.type_annotation

    def visit_SelfAccess(self, node):
        if self.current_agent is None:
            self.error("'self' used outside of agent", node)
            return None
        if self.current_agent_scope is not None:
            sym = self.current_agent_scope.resolve_local(node.field_name)
            if sym is not None:
                return sym.type_annotation
        self.error(f"Field '{node.field_name}' not found", node)
        return None

    def visit_FieldAccess(self, node):
        obj_sym = self.symbol_table.resolve(node.object_name)
        if obj_sym is None:
            self.error(f"Undefined variable '{node.object_name}'", node)
            return None
        return TypeAnnotation("number")

    def visit_BinaryOp(self, node):
        left_type = self.visit_expression(node.left)
        right_type = self.visit_expression(node.right)
        if left_type is None or right_type is None:
            return None
        operator = node.operator
        if operator in ('+', '-', '*', '/'):
            if left_type.type_name == "tensor" and right_type.type_name == "tensor":
                if operator in ('+', '-'):
                    if left_type.dimensions and right_type.dimensions:
                        if left_type.dimensions != right_type.dimensions:
                            self.error(f"Tensor dimension mismatch in '{operator}'", node)
                            return None
                    return TypeAnnotation("tensor", left_type.dimensions)
            if left_type.type_name == "tensor" and right_type.type_name == "number":
                if operator in ('*', '/'):
                    return TypeAnnotation("tensor", left_type.dimensions)
            if left_type.type_name == "number" and right_type.type_name == "tensor":
                if operator == '*':
                    return TypeAnnotation("tensor", right_type.dimensions)
            if left_type.type_name == "number" and right_type.type_name == "number":
                return TypeAnnotation("number")
            self.error(f"Type mismatch in '{operator}': {left_type} and {right_type}", node)
            return None
        if operator == '@':
            if left_type.type_name != 'tensor' or right_type.type_name != 'tensor':
                self.error(f"Operator '@' requires tensor operands", node)
                return None
            self.check_matmul_dims(left_type, right_type, node)
            result_dims = None
            if left_type.dimensions and right_type.dimensions:
                if len(left_type.dimensions) >= 2 and len(right_type.dimensions) >= 2:
                    result_dims = left_type.dimensions[:-1] + right_type.dimensions[-1:]
            return TypeAnnotation("tensor", result_dims)
        if operator in ('==', '!=', '>', '<', '>=', '<='):
            return TypeAnnotation("bool")
        return None

    def visit_UnaryOp(self, node):
        operand_type = self.visit_expression(node.operand)
        if operand_type is None:
            return None
        return operand_type

    def visit_InlineCall(self, node):
        sym = self.symbol_table.resolve(node.name)
        if sym is None:
            self.error(f"Undefined function '{node.name}'", node)
            return None
        for arg in node.arguments:
            self.visit_expression(arg)
        if sym.symbol_type == "builtin_function":
            return self._get_builtin_return_type(node.name)
        return None

    def visit_BlockCall(self, node):
        sym = self.symbol_table.resolve(node.name)
        if sym is None:
            self.error(f"Undefined function '{node.name}'", node)
            return None
        for arg in node.arguments:
            self.visit_expression(arg.value)
        if node.name == "nn_dense":
            return TypeAnnotation("agent")
        elif node.name == "load_csv":
            return TypeAnnotation("tensor")
        return None

    def visit_MethodCall(self, node):
        obj_sym = self.symbol_table.resolve(node.object_name)
        if obj_sym is None:
            self.error(f"Undefined variable '{node.object_name}'", node)
            return None
        for arg in node.arguments:
            self.visit_expression(arg)
        return TypeAnnotation("number")

    def visit_SpawnExpr(self, node):
        sym = self.symbol_table.resolve(node.agent_name)
        if sym is None:
            self.error(f"Undefined agent '{node.agent_name}'", node)
            return None
        if sym.symbol_type != "agent":
            self.error(f"'{node.agent_name}' is not an agent", node)
            return None
        return TypeAnnotation("agent")

    def visit_TensorAccess(self, node):
        tensor_type = self.visit_expression(node.tensor)
        if tensor_type is None or tensor_type.type_name != "tensor":
            self.error(f"Variable is not a tensor", node)
            return None
        self.visit_expression(node.row)
        self.visit_expression(node.col)
        return TypeAnnotation("number")

    def types_compatible(self, t1, t2):
        if t1 is None or t2 is None:
            return True
        if t1.type_name != t2.type_name:
            return False
        if t1.type_name == "tensor" and t1.dimensions and t2.dimensions:
            if t1.dimensions != t2.dimensions:
                return False
        return True

    def check_matmul_dims(self, left_type, right_type, node):
        if left_type.dimensions and right_type.dimensions:
            if len(left_type.dimensions) >= 2 and len(right_type.dimensions) >= 2:
                if left_type.dimensions[-1] != right_type.dimensions[-2]:
                    self.error(f"Matrix multiplication dimension mismatch: {left_type} @ {right_type}", node)

    def _get_builtin_return_type(self, name):
        builtin_types = {
            "random": TypeAnnotation("number"),
            "sigmoid": TypeAnnotation("number"),
            "relu": TypeAnnotation("number"),
            "tanh": TypeAnnotation("number"),
            "softmax": TypeAnnotation("tensor"),
            "matmul": TypeAnnotation("tensor"),
            "load_csv": TypeAnnotation("tensor"),
            "list_create": TypeAnnotation("list"),
            "list_len": TypeAnnotation("number"),
            "list_get": TypeAnnotation("number"),
            "string_create": TypeAnnotation("string"),
            "string_len": TypeAnnotation("number"),
            "string_from_char": TypeAnnotation("string"),
            "string_substring": TypeAnnotation("string"),
            "string_concat": TypeAnnotation("string"),
            "string_char_at": TypeAnnotation("number"),
            "string_char_code_at": TypeAnnotation("number"),
            "mse": TypeAnnotation("number"),
            "cross_entropy": TypeAnnotation("number"),
        }
        return builtin_types.get(name, None)