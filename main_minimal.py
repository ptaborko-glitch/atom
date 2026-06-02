from lexer import Lexer
from parser import Parser
from semantic import SemanticAnalyzer
from hir import HIRBuilder
from wasm_gen import WasmGenerator

with open('lexer_minimal.atom', 'r') as f:
    source = f.read()

lexer = Lexer(source)
parser = Parser(lexer)
ast = parser.parse()
semantic = SemanticAnalyzer()
symbol_table = semantic.analyze(ast)
hir_builder = HIRBuilder()
hir = hir_builder.build(ast, symbol_table)
wasm_gen = WasmGenerator()
wat = wasm_gen.generate(hir)
with open('output_minimal.wat', 'w') as f:
    f.write(wat)
print("WAT generated")
