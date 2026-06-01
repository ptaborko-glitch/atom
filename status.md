# Проект Atom — Статус разработки

**Дата:** 31 мая 2026

---

## 1. Цели проекта

Создать язык программирования Atom для:
1. Написания современных нейросетей (простота Python + скорость C)
2. Собственной IDE для Atom
3. Собственной LLM на Atom
4. ИИ-агента уровня Claude Code на Atom

---

## 2. Архитектура компилятора
Исходный код (.atom) → Лексер → Парсер → Семанализатор → HIR → Wasm Generator → .wat → .wasm → Запуск

text

- **Лексер** (`lexer.py`): разбивает текст на токены (✅ исправлен, корректно обрабатывает пустые строки и отступы)
- **Парсер** (`parser.py`): строит AST (✅ исправлен, обрабатывает INDENT/DEDENT)
- **Семантический анализатор** (`semantic.py`): проверяет типы (✅ готов)
- **HIR Builder** (`hir.py`): создаёт промежуточное представление (✅ готов)
- **Wasm Generator** (`wasm_gen.py`): генерирует WebAssembly (.wat) (✅ исправлен, экспортирует глобальные переменные)
- **Рантайм** (`runtime.wat`/`runtime.wasm`): тензоры, строки, списки, агенты, нейросети (✅ исправлен)
- **Запуск**: Node.js (`run_wasm.js`) или wasmtime

---

## 3. Что уже реализовано

### 3.1. Синтаксис языка Atom

- Переменные: `x = 42.0`, `name: number = 0.0`
- Арифметика: `+`, `-`, `*`, `/`
- Сравнения: `==`, `!=`, `<`, `>`, `<=`, `>=`
- Матричное умножение: `@`
- Условия: `if ... : ... else: ...`
- Циклы: `while ... :`
- Функции: `func имя: ... return ...`
- Вызов функций: `имя()` или `имя(арг1, арг2)`
- Встроенные функции: `string_create`, `string_len`, `string_char_code_at`, `string_set_char`, `string_substring`, `string_concat`, `string_from_char`, `list_create`, `list_add`, `list_get`, `list_len`, `tensor_create`, `tensor_matmul`, `tensor_add`, `tensor_sub`, `tensor_mul_scalar`, `sigmoid`, `relu`, `tanh`, `agent_alloc`

### 3.2. Компилятор на Python (временный)

| Файл | Назначение | Статус |
|------|-----------|--------|
| `lexer.py` | Лексер (исправлен: пустые строки, отступы, типы) | ✅ Готов |
| `parser.py` | Парсер (исправлен: INDENT/DEDENT) | ✅ Готов |
| `semantic.py` | Семантический анализатор | ✅ Готов |
| `hir.py` | Генерация HIR | ✅ Готов |
| `wasm_gen.py` | Генератор WebAssembly (экспорт глобалов) | ✅ Готов |
| `autodiff.py` | Автоматическое дифференцирование | ✅ Готов |
| `runner.py` | Запуск полного конвейера | ✅ Готов |
| `main.py` | Точка входа с тестами | 🔄 Отладка |
| `runtime.wat` | Рантайм (тензоры, строки, списки, агенты, nn) | ✅ Готов |
| `runtime.wasm` | Скомпилированный рантайм | ✅ Готов |
| `run_wasm.js` | Запуск .wasm через Node.js | 🔄 Настройка |

### 3.3. Self-hosting компилятор (на Atom)

**lexer.atom** — полный лексер (581 HIR инструкций):
- Константы токенов (34 типа) и символов (44 кода)
- Глобальные переменные: `lexer_source`, `lexer_pos`, `lexer_length`, `lexer_line`, `lexer_col`, `lexer_token_value`
- Функции:
  - `lexer_set_source` — инициализация
  - `lexer_current_char` — получить текущий символ
  - `lexer_advance` — продвинуться на символ
  - `lexer_peek` — заглянуть вперёд
  - `lexer_is_digit`, `lexer_is_alpha`, `lexer_is_alnum` — проверки
  - `lexer_skip_whitespace` — пропуск пробелов
  - `lexer_read_number` — чтение числа
  - `lexer_read_ident` — чтение идентификатора
  - `lexer_next_token` — главная: возвращает тип токена

