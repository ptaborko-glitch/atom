# inspect_parser_func.py
from parser import Parser
import inspect

# Получаем исходный код parse_func_def
source = inspect.getsource(Parser.parse_func_def)
print("parse_func_def:")
print(source)