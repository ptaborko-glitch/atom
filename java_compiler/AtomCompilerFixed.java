// AtomCompilerFixed.java - Исправленная версия компилятора
import java.util.*;
import java.nio.file.*;

public class AtomCompilerFixed {
    static final int TOKEN_EOF = -1;
    static final int TOKEN_NUMBER = 0;
    static final int TOKEN_IDENT = 1;
    static final int TOKEN_PLUS = 2;
    static final int TOKEN_MINUS = 3;
    static final int TOKEN_STAR = 4;
    static final int TOKEN_SLASH = 5;
    static final int TOKEN_ASSIGN = 7;
    static final int TOKEN_NEWLINE = 22;
    
    static class Token {
        int type;
        double numberValue;
        String identValue;
        
        Token(int type) { this.type = type; }
        Token(int type, double value) { this.type = type; this.numberValue = value; }
        Token(int type, String value) { this.type = type; this.identValue = value; }
    }
    
    static class Lexer {
        private String source;
        private int pos;
        private int length;
        
        Lexer(String source) {
            this.source = source;
            this.pos = 0;
            this.length = source.length();
        }
        
        private void skipWhitespace() {
            while (pos < length) {
                char ch = source.charAt(pos);
                if (ch != ' ' && ch != '\t' && ch != '\r') break;
                pos++;
            }
        }
        
        private double readNumber() {
            int start = pos;
            while (pos < length) {
                char ch = source.charAt(pos);
                if (ch < '0' || ch > '9') break;
                pos++;
            }
            return Double.parseDouble(source.substring(start, pos));
        }
        
        private String readIdent() {
            int start = pos;
            while (pos < length) {
                char ch = source.charAt(pos);
                boolean isLetter = (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z');
                boolean isDigit = (ch >= '0' && ch <= '9');
                if (!isLetter && !isDigit && ch != '_') break;
                pos++;
            }
            return source.substring(start, pos);
        }
        
        Token nextToken() {
            skipWhitespace();
            
            if (pos >= length) return new Token(TOKEN_EOF);
            
            char ch = source.charAt(pos);
            
            if (ch >= '0' && ch <= '9') {
                return new Token(TOKEN_NUMBER, readNumber());
            }
            
            if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch == '_') {
                return new Token(TOKEN_IDENT, readIdent());
            }
            
            pos++;
            switch (ch) {
                case '+': return new Token(TOKEN_PLUS);
                case '-': return new Token(TOKEN_MINUS);
                case '*': return new Token(TOKEN_STAR);
                case '/': return new Token(TOKEN_SLASH);
                case '=': return new Token(TOKEN_ASSIGN);
                case '\n': return new Token(TOKEN_NEWLINE);
                default: return new Token(TOKEN_EOF);
            }
        }
    }
    
    static class ASTNode {
        String type;
        double numberValue;
        String identName;
        String op;
        ASTNode left;
        ASTNode right;
        List<ASTNode> statements;
        
        static ASTNode number(double value) {
            ASTNode n = new ASTNode();
            n.type = "number";
            n.numberValue = value;
            return n;
        }
        
        static ASTNode ident(String name) {
            ASTNode n = new ASTNode();
            n.type = "ident";
            n.identName = name;
            return n;
        }
        
        static ASTNode binary(String op, ASTNode left, ASTNode right) {
            ASTNode n = new ASTNode();
            n.type = "binary";
            n.op = op;
            n.left = left;
            n.right = right;
            return n;
        }
        
        static ASTNode assign(String name, ASTNode value) {
            ASTNode n = new ASTNode();
            n.type = "assign";
            n.identName = name;
            n.left = value;
            return n;
        }
        
        static ASTNode program(List<ASTNode> statements) {
            ASTNode n = new ASTNode();
            n.type = "program";
            n.statements = statements;
            return n;
        }
    }
    
    static class Parser {
        private List<Token> tokens;
        private int pos;
        private Map<String, String> varMap;
        private int varCounter;
        
