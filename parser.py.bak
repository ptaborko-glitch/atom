# parser.py — Парсер языка Atom

from lexer import TokenType


class ASTNode:
    pass


class Program(ASTNode):
    def __init__(self, statements):
        self.statements = statements
    def __repr__(self):
        return f"Program({self.statements})"


class VarDecl(ASTNode):
    def __init__(self, name, type_annotation, value):
        self.name = name
        self.type_annotation = type_annotation
        self.value = value
    def __repr__(self):
        return f"VarDecl({self.name}: {self.type_annotation} = {self.value})"


class Assign(ASTNode):
    def __init__(self, name, value):
        self.name = name
        self.value = value
    def __repr__(self):
        return f"Assign({self.name} = {self.value})"


class AssignField(ASTNode):
    def __init__(self, object_name, field_name, value):
        self.object_name = object_name
        self.field_name = field_name
        self.value = value
    def __repr__(self):
        return f"AssignField({self.object_name}.{self.field_name} = {self.value})"


class AgentDef(ASTNode):
    def __init__(self, name, fields, methods):
        self.name = name
        self.fields = fields
        self.methods = methods
    def __repr__(self):
        return f"AgentDef({self.name})"


class ActDef(ASTNode):
    def __init__(self, name, params, return_type, body):
        self.name = name
        self.params = params
        self.return_type = return_type
        self.body = body
    def __repr__(self):
        return f"ActDef({self.name})"


class Param(ASTNode):
    def __init__(self, name, type_annotation):
        self.name = name
        self.type_annotation = type_annotation
    def __repr__(self):
        return f"Param({self.name}: {self.type_annotation})"


class NumberLiteral(ASTNode):
    def __init__(self, value):
        self.value = value
    def __repr__(self):
        return f"Number({self.value})"


class StringLiteral(ASTNode):
    def __init__(self, value):
        self.value = value
    def __repr__(self):
        return f"String({repr(self.value)})"


class BoolLiteral(ASTNode):
    def __init__(self, value):
        self.value = value
    def __repr__(self):
        return f"Bool({self.value})"


class Identifier(ASTNode):
    def __init__(self, name):
        self.name = name
    def __repr__(self):
        return f"Ident({self.name})"


class SelfAccess(ASTNode):
    def __init__(self, field_name):
        self.field_name = field_name
    def __repr__(self):
        return f"SelfAccess({self.field_name})"


class FieldAccess(ASTNode):
    def __init__(self, object_name, field_name):
        self.object_name = object_name
        self.field_name = field_name
    def __repr__(self):
        return f"FieldAccess({self.object_name}.{self.field_name})"


class BinaryOp(ASTNode):
    def __init__(self, left, operator, right):
        self.left = left
        self.operator = operator
        self.right = right
    def __repr__(self):
        return f"BinOp({self.left} {self.operator} {self.right})"


class UnaryOp(ASTNode):
    def __init__(self, operator, operand):
        self.operator = operator
        self.operand = operand
    def __repr__(self):
        return f"UnaryOp({self.operator}{self.operand})"


class InlineCall(ASTNode):
    def __init__(self, name, arguments):
        self.name = name
        self.arguments = arguments
    def __repr__(self):
        return f"InlineCall({self.name}({self.arguments}))"


class BlockCall(ASTNode):
    def __init__(self, name, arguments):
        self.name = name
        self.arguments = arguments
    def __repr__(self):
        return f"BlockCall({self.name})"


class MethodCall(ASTNode):
    def __init__(self, object_name, method_name, arguments):
        self.object_name = object_name
        self.method_name = method_name
        self.arguments = arguments
    def __repr__(self):
        return f"MethodCall({self.object_name}.{self.method_name})"


class SpawnExpr(ASTNode):
    def __init__(self, agent_name, arguments):
        self.agent_name = agent_name
        self.arguments = arguments
    def __repr__(self):
        return f"Spawn({self.agent_name})"


class ReturnStmt(ASTNode):
    def __init__(self, value):
        self.value = value
    def __repr__(self):
        return f"Return({self.value})"


class FuncDef(ASTNode):
    def __init__(self, name, body):
        self.name = name
        self.body = body
    def __repr__(self):
        return f"FuncDef({self.name})"


