/**
 * @module util
 */

var PathUtils = require("./pathutils");
var CleanCSS = require("clean-css");
var UglifyJS = require("uglify-js");
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

exports.zipCSS = function(css) {
    var mini = new CleanCSS({
      sourceMap: true,
      inline: ['local']
    }).minify(css);

    return {
      src: css,
      zip: mini.styles,
      map: mini.sourceMap,
      errors: mini.errors,
      warnings: mini.warnings
    };
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
exports.cleanDir = function(path, preserveGit) {
    if (typeof preserveGit === 'undefined') preserveGit = false;
    path = Path.resolve(path);
    // If the pah does not exist, everything is fine!
    if( !FS.existsSync( path ) ) return;

    if (preserveGit) {
        // We must delete the content of this folder but preserve `.git`.
        // The `www` dir, for instance, can be used as a `gh-pages` branch.
        var files = FS.readdirSync(path);
        files.forEach(function (filename) {
            if (filename == '.git') return;
            var filepath = Path.join(path, filename);
            var stat = FS.statSync(filepath);
            if (stat.isDirectory()) {
                if (filepath != '.' && filepath != '..') {
                    PathUtils.rmdir(filepath);
                }
            } else {
                FS.unlink(filepath);
            }
        });
    } else {
        // Brutal clean: remove dir and recreate it.
        PathUtils.rmdir(path);
        PathUtils.mkdir(path);
    }
};

/**
 * @class Dependencies
 */
var Resources = function(data){
    this.clear();
    this.data(data);
};

/**
 * Set/Get the list of dependencies.
 */
Resources.prototype.data = function(data) {
    if (typeof data === 'undefined') {
        var copy = [];
        this._data.forEach(
            function(itm) {
                copy.push(itm);
            }
        );
        return copy;
    }
    this.clear();
    if (Array.isArray(data)) {
        data.forEach(
            function(itm) {
                this.add(itm);
            }, this
        );
    }
};

/**
 * Remove all the dependencies.
 */
Resources.prototype.clear = function() {
    this._data = [];
    this._map = {};
};

/**
 * Add a dependency.
 * @param {string/array} item As an array, it is the couple `[source, destination]`.
 * If the `source` is the same as the `destination`, just pass one string.
 */
Resources.prototype.add = function(item) {
    var key = item;
    if (Array.isArray(item)) {
        key = item[0];
    }
    if (this._map[key]) return;
    this._map[key] = 1;
    this._data.push(item);
};

/**
 * Loop on the dependencies.
 */
Resources.prototype.forEach = function(f, that) {
    this._data.forEach(
        function(itm, idx, arr) {
            f(itm, idx, arr);
        }, that
    );
};


exports.Resources = Resources;


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
