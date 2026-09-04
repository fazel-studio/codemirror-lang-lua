import { completeFromList, snippetCompletion, ifNotIn } from "@codemirror/autocomplete"

/**
 * Lua 5.4 keyword completions
 */
const luaKeywords = [
  { label: "and", type: "keyword", detail: "logical operator" },
  { label: "break", type: "keyword", detail: "break statement" },
  { label: "do", type: "keyword", detail: "do block" },
  { label: "else", type: "keyword" },
  { label: "elseif", type: "keyword" },
  { label: "end", type: "keyword" },
  { label: "false", type: "keyword", detail: "boolean" },
  { label: "for", type: "keyword", detail: "for loop" },
  { label: "function", type: "keyword", detail: "function definition" },
  { label: "goto", type: "keyword" },
  { label: "if", type: "keyword", detail: "if statement" },
  { label: "in", type: "keyword" },
  { label: "local", type: "keyword", detail: "local declaration" },
  { label: "nil", type: "keyword", detail: "nil value" },
  { label: "not", type: "keyword", detail: "logical not" },
  { label: "or", type: "keyword", detail: "logical or" },
  { label: "repeat", type: "keyword", detail: "repeat loop" },
  { label: "return", type: "keyword" },
  { label: "then", type: "keyword" },
  { label: "true", type: "keyword", detail: "boolean" },
  { label: "until", type: "keyword" },
  { label: "while", type: "keyword", detail: "while loop" },
]

/**
 * Standard globals & built-ins (Lua 5.4 Reference Manual §6)
 */
const luaGlobals = [
  { label: "_G", type: "variable", detail: "global table" },
  { label: "_VERSION", type: "variable", detail: "Lua version" },
  { label: "assert", type: "function", detail: "assert(v [, message])" },
  { label: "collectgarbage", type: "function", detail: "collectgarbage([opt [, arg]])" },
  { label: "dofile", type: "function", detail: "dofile([filename])" },
  { label: "error", type: "function", detail: "error(message [, level])" },
  { label: "getmetatable", type: "function", detail: "getmetatable(object)" },
  { label: "ipairs", type: "function", detail: "ipairs(t)" },
  { label: "load", type: "function", detail: "load(chunk [, chunkname [, mode [, env]]])" },
  { label: "loadfile", type: "function", detail: "loadfile([filename [, mode [, env]]])" },
  { label: "next", type: "function", detail: "next(table [, index])" },
  { label: "pairs", type: "function", detail: "pairs(t)" },
  { label: "pcall", type: "function", detail: "pcall(f [, arg1, ...])" },
  { label: "print", type: "function", detail: "print(...)" },
  { label: "rawequal", type: "function", detail: "rawequal(v1, v2)" },
  { label: "rawget", type: "function", detail: "rawget(table, index)" },
  { label: "rawlen", type: "function", detail: "rawlen(v)" },
  { label: "rawset", type: "function", detail: "rawset(table, index, value)" },
  { label: "require", type: "function", detail: "require(modname)" },
  { label: "select", type: "function", detail: "select(index, ...)" },
  { label: "setmetatable", type: "function", detail: "setmetatable(table, metatable)" },
  { label: "tonumber", type: "function", detail: "tonumber(e [, base])" },
  { label: "tostring", type: "function", detail: "tostring(v)" },
  { label: "type", type: "function", detail: "type(v)" },
  { label: "warn", type: "function", detail: "warn(msg1, ...)" },
  { label: "xpcall", type: "function", detail: "xpcall(f, msgh [, arg1, ...])" },
]

const coroutineLib = [
  { label: "coroutine.close", type: "function", detail: "coroutine.close(co)" },
  { label: "coroutine.create", type: "function", detail: "coroutine.create(f)" },
  { label: "coroutine.isyieldable", type: "function", detail: "coroutine.isyieldable([co])" },
  { label: "coroutine.resume", type: "function", detail: "coroutine.resume(co [, val1, ...])" },
  { label: "coroutine.running", type: "function", detail: "coroutine.running()" },
  { label: "coroutine.status", type: "function", detail: "coroutine.status(co)" },
  { label: "coroutine.wrap", type: "function", detail: "coroutine.wrap(f)" },
  { label: "coroutine.yield", type: "function", detail: "coroutine.yield(...)" },
]

