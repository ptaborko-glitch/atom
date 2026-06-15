#!/usr/bin/env node
import fs from 'fs';
import { execSync } from 'child_process';

class AtomCompiler {
    compile(source) {
        const lines = source.split('\n');
        let wat = '(module\n';
        wat += '  (import "runtime" "print" (func $print (param i32 i32)))\n';
        wat += '  (memory $mem 1)\n';
        wat += '  (export "memory" (memory $mem))\n\n';
        wat += '  (func $main (result i32)\n';
        wat += '    (local $ptr i32)\n\n';
        
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('//')) continue;
            
            const printMatch = trimmed.match(/print\(["'](.+?)["']\)/);
            if (printMatch) {
                const text = printMatch[1];
                wat += `    ;; print("${text}")\n`;
                wat += `    i32.const 1000\n`;
                for (let i = 0; i < text.length; i++) {
                    wat += `    i32.const ${text.charCodeAt(i)}\n`;
                    wat += `    i32.const ${1004 + i}\n`;
                    wat += `    i32.store8\n`;
                }
                wat += `    i32.const 1000\n`;
                wat += `    i32.const ${text.length}\n`;
                wat += `    call $print\n`;
                continue;
            }
            
            const assignMatch = trimmed.match(/^(\w+)\s*=\s*(\d+)$/);
            if (assignMatch) {
                const value = assignMatch[2];
                wat += `    ;; result = ${value}\n`;
                wat += `    f64.const ${value}\n`;
                wat += `    return\n`;
            }
        }
        
        wat += `    i32.const 0\n`;
        wat += '    return\n';
        wat += '  )\n';
        wat += '  (export "main" (func $main))\n';
        wat += ')\n';
        return wat;
    }
}

const inputFile = process.argv[2];
if (!inputFile) {
    console.error('Usage: node bin/atomc_final.js <file.atom>');
    process.exit(1);
}
const source = fs.readFileSync(inputFile, 'utf8');
const compiler = new AtomCompiler();
const wat = compiler.compile(source);
const outputFile = inputFile.replace('.atom', '.wat');
fs.writeFileSync(outputFile, wat);
console.log(`✅ Compiled to ${outputFile}`);
try {
    execSync(`wat2wasm ${outputFile} -o ${outputFile.replace('.wat', '.wasm')} 2>/dev/null`);
    console.log(`✅ Converted to WASM`);
} catch(e) {}
