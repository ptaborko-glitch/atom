# hir.py — HIR для Atom

from parser import FuncDef, FuncCall, ReturnStmt


class HIRInstruction:
    def __init__(self, opcode, operands=None, result=None, value_type="f64"):
        self.opcode = opcode
        self.operands = operands if operands is not None else []
        self.result = result
        self.value_type = value_type

    def __repr__(self):
        if self.opcode == "store":
            return f"store {self.operands[0]} -> {self.operands[1]}"
        elif self.opcode == "call":
            args = ", ".join(str(o) for o in self.operands[1:])
            return f"{self.result} = call {self.operands[0]}, {args}"
        elif self.opcode == "func_call":
            args = ", ".join(str(o) for o in self.operands[1:])
            return f"{self.result} = func_call {self.operands[0]}, {args}"
        elif self.opcode == "func_begin":
            return f"func_begin {self.operands[0]}"
        elif self.opcode == "func_end":
            return f"func_end {self.operands[0]}"
        elif self.opcode in ("tensor_create", "tensor_matmul", "tensor_add", "tensor_sub"):
            return f"{self.result} = {self.opcode} {self.operands}"
        elif self.opcode == "tensor_set":
            return f"tensor_set {self.operands}"
        elif self.opcode == "tensor_get":
            return f"{self.result} = tensor_get {self.operands}"
        elif self.opcode == "tensor_mul_scalar":
            return f"{self.result} = tensor_mul_scalar {self.operands}"
        elif self.opcode in ("agent_set_field", "agent_get_field"):
            return f"{self.opcode} {self.operands}"
        elif self.opcode in ("block", "loop", "begin_if", "begin_else", "end_block", "br", "br_if"):
            return f"{self.opcode} {self.operands}"
        elif self.opcode == "return":
            return f"return {self.operands[0]}"
        elif self.result:
            return f"{self.result} = {self.opcode} {self.operands}"
        else:
            return f"{self.opcode} {self.operands}"


