# Проект Atom — Итоговый статус

**Дата:** 2 июня 2026
**Статус:** ✅ Рабочий прототип компилятора

---

## Что работает

1. **Лексер на Atom** (`lexer.atom`) → компилируется в `output.wasm`
2. **Парсер на JavaScript** → использует `output.wasm` для разбора кода
3. **Генератор WAT** → создаёт WebAssembly код
4. **Полный цикл компиляции** → Atom → WASM → выполнение

**Пример:** `1+2` → лексер → парсер → WAT → WASM → результат `3`

---

## Ограничения

- Ключевые слова не распознаются
- Имена переменных не сохраняются
- Парсер на Atom не компилируется (нужен bootstrap)

---

## Следующий шаг

1. Расширить JavaScript парсер для поддержки переменных
2. Создать полноценный компилятор на JavaScript
3. Использовать его для компиляции `parser.atom`

---

## Команды для работы

```bash
# Компиляция лексера (не менять lexer.atom!)
python3 main_debug2.py
wat2wasm output.wat -o output.wasm

# Запуск компилятора
node working_compiler6.js
wat2wasm working.wat -o working.wasm
node -e "const fs = require('fs'); const wasm = fs.readFileSync('working.wasm'); (async () => { const i = await WebAssembly.instantiate(wasm); console.log(i.instance.exports.main()); })()"
Решение: Продолжаем с JavaScript компилятором, не трогая lexer.atom.
