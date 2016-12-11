@include "literal.ne"
@include "math.ne"

main -> ___ lines:? ___ {% d => d[1] %}

lines  -> _lines         {% d => d[0].filter(ln => ln !== null) %}
_lines -> _lines nl line {% d => [...d[0], d[2]] %}
        | line           {% d => [d[0]] %}

line  -> _ expression _ {% d => d[1] %}
       | _ methodDef _  {% d => d[1] %}
       | _ (ident __ "=" __):+ expression {% d => ['varAssign', d[1].map(d => d[0]), d[2]] %}
       | ___            {% d => null %}

methodDef -> "def" __ ident "(" (argList|___) ")" _ block {% d => ['methodDef', d[2], d[4][0] === null ? [] : d[4][0], d[7]] %}
argList   -> ___ argList "," ___ arg ___ {% d => [...d[1], d[4]] %}
           | arg                         {% d => [d[0]] %}
arg       -> ident                       {% d => d[0] %}

nl      -> _ comment:? "\n" {% d => null %}
comment -> "#" [^\n]:*      {% d => null %}

# Whitespace
_    -> wschar:*   {% d => null %} # optional
___  -> wsnlchar:* {% d => null %} # optional w/ newlines
__   -> wschar:+   {% d => null %} # mandatory
____ -> wsnlchar:+ {% d => null %} # mandatory w/ newlines

wschar   -> [ \t]         {% d => d[0] %}
wsnlchar -> [ \t\n\v\f] {% d => d[0] %}
