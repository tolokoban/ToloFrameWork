/**
 * @module FileJS
 */

var uglify = require("uglify-js");
var fs = require("fs");

var UglifyError = function(file, ex) {
    var msg = ex.message + "\n";
    msg += "  file: " + file + "\n";
    msg += "  line: " + ex.line + "\n";
    msg += "  col.: " + ex.col + "\n";
    msg += "----------------------------------------"
        + "----------------------------------------\n";
    var content = fs.readFileSync(file).toString();
    var lines = content.split("\n"),
    lineIndex, indent = '',
    min = Math.max(0, ex.line - 1 - 2),
    max = ex.line;
    for (lineIndex = min ; lineIndex < max ; lineIndex++) {
        msg += lines[lineIndex].trimRight() + "\n";
    }
    for (lineIndex = 0 ; lineIndex < ex.col ; lineIndex++) {
        indent += ' ';
    }
    msg += "\n" + indent + "^\n";
    this.fatal = msg;
};

exports.zip = function(file) {
    try {
        return uglify.minify(file).code;
    } catch (x) {
        throw new UglifyError(file, x);
    }
};

exports.parse = function(file) {
    var content = fs.readFileSync(file).toString();
    try {
        return uglify.parse(content, {filename: file});
    }
    catch (x) {
        throw new UglifyError(file, x);
    }

}