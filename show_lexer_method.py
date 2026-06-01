# show_lexer_method.py
import inspect
from lexer import Lexer

# Получаем исходный код метода get_next_token
source = inspect.getsource(Lexer.get_next_token)
print(source)