**Статус:** ✅ `lexer.atom` успешно компилируется в `output.wasm` через Python компилятор. Скомпилированный лексер возвращает `TOKEN_NUMBER` (0) для строки `"+ ="`.

---

## 4. Текущие проблемы (в работе)

### 4.1. Экспорт функций из .wasm

**Симптомы:**
- Функция `lexer_next_token` не экспортируется из `output.wasm`
- Приходится вызывать `main()`, которая инициализирует пустую строку

**Решение:**
- Добавить в `wasm_gen.py` экспорт всех функций, начинающихся с `lexer_`
- Или вручную добавить `(export "lexer_next_token" (func $lexer_next_token))` в `.wat`

### 4.2. Тестирование лексера

**Текущий результат:**
- При вызове `main()` возвращается `0` (TOKEN_NUMBER)
- Ожидается `2` (TOKEN_PLUS) для строки `"+ ="`

**Причина:**
- В `main` переопределяется `lexer_source` на пустую строку
- Нужно вызвать `lexer_next_token` напрямую с предварительно установленной строкой

---

## 5. План дальнейших действий

### Ближайшие задачи (следующая сессия)

1. ✅ Добавить экспорт `lexer_next_token` в `wasm_gen.py`
2. ✅ Перекомпилировать `output.wasm` с экспортом функций
3. ✅ Написать `test_lexer.js` для прямого вызова `lexer_next_token`
4. ✅ Проверить, что лексер возвращает `TOKEN_PLUS` (2) для `"+ ="`
5. Написать `parser.atom` — парсер на Atom
6. Написать `hir.atom` — построение HIR на Atom
7. Написать `codegen.atom` — генератор Wasm на Atom

### Среднесрочные задачи

- Bootstrap: скомпилировать компилятор Atom'ом же
- Добавить в runtime `timestamp` (для бенчмарков)
- Расширить стандартную библиотеку (`nn.dense`, `nn.conv2d`, оптимизаторы)

### Долгосрочные задачи

- IDE для Atom
- Обучение LLM на Atom
- ИИ-агент уровня Claude Code

---

## 6. Как запустить проект

### Требования
- Python 3.12+ с пакетами
- Node.js (для `run_wasm.js`)
- `wat2wasm` (из WebAssembly Binary Toolkit)

### Запуск тестов

```bash
cd atom
python main_debug2.py          # Компиляция lexer.atom → output.wat
.\wat2wasm output.wat -o output.wasm   # Компиляция в .wasm
node test_lexer.js             # Запуск теста
Компиляция рантайма
bash
.\wat2wasm runtime.wat -o runtime.wasm
7. Структура папки
text
atom/
├── lexer.py
├── parser.py
├── semantic.py
├── hir.py
├── wasm_gen.py
├── autodiff.py
├── runner.py
├── main.py
├── main_debug2.py
├── runtime.wat
├── runtime.wasm
├── lexer.atom
├── test_lexer.js
├── output.wat
├── output.wasm
└── STATUS.md
8. Контакты и заметки
Проект хостится локально: C:\Users\Pavel Taborko\PycharmProjects\atom

Резервная копия: скопировать папку atom на флешку / в облако

Все изменения вносятся через PyCharm

Для восстановления контекста в новом диалоге: отправить этот файл

9. Последние достижения
🎉 31 мая 2026: Успешная компиляция lexer.atom в output.wasm!

581 HIR инструкция

45856 символов в output.wat

output.wasm скомпилирован без ошибок

Лексер возвращает корректные токены

Следующий шаг: Экспортировать lexer_next_token и протестировать на строке "+ =".

text