class FuncCall(ASTNode):
    def __init__(self, name, arguments):
        self.name = name
        self.arguments = arguments
    def __repr__(self):
        return f"FuncCall({self.name}({self.arguments}))"


class GraphBlock(ASTNode):
    def __init__(self, body):
        self.body = body
    def __repr__(self):
        return f"GraphBlock"


class IfStmt(ASTNode):
    def __init__(self, condition, then_body, else_body):
        self.condition = condition
        self.then_body = then_body
        self.else_body = else_body
    def __repr__(self):
        return f"If(...)"


class WhileStmt(ASTNode):
    def __init__(self, condition, body):
        self.condition = condition
        self.body = body
    def __repr__(self):
        return f"While(...)"


class TensorLiteral(ASTNode):
    def __init__(self, rows):
        self.rows = rows
    def __repr__(self):
        return f"Tensor({self.rows})"


class TensorAccess(ASTNode):
    def __init__(self, tensor, row, col):
        self.tensor = tensor
        self.row = row
        self.col = col
    def __repr__(self):
        return f"TensorAccess"


class TypeAnnotation(ASTNode):
    def __init__(self, type_name, dimensions=None):
        self.type_name = type_name
        self.dimensions = dimensions
    def __repr__(self):
        if self.dimensions:
            return f"Type({self.type_name}[{','.join(map(str, self.dimensions))}])"
        return f"Type({self.type_name})"


