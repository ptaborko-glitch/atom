# autodiff.py — Вычислительный граф и автоматическое дифференцирование
# Этап 8

class GraphNode:
    """Узел вычислительного графа."""

    def __init__(self, op_name, inputs, output_name, output_type="f64"):
        self.op_name = op_name
        self.inputs = inputs
        self.output_name = output_name
        self.output_type = output_type
        self.shape = None

    def __repr__(self):
        return f"GraphNode({self.op_name}: {self.inputs} -> {self.output_name})"


class ComputeGraph:
    """Вычислительный граф для одного блока graph."""

    def __init__(self):
        self.nodes = []
        self.parameters = set()
        self.gradients = {}
        self.node_counter = 0

    def new_node_name(self, prefix="t"):
        self.node_counter += 1
        return f"{prefix}{self.node_counter}"

    def add_node(self, op_name, inputs, output_name=None, output_type="f64"):
        if output_name is None:
            output_name = self.new_node_name()
        node = GraphNode(op_name, inputs, output_name, output_type)
        self.nodes.append(node)
        return node

    def mark_parameter(self, name):
        self.parameters.add(name)

    def generate_backward(self):
        """Генерирует обратный проход: список кортежей (opcode, operands, result)."""
        instructions = []

        if not self.nodes:
            return instructions

        last_node = self.nodes[-1]
        grad_name = f"d{last_node.output_name}"
        instructions.append(("const", [1.0], grad_name))
        self.gradients[last_node.output_name] = grad_name

        for node in reversed(self.nodes):
            if node.output_name not in self.gradients:
                continue

            grad_in = self.gradients[node.output_name]
            backward = self._backward_rule(node, grad_in, instructions)

            for i, inp in enumerate(node.inputs):
                if backward[i] is not None:
                    self.gradients[inp] = backward[i]

        return instructions

    def _backward_rule(self, node, grad_out, instructions):
        op = node.op_name

        if op == "add":
            return [grad_out, grad_out]

        elif op == "sub":
            neg_grad = self.new_node_name("d")
            instructions.append(("neg", [grad_out], neg_grad))
            return [grad_out, neg_grad]

        elif op == "mul":
            a, b = node.inputs
            da = self.new_node_name("d")
            db = self.new_node_name("d")
            instructions.append(("mul", [b, grad_out], da))
            instructions.append(("mul", [a, grad_out], db))
            return [da, db]

        elif op == "matmul":
            a, b = node.inputs
            da = self.new_node_name("d")
            db = self.new_node_name("d")
            instructions.append(("matmul", [grad_out, f"{b}_T"], da))
            instructions.append(("matmul", [f"{a}_T", grad_out], db))
            return [da, db]

        elif op == "sigmoid":
            z = node.output_name
            da = self.new_node_name("d")
            one_minus_z = self.new_node_name("t")
            sig_deriv = self.new_node_name("t")
            instructions.append(("const", [1.0], "one"))
            instructions.append(("sub", ["one", z], one_minus_z))
            instructions.append(("mul", [z, one_minus_z], sig_deriv))
            instructions.append(("mul", [sig_deriv, grad_out], da))
            return [da]

        elif op == "relu":
            a = node.inputs[0]
            da = self.new_node_name("d")
            instructions.append(("relu_grad", [a, grad_out], da))
            return [da]

        elif op == "tanh":
            z = node.output_name
            da = self.new_node_name("d")
            z_sq = self.new_node_name("t")
            one_minus_z_sq = self.new_node_name("t")
            instructions.append(("mul", [z, z], z_sq))
            instructions.append(("const", [1.0], "one"))
            instructions.append(("sub", ["one", z_sq], one_minus_z_sq))
            instructions.append(("mul", [one_minus_z_sq, grad_out], da))
            return [da]

        elif op in ("const", "param"):
            return [None] * len(node.inputs)

        else:
            return [None] * len(node.inputs)