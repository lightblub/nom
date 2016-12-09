@include "literal.ne"
@include "math.ne"

main -> line:* {% d => d[0] %}
line -> _ expression (_ nl):+ _ {% d => d[1] %}

nl -> "\n"     {% d => null %}
    | "\r\n"   {% d => null %}
    | ";"      {% d => null %}
