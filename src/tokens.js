import {ExternalTokenizer} from "@lezer/lr"
import {LongString, BlockComment} from "./parser.terms.js"

// LongString tokenizer: matches Lua long strings [[ ... ]] , [=[ ... ]=] , [==[ ... ]==] etc.
// Pattern: '[' '='* '['  content  ']' '='* ']' where closing '=' count matches opening.
export const longString = new ExternalTokenizer(input => {
  let ch = input.next
  if (ch !== 91) return // '['
  // Count '=' after first '['
  let level = 0
  let pos = 1
  while (true) {
    let nxt = input.peek(pos)
    if (nxt === 61) { // '='
      level++
      pos++
    } else if (nxt === 91) { // '['
      break
    } else {
      return
    }
  }
  // Opening delimiter is '[' + '='*level + '['  length = 2 + level
  // Advance over opening
  for (let i = 0; i < 2 + level; i++) input.advance()
  // Scan until matching closing delimiter
  while (true) {
    if (input.next < 0) {
      // Unterminated long string: accept up to EOF (still valid token for error recovery)
      input.acceptToken(LongString)
      return
    }
    if (input.next === 93) { // ']'
      // Check if following chars are '='*level + ']'
      let eq = 0
      let ok = true
      for (let i = 1; i <= level; i++) {
        if (input.peek(i) !== 61) { ok = false; break }
        eq++
      }
      if (ok && input.peek(level + 1) === 93) {
        // Found closing delimiter
        // Advance over ']' + '='*level + ']'
        for (let i = 0; i < 2 + level; i++) input.advance()
        input.acceptToken(LongString)
        return
      }
    }
    input.advance()
  }
})

// BlockComment tokenizer: matches Lua block comments --[[ ... ]], --[=[ ... ]=] etc.
// Pattern: '--' '[' '='* '['  content  ']' '='* ']'
export const blockComment = new ExternalTokenizer(input => {
  if (input.next !== 45) return // '-'
  if (input.peek(1) !== 45) return
  if (input.peek(2) !== 91) return // third char must be '[' for block comment
  // Count '=' after '--['
  let level = 0
  let pos = 3
  while (true) {
    let nxt = input.peek(pos)
    if (nxt === 61) {
      level++
      pos++
    } else if (nxt === 91) {
      break
    } else {
      return // not a block comment, let LineComment handle '--'
    }
  }
  // Opening is '--' + '[' + '='*level + '['  => length 4 + level
  for (let i = 0; i < 4 + level; i++) input.advance()
  while (true) {
    if (input.next < 0) {
      input.acceptToken(BlockComment)
      return
    }
    if (input.next === 93) {
      let eq = 0
      let ok = true
      for (let i = 1; i <= level; i++) {
        if (input.peek(i) !== 61) { ok = false; break }
        eq++
      }
      if (ok && input.peek(level + 1) === 93) {
        for (let i = 0; i < 2 + level; i++) input.advance()
        input.acceptToken(BlockComment)
        return
      }
    }
    input.advance()
  }
})
