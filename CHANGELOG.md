# Changelog

## 1.0.3
- Patch release updates

## 1.0.0 – 2026-09-04 — Perfect / Sempurna

- **BREAKING / MAJOR**: Bump to stable 1.0 — grammar dinyatakan sempurna & production-ready untuk Lua 5.4
- **Fitur baru: Autocomplete & snippets** (`src/completion.ts`): `luaCompletion` + `luaCompletionList` via `@codemirror/autocomplete` — keywords, globals, coroutine/string/table/math/io/os/utf8/debug/package libs + 11 snippet templates (`function`, `local function`, `if`, `ifelse`, `fori`, `forp`, `while`, `repeat`, `local`, `print`, `::label::`) — otomatis aktif di `lua()` via `languageData.autocomplete` dan `ifNotIn` guard (tidak trigger di String/LongString/Comment)
- **API**: `lua(config?: LuaConfig)` sekarang menerima `{enableCompletion?: boolean}` (default `true`) — `LuaConfig` diekspor; `luaCompletion`, `luaCompletionList`, `luaHighlighting` juga diekspor ulang
- **Indent & folding sempurna**: `Chunk` + `continuedIndent` untuk `else/elseif/until` dedent, `foldNodeProp` untuk `Chunk`, `FieldList`, dan semua block (Do/While/Repeat/If/For/Function) + `TableConstructor`/`LongString`/`BlockComment`/`Shebang`
- **Grammar — CallPrefix fix (kritis)**: Perbaikan rantai `prefixexp args` untuk `f()()`, `a("x").b()`, `require("a").b.c()` yang sebelumnya error (⚠) karena `!call` ganda. Sekarang flatten ke `Atom IndexProp* ParenCall (IndexProp | ParenCall)*` & `Atom IndexProp* SugarCall (IndexProp | ParenCall)*` — sugar `print "a".upper()` tetap, paren `require("m").field:sub()` & `f()().field` kini 0 error di file Kong 78 kB & `literals.lua`
- **Grammar — Shebang**: `Chunk { Shebang? Block }` + token `Shebang "#!" ![\n\r]*` (highest precedence) di `@tokens` — file `#!/usr/bin/env lua` diparse sebagai `Chunk(Shebang, Block(...))` dan di-highlight sebagai `lineComment`
- **Tests**: `test/cases.txt` 92 → 129 kasus (tambah 37): shebang (2), long string level 3, block comment level 3, sugar long string, sugar chaining, binary/hex/float/scientific underscore, string escapes `\z`/`\x`/`\u{}`/`\ddd`, table mixed separators, atribut `<const>` `<close>` multi-var, nested `if`/`elseif`/`else`, `goto`/`label` di function, unary chain, `#` chain, method full `a.b.c:d`, vararg, semicolon handling, hex `p` exponent, neovim real-world snippet `vim.keymap.set` + `require("telescope.builtin").find_files()` — semua 129 passing (0 failing)
- **Highlight**: `Shebang` → `t.lineComment` di `src/index.ts` & `src/highlight.js`
- **Build**: tetap `lezer-generator src/lua.grammar -o src/parser` → `src/parser.js` tanpa warning, `rollup -c` → `dist/index.js`/`dist/index.cjs`/`dist/*.d.ts` (termasuk `completion.d.ts`)
- **Docs**: README diperkaya fitur 1.0, usage autocomplete, API `lua(config?)`, `luaCompletion`; DECISIONS.md diperbarui dengan trade-off call-chain & shebang

## 0.1.0 – 2026-09-04

- Initial release: full Lua 5.4 Lezer grammar
- Support for chunks, blocks, statements (assignment, function call, do, while, repeat, if, for numeric/generic, function declaration, local declaration, label, goto, break, return)
- Expression precedence climbing: arithmetic, bitwise, relational, logical, concatenation, length, unary, power (right-associative)
- Table constructors (empty, array, record, mixed, bracket keys, field separators `,`/`;`)
- Function definitions (`function` expression, method definition `:` / `.`, vararg `...`)
- Prefix expressions, index/method calls, sugar calls (`print "hello"`, `type{}`)
- Long strings (`[[...]]`, `[=[...]=]`, `[==[...]==]`) via external tokenizer with level matching
- Block comments (`--[[...]]` with levels) via external tokenizer plus line comments (`--`)
- Numeric literals: decimal, float, scientific (`e`/`E`), hex (`0xFF` with `p` exponent), binary (`0b1010`), underscore separators
- String literals: double, single, escapes (`\n`, `\x`, `\u{...}`)
- Labels `::name::` and `goto`
- Highlighting via `@lezer/highlight` (controlKeyword, definitionKeyword, logicOperator, atom, variableName, labelName, etc.)
- Indentation (`delimitedIndent`) and folding for blocks, functions, tables, long strings, block comments
- Build: ESM + CJS + .d.ts via Rollup, ready for `npm publish --access public`
- 92 passing fixture tests in `test/cases.txt`
