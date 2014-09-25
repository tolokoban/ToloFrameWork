/**
 * @module util
 */

var UglifyJS = require("uglify-js");

/**
 * @param {string} js Script you want to zip.
 * @return zipped script.
 */
exports.zipJS = function(js) {
    try {
        return UglifyJS.minify(js, {fromString: true}).code;
    } catch (x) {
        throwUglifyJSException(js, x);
    }
};


function throwUglifyJSException(js, ex) {
    var msg = ex.message + "\n";
    msg += "  line: " + ex.line + "\n";
    msg += "  col.: " + ex.col + "\n";
    msg += "----------------------------------------"
        + "----------------------------------------\n";
    var content = js;
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
    throw {
        fatal: msg,
        src: "util.zipJS"
    };
}
