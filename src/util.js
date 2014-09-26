/**
 * @module util
 */

var UglifyJS = require("uglify-js");
var Less = require("less");
var Path = require("path");
var FS = require("fs");

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

/**
 * Apply LESS expansion on CSS content.
 * @param {string} name name used for error reporting.
 * @param {string} content CSS content with LESS syntax.
 * @param {bool} compression if `true`, the result must be compressed.
 * @return CSS after compilation.
 */
exports.lessCSS = function(name, content, compression) {
    var options = {
        paths         : ["."],            // .less file search paths
        outputDir     : ".",              // output directory, note the '/'
        optimization  : 9,                // optimization level
        filename      : name,             // root .less file
        compress      : compression,      // compress?
        yuicompress   : compression       // use YUI compressor?
    };
    var result = "";
    var parser = new Less.Parser(options);
    parser.parse(
        content, 
        function ( error, cssTree ) {
            if ( error ) {
                Less.writeError( error, options );
                return;
            }
            
            // Create the CSS from the cssTree
            var cssString = cssTree.toCSS( {
                compress   : options.compress,
                yuicompress: options.yuicompress
            } );
            
            result = cssString;
        }
    );
    return result;
};

/**
 * Return a copy of an array after removing all doubles.
 * @param {array} arrInput array of any comparable object.
 */
exports.removeDoubles = function(arrInput) {
    var arrOutput = [];
    var map = {};
    arrInput.forEach(
        function(itm) {
            if (itm in map) return;
            map[itm] = 1;
            arrOutput.push(itm);
        } 
    );
    return arrOutput;
};

/**
 * Remove all files and directories found in `path`, but not `path` itself.
 */
exports.cleanDir = function(path) {
    path = Path.resolve(path);
    FS.readdirSync(path).forEach(
        function(filename) {
            var file = Path.resolve(Path.join(path, filename));
            if (FS.existsSync(file)) {
                var stat = FS.statSync(file);
                if (stat.isFile()) {
                    FS.unlinkSync(file);
                }
                else if (stat.isDirectory()) {
                    this.cleanDir(file);
                    try {
                        FS.rmdirSync(file);
                    }
                    catch (ex) {
                        console.error(
                            "Unable to remove directory\n\"" + file + "\"\n\n".err()
                        );
                        console.error(ex.err());
                    }
                }
            }
        },
        this
    );
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