const stringLib = [
  { label: "string.byte", type: "method", detail: "string.byte(s [, i [, j]])" },
  { label: "string.char", type: "method", detail: "string.char(...)" },
  { label: "string.dump", type: "method", detail: "string.dump(function [, strip])" },
  { label: "string.find", type: "method", detail: "string.find(s, pattern [, init [, plain]])" },
  { label: "string.format", type: "method", detail: "string.format(formatstring, ...)" },
  { label: "string.gmatch", type: "method", detail: "string.gmatch(s, pattern)" },
  { label: "string.gsub", type: "method", detail: "string.gsub(s, pattern, repl [, n])" },
  { label: "string.len", type: "method", detail: "string.len(s)" },
  { label: "string.lower", type: "method", detail: "string.lower(s)" },
  { label: "string.match", type: "method", detail: "string.match(s, pattern [, init])" },
  { label: "string.pack", type: "method", detail: "string.pack(fmt, v1, v2, ...)" },
  { label: "string.packsize", type: "method", detail: "string.packsize(fmt)" },
  { label: "string.rep", type: "method", detail: "string.rep(s, n [, sep])" },
  { label: "string.reverse", type: "method", detail: "string.reverse(s)" },
  { label: "string.sub", type: "method", detail: "string.sub(s, i [, j])" },
  { label: "string.unpack", type: "method", detail: "string.unpack(fmt, s [, pos])" },
  { label: "string.upper", type: "method", detail: "string.upper(s)" },
]

const tableLib = [
  { label: "table.concat", type: "method", detail: "table.concat(list [, sep [, i [, j]]])" },
  { label: "table.insert", type: "method", detail: "table.insert(list [, pos,] value)" },
  { label: "table.move", type: "method", detail: "table.move(a1, f, e, t [,a2])" },
  { label: "table.pack", type: "method", detail: "table.pack(...)" },
  { label: "table.remove", type: "method", detail: "table.remove(list [, pos])" },
  { label: "table.sort", type: "method", detail: "table.sort(list [, comp])" },
  { label: "table.unpack", type: "method", detail: "table.unpack(list [, i [, j]])" },
]

const mathLib = [
  { label: "math.abs", type: "property", detail: "math.abs(x)" },
  { label: "math.acos", type: "property", detail: "math.acos(x)" },
  { label: "math.asin", type: "property", detail: "math.asin(x)" },
  { label: "math.atan", type: "property", detail: "math.atan(y [, x])" },
  { label: "math.ceil", type: "property", detail: "math.ceil(x)" },
  { label: "math.cos", type: "property", detail: "math.cos(x)" },
  { label: "math.deg", type: "property", detail: "math.deg(x)" },
  { label: "math.exp", type: "property", detail: "math.exp(x)" },
  { label: "math.floor", type: "property", detail: "math.floor(x)" },
  { label: "math.fmod", type: "property", detail: "math.fmod(x, y)" },
  { label: "math.huge", type: "constant", detail: "value larger than any number" },
  { label: "math.log", type: "property", detail: "math.log(x [, base])" },
  { label: "math.max", type: "property", detail: "math.max(x, ...)" },
  { label: "math.maxinteger", type: "constant" },
  { label: "math.min", type: "property", detail: "math.min(x, ...)" },
  { label: "math.mininteger", type: "constant" },
  { label: "math.modf", type: "property", detail: "math.modf(x)" },
  { label: "math.pi", type: "constant" },
  { label: "math.rad", type: "property", detail: "math.rad(x)" },
  { label: "math.random", type: "property", detail: "math.random([m [, n]])" },
  { label: "math.randomseed", type: "property", detail: "math.randomseed(x [, y])" },
  { label: "math.sin", type: "property", detail: "math.sin(x)" },
  { label: "math.sqrt", type: "property", detail: "math.sqrt(x)" },
  { label: "math.tan", type: "property", detail: "math.tan(x)" },
  { label: "math.tointeger", type: "property", detail: "math.tointeger(x)" },
  { label: "math.type", type: "property", detail: "math.type(x)" },
  { label: "math.ult", type: "property", detail: "math.ult(m, n)" },
]

const ioLib = [
  { label: "io.close", type: "method" },
  { label: "io.flush", type: "method" },
  { label: "io.input", type: "method" },
  { label: "io.lines", type: "method" },
  { label: "io.open", type: "method", detail: 'io.open(filename [, mode])' },
  { label: "io.output", type: "method" },
  { label: "io.popen", type: "method" },
  { label: "io.read", type: "method" },
  { label: "io.stderr", type: "variable" },
  { label: "io.stdin", type: "variable" },
  { label: "io.stdout", type: "variable" },
  { label: "io.tmpfile", type: "method" },
  { label: "io.type", type: "method" },
  { label: "io.write", type: "method" },
]

const osLib = [
  { label: "os.clock", type: "method" },
  { label: "os.date", type: "method", detail: 'os.date([format [, time]])' },
  { label: "os.difftime", type: "method" },
  { label: "os.execute", type: "method" },
  { label: "os.exit", type: "method" },
  { label: "os.getenv", type: "method" },
  { label: "os.remove", type: "method" },
  { label: "os.rename", type: "method" },
  { label: "os.setlocale", type: "method" },
  { label: "os.time", type: "method" },
  { label: "os.tmpname", type: "method" },
]

