import {styleTags, tags as t} from "@lezer/highlight"

export const luaHighlighting = styleTags({
  // Keywords control flow
  "if then else elseif end": t.controlKeyword,
  "while do repeat until": t.controlKeyword,
  "for in": t.controlKeyword,
  "return break goto": t.controlKeyword,
  "and or not": t.logicOperator,
  // Declaration keywords
  "function local": t.definitionKeyword,
  // Literals atoms
  "nil true false": t.atom,
  // Names
  Identifier: t.name,
  VariableName: t.variableName,
  LabelName: t.labelName,
  FuncName: t.function(t.definition(t.variableName)),
  FieldName: t.propertyName,
  // Literals
  Number: t.number,
  String: t.string,
  LongString: t.string,
  // Comments
  LineComment: t.lineComment,
  BlockComment: t.blockComment,
  Shebang: t.lineComment,
  // Operators
  '"+" "-" "*" "/" "^" "%" "//"': t.arithmeticOperator,
  "& | ~ << >>": t.bitwiseOperator,
  "< > <= >= == ~=": t.compareOperator,
  '".."': t.operator,
  '"#"': t.operator,
  Ellipsis: t.punctuation,
  // Punctuation
  "( )": t.paren,
  "[ ]": t.squareBracket,
  "{ }": t.brace,
  ". , ; : ::": t.punctuation,
  "=": t.definitionOperator,
})
