@builtin "string.ne"

# Identifiers
# variables: lowerCamelCase
# classes:   UpperCamelCase (cannot be a single character)
# constants: SCREAMING_CAPS
ident_ -> [a-z] [A-Za-z0-9]:* {% d => ['variable', d[0] + d[1].join('')] %}
        | [A-Z] [A-Za-z0-9]:+ {% (d, l, r) => {
  if (d[1].join('').toUpperCase() === d[1].join('')) return r // It's actually a constant
  else return ['class', d[0] + d[1].join('')]
} %}
        | [A-Z] [A-Z0-9_]:*   {% d => ['constant', d[0] + d[1].join('')] %}
        | (ident_|literal) "." ident_   {% d => [...(d[0][0][0] instanceof Array ? d[0][0] : d[0]), d[2]] %}
ident  -> ident_              {% d => d[0] %}

literal -> dqstring           {% d => ['string', d[0]] %}
         | sqstring           {% d => ['string', d[0]] %}
         | num                {% d => d[0] %}
         | block              {% d => d[0] %}

num -> float         {% d => ['num', d[0]] %}
     | int           {% d => ['num', d[0]] %}
     | "-" AS        {% d => ['-', ['num', '0'], d[1]] %}

float -> int "." int {% d => d.join('') %}
int   -> [0-9]:+     {% d => d[0].join('') %}

block -> "{" ___ lines:? ___ "}" {% d => ['block', d[2] === null ? [] : d[2]] %}
