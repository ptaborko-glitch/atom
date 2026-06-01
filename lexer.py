# lexer.py — Исправленная версия с правильной обработкой пустых строк
from enum import Enum, auto


class TokenType(Enum):
    EOF = auto()
    NEWLINE = auto()
    INDENT = auto()
    DEDENT = auto()
    NUMBER = auto()
    IDENT = auto()
    STRING = auto()
    PLUS = auto()
    MINUS = auto()
    STAR = auto()
    SLASH = auto()
    AT = auto()
    ASSIGN = auto()
    PLUS_ASSIGN = auto()
    MINUS_ASSIGN = auto()
    STAR_ASSIGN = auto()
    SLASH_ASSIGN = auto()
    AT_ASSIGN = auto()
    EQ = auto()
    NEQ = auto()
    LT = auto()
    GT = auto()
    LTE = auto()
    GTE = auto()
    LPAREN = auto()
    RPAREN = auto()
    LBRACKET = auto()
    RBRACKET = auto()
    LBRACE = auto()
    RBRACE = auto()
    COLON = auto()
    COMMA = auto()
    DOT = auto()
    ARROW = auto()
    KW_AGENT = auto()
    KW_ACT = auto()
    KW_GRAPH = auto()
    KW_RETURN = auto()
    KW_IF = auto()
    KW_ELSE = auto()
    KW_WHILE = auto()
    KW_FOR = auto()
    KW_SPAWN = auto()
    KW_SELF = auto()
    KW_FUNC = auto()
    KW_TRUE = auto()
    KW_FALSE = auto()
    TYPE_NUMBER = auto()
    TYPE_STRING = auto()
    TYPE_BOOL = auto()
    TYPE_TENSOR = auto()


class Token:
    def __init__(self, type, value, line, col):
        self.type = type
        self.value = value
        self.line = line
        self.col = col

    def __repr__(self):
        return f"Token({self.type.name}, {self.value}, line={self.line}, col={self.col})"


