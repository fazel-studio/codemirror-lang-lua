# @fazelstudio/codemirror-lang-lua

[![NPM version](https://img.shields.io/npm/v/@fazelstudio/codemirror-lang-lua.svg)](https://www.npmjs.com/package/@fazelstudio/codemirror-lang-lua)

This package implements **Lua 5.4** language support for the
[CodeMirror](https://codemirror.net/) code editor: a full **Lezer native** grammar covering
chunks, blocks, assignments, control structures (`if`/`while`/`repeat`/`for`), function declarations, local declarations, table constructors, string literals (including long strings `[[...]]`), numeric literals (hex, binary & underscore `1_000_000`), comments (`--` & `--[[...]]`), labels (`::label::`), `goto`, **and production-grade additions** — syntax highlighting, **autocomplete (stdlib + snippets)**, indentation, folding & bracket matching — compatible with any CodeMirror 6 theme.

This code is released under an MIT license.

## Features

### Core (v0.1 → v1.0 perfect)
- Full Lua 5.4 syntax (Lua Reference Manual §3.1/3.3/3.4 + EBNF)
- Table constructors (array-style, record-style, mixed, `,`/`;` separators, bracket keys)
- Long strings (`[[...]]`, `[=[...]=]`, `[===[...]==]`) with level matching via external tokenizer
- Numeric literals: decimal, float, hex (`0xFF` + `0x1.8p10`), binary (`0b1010`), underscore separators (`1_000` / `0xFF_FF` / `0b1010_0101`)
- Comments: line (`--`) & block (`--[[...]]` with levels `--[=[`) + **Shebang** `#!/usr/bin/env lua`
- Labels (`::retry::`) & `goto`, `break`, `return`
- Multiple assignment / multiple return, vararg `...`, attributes `<const>` `<close>`
- Syntactic sugar: `print "hello"`, `type{}` , `obj:method "arg"` + chaining `require "a".field:sub():call()`
- **Call-chain fix (1.0)**: `f()()` / `a("x").b()` / `require("x").y()` / `foo().bar():baz()` now 0-error (was ⚠ before)
- **Precedence climbing**: `or` < `and` < compare < `|` < `~` < `&` < `<<>>` < `..` (right) < `+ -` < `* / // %` < unary < `^` (right)

### Editor (new in 1.0 — complex)
- **Autocomplete**: 220+ completions via `@codemirror/autocomplete` — keywords, globals (`print`, `pairs`, `require`, `pcall`), libs `coroutine`/`string`/`table`/`math`/`io`/`os`/`utf8`/`debug`/`package` + snippets
- **Snippets**: `function`, `local function`, `if`, `ifelse`, `fori`, `forp`, `while`, `repeat`, `local`, `print`, `::label::` (trigger `if` → expands `if ${cond} then … end`)
- **Highlighting**: `@lezer/highlight` tags (`controlKeyword`, `definitionKeyword`, `logicOperator`, `atom`, `variableName`, `labelName`, `propertyName`, `string`, `number`, `lineComment`/`blockComment`/`Shebang`, `arithmetic`/`bitwise`/`compare` operators)
- **Indentation**: `delimitedIndent` per block (`do`/`while`/`repeat`/`if`/`for`/`function`/`{}`) + `continuedIndent` for `else`/`elseif`/`until`
- **Folding**: `Chunk`, `Block`, `DoBlock`, `WhileBlock`, `RepeatBlock`, `IfStatement`, `ForStatement`, `FunctionBody`, `TableConstructor`, `LongString`, `BlockComment`, `Shebang`
- **Brackets & comment tokens**: `commentTokens {line:"--", block:{open:"--[[",close:"]]"}}`, `closeBrackets ["(","[","{",'"',"'"]`, `indentOnInput` for `end/else/elseif/until`

## Usage

```js
import { EditorView, basicSetup } from "codemirror"
import { lua } from "@fazelstudio/codemirror-lang-lua"

new EditorView({
  parent: document.body,
  doc: `print "Hello, Lua!"`,
  extensions: [basicSetup, lua()],
})
```

### Autocomplete (new in 1.0)

`lua()` now ships with autocomplete out-of-the-box. No extra setup:

```js
import { autocompletion } from "@codemirror/autocomplete"
new EditorView({
  extensions: [basicSetup, lua(), autocompletion()],
  // type `pri` → suggests `print`, `pairs`; `str.` → `string.find`, etc.
  // snippet: type `fori` → `for ${i} = ${1}, ${10} do … end`
})
// Disable if you bring your own completions:
lua({ enableCompletion: false })
```

## API

### `lua(config?: LuaConfig) → LanguageSupport`

```ts
interface LuaConfig { enableCompletion?: boolean } // default true
```

Create a `LanguageSupport` extension for Lua.

```js
import {lua, luaLanguage, luaCompletion, luaCompletionList, luaHighlighting} from "@fazelstudio/codemirror-lang-lua"
lua() // with autocomplete
lua({enableCompletion:false}) // without
luaLanguage // LRLanguage
luaCompletion // CompletionSource (ifNotIn guarded)
luaCompletionList // raw 220+ completions
luaHighlighting // styleTags object
```

### `luaLanguage: LRLanguage`

The underlying `LRLanguage` instance. Provides `parser`, `languageData` (comment tokens, indent, brackets, **autocomplete**).

- `commentTokens: { line: "--", block: { open: "--[[", close: "]]" } }`
- `indentOnInput: /^\s*(end|else|elseif|until|\)|\])$/`
- `closeBrackets: ["(", "[", "{", '"', "'"]`
- `wordChars: "_"`
- `autocomplete: luaCompletion` (via `ifNotIn` — disabled inside String/LongString/Comment)

## Build

```sh
npm run build:grammar # lua.grammar -> src/parser.js
npm run build         # src/*.ts -> dist/*.js + .cjs + .d.ts (rollup)
npm test              # run fixture tests
```

## Coverage

- 129 fixture tests in `test/cases.txt` (v0.1 92 → v1.0 129) — 40 checklist §6 + 89 edge/real-world
- Verified on real files: `Kong/kong/db/schema/init.lua` (78 kB, 0 ⚠ after fix, was 18), `lua/lua/testes/literals.lua` (11 kB), `neovim` Telescope snippet `require("telescope.builtin").find_files()` (now 0 ⚠, was ⚠ before 1.0 fix), `LOVE` & `OpenResty` samples

## Known limitations

- Type analysis/inference is out of scope — this package only provides
  syntax highlighting, parsing, folding, indent & completions, not semantic analysis.
- String interpolation is not supported (Lua doesn't have it natively — use `..`).
- Module/package system (`require`) is runtime-level, not part of the grammar (but parsed as `prefixexp args`).
- Binary literals (`0b1010`) and underscore separators (`1_000`) are parsed
  for editor convenience though not strictly Lua 5.4 spec (they are LuaJIT/5.4 compat extensions).

## License

MIT © Fazel Studio