class HIRBuilder:
    def __init__(self):
        self.instructions = []
        self.temp_counter = 0
        self.label_counter = 0
        self.symbol_table = None
        self.func_defs = {}

    def new_temp(self):
        self.temp_counter += 1
        return f"%{self.temp_counter}"

    def new_label(self):
        self.label_counter += 1
        return f"L{self.label_counter}"

    def emit(self, opcode, operands=None, result=None, value_type="f64"):
        if operands is None:
            operands = []
        inst = HIRInstruction(opcode, operands, result, value_type)
        self.instructions.append(inst)
        return result

    def build(self, ast, symbol_table):
        self.symbol_table = symbol_table
        self.func_defs = {}

        # Первый проход: собираем определения функций
        for statement in ast.statements:
            if isinstance(statement, FuncDef):
                self.func_defs[statement.name] = statement

        # Генерируем код main (всё, кроме FuncDef)
        for statement in ast.statements:
            if not isinstance(statement, FuncDef):
                self.visit(statement)

        # Добавляем код функций в конец с маркерами func_begin/func_end
        for name, func_def in self.func_defs.items():
            self.emit("func_begin", [name])
            for stmt in func_def.body:
                self.visit(stmt)
            self.emit("func_end", [name])

        return self.instructions

    def visit(self, node):
        from parser import (
            Program, VarDecl, Assign, AssignField, AgentDef, ActDef,
            IfStmt, WhileStmt, GraphBlock, BlockCall,
            NumberLiteral, StringLiteral, BoolLiteral, Identifier,
            SelfAccess, FieldAccess, BinaryOp, UnaryOp, InlineCall,
            MethodCall, SpawnExpr, TensorLiteral, TensorAccess
        )
        if isinstance(node, Program):
            return self.visit_Program(node)
        elif isinstance(node, VarDecl):
            return self.visit_VarDecl(node)
        elif isinstance(node, Assign):
            return self.visit_Assign(node)
        elif isinstance(node, AssignField):
            return self.visit_AssignField(node)
        elif isinstance(node, AgentDef):
            return self.visit_AgentDef(node)
        elif isinstance(node, ActDef):
            return self.visit_ActDef(node)
        elif isinstance(node, IfStmt):
            return self.visit_IfStmt(node)
        elif isinstance(node, WhileStmt):
            return self.visit_WhileStmt(node)
        elif isinstance(node, ReturnStmt):
            return self.visit_ReturnStmt(node)
        elif isinstance(node, GraphBlock):
            return self.visit_GraphBlock(node)
        elif isinstance(node, BlockCall):
            return self.visit_BlockCall(node)
        elif isinstance(node, NumberLiteral):
            return self.visit_NumberLiteral(node)
        elif isinstance(node, StringLiteral):
            return self.visit_StringLiteral(node)
        elif isinstance(node, BoolLiteral):
            return self.visit_BoolLiteral(node)
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
        elif isinstance(node, MethodCall):
            return self.visit_MethodCall(node)
        elif isinstance(node, SpawnExpr):
            return self.visit_SpawnExpr(node)
        elif isinstance(node, TensorLiteral):
            return self.visit_TensorLiteral(node)
        elif isinstance(node, TensorAccess):
            return self.visit_TensorAccess(node)
        elif isinstance(node, FuncDef):
            return self.visit_FuncDef(node)
        elif isinstance(node, FuncCall):
            return self.visit_FuncCall(node)
        else:
            raise NotImplementedError(f"No HIR visitor for {type(node).__name__}")

    def visit_Program(self, node):
        for stmt in node.statements:
            self.visit(stmt)

    def visit_FuncDef(self, node):
        # Ничего не делаем — функции собираются в build()
        pass

    def visit_FuncCall(self, node):
        from parser import InlineCall
        if node.name in self.func_defs:
            arg_temps = []
            for arg in node.arguments:
                arg_temps.append(self.visit(arg))
            temp = self.new_temp()
            self.emit("func_call", [node.name] + arg_temps, result=temp)
            return temp
        else:
            # Встроенная функция — создаём InlineCall и делегируем
            inline = InlineCall(node.name, node.arguments)
            return self.visit_InlineCall(inline)

    def visit_AgentDef(self, node):
        pass

    def visit_VarDecl(self, node):
        value_temp = self.visit(node.value)
        self.emit("store", [value_temp, node.name])

    def visit_Assign(self, node):
        value_temp = self.visit(node.value)
        self.emit("store", [value_temp, node.name])

    def visit_AssignField(self, node):
        obj_temp = self.visit(Identifier(node.object_name))
        field_offset = self._get_field_offset(node.object_name, node.field_name)
        offset_temp = self.new_temp()
        self.emit("const", [field_offset], result=offset_temp, value_type="i32")
        val_temp = self.visit(node.value)
        self.emit("agent_set_field", [obj_temp, offset_temp, val_temp])

    def visit_ActDef(self, node):
        agent_name = self.symbol_table.get_agent_name() or "unknown"
        func_label = f"{agent_name}.{node.name}"
        self.emit("label", [func_label])
        self.emit("param", ["self"])
        for param in node.params:
            self.emit("param", [param.name])
        for stmt in node.body:
            self.visit(stmt)
        self.emit("end")

    def visit_IfStmt(self, node):
        cond_temp = self.visit(node.condition)
        if node.else_body:
            self.emit("begin_if_else", [cond_temp])
        else:
            self.emit("begin_if", [cond_temp])
        for stmt in node.then_body:
            self.visit(stmt)
        if node.else_body:
            self.emit("begin_else")
            for stmt in node.else_body:
                self.visit(stmt)
        self.emit("end_block")

    def visit_WhileStmt(self, node):
        end_label = self.new_label()
        start_label = self.new_label()
        self.emit("block", [end_label])
        self.emit("loop", [start_label])
        cond_temp = self.visit(node.condition)
        self.emit("br_if", [cond_temp, end_label])
        for stmt in node.body:
            self.visit(stmt)
        self.emit("br", [start_label])
        self.emit("end_block")
        self.emit("end_block")

    def visit_ReturnStmt(self, node):
        value_temp = self.visit(node.value)
        self.emit("return", [value_temp])

    def visit_GraphBlock(self, node):
        from autodiff import ComputeGraph
        graph = ComputeGraph()
        self._build_graph(node, graph)
        backward_instructions = graph.generate_backward()
        for graph_node in graph.nodes:
            self.emit(graph_node.op_name, graph_node.inputs, result=graph_node.output_name)
        for opcode, operands, result in backward_instructions:
            self.emit(opcode, operands, result=result)

    def _build_graph(self, node, graph):
        for stmt in node.body:
            if isinstance(stmt, ReturnStmt):
                self._build_graph_expr(stmt.value, graph)

    def _build_graph_expr(self, node, graph):
        from parser import BinaryOp, UnaryOp, InlineCall, Identifier, NumberLiteral, SelfAccess
        if isinstance(node, NumberLiteral):
            return graph.add_node("const", [str(node.value)]).output_name
        elif isinstance(node, Identifier):
            graph.mark_parameter(node.name)
            return graph.add_node("param", [node.name]).output_name
        elif isinstance(node, SelfAccess):
            name = f"self.{node.field_name}"
            graph.mark_parameter(name)
            return graph.add_node("param", [name]).output_name
        elif isinstance(node, BinaryOp):
            left_name = self._build_graph_expr(node.left, graph)
            right_name = self._build_graph_expr(node.right, graph)
            op_map = {'+': 'add', '-': 'sub', '*': 'mul', '/': 'div', '@': 'matmul'}
            op_name = op_map.get(node.operator, node.operator)
            return graph.add_node(op_name, [left_name, right_name]).output_name
        elif isinstance(node, UnaryOp):
            operand_name = self._build_graph_expr(node.operand, graph)
            return graph.add_node("neg", [operand_name]).output_name
        elif isinstance(node, InlineCall):
            arg_names = [self._build_graph_expr(arg, graph) for arg in node.arguments]
            return graph.add_node(node.name, arg_names).output_name
        return "unknown"

    def visit_BlockCall(self, node):
        arg_temps = []
        for arg in node.arguments:
            val_temp = self.visit(arg.value)
            arg_temps.append(val_temp)
        if node.name == "load_csv":
            rows_temp = self.new_temp()
            cols_temp = self.new_temp()
            self.emit("const", [2], result=rows_temp, value_type="i32")
            self.emit("const", [2], result=cols_temp, value_type="i32")
            temp = self.new_temp()
            self.emit("tensor_create", [rows_temp, cols_temp], result=temp, value_type="i32")
            return temp
        temp = self.new_temp()
        self.emit("const", [0], result=temp, value_type="i32")
        return temp

    def visit_NumberLiteral(self, node):
        temp = self.new_temp()
        self.emit("const", [node.value], result=temp)
        return temp

    def visit_StringLiteral(self, node):
        temp = self.new_temp()
        self.emit("const", [f'"{node.value}"'], result=temp)
        return temp

    def visit_BoolLiteral(self, node):
        temp = self.new_temp()
        self.emit("const", [1 if node.value else 0], result=temp)
        return temp

    def visit_Identifier(self, node):
        temp = self.new_temp()
        self.emit("load", [node.name], result=temp)
        return temp

    def visit_SelfAccess(self, node):
        temp = self.new_temp()
        self.emit("load", [f"self.{node.field_name}"], result=temp)
        return temp

    def visit_FieldAccess(self, node):
        obj_temp = self.visit(Identifier(node.object_name))
        field_offset = self._get_field_offset(node.object_name, node.field_name)
        offset_temp = self.new_temp()
        self.emit("const", [field_offset], result=offset_temp, value_type="i32")
        temp = self.new_temp()
        self.emit("agent_get_field", [obj_temp, offset_temp], result=temp)
        return temp

    def visit_BinaryOp(self, node):
        left_temp = self.visit(node.left)
        right_temp = self.visit(node.right)
        left_type = self._get_expr_type(node.left)
        if node.operator == '@':
            temp = self.new_temp()
            self.emit("tensor_matmul", [left_temp, right_temp], result=temp, value_type="i32")
            return temp
        if left_type and left_type.type_name == "tensor":
            if node.operator == '+':
                temp = self.new_temp()
                self.emit("tensor_add", [left_temp, right_temp], result=temp, value_type="i32")
                return temp
            if node.operator == '-':
                temp = self.new_temp()
                self.emit("tensor_sub", [left_temp, right_temp], result=temp, value_type="i32")
                return temp
            if node.operator in ('*', '/'):
                temp = self.new_temp()
                self.emit("tensor_mul_scalar", [left_temp, right_temp], result=temp, value_type="i32")
                return temp
        opcode_map = {
            '+': 'add', '-': 'sub', '*': 'mul', '/': 'div',
            '==': 'eq', '!=': 'neq', '>': 'gt', '<': 'lt',
            '>=': 'gte', '<=': 'lte',
        }
        opcode = opcode_map.get(node.operator)
        if opcode is None:
            raise NotImplementedError(f"Unknown operator: {node.operator}")
        temp = self.new_temp()
        self.emit(opcode, [left_temp, right_temp], result=temp)
        return temp

    def visit_UnaryOp(self, node):
        operand_temp = self.visit(node.operand)
        temp = self.new_temp()
        self.emit("neg", [operand_temp], result=temp)
        return temp

    def visit_InlineCall(self, node):
        all_i32_funcs = {"list_create", "list_len",
                         "string_create", "string_len",
                         "tensor_create", "tensor_matmul", "tensor_add",
                         "tensor_sub", "agent_alloc",
                         "string_substring", "string_concat"}
        mixed_funcs = {
            "list_get": 2,
            "string_char_at": 2,
            "string_char_code_at": 2,
            "tensor_get": 3,
            "tensor_set": 3,
            "string_set_char": 2,
            "tensor_mul_scalar": 1,
            "tensor_get_element": 2,
        }
        arg_temps = []
        for i, arg in enumerate(node.arguments):
            if node.name in all_i32_funcs:
                temp = self._visit_as_i32(arg)
            elif node.name in mixed_funcs:
                num_i32 = mixed_funcs[node.name]
                if i < num_i32:
                    temp = self._visit_as_i32(arg)
                else:
                    temp = self.visit(arg)
            else:
                temp = self.visit(arg)
            arg_temps.append(temp)
        if node.name == "random" and len(arg_temps) == 2:
            temp = self.new_temp()
            self.emit("tensor_create", [arg_temps[0], arg_temps[1]], result=temp, value_type="i32")
            self.emit("call", ["tensor_random", temp], result=None)
            return temp
        first_arg_type = self._get_expr_type(node.arguments[0]) if node.arguments else None
        if first_arg_type and first_arg_type.type_name == "tensor":
            tensor_funcs = {"sigmoid": "tensor_sigmoid", "relu": "tensor_relu", "tanh": "tensor_tanh"}
            if node.name in tensor_funcs:
                self.emit("call", [tensor_funcs[node.name]] + [arg_temps[0]], result=None)
                return arg_temps[0]
        temp = self.new_temp()
        self.emit("call", [node.name] + arg_temps, result=temp)
        return temp

    def visit_MethodCall(self, node):
        obj_temp = self.visit(Identifier(node.object_name))
        arg_temps = [obj_temp]
        for arg in node.arguments:
            arg_temps.append(self.visit(arg))
        temp = self.new_temp()
        self.emit("call", [node.method_name] + arg_temps, result=temp)
        return temp

    def visit_SpawnExpr(self, node):
        agent_sym = self.symbol_table.resolve(node.agent_name)
        size = 4
        fields = []
        if agent_sym and hasattr(agent_sym, 'agent_size'):
            size = agent_sym.agent_size
        if agent_sym and agent_sym.node:
            fields = agent_sym.node.fields
        size_temp = self.new_temp()
        self.emit("const", [size], result=size_temp, value_type="i32")
        agent_temp = self.new_temp()
        self.emit("call", ["agent_alloc", size_temp], result=agent_temp, value_type="i32")
        for field in fields:
            field_sym = self.symbol_table.resolve(field.name)
            if field_sym and field_sym.offset is not None:
                val_temp = self.visit(field.value)
                offset_temp = self.new_temp()
                self.emit("const", [field_sym.offset], result=offset_temp, value_type="i32")
                self.emit("agent_set_field", [agent_temp, offset_temp, val_temp])
        return agent_temp

    def visit_TensorLiteral(self, node):
        rows = len(node.rows)
        cols = len(node.rows[0]) if rows > 0 else 0
        temp_tensor = self.new_temp()
        rows_temp = self.new_temp()
        cols_temp = self.new_temp()
        self.emit("const", [rows], result=rows_temp, value_type="i32")
        self.emit("const", [cols], result=cols_temp, value_type="i32")
        self.emit("tensor_create", [rows_temp, cols_temp], result=temp_tensor, value_type="i32")
        for i, row in enumerate(node.rows):
            for j, val in enumerate(row):
                val_temp = self.new_temp()
                i_temp = self.new_temp()
                j_temp = self.new_temp()
                self.emit("const", [val], result=val_temp)
                self.emit("const", [i], result=i_temp, value_type="i32")
                self.emit("const", [j], result=j_temp, value_type="i32")
                self.emit("tensor_set", [temp_tensor, i_temp, j_temp, val_temp])
        return temp_tensor

    def visit_TensorAccess(self, node):
        tensor_temp = self.visit(node.tensor)
        row_temp = self._visit_as_i32(node.row)
        col_temp = self._visit_as_i32(node.col)
        temp = self.new_temp()
        self.emit("tensor_get", [tensor_temp, row_temp, col_temp], result=temp)
        return temp

    def _visit_as_i32(self, node):
        from parser import NumberLiteral
        if isinstance(node, NumberLiteral):
            temp = self.new_temp()
            self.emit("const", [int(node.value)], result=temp, value_type="i32")
            return temp
        return self.visit(node)

    def _get_expr_type(self, node):
        from parser import Identifier, NumberLiteral, TensorLiteral, TypeAnnotation
        if isinstance(node, Identifier):
            sym = self.symbol_table.resolve(node.name)
            if sym and sym.type_annotation:
                return sym.type_annotation
        if isinstance(node, NumberLiteral):
            return TypeAnnotation("number")
        if isinstance(node, TensorLiteral):
            return TypeAnnotation("tensor", [len(node.rows), len(node.rows[0]) if node.rows else 0])
        return None

    def _get_field_offset(self, obj_name, field_name):
        obj_sym = self.symbol_table.resolve(obj_name)
        if obj_sym and obj_sym.type_annotation:
            agent_sym = self.symbol_table.resolve(obj_sym.type_annotation.type_name)
            if agent_sym and agent_sym.node:
                for field in agent_sym.node.fields:
                    if field.name == field_name:
                        field_sym = self.symbol_table.resolve(field.name)
                        if field_sym and field_sym.offset is not None:
                            return field_sym.offset
        return 0