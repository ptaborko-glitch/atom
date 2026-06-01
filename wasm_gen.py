# wasm_gen.py — Генератор WebAssembly (.wat) для Atom
# Исправленная версия с экспортом глобальных переменных

class WasmGenerator:
    def __init__(self):
        self.output = []
        self.locals = {}
        self.local_types = {}
        self.local_names = []
        self.indent_level = 0
        self.used_imports = set()
        self.last_result = None
        self.globals = {}
        self.global_names = []
        self.var_types = {}
        self.in_if_with_else = False

        self._context = []
        self._temp_counter = 0

    def push_context(self, ctx):
        self._context.append(ctx)

    def pop_context(self):
        self._context.pop()

    def expects_value(self):
        return self._context and self._context[-1] == 'expr'

    def new_temp(self):
        self._temp_counter += 1
        return f"%temp_{self._temp_counter}"

    def emit(self, line):
        indent = "    " * self.indent_level
        self.output.append(indent + line)

    def emit_raw(self, line):
        self.output.append(line)

    def set_var_type(self, name, var_type):
        if name.startswith("%"):
            if name not in self.locals:
                self.locals[name] = len(self.local_names)
                self.local_names.append(name)
            self.local_types[name] = var_type
        else:
            if name not in self.globals:
                self.globals[name] = var_type
                self.global_names.append(name)
            elif self.globals[name] == "f64" and var_type == "i32":
                self.globals[name] = "i32"
            elif self.globals[name] == "i32" and var_type == "f64":
                pass
        if name not in self.var_types:
            self.var_types[name] = var_type
        elif self.var_types[name] == "f64" and var_type == "i32":
            self.var_types[name] = "i32"

    def get_var_type(self, name):
        if name in self.var_types:
            return self.var_types[name]
        return "f64"

    def is_global(self, name):
        return name in self.globals

    def generate(self, hir_instructions):
        runtime_funcs = {
            "sigmoid", "relu", "tanh", "random",
            "tensor_create", "tensor_get", "tensor_set",
            "tensor_matmul", "tensor_add", "tensor_sub",
            "tensor_mul_scalar", "tensor_sigmoid", "tensor_relu", "tensor_tanh",
            "tensor_get_element", "tensor_print", "tensor_random",
            "tensor_get_rows", "tensor_get_cols",
            "agent_alloc", "mse", "cross_entropy", "softmax",
            "sgd_step", "nn_dense", "load_csv", "save_csv",
            "train_test_split", "exp", "log",
            "list_create", "list_add", "list_get", "list_len",
            "string_create", "string_len",
            "string_char_at", "string_char_code_at", "string_substring",
            "string_concat", "string_set_char", "string_from_char"
        }

        i32_return_funcs = {
            "string_create", "string_len", "string_substring", "string_concat",
            "string_from_char", "list_create", "list_len",
            "tensor_create", "tensor_matmul", "tensor_add", "tensor_sub",
            "agent_alloc"
        }

        i32_result_ops = {"eq", "neq", "gt", "lt", "gte", "lte"}

        main_instructions = []
        functions = []
        current_func_name = None
        current_func_insts = []

        for inst in hir_instructions:
            if inst.opcode == "func_begin":
                current_func_name = inst.operands[0]
                current_func_insts = []
            elif inst.opcode == "func_end":
                functions.append((current_func_name, current_func_insts))
                current_func_name = None
            elif current_func_name is not None:
                current_func_insts.append(inst)
            else:
                main_instructions.append(inst)

        self._infer_all_types(main_instructions, i32_return_funcs, i32_result_ops, runtime_funcs)
        main_var_types = dict(self.var_types)

        saved_globals = dict(self.globals)
        saved_global_names = list(self.global_names)

        func_var_types_list = []
        for func_name, func_insts in functions:
            self.locals = {}
            self.local_types = {}
            self.local_names = []
            self.var_types = {}
            self.globals = saved_globals.copy()
            self.global_names = list(saved_global_names)
            for name in self.globals:
                self.var_types[name] = self.globals[name]
            self._infer_all_types(func_insts, i32_return_funcs, i32_result_ops, runtime_funcs)
            func_var_types_list.append(dict(self.var_types))

        self.var_types = main_var_types
        self.globals = saved_globals
        self.global_names = saved_global_names
        self.locals = {}
        self.local_types = {}
        self.local_names = []
        for name, t in main_var_types.items():
            if name.startswith("%"):
                self.locals[name] = len(self.local_names)
                self.local_types[name] = t
                self.local_names.append(name)

        for fvt in func_var_types_list:
            for name, t in fvt.items():
                if not name.startswith("%") and name not in self.globals:
                    self.globals[name] = t
                    self.global_names.append(name)

        all_instructions = main_instructions[:]
        for _, func_insts in functions:
            all_instructions.extend(func_insts)
        for inst in all_instructions:
            if inst.opcode == "call" and inst.operands[0] in runtime_funcs:
                self.used_imports.add(inst.operands[0])
            if inst.opcode in ("tensor_matmul", "tensor_add", "tensor_sub",
                               "tensor_create", "tensor_set", "tensor_get",
                               "tensor_mul_scalar"):
                self.used_imports.add(inst.opcode)

        self.emit_raw("(module")
        self.indent_level = 1

        for func_name in sorted(self.used_imports):
            self._emit_import(func_name)

        self.emit("(memory 1)")
        self.emit('(export "memory" (memory 0))')

        for name in self.global_names:
            var_type = self.globals.get(name, "f64")
            if var_type == "i32":
                self.emit(f"(global ${name} (mut i32) (i32.const 0))")
            else:
                self.emit(f"(global ${name} (mut f64) (f64.const 0.0))")

        # Экспортируем все глобальные переменные для доступа из JavaScript
        for name in self.global_names:
            self.emit(f'(export "{name}" (global ${name}))')

        for (func_name, func_insts), fvt in zip(functions, func_var_types_list):
            self.var_types = fvt
            self.locals = {}
            self.local_types = {}
            self.local_names = []
            for name, t in fvt.items():
                if name.startswith("%"):
                    self.locals[name] = len(self.local_names)
                    self.local_types[name] = t
                    self.local_names.append(name)
            self._generate_wasm_func(func_name, func_insts)

        self.var_types = main_var_types
        self.locals = {}
        self.local_types = {}
        self.local_names = []
        for name, t in main_var_types.items():
            if name.startswith("%"):
                self.locals[name] = len(self.local_names)
                self.local_types[name] = t
                self.local_names.append(name)
        self.emit('(export "main" (func $main))')
        self._generate_wasm_func("main", main_instructions)

        self.indent_level = 0
        self.emit_raw(")")

        return "\n".join(self.output)

    def _infer_all_types(self, instructions, i32_funcs, i32_ops, runtime_funcs):
        for inst in instructions:
            if inst.opcode == "store":
                dst = inst.operands[1]
                src = inst.operands[0]
                src_type = self._value_type(inst, src, i32_funcs, i32_ops)
                if src_type:
                    self.set_var_type(dst, src_type)
            elif inst.opcode in ("call", "func_call"):
                func_name = inst.operands[0]
                if inst.result:
                    if func_name in i32_funcs:
                        self.set_var_type(inst.result, "i32")
                    elif func_name in i32_ops:
                        self.set_var_type(inst.result, "i32")
                    else:
                        self.set_var_type(inst.result, "f64")
            elif inst.opcode == "const":
                if inst.result:
                    val = inst.operands[0]
                    if isinstance(val, str) and val.startswith('"'):
                        self.set_var_type(inst.result, "i32")
                    elif inst.value_type == "i32":
                        self.set_var_type(inst.result, "i32")
                    else:
                        self.set_var_type(inst.result, "f64")
            elif inst.opcode in i32_ops and inst.result:
                self.set_var_type(inst.result, "i32")
            elif inst.opcode == "load":
                if inst.result:
                    src = inst.operands[0]
                    if src in self.var_types:
                        self.set_var_type(inst.result, self.var_types[src])

        for inst in instructions:
            if inst.result and inst.result not in self.var_types:
                self.set_var_type(inst.result, "f64")
            if inst.opcode == "store":
                dst = inst.operands[1]
                if dst not in self.var_types:
                    self.set_var_type(dst, "f64")
            if inst.opcode == "load":
                src = inst.operands[0]
                if src not in self.var_types:
                    self.set_var_type(src, "f64")

    def _value_type(self, inst, name, i32_funcs, i32_ops):
        if name in self.var_types:
            return self.var_types[name]
        if name.startswith('"'):
            return "i32"
        return None

    def _generate_wasm_func(self, func_name, instructions):
        self.emit(f"(func ${func_name} (result f64)")
        self.indent_level = 2

        for name in self.local_names:
            if name.startswith("%"):
                var_type = self.local_types.get(name, "f64")
                self.emit(f"(local ${name} {var_type})")

        self._context = []

        for inst in instructions:
            self._translate(inst)

        has_return = any(inst.opcode == "return" for inst in instructions)
        if not has_return:
            last_value = None
            for inst in reversed(instructions):
                if inst.opcode == "store" and inst.operands[1] in self.globals:
                    last_value = inst.operands[1]
                    break
            if last_value:
                self._emit_converted_access(last_value, "f64")
                self.emit("return")
            else:
                self.emit("f64.const 0.0")
                self.emit("return")

        self.indent_level = 1
        self.emit(")")

    def _emit_var_access(self, name):
        if name in self.globals:
            self.emit(f"global.get ${name}")
        elif name in self.locals:
            self.emit(f"local.get ${name}")
        else:
            self.emit(f"global.get ${name}")

    def _emit_var_set(self, name):
        if name in self.globals:
            self.emit(f"global.set ${name}")
        elif name in self.locals:
            self.emit(f"local.set ${name}")
        else:
            self.emit(f"global.set ${name}")

    def _emit_var_tee(self, name):
        if name in self.locals:
            self.emit(f"local.tee ${name}")
        elif name in self.globals:
            self.emit(f"global.set ${name}")
            self.emit(f"global.get ${name}")
        else:
            self.emit(f"global.set ${name}")
            self.emit(f"global.get ${name}")

    def _emit_converted_access(self, name, target_type):
        current_type = self.get_var_type(name)
        self._emit_var_access(name)
        if current_type == "i32" and target_type == "f64":
            self.emit("f64.convert_i32_s")
        elif current_type == "f64" and target_type == "i32":
            self.emit("i32.trunc_f64_s")

    def _emit_comparison_with_types(self, left, right, op):
        left_type = self.get_var_type(left)
        right_type = self.get_var_type(right)

        if left_type == "i32":
            self._emit_var_access(left)
            self.emit("f64.convert_i32_s")
        else:
            self._emit_var_access(left)

        if right_type == "i32":
            self._emit_var_access(right)
            self.emit("f64.convert_i32_s")
        else:
            self._emit_var_access(right)

        self.emit(op)

    def _emit_import(self, func_name):
        if func_name in ("sigmoid", "relu", "tanh", "random", "exp", "log"):
            self.emit(f'(import "runtime" "{func_name}" (func ${func_name} (param f64) (result f64)))')
        elif func_name in ("tensor_matmul", "tensor_add", "tensor_sub", "agent_alloc"):
            self.emit(f'(import "runtime" "{func_name}" (func ${func_name} (param i32) (param i32) (result i32)))')
        elif func_name == "tensor_create":
            self.emit(f'(import "runtime" "tensor_create" (func $tensor_create (param i32) (param i32) (result i32)))')
        elif func_name == "tensor_get":
            self.emit(
                f'(import "runtime" "tensor_get" (func $tensor_get (param i32) (param i32) (param i32) (result f64)))')
        elif func_name == "tensor_set":
            self.emit(
                f'(import "runtime" "tensor_set" (func $tensor_set (param i32) (param i32) (param i32) (param f64)))')
        elif func_name == "tensor_get_element":
            self.emit(
                f'(import "runtime" "tensor_get_element" (func $tensor_get_element (param i32) (param i32) (result f64)))')
        elif func_name == "tensor_mul_scalar":
            self.emit(f'(import "runtime" "tensor_mul_scalar" (func $tensor_mul_scalar (param i32) (param f64)))')
        elif func_name in ("tensor_sigmoid", "tensor_relu", "tensor_tanh", "tensor_random", "tensor_print"):
            self.emit(f'(import "runtime" "{func_name}" (func ${func_name} (param i32)))')
        elif func_name == "mse":
            self.emit(f'(import "runtime" "mse" (func $mse (param i32) (param i32) (result f64)))')
        elif func_name == "cross_entropy":
            self.emit(f'(import "runtime" "cross_entropy" (func $cross_entropy (param i32) (param i32) (result f64)))')
        elif func_name == "softmax":
            self.emit(f'(import "runtime" "softmax" (func $softmax (param i32)))')
        elif func_name == "sgd_step":
            self.emit(f'(import "runtime" "sgd_step" (func $sgd_step (param i32) (param i32) (param f64)))')
        elif func_name == "nn_dense":
            self.emit(
                f'(import "runtime" "nn_dense" (func $nn_dense (param i32) (param i32) (param i32) (param i32) (param i32) (param i32) (param f64) (result i32)))')
        elif func_name == "load_csv":
            self.emit(
                f'(import "runtime" "load_csv" (func $load_csv (param i32) (param i32) (param i32) (result i32)))')
        elif func_name in ("save_csv", "train_test_split"):
            self.emit(f'(import "runtime" "{func_name}" (func ${func_name}))')
        elif func_name == "list_create":
            self.emit(f'(import "runtime" "list_create" (func $list_create (param i32) (result i32)))')
        elif func_name == "list_add":
            self.emit(f'(import "runtime" "list_add" (func $list_add (param i32) (param f64)))')
        elif func_name == "list_get":
            self.emit(f'(import "runtime" "list_get" (func $list_get (param i32) (param i32) (result f64)))')
        elif func_name == "list_len":
            self.emit(f'(import "runtime" "list_len" (func $list_len (param i32) (result i32)))')
        elif func_name == "string_create":
            self.emit(f'(import "runtime" "string_create" (func $string_create (param i32) (result i32)))')
        elif func_name == "string_len":
            self.emit(f'(import "runtime" "string_len" (func $string_len (param i32) (result i32)))')
        elif func_name == "string_char_at":
            self.emit(
                f'(import "runtime" "string_char_at" (func $string_char_at (param i32) (param i32) (result f64)))')
        elif func_name == "string_char_code_at":
            self.emit(
                f'(import "runtime" "string_char_code_at" (func $string_char_code_at (param i32) (param i32) (result f64)))')
        elif func_name == "string_substring":
            self.emit(
                f'(import "runtime" "string_substring" (func $string_substring (param i32) (param i32) (param i32) (result i32)))')
        elif func_name == "string_concat":
            self.emit(f'(import "runtime" "string_concat" (func $string_concat (param i32) (param i32) (result i32)))')
        elif func_name == "string_set_char":
            self.emit(
                f'(import "runtime" "string_set_char" (func $string_set_char (param i32) (param i32) (param f64)))')
        elif func_name == "string_from_char":
            self.emit(f'(import "runtime" "string_from_char" (func $string_from_char (param f64) (result i32)))')

    def _translate(self, inst):
        opcode = inst.opcode
        ops = inst.operands

        if opcode == "const":
            value = ops[0]
            if isinstance(value, str) and value.startswith('"'):
                self.emit("i32.const 0")
                if inst.result:
                    self._emit_var_set(inst.result)
            elif inst.value_type == "i32":
                self.emit(f"i32.const {int(float(value)) if isinstance(value, float) else int(value)}")
                if inst.result:
                    self._emit_var_set(inst.result)
            else:
                self.emit(f"f64.const {float(value)}")
                if inst.result:
                    self._emit_var_set(inst.result)

        elif opcode == "load":
            self._emit_var_access(ops[0])
            if inst.result:
                self._emit_var_set(inst.result)

        elif opcode == "store":
            dst = ops[1]
            src = ops[0]
            src_type = self.get_var_type(src)
            dst_type = self.get_var_type(dst)

            self._emit_var_access(src)
            if src_type != dst_type:
                if dst_type == "f64" and src_type == "i32":
                    self.emit("f64.convert_i32_s")
                elif dst_type == "i32" and src_type == "f64":
                    self.emit("i32.trunc_f64_s")
            self._emit_var_set(dst)
            self.last_result = None

        elif opcode == "add":
            self._emit_var_access(ops[0])
            self._emit_var_access(ops[1])
            self.emit("f64.add")
            if inst.result:
                self._emit_var_set(inst.result)

        elif opcode == "sub":
            self._emit_var_access(ops[0])
            self._emit_var_access(ops[1])
            self.emit("f64.sub")
            if inst.result:
                self._emit_var_set(inst.result)

        elif opcode == "mul":
            self._emit_var_access(ops[0])
            self._emit_var_access(ops[1])
            self.emit("f64.mul")
            if inst.result:
                self._emit_var_set(inst.result)

        elif opcode == "div":
            self._emit_var_access(ops[0])
            self._emit_var_access(ops[1])
            self.emit("f64.div")
            if inst.result:
                self._emit_var_set(inst.result)

        elif opcode == "neg":
            self.emit("f64.const -1.0")
            self._emit_var_access(ops[0])
            self.emit("f64.mul")
            if inst.result:
                self._emit_var_set(inst.result)

        elif opcode == "call":
            func_name = ops[0]
            args = ops[1:]
            i32_funcs = {"string_len", "string_char_code_at", "string_create"}

            for arg in args:
                if func_name in i32_funcs:
                    self._emit_converted_access(arg, "i32")
                else:
                    self._emit_var_access(arg)

            self.emit(f"call ${func_name}")
            if inst.result:
                self._emit_var_set(inst.result)

        elif opcode == "func_call":
            func_name = ops[0]
            args = ops[1:]
            for arg in args:
                self._emit_var_access(arg)
            self.emit(f"call ${func_name}")
            if inst.result:
                self._emit_var_set(inst.result)

        elif opcode == "begin_if":
            cond = ops[0]
            if self.get_var_type(cond) == "f64":
                self._emit_var_access(cond)
                self.emit("f64.const 0.0")
                self.emit("f64.ne")
            else:
                self._emit_var_access(cond)
            self.emit("if")
            self.indent_level += 1

        elif opcode == "begin_if_else":
            cond = ops[0]

            if self.get_var_type(cond) == "f64":
                self._emit_var_access(cond)
                self.emit("f64.const 0.0")
                self.emit("f64.ne")
            else:
                self._emit_var_access(cond)

            self.emit("if (result f64)")
            self.indent_level += 1

        elif opcode == "begin_else":
            self.indent_level -= 1
            self.emit("else")
            self.indent_level += 1

        elif opcode == "end_block":
            self.indent_level -= 1
            self.emit("end")

        elif opcode == "block":
            block_name = ops[0]
            self.emit(f"block ${block_name}")
            self.indent_level += 1

        elif opcode == "loop":
            loop_name = ops[0]
            self.emit(f"loop ${loop_name}")
            self.indent_level += 1

        elif opcode == "br":
            target = ops[0]
            self.emit(f"br ${target}")

        elif opcode == "br_if":
            cond = ops[0]
            target = ops[1]
            if self.get_var_type(cond) == "f64":
                self._emit_var_access(cond)
                self.emit("f64.const 0.0")
                self.emit("f64.ne")
            else:
                self._emit_var_access(cond)
            self.emit(f"br_if ${target}")

        elif opcode == "return":
            if ops:
                self._emit_converted_access(ops[0], "f64")
            self.emit("return")

        elif opcode in ("eq", "neq", "gt", "lt", "gte", "lte"):
            opcode_map = {
                "eq": "f64.eq", "neq": "f64.ne",
                "gt": "f64.gt", "lt": "f64.lt",
                "gte": "f64.ge", "lte": "f64.le",
            }
            self._emit_comparison_with_types(ops[0], ops[1], opcode_map[opcode])
            if inst.result:
                self._emit_var_set(inst.result)

        else:
            self.emit(f";; UNKNOWN: {opcode}")