        Parser(List<Token> tokens) {
            this.tokens = tokens;
            this.pos = 0;
            this.varMap = new LinkedHashMap<>();
            this.varCounter = 0;
        }
        
        private String getVarName(String original) {
            if (!varMap.containsKey(original)) {
                varMap.put(original, "var" + varCounter++);
                System.out.println("    Новая переменная: " + original + " -> var" + (varCounter-1));
            }
            return varMap.get(original);
        }
        
        private ASTNode parsePrimary() {
            Token t = tokens.get(pos);
            if (t.type == TOKEN_NUMBER) {
                pos++;
                return ASTNode.number(t.numberValue);
            }
            if (t.type == TOKEN_IDENT) {
                String name = t.identValue;
                pos++;
                return ASTNode.ident(name);
            }
            return ASTNode.number(0);
        }
        
        private ASTNode parseMultiplication() {
            ASTNode left = parsePrimary();
            while (pos < tokens.size()) {
                Token t = tokens.get(pos);
                if (t.type == TOKEN_STAR) {
                    pos++;
                    ASTNode right = parsePrimary();
                    left = ASTNode.binary("*", left, right);
                } else if (t.type == TOKEN_SLASH) {
                    pos++;
                    ASTNode right = parsePrimary();
                    left = ASTNode.binary("/", left, right);
                } else {
                    break;
                }
            }
            return left;
        }
        
        private ASTNode parseExpression() {
            ASTNode left = parseMultiplication();
            while (pos < tokens.size()) {
                Token t = tokens.get(pos);
                if (t.type == TOKEN_PLUS) {
                    pos++;
                    ASTNode right = parseMultiplication();
                    left = ASTNode.binary("+", left, right);
                } else if (t.type == TOKEN_MINUS) {
                    pos++;
                    ASTNode right = parseMultiplication();
                    left = ASTNode.binary("-", left, right);
                } else {
                    break;
                }
            }
            return left;
        }
        
        private ASTNode parseAssignment() {
            if (pos >= tokens.size()) return null;
            Token t = tokens.get(pos);
            if (t.type == TOKEN_IDENT) {
                String name = t.identValue;
                pos++;
                if (pos < tokens.size() && tokens.get(pos).type == TOKEN_ASSIGN) {
                    pos++;
                    ASTNode value = parseExpression();
                    return ASTNode.assign(name, value);
                }
            }
            return null;
        }
        
        ASTNode parse() {
            List<ASTNode> statements = new ArrayList<>();
            while (pos < tokens.size()) {
                while (pos < tokens.size() && tokens.get(pos).type == TOKEN_NEWLINE) {
                    pos++;
                }
                if (pos >= tokens.size()) break;
                
                ASTNode stmt = parseAssignment();
                if (stmt != null) {
                    statements.add(stmt);
                    System.out.println("  Распарсили: " + stmt.identName);
                } else {
                    break;
                }
            }
            return ASTNode.program(statements);
        }
        
        Map<String, String> getVarMap() { return varMap; }
    }
    
    static class CodeGenerator {
        private Map<String, String> varMap;
        
        CodeGenerator(Map<String, String> varMap) {
            this.varMap = varMap;
        }
        
        String generate(ASTNode ast) {
            StringBuilder wat = new StringBuilder();
            wat.append("(module\n");
            
            // Объявляем глобальные переменные
            System.out.println("\n=== Переменные для WAT ===");
            for (Map.Entry<String, String> entry : varMap.entrySet()) {
                wat.append("  (global $").append(entry.getValue()).append(" (mut f64) (f64.const 0))\n");
                System.out.println("  " + entry.getKey() + " -> $" + entry.getValue());
            }
            wat.append("\n");
            
            wat.append("  (func $main (result f64)\n");
            
            // Генерируем код для каждого statement
            int stmtNum = 0;
            for (ASTNode stmt : ast.statements) {
                if (stmt.type.equals("assign")) {
                    String watName = varMap.get(stmt.identName);
                    wat.append("    ;; ").append(stmt.identName).append(" = ...\n");
                    wat.append(generateExpression(stmt.left));
                    wat.append("    global.set $").append(watName).append("\n");
                    stmtNum++;
                }
            }
            
            // Возвращаем последнее значение
            if (!ast.statements.isEmpty()) {
                ASTNode last = ast.statements.get(ast.statements.size() - 1);
                String watName = varMap.get(last.identName);
                wat.append("    global.get $").append(watName).append("\n");
            } else {
                wat.append("    f64.const 0\n");
            }
            
            wat.append("    return\n");
            wat.append("  )\n");
            wat.append("  (export \"main\" (func $main))\n");
            wat.append(")\n");
            
            return wat.toString();
        }
        
