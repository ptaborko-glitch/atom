# runner.py — Автоматический раннер для Atom

import subprocess
import os
import sys
import shutil

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


def compile_atom_to_wat(source_code):
    from lexer import Lexer, TokenType
    from parser import Parser
    from semantic import SemanticAnalyzer, SemanticError
    from hir import HIRBuilder
    from wasm_gen import WasmGenerator

    lexer = Lexer(source_code)
    tokens = []
    token = lexer.get_next_token()
    while token.type != TokenType.EOF:
        tokens.append(token)
        token = lexer.get_next_token()

    lexer = Lexer(source_code)
    parser = Parser(lexer)
    ast = parser.parse()

    analyzer = SemanticAnalyzer()
    try:
        symbol_table = analyzer.analyze(ast)
    except SemanticError as e:
        print(f"Ошибка компиляции: {e}")
        return None, None

    builder = HIRBuilder()
    hir_instructions = builder.build(ast, symbol_table)

    wasm_gen = WasmGenerator()
    wat_code = wasm_gen.generate(hir_instructions)

    return wat_code, hir_instructions


def find_wat2wasm():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    local = os.path.join(script_dir, "wat2wasm.exe")
    if os.path.exists(local):
        return local
    found = shutil.which("wat2wasm") or shutil.which("wat2wasm.exe")
    if found:
        return found
    return None


def compile_wat_to_wasm(wat_code, output_path="output.wasm"):
    wat2wasm_path = find_wat2wasm()
    if wat2wasm_path is None:
        print("wat2wasm не найден.")
        return False
    wat_path = output_path.replace(".wasm", ".wat")
    with open(wat_path, "w") as f:
        f.write(wat_code)
    try:
        result = subprocess.run(
            [wat2wasm_path, wat_path, "-o", output_path],
            capture_output=True, text=True
        )
        if result.returncode != 0:
            print(f"Ошибка wat2wasm: {result.stderr}")
            return False
        return True
    except FileNotFoundError:
        print("wat2wasm не найден.")
        return False


def run_wasm(wasm_path="output.wasm", runtime_path="runtime.wasm"):
    try:
        import wasmtime
    except ImportError:
        print("Установите wasmtime Python API: pip install wasmtime")
        return None

    try:
        engine = wasmtime.Engine()
        store = wasmtime.Store(engine)

        with open(runtime_path, "rb") as f:
            runtime_bytes = f.read()
        runtime_module = wasmtime.Module(engine, runtime_bytes)
        runtime_instance = wasmtime.Instance(store, runtime_module, [])
        runtime_exports = runtime_instance.exports(store)

        with open(wasm_path, "rb") as f:
            program_bytes = f.read()
        program_module = wasmtime.Module(engine, program_bytes)

        imports = []
        for imp in program_module.imports:
            if imp.module == "runtime":
                exported = runtime_exports.get(imp.name)
                if exported is not None:
                    imports.append(exported)
                else:
                    print(f"Не найден экспорт '{imp.name}' в рантайме")
                    return None
            else:
                print(f"Неизвестный модуль: {imp.module}")
                return None

        program_instance = wasmtime.Instance(store, program_module, imports)

        main_func = program_instance.exports(store).get("main")
        if main_func is None:
            print("Функция 'main' не найдена")
            return None

        result = main_func(store)
        return str(result)
    except Exception as e:
        print(f"Ошибка при запуске: {e}")
        return None


def run_atom_program(source_code, show_hir=False):
    print("=" * 60)
    print("КОМПИЛЯЦИЯ ATOM")
    print("=" * 60)

    wat_code, hir = compile_atom_to_wat(source_code)
    if wat_code is None:
        return None

    print("Компиляция успешна.")

    if show_hir and hir:
        print(f"\nHIR инструкции ({len(hir)}):")
        for inst in hir:
            print(f"  {inst}")

    print(f"\nСгенерированный .wat:\n{wat_code}\n")

    print("=" * 60)
    print("КОМПИЛЯЦИЯ WASM")
    print("=" * 60)

    if not compile_wat_to_wasm(wat_code):
        return None

    print("Компиляция в .wasm успешна.")

    print()
    print("=" * 60)
    print("ЗАПУСК")
    print("=" * 60)

    result = run_wasm()
    if result is not None:
        print(f"Результат: {result}")

    return result