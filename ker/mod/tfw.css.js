
var RX_NUMBER = /[ \t\n\r]*[+-]?(\.[0-9]+|[0-9]+(\.[0-9]+)?)/g;

exports.parseUnit = function(txt) {
    var c;
    var mode = 0;
    for (var i = 0; i < txt.length; i++) {
        c = txt.charAt(i);
        if (mode == 0) {
            if (c == '-' || c == '+' || (c >= '0' && c <= '9')) mode = 1;
            else if (c == '.') mode = 2;
            else if (c > ' ') break;
        }
        else if (mode == 1) {
            if (c == '.') mode = 2;
            else if (c < '0' || c > '9') break;
        }
        else if (mode == 2) {
            if (c < '0' || c > '9') break;
        }
    }

    return {
        v: parseFloat(txt.substr(0, i)),
        u: txt.substr(i).trim()
    };
};
