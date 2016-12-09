@include "literal.ne"

expression -> _ AS _ {% d => ['expr', d[1]] %}

# Brackets
B_ -> "(" ___ AS ___ ")" {% d => [d[2]] %}
Bs -> "(" ___ (AS "," ___):+ AS ___ ("," ___):? ")" {% d => {
  // Mulitple arguments
  let args = d[2].map(d => d[0])
  args.push(d[3])

  return args
} %}
    | B_              {% d => d[0] %}
    | __ AS ___       {% d => [d[1]] %}
    #| "(" _ ")"      {% d => [] %}
B  -> B_              {% d => d[0][0] %}
    | num B_          {% d => ['*', d[0], d[1][0]] %}
    | ident Bs        {% (d, l, r) => {
  //console.dir(d, {depth:null})
  //console.log(d[0][d[0][0].length-1])

  return ['call', d[0], d[1]]
} %}
    | ident "(" _ ")" {% d => ['call', d[0], []] %}
    | ident           {% d => d[0] %}
    | literal         {% d => d[0] %}

# Indices (aka powers or exponents)
I -> B "^" I         {% d => ['^', d[0], d[2]] %}
   | B               {% d => d[0] %}

# Division & Multiplication
DM -> DM _ "*" _ I   {% d => ['*', d[0], d[4]] %}
    | DM _ "/" _ I   {% d => ['/', d[0], d[4]] %}
    | num ident      {% d => ['*', d[0], d[1]] %}
    | I              {% d => d[0] %}

# Addition & Subtraction
AS -> AS _ "+" _ DM  {% d => ['+', d[0], d[4]] %}
    | AS _ "++" _ DM {% d => ['++', d[0], d[4]] %}
    | AS _ "-" _ DM  {% (d, l, r) => d[4][0] === 'num' && d[4][1] === '0' ? r : ['-', d[0], d[4]] %}
    | DM             {% d => d[0] %}
