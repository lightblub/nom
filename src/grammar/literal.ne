@builtin "string.ne"

# Identifiers
# variables: snake_case
# classes:   UpperCamelCase (cannot be a single character)
# constants: SCREAMING_CAPS
ident_ -> [a-z_] [_a-z0-9]:* {% d => ['variable', d[0] + d[1].join('')] %}
        | [A-Z] [A-Za-z0-9]:+ {% (d, l, r) => {
  if (d[1].join('').toUpperCase() === d[1].join('')) return r // It's actually a constant
  else return ['class', d[0] + d[1].join('')]
} %}
        | [A-Z] [A-Z0-9_]:*   {% d => ['constant', d[0] + d[1].join('')] %}
        | (ident_|literal) "." ident_   {% d => [...(d[0][0][0] instanceof Array ? d[0][0] : d[0]), d[2]] %}
        | (ident_|literal) "[" expression "]" {% d => [...(d[0][0][0] instanceof Array ? d[0][0] : d[0]), d[2]] %}
ident  -> ident_              {% d => d[0] %}

literal -> string           {% d => ['string', d[0]] %}
         | num                {% d => d[0] %}
         | block              {% d => d[0] %}

string -> "\"" stringDoubleContents "\""   {% d => d[1] %}
        | "'" stringSingleContents "'"     {% d => d[1] %}

stringDoubleContents -> strongDoubleChar:* {% d => d[0].join('') %}
strongDoubleChar -> stringEscapeChar       {% d => d[0] %}
                  | stringChar             {% (d, l, r) => d[0] === '"' ? r : d[0] %}

stringSingleContents -> stringSingleChar:* {% d => d[0].join('') %}
stringSingleChar -> stringEscapeChar       {% d => d[0] %}
                  | stringChar             {% (d, l, r) => d[0] === "'" ? r : d[0] %}

stringEscapeChar -> "\\" (. | "\n") {% d => d[1][0] %}
stringChar       -> .               {% (d, l, r) => d[0] === '\\' ? r : d[0] %}

num -> float         {% d => ['num', d[0]] %}
     | int           {% d => ['num', d[0]] %}
     | "-" AS        {% d => ['-', ['num', '0'], d[1]] %}

float -> int "." int {% d => d.join('') %}
int   -> [0-9]:+     {% d => d[0].join('') %}

block -> "{" ___ lines:? ___ "}" {% d => ['block', d[2] === null ? [] : d[2]] %}