const utf8Lib = [
  { label: "utf8.char", type: "method" },
  { label: "utf8.charpattern", type: "constant" },
  { label: "utf8.codes", type: "method" },
  { label: "utf8.codepoint", type: "method" },
  { label: "utf8.len", type: "method" },
  { label: "utf8.offset", type: "method" },
]

const debugLib = [
  { label: "debug.debug", type: "method" },
  { label: "debug.gethook", type: "method" },
  { label: "debug.getinfo", type: "method" },
  { label: "debug.getlocal", type: "method" },
  { label: "debug.getmetatable", type: "method" },
  { label: "debug.getregistry", type: "method" },
  { label: "debug.getupvalue", type: "method" },
  { label: "debug.getuservalue", type: "method" },
  { label: "debug.sethook", type: "method" },
  { label: "debug.setlocal", type: "method" },
  { label: "debug.setmetatable", type: "method" },
  { label: "debug.setupvalue", type: "method" },
  { label: "debug.setuservalue", type: "method" },
  { label: "debug.traceback", type: "method" },
  { label: "debug.upvalueid", type: "method" },
  { label: "debug.upvaluejoin", type: "method" },
]

const packageLib = [
  { label: "package.config", type: "variable" },
  { label: "package.cpath", type: "variable" },
  { label: "package.loaded", type: "variable" },
  { label: "package.loadlib", type: "method" },
  { label: "package.path", type: "variable" },
  { label: "package.preload", type: "variable" },
  { label: "package.searchers", type: "variable" },
  { label: "package.searchpath", type: "method" },
]

/**
 * Snippet completions — idiomatic Lua patterns
 */
const luaSnippets = [
  snippetCompletion("function ${name}(${params})\n\t${}\nend", {
    label: "function",
    detail: "function snippet",
    type: "keyword",
    boost: 1,
  }),
  snippetCompletion("local function ${name}(${params})\n\t${}\nend", {
    label: "local function",
    detail: "local function snippet",
    type: "keyword",
  }),
  snippetCompletion("if ${cond} then\n\t${}\nend", {
    label: "if",
    detail: "if statement",
    type: "keyword",
  }),
  snippetCompletion("if ${cond} then\n\t${}\nelse\n\t${}\nend", {
    label: "ifelse",
    detail: "if-else statement",
    type: "keyword",
  }),
  snippetCompletion("for ${i} = ${1}, ${10} do\n\t${}\nend", {
    label: "fori",
    detail: "numeric for loop",
    type: "keyword",
  }),
  snippetCompletion("for ${k}, ${v} in pairs(${table}) do\n\t${}\nend", {
    label: "forp",
    detail: "generic for (pairs)",
    type: "keyword",
  }),
  snippetCompletion("while ${cond} do\n\t${}\nend", {
    label: "while",
    detail: "while loop",
    type: "keyword",
  }),
  snippetCompletion("repeat\n\t${}\nuntil ${cond}", {
    label: "repeat",
    detail: "repeat-until loop",
    type: "keyword",
  }),
  snippetCompletion("local ${name} = ${value}", {
    label: "local",
    detail: "local declaration",
    type: "keyword",
  }),
  snippetCompletion('print("${}")', {
    label: "print",
    detail: "print snippet",
    type: "function",
  }),
  snippetCompletion("::${label}::", {
    label: "::",
    detail: "label definition",
    type: "keyword",
  }),
]

/**
 * Flat list for `completeFromList`
 * We attach `section` to group in UI (optional)
 */
export const luaCompletionList = [
  ...luaKeywords.map(c => ({ ...c, section: "Keyword" as const })),
  ...luaGlobals.map(c => ({ ...c, section: "Global" as const })),
  ...coroutineLib.map(c => ({ ...c, section: "Coroutine" as const })),
  ...stringLib.map(c => ({ ...c, section: "String" as const })),
  ...tableLib.map(c => ({ ...c, section: "Table" as const })),
  ...mathLib.map(c => ({ ...c, section: "Math" as const })),
  ...ioLib.map(c => ({ ...c, section: "IO" as const })),
  ...osLib.map(c => ({ ...c, section: "OS" as const })),
  ...utf8Lib.map(c => ({ ...c, section: "UTF8" as const })),
  ...debugLib.map(c => ({ ...c, section: "Debug" as const })),
  ...packageLib.map(c => ({ ...c, section: "Package" as const })),
  ...luaSnippets,
]

/**
 * Completion source that avoids completing inside strings/comments/long strings.
 * Use `ifNotIn` wrapper per CodeMirror spec.
 */
export const luaCompletion = ifNotIn(
  ["String", "LongString", "LineComment", "BlockComment"],
  completeFromList(luaCompletionList)
)

/**
 * Alias for external consumers
 */
export const luaCompletionSource = luaCompletion
