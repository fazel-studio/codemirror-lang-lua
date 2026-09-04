import {LRLanguage, LanguageSupport, indentNodeProp, foldNodeProp, delimitedIndent} from "@codemirror/language"
import {styleTags, tags as t} from "@lezer/highlight"
import {parser} from "./parser.js"
import {luaCompletion} from "./completion.js"

const configuredParser = parser.configure({
  props: [
    styleTags({
      // Keywords
      "and or not": t.logicOperator,
      "if then else elseif end": t.controlKeyword,
      "while do repeat until": t.controlKeyword,
      "for in": t.controlKeyword,
      "function local": t.definitionKeyword,
      "return break goto": t.controlKeyword,
      "nil true false": t.atom,
      // Names
      Identifier: t.name,
      VariableName: t.variableName,
      FuncName: t.function(t.definition(t.variableName)),
      FieldName: t.propertyName,
      LabelName: t.labelName,
      ParamList: t.variableName,
      // Literals
      Number: t.number,
      String: t.string,
      LongString: t.string,
      Ellipsis: t.punctuation,
      // Comments
      LineComment: t.lineComment,
      BlockComment: t.blockComment,
      Shebang: t.lineComment,
      // Operators - quoted for * and / which are special in styleTags paths
      '"+" "-" "*" "/" "^" "%" "//"': t.arithmeticOperator,
      "& | ~ << >>": t.bitwiseOperator,
      "< > <= >= == ~=": t.compareOperator,
      '".."': t.operator,
      '"#"': t.operator,
      // Punctuation
      "( )": t.paren,
      "[ ]": t.squareBracket,
      "{ }": t.brace,
      ". , ; : ::": t.punctuation,
      "=": t.definitionOperator,
    }),
    indentNodeProp.add({
      DoBlock: delimitedIndent({closing: "end"}),
      WhileBlock: delimitedIndent({closing: "end"}),
      RepeatBlock: delimitedIndent({closing: "until"}),
      IfStatement: delimitedIndent({closing: "end"}),
      ForStatement: delimitedIndent({closing: "end"}),
      FunctionBody: delimitedIndent({closing: "end"}),
      TableConstructor: delimitedIndent({closing: "}"}),
    }),
    foldNodeProp.add({
      DoBlock: (node) => {
        let doKw = node.getChild("do");
        let endKw = node.getChild("end");
        return doKw && endKw ? {from: doKw.to, to: endKw.from} : null;
      },
      WhileBlock: (node) => {
        let doKw = node.getChild("do");
        let endKw = node.getChild("end");
        return doKw && endKw ? {from: doKw.to, to: endKw.from} : null;
      },
      RepeatBlock: (node) => {
        let repeatKw = node.getChild("repeat");
        let untilKw = node.getChild("until");
        return repeatKw && untilKw ? {from: repeatKw.to, to: untilKw.from} : null;
      },
      IfStatement: (node) => {
        let thenKw = node.getChild("then");
        let endKw = node.getChild("end");
        return thenKw && endKw ? {from: thenKw.to, to: endKw.from} : null;
      },
      ForStatement: (node) => {
        let doKw = node.getChild("do");
        let endKw = node.getChild("end");
        return doKw && endKw ? {from: doKw.to, to: endKw.from} : null;
      },
      FunctionBody: (node) => {
        let closeParen = node.getChild(")");
        let endKw = node.getChild("end");
        return closeParen && endKw ? {from: closeParen.to, to: endKw.from} : null;
      },
      TableConstructor: (node) => ({from: node.from + 1, to: node.to - 1}),
      LongString: (node) => ({from: node.from, to: node.to}),
      BlockComment: (node) => ({from: node.from, to: node.to}),
    }),
  ],
})

export const luaLanguage = LRLanguage.define({
  name: "lua",
  parser: configuredParser,
  languageData: {
    commentTokens: {line: "--", block: {open: "--[[", close: "]]"}},
    indentOnInput: /^\s*(end|else|elseif|until|\)|\])$/,
    closeBrackets: {brackets: ["(", "[", "{", '"', "'"]},
    wordChars: "_",
    autocomplete: luaCompletion,
  },
})

export interface LuaConfig {
  /** Enable autocompletion (default true). When false, no completion source is added. */
  enableCompletion?: boolean
}

export function lua(config: LuaConfig = {}) {
  const enableCompletion = config.enableCompletion !== false
  const extensions = enableCompletion ? [luaLanguage.data.of({ autocomplete: luaCompletion })] : []
  return new LanguageSupport(luaLanguage, extensions)
}

// Re-export completion helpers for consumers
export { luaCompletion, luaCompletionList } from "./completion.js"
export { luaHighlighting } from "./highlight.js"
