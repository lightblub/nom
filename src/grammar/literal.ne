@builtin "string.ne"

# Identifiers
ident_ -> [A-Za-z_] [_A-Za-z0-9]:* {% d => ['variable', d[0] + d[1].join('')] %}
        | (ident_|literal|bracketedExpression|methodCall) "." ident_   {% d => [...(d[0][0][0] instanceof Array ? d[0][0] : d[0]), d[2]] %}
        | (ident_|literal|bracketedExpression|methodCall) "[" expression "]" {% d => [...(d[0][0][0] instanceof Array ? d[0][0] : d[0]), d[2]] %}
ident  -> ident_              {% d => {
  if (d[0][0] === 'variable') return d
  else return ['path', d[0]]
} %}

literal -> string           {% d => ['string', d[0]] %}
         | num              {% d => d[0] %}
         | block            {% d => d[0] %}

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
