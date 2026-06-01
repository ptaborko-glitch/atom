# test_parser.py
from parser import Parser
import inspect

# Посмотрим сигнатуру __init__
sig = inspect.signature(Parser.__init__)
print(f"Parser.__init__ ожидает: {sig}")

# Посмотрим доступные методы
print(f"Методы Parser: {[m for m in dir(Parser) if not m.startswith('_')]}")