class Parser:
    def __init__(self, lexer):
        self.lexer = lexer
        self.current_token = self.lexer.get_next_token()

    def error(self, message):
        raise SyntaxError(f"Parser error at line {self.current_token.line}: {message}")

    def eat(self, token_type):
        if self.current_token.type == token_type:
            token = self.current_token
            self.current_token = self.lexer.get_next_token()
            return token
        self.error(f"Expected {token_type}, got {self.current_token.type}")

    def peek(self, token_type):
        return self.current_token.type == token_type

    def parse(self):
        statements = []
        while not self.peek(TokenType.EOF):
            if self.peek(TokenType.NEWLINE):
                self.eat(TokenType.NEWLINE)
                continue
            statements.append(self.parse_statement())
        return Program(statements)

    def parse_statement(self):
        if self.peek(TokenType.KW_AGENT):
            return self.parse_agent_def()
        elif self.peek(TokenType.KW_RETURN):
            return self.parse_return()
        elif self.peek(TokenType.KW_GRAPH):
            return self.parse_graph_block()
        elif self.peek(TokenType.KW_IF):
            return self.parse_if()
        elif self.peek(TokenType.KW_WHILE):
            return self.parse_while()
        elif self.peek(TokenType.KW_FUNC):
            return self.parse_func_def()
        elif self.peek(TokenType.IDENT):
            return self.parse_ident_statement()
        else:
            self.error(f"Unexpected token: {self.current_token}")

    def parse_func_def(self):
        """FuncDef := 'func' IDENT ':' NEWLINE INDENT Statement+ DEDENT"""
        self.eat(TokenType.KW_FUNC)
        name = self.eat(TokenType.IDENT).value
        self.eat(TokenType.COLON)
        self.eat(TokenType.NEWLINE)
        self.eat(TokenType.INDENT)
        body = []
        while not self.peek(TokenType.DEDENT):
            if self.peek(TokenType.NEWLINE):
                self.eat(TokenType.NEWLINE)
                continue
            body.append(self.parse_statement())
        self.eat(TokenType.DEDENT)
        return FuncDef(name, body)

    def parse_ident_statement(self):
        name = self.eat(TokenType.IDENT).value

        if self.peek(TokenType.DOT):
            self.eat(TokenType.DOT)
            member = self.eat(TokenType.IDENT).value
            if self.peek(TokenType.ASSIGN):
                self.eat(TokenType.ASSIGN)
                value = self.parse_expression()
                return AssignField(name, member, value)
            elif self.peek(TokenType.LPAREN):
                self.eat(TokenType.LPAREN)
                args = []
                if not self.peek(TokenType.RPAREN):
                    args.append(self.parse_expression())
                    while self.peek(TokenType.COMMA):
                        self.eat(TokenType.COMMA)
                        args.append(self.parse_expression())
                self.eat(TokenType.RPAREN)
                return MethodCall(name, member, args)
            else:
                self.error(f"Expected '(' or '=' after '{name}.{member}'")

        if self.peek(TokenType.COLON):
            self.eat(TokenType.COLON)
            if self.peek(TokenType.NEWLINE):
                self.eat(TokenType.NEWLINE)
                self.eat(TokenType.INDENT)
                args = []
                while not self.peek(TokenType.DEDENT):
                    args.append(self.parse_block_arg())
                    if self.peek(TokenType.NEWLINE):
                        self.eat(TokenType.NEWLINE)
                self.eat(TokenType.DEDENT)
                return BlockCall(name, args)
            type_ann = self.parse_type_annotation()
            self.eat(TokenType.ASSIGN)
            value = self.parse_expression()
            return VarDecl(name, type_ann, value)

        elif self.peek(TokenType.ASSIGN):
            self.eat(TokenType.ASSIGN)
            value = self.parse_expression()
            return Assign(name, value)

        elif self.peek(TokenType.LPAREN):
            return self.parse_inline_call(name)

        else:
            self.error(f"Expected ':', '=', '(' after '{name}'")

    def parse_block_arg(self):
        name = self.eat(TokenType.IDENT).value
        self.eat(TokenType.ASSIGN)
        value = self.parse_expression()
        return Assign(name, value)

    def parse_inline_call(self, name):
        self.eat(TokenType.LPAREN)
        arguments = []
        if not self.peek(TokenType.RPAREN):
            arguments.append(self.parse_expression())
            while self.peek(TokenType.COMMA):
                self.eat(TokenType.COMMA)
                arguments.append(self.parse_expression())
        self.eat(TokenType.RPAREN)
        return InlineCall(name, arguments)

    def parse_agent_def(self):
        self.eat(TokenType.KW_AGENT)
        name = self.eat(TokenType.IDENT).value
        self.eat(TokenType.COLON)
        self.eat(TokenType.NEWLINE)
        self.eat(TokenType.INDENT)
        fields = []
        methods = []
        while not self.peek(TokenType.DEDENT):
            if self.peek(TokenType.NEWLINE):
                self.eat(TokenType.NEWLINE)
                continue
            if self.peek(TokenType.KW_ACT):
                methods.append(self.parse_act_def())
            elif self.peek(TokenType.IDENT):
                field_name = self.eat(TokenType.IDENT).value
                self.eat(TokenType.COLON)
                type_ann = self.parse_type_annotation()
                self.eat(TokenType.ASSIGN)
                value = self.parse_expression()
                fields.append(VarDecl(field_name, type_ann, value))
                if self.peek(TokenType.NEWLINE):
                    self.eat(TokenType.NEWLINE)
            else:
                self.error(f"Unexpected token inside agent")
        self.eat(TokenType.DEDENT)
        return AgentDef(name, fields, methods)

    def parse_act_def(self):
        self.eat(TokenType.KW_ACT)
        name = self.eat(TokenType.IDENT).value
        self.eat(TokenType.LPAREN)
        params = []
        if not self.peek(TokenType.RPAREN):
            params.append(self.parse_param())
            while self.peek(TokenType.COMMA):
                self.eat(TokenType.COMMA)
                params.append(self.parse_param())
        self.eat(TokenType.RPAREN)
        return_type = None
        if self.peek(TokenType.ARROW):
            self.eat(TokenType.ARROW)
            return_type = self.parse_type_annotation()
        self.eat(TokenType.COLON)
        self.eat(TokenType.NEWLINE)
        self.eat(TokenType.INDENT)
        body = []
        while not self.peek(TokenType.DEDENT):
            if self.peek(TokenType.NEWLINE):
                self.eat(TokenType.NEWLINE)
                continue
            body.append(self.parse_statement())
        self.eat(TokenType.DEDENT)
        return ActDef(name, params, return_type, body)

    def parse_param(self):
        name = self.eat(TokenType.IDENT).value
        self.eat(TokenType.COLON)
        type_ann = self.parse_type_annotation()
        return Param(name, type_ann)

    def parse_graph_block(self):
        self.eat(TokenType.KW_GRAPH)
        self.eat(TokenType.COLON)
        self.eat(TokenType.NEWLINE)
        self.eat(TokenType.INDENT)
        body = []
        while not self.peek(TokenType.DEDENT):
            if self.peek(TokenType.NEWLINE):
                self.eat(TokenType.NEWLINE)
                continue
            body.append(self.parse_statement())
        self.eat(TokenType.DEDENT)
        return GraphBlock(body)

    def parse_return(self):
        self.eat(TokenType.KW_RETURN)
        value = self.parse_expression()
        return ReturnStmt(value)

    def parse_if(self):
        self.eat(TokenType.KW_IF)
        condition = self.parse_expression()
        self.eat(TokenType.COLON)
        self.eat(TokenType.NEWLINE)
        self.eat(TokenType.INDENT)
        then_body = []
        while not self.peek(TokenType.DEDENT):
            if self.peek(TokenType.NEWLINE):
                self.eat(TokenType.NEWLINE)
                continue
            then_body.append(self.parse_statement())
        self.eat(TokenType.DEDENT)
        else_body = []
        if self.peek(TokenType.KW_ELSE):
            self.eat(TokenType.KW_ELSE)
            self.eat(TokenType.COLON)
            self.eat(TokenType.NEWLINE)
            self.eat(TokenType.INDENT)
            while not self.peek(TokenType.DEDENT):
                if self.peek(TokenType.NEWLINE):
                    self.eat(TokenType.NEWLINE)
                    continue
                else_body.append(self.parse_statement())
            self.eat(TokenType.DEDENT)
        return IfStmt(condition, then_body, else_body)

    def parse_while(self):
        self.eat(TokenType.KW_WHILE)
        condition = self.parse_expression()
        self.eat(TokenType.COLON)
        self.eat(TokenType.NEWLINE)
        self.eat(TokenType.INDENT)
        body = []
        while not self.peek(TokenType.DEDENT):
            if self.peek(TokenType.NEWLINE):
                self.eat(TokenType.NEWLINE)
                continue
            body.append(self.parse_statement())
        self.eat(TokenType.DEDENT)
        return WhileStmt(condition, body)

    def parse_expression(self):
        return self.parse_comparison()

    def parse_comparison(self):
        left = self.parse_addition()
        while self.peek(TokenType.EQ) or self.peek(TokenType.NEQ) or \
                self.peek(TokenType.GT) or self.peek(TokenType.LT) or \
                self.peek(TokenType.GTE) or self.peek(TokenType.LTE):
            op_token = self.current_token
            self.eat(op_token.type)
            right = self.parse_addition()
            left = BinaryOp(left, op_token.value, right)
        return left

    def parse_addition(self):
        left = self.parse_multiplication()
        while self.peek(TokenType.PLUS) or self.peek(TokenType.MINUS):
            op_token = self.current_token
            self.eat(op_token.type)
            right = self.parse_multiplication()
            left = BinaryOp(left, op_token.value, right)
        return left

    def parse_multiplication(self):
        left = self.parse_unary()
        while self.peek(TokenType.STAR) or self.peek(TokenType.SLASH) or self.peek(TokenType.AT):
            op_token = self.current_token
            self.eat(op_token.type)
            right = self.parse_unary()
            left = BinaryOp(left, op_token.value, right)
        return left

    def parse_unary(self):
        if self.peek(TokenType.MINUS):
            op_token = self.current_token
            self.eat(TokenType.MINUS)
            operand = self.parse_unary()
            return UnaryOp(op_token.value, operand)
        return self.parse_primary()

    def parse_primary(self):
        token = self.current_token

        if self.peek(TokenType.NUMBER):
            self.eat(TokenType.NUMBER)
            return NumberLiteral(token.value)
        if self.peek(TokenType.STRING):
            self.eat(TokenType.STRING)
            return StringLiteral(token.value)
        if self.peek(TokenType.KW_TRUE):
            self.eat(TokenType.KW_TRUE)
            return BoolLiteral(True)
        if self.peek(TokenType.KW_FALSE):
            self.eat(TokenType.KW_FALSE)
            return BoolLiteral(False)
        if self.peek(TokenType.KW_SELF):
            self.eat(TokenType.KW_SELF)
            self.eat(TokenType.DOT)
            field_name = self.eat(TokenType.IDENT).value
            return SelfAccess(field_name)
        if self.peek(TokenType.KW_SPAWN):
            self.eat(TokenType.KW_SPAWN)
            agent_name = self.eat(TokenType.IDENT).value
            self.eat(TokenType.LPAREN)
            arguments = []
            if not self.peek(TokenType.RPAREN):
                arguments.append(self.parse_expression())
                while self.peek(TokenType.COMMA):
                    self.eat(TokenType.COMMA)
                    arguments.append(self.parse_expression())
            self.eat(TokenType.RPAREN)
            return SpawnExpr(agent_name, arguments)
        if self.peek(TokenType.LBRACKET):
            return self.parse_tensor_literal()
        if self.peek(TokenType.IDENT):
            name = self.eat(TokenType.IDENT).value
            if self.peek(TokenType.DOT):
                return self.parse_method_or_field(name)
            if self.peek(TokenType.LPAREN):
                self.eat(TokenType.LPAREN)
                arguments = []
                if not self.peek(TokenType.RPAREN):
                    arguments.append(self.parse_expression())
                    while self.peek(TokenType.COMMA):
                        self.eat(TokenType.COMMA)
                        arguments.append(self.parse_expression())
                self.eat(TokenType.RPAREN)
                return FuncCall(name, arguments)
            if self.peek(TokenType.LBRACKET):
                return self.parse_tensor_access(name)
            return Identifier(name)
        if self.peek(TokenType.LPAREN):
            self.eat(TokenType.LPAREN)
            expr = self.parse_expression()
            self.eat(TokenType.RPAREN)
            return expr
        self.error(f"Unexpected token in expression: {token}")

    def parse_method_or_field(self, object_name):
        self.eat(TokenType.DOT)
        member_name = self.eat(TokenType.IDENT).value
        if self.peek(TokenType.LPAREN):
            self.eat(TokenType.LPAREN)
            arguments = []
            if not self.peek(TokenType.RPAREN):
                arguments.append(self.parse_expression())
                while self.peek(TokenType.COMMA):
                    self.eat(TokenType.COMMA)
                    arguments.append(self.parse_expression())
            self.eat(TokenType.RPAREN)
            return MethodCall(object_name, member_name, arguments)
        else:
            return FieldAccess(object_name, member_name)

    def parse_tensor_literal(self):
        self.eat(TokenType.LBRACKET)
        rows = []
        while not self.peek(TokenType.RBRACKET):
            self.eat(TokenType.LBRACKET)
            row = []
            row.append(self.eat(TokenType.NUMBER).value)
            while self.peek(TokenType.COMMA):
                self.eat(TokenType.COMMA)
                row.append(self.eat(TokenType.NUMBER).value)
            self.eat(TokenType.RBRACKET)
            rows.append(row)
            if self.peek(TokenType.COMMA):
                self.eat(TokenType.COMMA)
        self.eat(TokenType.RBRACKET)
        return TensorLiteral(rows)

    def parse_tensor_access(self, tensor_name):
        self.eat(TokenType.LBRACKET)
        row = self.parse_expression()
        self.eat(TokenType.COMMA)
        col = self.parse_expression()
        self.eat(TokenType.RBRACKET)
        return TensorAccess(Identifier(tensor_name), row, col)

    def parse_type_annotation(self):
        if self.peek(TokenType.TYPE_TENSOR):
            self.eat(TokenType.TYPE_TENSOR)
            dimensions = []
            if self.peek(TokenType.LBRACKET):
                self.eat(TokenType.LBRACKET)
                dimensions.append(self.eat(TokenType.NUMBER).value)
                while self.peek(TokenType.COMMA):
                    self.eat(TokenType.COMMA)
                    dimensions.append(self.eat(TokenType.NUMBER).value)
                self.eat(TokenType.RBRACKET)
            return TypeAnnotation("tensor", dimensions)
        if self.peek(TokenType.TYPE_NUMBER):
            self.eat(TokenType.TYPE_NUMBER)
            return TypeAnnotation("number")
        if self.peek(TokenType.TYPE_STRING):
            self.eat(TokenType.TYPE_STRING)
            return TypeAnnotation("string")
        if self.peek(TokenType.TYPE_BOOL):
            self.eat(TokenType.TYPE_BOOL)
            return TypeAnnotation("bool")
        self.error(f"Expected type annotation")