class Lexer:
    def __init__(self, source):
        self.source = source
        self.pos = 0
        self.length = len(source)
        self.line = 1
        self.col = 1
        self.current_char = source[0] if source else None
        self.pending_newline = False
        self.indent_stack = [0]
        self._dedent_queue = []
        self.eof_reached = False

    def advance(self):
        if self.current_char == '\n':
            self.line += 1
            self.col = 1
        else:
            self.col += 1

        self.pos += 1
        if self.pos >= self.length:
            self.current_char = None
        else:
            self.current_char = self.source[self.pos]

    def peek(self):
        if self.pos + 1 >= self.length:
            return None
        return self.source[self.pos + 1]

    def skip_whitespace_on_line(self):
        while self.current_char in (' ', '\t'):
            self.advance()

    def skip_comment(self):
        while self.current_char and self.current_char != '\n':
            self.advance()

    def read_number(self):
        line = self.line
        col = self.col
        num_str = ""
        is_float = False

        while self.current_char and (self.current_char.isdigit() or self.current_char == '.'):
            if self.current_char == '.':
                if is_float:
                    break
                is_float = True
            num_str += self.current_char
            self.advance()

        if is_float:
            return Token(TokenType.NUMBER, float(num_str), line, col)
        else:
            return Token(TokenType.NUMBER, int(num_str), line, col)

    def read_string(self):
        line = self.line
        col = self.col
        self.advance()
        string_chars = []

        while self.current_char and self.current_char != '"':
            if self.current_char == '\\':
                self.advance()
                if self.current_char == 'n':
                    string_chars.append('\n')
                elif self.current_char == 't':
                    string_chars.append('\t')
                elif self.current_char == '"':
                    string_chars.append('"')
                elif self.current_char == '\\':
                    string_chars.append('\\')
                else:
                    string_chars.append(self.current_char)
                self.advance()
            else:
                string_chars.append(self.current_char)
                self.advance()

        if self.current_char == '"':
            self.advance()

        return Token(TokenType.STRING, ''.join(string_chars), line, col)

    def read_ident(self):
        line = self.line
        col = self.col
        ident = ""

        while self.current_char and (self.current_char.isalnum() or self.current_char == '_'):
            ident += self.current_char
            self.advance()

        keywords = {
            'agent': TokenType.KW_AGENT,
            'act': TokenType.KW_ACT,
            'graph': TokenType.KW_GRAPH,
            'return': TokenType.KW_RETURN,
            'if': TokenType.KW_IF,
            'else': TokenType.KW_ELSE,
            'while': TokenType.KW_WHILE,
            'for': TokenType.KW_FOR,
            'spawn': TokenType.KW_SPAWN,
            'self': TokenType.KW_SELF,
            'func': TokenType.KW_FUNC,
            'true': TokenType.KW_TRUE,
            'false': TokenType.KW_FALSE,
            'number': TokenType.TYPE_NUMBER,
            'string': TokenType.TYPE_STRING,
            'bool': TokenType.TYPE_BOOL,
            'tensor': TokenType.TYPE_TENSOR,
        }

        if ident in keywords:
            return Token(keywords[ident], ident, line, col)
        return Token(TokenType.IDENT, ident, line, col)

    def handle_indent(self):
        spaces = 0
        while self.current_char == ' ':
            spaces += 1
            self.advance()

        current_indent = spaces
        top = self.indent_stack[-1]

        if current_indent > top:
            self.indent_stack.append(current_indent)
            return [Token(TokenType.INDENT, current_indent, self.line, self.col)]
        elif current_indent < top:
            tokens = []
            while self.indent_stack and current_indent < self.indent_stack[-1]:
                self.indent_stack.pop()
                tokens.append(Token(TokenType.DEDENT, 0, self.line, self.col))
            if self.indent_stack and current_indent != self.indent_stack[-1]:
                self.error(f"Inconsistent indentation: {current_indent} vs {self.indent_stack[-1]}")
            return tokens
        return []

    def error(self, message):
        raise SyntaxError(f"{message} at line {self.line}, column {self.col}")

    def get_next_token(self):
        if self._dedent_queue:
            return self._dedent_queue.pop(0)

        if self.eof_reached:
            return None

        while self.current_char is not None:
            # Обработка отступов после новой строки
            if self.pending_newline:
                self.pending_newline = False
                # Пропускаем пустые строки - они не влияют на отступы
                while self.current_char == '\n':
                    self.advance()
                    self.line += 1
                    self.col = 1
                    # Продолжаем проверять, может быть несколько пустых строк подряд
                # После пропуска пустых строк, обрабатываем отступ для непустой строки
                indent_tokens = self.handle_indent()
                if indent_tokens:
                    if len(indent_tokens) > 1:
                        self._dedent_queue = indent_tokens[1:]
                    return indent_tokens[0]

            if self.current_char in (' ', '\t'):
                self.skip_whitespace_on_line()
                continue

            if self.current_char == '/' and self.peek() == '/':
                self.skip_comment()
                continue

            if self.current_char == '\n':
                self.advance()
                self.pending_newline = True
                return Token(TokenType.NEWLINE, '\n', self.line - 1, self.col)

            if self.current_char.isdigit():
                return self.read_number()

            if self.current_char == '"':
                return self.read_string()

            if self.current_char.isalpha() or self.current_char == '_':
                return self.read_ident()

            char = self.current_char
            line, col = self.line, self.col

            if char == '+':
                self.advance()
                if self.current_char == '=':
                    self.advance()
                    return Token(TokenType.PLUS_ASSIGN, '+=', line, col)
                return Token(TokenType.PLUS, '+', line, col)

            if char == '-':
                self.advance()
                if self.current_char == '=':
                    self.advance()
                    return Token(TokenType.MINUS_ASSIGN, '-=', line, col)
                if self.current_char == '>':
                    self.advance()
                    return Token(TokenType.ARROW, '->', line, col)
                return Token(TokenType.MINUS, '-', line, col)

            if char == '*':
                self.advance()
                if self.current_char == '=':
                    self.advance()
                    return Token(TokenType.STAR_ASSIGN, '*=', line, col)
                return Token(TokenType.STAR, '*', line, col)

            if char == '/':
                self.advance()
                if self.current_char == '=':
                    self.advance()
                    return Token(TokenType.SLASH_ASSIGN, '/=', line, col)
                return Token(TokenType.SLASH, '/', line, col)

            if char == '@':
                self.advance()
                if self.current_char == '=':
                    self.advance()
                    return Token(TokenType.AT_ASSIGN, '@=', line, col)
                return Token(TokenType.AT, '@', line, col)

            if char == '=':
                self.advance()
                if self.current_char == '=':
                    self.advance()
                    return Token(TokenType.EQ, '==', line, col)
                return Token(TokenType.ASSIGN, '=', line, col)

            if char == '!':
                self.advance()
                if self.current_char == '=':
                    self.advance()
                    return Token(TokenType.NEQ, '!=', line, col)
                self.error(f"Unexpected character '!'")

            if char == '>':
                self.advance()
                if self.current_char == '=':
                    self.advance()
                    return Token(TokenType.GTE, '>=', line, col)
                return Token(TokenType.GT, '>', line, col)

            if char == '<':
                self.advance()
                if self.current_char == '=':
                    self.advance()
                    return Token(TokenType.LTE, '<=', line, col)
                return Token(TokenType.LT, '<', line, col)

            simple_tokens = {
                '(': TokenType.LPAREN,
                ')': TokenType.RPAREN,
                '[': TokenType.LBRACKET,
                ']': TokenType.RBRACKET,
                '{': TokenType.LBRACE,
                '}': TokenType.RBRACE,
                ':': TokenType.COLON,
                ',': TokenType.COMMA,
                '.': TokenType.DOT,
            }

            if char in simple_tokens:
                self.advance()
                return Token(simple_tokens[char], char, line, col)

            self.error(f"Unexpected character: '{char}'")

        if len(self.indent_stack) > 1:
            self.indent_stack.pop()
            return Token(TokenType.DEDENT, 0, self.line, self.col)

        self.eof_reached = True
        return Token(TokenType.EOF, None, self.line, self.col)