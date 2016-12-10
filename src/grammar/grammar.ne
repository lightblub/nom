@include "literal.ne"
@include "math.ne"

main -> ___ lines:? ___ {% d => d[1] %}

lines -> lines nl line  {% d => [...d[0], d[2]] %}
       | line           {% d => [d[0]] %}

line  -> _ expression _ {% d => d[1] %}
       | _ methodDef _  {% d => d[1] %}

methodDef -> ident _ "(" (argList|_) ")" _ block {% d => ['methodDef', d[0], d[3][0] === null ? [] : d[3][0], d[6]] %}
argList   -> ___ argList "," ___ arg ___ {% d => [...d[1], d[4]] %}
           | arg                         {% d => [d[0]] %}
arg       -> ident                       {% d => d[0] %}

nl      -> _ comment:? "\r":? "\n" {% d => null %}
comment -> ("--"|"//"|"#") [^\n]:* {% d => null %}

# Whitespace
_    -> wschar:*   {% d => null %} # optional
___  -> wsnlchar:* {% d => null %} # optional w/ newlines
__   -> wschar:+   {% d => null %} # mandatory
____ -> wsnlchar:+ {% d => null %} # mandatory w/ newlines

wschar   -> [ \t]         {% d => d[0] %}
wsnlchar -> [ \t\n\v\f\r] {% d => d[0] %}
