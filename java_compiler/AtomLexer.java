// AtomLexer.java - Лексер для языка Atom на Java
import java.util.*;

public class AtomLexer {
    // Типы токенов
    public static final int TOKEN_EOF = -1;
    public static final int TOKEN_NUMBER = 0;
    public static final int TOKEN_IDENT = 1;
    public static final int TOKEN_PLUS = 2;
    public static final int TOKEN_MINUS = 3;
    public static final int TOKEN_STAR = 4;
    public static final int TOKEN_SLASH = 5;
    public static final int TOKEN_ASSIGN = 7;
    public static final int TOKEN_NEWLINE = 22;
    public static final int TOKEN_LPAREN = 14;
    public static final int TOKEN_RPAREN = 15;
    
    private String source;
    private int pos;
    private int length;
    private int currentToken;
    private double numberValue;
    private String identValue;
    
    public AtomLexer(String source) {
        this.source = source;
        this.pos = 0;
        this.length = source.length();
        this.currentToken = TOKEN_EOF;
        this.numberValue = 0.0;
        this.identValue = "";
    }
    
    private char currentChar() {
        if (pos >= length) return '\0';
        return source.charAt(pos);
    }
    
    private void skipWhitespace() {
        while (pos < length) {
            char ch = source.charAt(pos);
            if (ch != ' ' && ch != '\t' && ch != '\r') {
                break;
            }
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
        String numStr = source.substring(start, pos);
        return Double.parseDouble(numStr);
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
    
    public int nextToken() {
        skipWhitespace();
        
        if (pos >= length) {
            currentToken = TOKEN_EOF;
            return TOKEN_EOF;
        }
        
        char ch = source.charAt(pos);
        
        // Числа
        if (ch >= '0' && ch <= '9') {
            numberValue = readNumber();
            currentToken = TOKEN_NUMBER;
            return TOKEN_NUMBER;
        }
        
        // Идентификаторы
        if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch == '_') {
            identValue = readIdent();
            currentToken = TOKEN_IDENT;
            System.out.println("  IDENT: '" + identValue + "'");
            return TOKEN_IDENT;
        }
        
        // Операторы
        pos++;
        
        switch (ch) {
            case '+': currentToken = TOKEN_PLUS; break;
            case '-': currentToken = TOKEN_MINUS; break;
            case '*': currentToken = TOKEN_STAR; break;
            case '/': currentToken = TOKEN_SLASH; break;
            case '=': currentToken = TOKEN_ASSIGN; break;
            case '(': currentToken = TOKEN_LPAREN; break;
            case ')': currentToken = TOKEN_RPAREN; break;
            case '\n': currentToken = TOKEN_NEWLINE; break;
            default: currentToken = TOKEN_EOF;
        }
        
        return currentToken;
    }
    
    public double getNumberValue() { return numberValue; }
    public String getIdentValue() { return identValue; }
    public int getCurrentToken() { return currentToken; }
    
    public static void main(String[] args) {
        if (args.length < 1) {
            System.err.println("Usage: java AtomLexer <source.atom>");
            return;
        }
        
        try {
            String source = new String(java.nio.file.Files.readAllBytes(
                java.nio.file.Paths.get(args[0])));
            
            AtomLexer lexer = new AtomLexer(source);
            System.out.println("=== Лексинг файла: " + args[0]);
            System.out.println("Исходный код:\n" + source);
            System.out.println("\n=== Токены ===");
            
            int token;
            int count = 0;
            while ((token = lexer.nextToken()) != TOKEN_EOF && count < 100) {
                switch (token) {
                    case TOKEN_NUMBER:
                        System.out.println("  NUMBER: " + lexer.getNumberValue());
                        break;
                    case TOKEN_IDENT:
                        System.out.println("  IDENT: " + lexer.getIdentValue());
                        break;
                    case TOKEN_PLUS: System.out.println("  PLUS"); break;
                    case TOKEN_MINUS: System.out.println("  MINUS"); break;
                    case TOKEN_STAR: System.out.println("  STAR"); break;
                    case TOKEN_SLASH: System.out.println("  SLASH"); break;
                    case TOKEN_ASSIGN: System.out.println("  ASSIGN"); break;
                    case TOKEN_NEWLINE: System.out.println("  NEWLINE"); break;
                    case TOKEN_LPAREN: System.out.println("  LPAREN"); break;
                    case TOKEN_RPAREN: System.out.println("  RPAREN"); break;
                }
                count++;
            }
            System.out.println("\nВсего токенов: " + count);
            
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
        }
    }
}
