require("colors");
String.prototype.err = function() {
    var txt = '';
    var lines = this.split("\n");
    var line;
    var i;
    for (i = 0 ; i < lines.length ; i++) {
        line = lines[i];
        while(line.length < 80) {
            line += ' ';
        }
        if (txt.length > 0) {
            txt += "\n";
        }
        txt += line;
    }

    return txt.redBG.white;
};


console.log("---------------------");
console.log(" ToloFrameWork 3.0.0 ");
console.log("       beta  5       ");
console.log("---------------------");
console.log();

require("./project").build();
