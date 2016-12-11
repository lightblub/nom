@include "literal.ne"

expression -> _ AS _      {% d => ['expr', d[1]] %}
bracketedExpression -> B_ {% d => ['expr', d[1]] %}

exprList -> expression ("," ___ expression):* {% d => {
  let first = d[0]
  let others = d[1].map(d => d[2])

  return [first, ...others]
} %}

# Brackets
B_ -> "(" _ AS _ ")" {% d => [d[2]] %}

Bs -> "(" ___ exprList ___ ")" __ block {% d => [...d[2], d[6]] %}
    | "(" ___ exprList ___ ")"          {% d => d[2] %}
    | "(" ___ ")"                       {% d => [] %}
    | "(" ___ ")" __ block              {% d => [d[4]] %}

B  -> B_             {% d => d[0][0] %}
    | num B_         {% d => ['*', d[0], d[1][0]] %}
    | ident Bs       {% d => ['call', d[0], d[1]] %}
    | ident          {% d => ['call', d[0], []] %}
    | literal        {% d => d[0] %}

# Indices (aka powers or exponents)
I -> B _ "^" _ I     {% d => ['^', d[0], d[4]] %}
   | B               {% d => d[0] %}

# Division & Multiplication
DM -> DM _ "*" _ I   {% d => ['*', d[0], d[4]] %}
    | DM _ "/" _ I   {% d => ['/', d[0], d[4]] %}
    | I              {% d => d[0] %}

# Addition & Subtraction
AS -> AS _ "+" _ DM  {% d => ['+', d[0], d[4]] %}
    | AS __ "." __ DM {% d => ['.', d[0], d[4]] %}
    | AS _ "-" _ DM  {% (d, l, r) => d[4][0] === 'num' && d[4][1] === '0' ? r : ['-', d[0], d[4]] %}
    | DM             {% d => d[0] %}
