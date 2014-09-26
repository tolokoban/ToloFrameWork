/**
 * Here are the tags used by a CSS source:
 * * __`debug`__: (string) CSS code after LESS expansion.
 * * __`release`__: (string) CSS LESS expanded code after zip.
 * * __`resources`__: (array) resources referenced by this CSS: images, fonts, ...
 * @module compiler-css
 */

var FS = require("fs");
var Path = require("path");
var Util = require("./util");

/**
 * @todo Parse the `release` looking for `url(...)` in order to list all resources.
 */
module.exports.compile = function(source) {
    if (source.isUptodate()) return false;
    console.log("Compiling " + source.name().yellow);
    var content = source.read();
    var debug = Util.lessCSS(source.name(), content, false);
    var release = Util.lessCSS(source.name(), content, true);
    source.tag("debug", debug);
    source.tag("release", release);
    source.save();
};