        private String generateExpression(ASTNode expr) {
            if (expr.type.equals("number")) {
                return "    f64.const " + expr.numberValue + "\n";
            }
            if (expr.type.equals("ident")) {
                String watName = varMap.get(expr.identName);
                return "    global.get $" + watName + "\n";
            }
            if (expr.type.equals("binary")) {
                String left = generateExpression(expr.left);
                String right = generateExpression(expr.right);
                String opMap = "";
                switch (expr.op) {
                    case "+": opMap = "f64.add"; break;
                    case "-": opMap = "f64.sub"; break;
                    case "*": opMap = "f64.mul"; break;
                    case "/": opMap = "f64.div"; break;
                }
                return left + right + "    " + opMap + "\n";
            }
            return "    f64.const 0\n";
        }
    }
    
    public static void main(String[] args) throws Exception {
        if (args.length < 1) {
            System.err.println("Usage: java AtomCompilerFixed <file.atom>");
            System.exit(1);
        }
        
        String source = new String(Files.readAllBytes(Paths.get(args[0])));
        System.out.println("=== Компиляция файла: " + args[0]);
        System.out.println("Исходный код:\n" + source);
        
        // Лексинг
        Lexer lexer = new Lexer(source);
        List<Token> tokens = new ArrayList<>();
        Token token;
        while ((token = lexer.nextToken()).type != TOKEN_EOF) {
            tokens.add(token);
        }
        
        System.out.println("\n=== Токены (" + tokens.size() + ") ===");
        for (Token t : tokens) {
            if (t.type == TOKEN_NUMBER) System.out.println("  NUMBER: " + t.numberValue);
            else if (t.type == TOKEN_IDENT) System.out.println("  IDENT: " + t.identValue);
            else if (t.type == TOKEN_PLUS) System.out.println("  PLUS");
            else if (t.type == TOKEN_ASSIGN) System.out.println("  ASSIGN");
            else if (t.type == TOKEN_NEWLINE) System.out.println("  NEWLINE");
            else if (t.type == TOKEN_STAR) System.out.println("  STAR");
            else if (t.type == TOKEN_SLASH) System.out.println("  SLASH");
        }
        
        // Парсинг
        Parser parser = new Parser(tokens);
        ASTNode ast = parser.parse();
        System.out.println("\n=== AST ===");
        System.out.println("  Statements: " + ast.statements.size());
        
        // Генерация кода
        CodeGenerator gen = new CodeGenerator(parser.getVarMap());
        String wat = gen.generate(ast);
        
        // Сохраняем результат
        String outputFile = args[0].replace(".atom", ".wat");
        Files.write(Paths.get(outputFile), wat.getBytes());
        System.out.println("\n✅ Сохранено в " + outputFile);
        System.out.println("\n=== Сгенерированный WAT ===\n" + wat);
        
        // Пробуем сконвертировать в WASM
        try {
            ProcessBuilder pb = new ProcessBuilder("../wat2wasm.exe", outputFile, "-o", outputFile.replace(".wat", ".wasm"));
            pb.inheritIO();
            Process p = pb.start();
            int exitCode = p.waitFor();
            if (exitCode == 0) {
                System.out.println("✅ Сконвертировано в WASM");
            }
        } catch (Exception e) {
            System.out.println("⚠️  wat2wasm не найден");
        }
    }
}
