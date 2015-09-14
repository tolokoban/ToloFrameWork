var FS = require("fs");
var Libs = require("./compiler-com-libs");
var Path = require("path");
var Tree = require("./htmltree");
var Fatal = require("./fatal");
var Utils = require("./pathutils");
var Source = require("./source");

var Components = [];
var TagRegExps = [];

/**
 * Loading and sorting all components.
 */
exports.loadComponents = function(prj) {
    var pathes = [prj.srcPath("com")];
    prj.getExtraModulesPath().forEach(
        function(extraModulePath) {
            pathes.push(Path.join(extraModulePath, "com"));
        }
    );
    pathes.push(prj.libPath("com"));

    Components = [];
    TagRegExps = [];
    pathes.forEach(function (path) {
        var components = [];
        Utils.findFilesByExtension(path, ".com.js").forEach(function (comPath) {
            var com;
            try {
                com = require(comPath);
            }
            catch (ex) {
                Fatal.bubble(ex, comPath);
            }
            com.$path = comPath;
            if (typeof com.tags === 'undefined') {
                Fatal.fire(
                    "Missing the mandatory attribute \"tags\"!",
                    "Bad Component Definition",
                    comPath
                );
            }
            if (typeof com.priotity !== 'number') com.priotity = 0;
            if (typeof com.compile !== 'function') {
                Fatal.fire(
                    "Missing the mandatory function \"compile(root libs)\"!",
                    "Bad Component Definition",
                    comPath
                );
            }
            components.push(com);
        });
        components.sort(function(a, b) {
            return b.priotity - a.priotity;
        });
        components.forEach(function(item) {
            Components.push(item);
        });
    });
    // Precompile all regular expressions used to match the tag.
    Components.forEach(function (com) {
        var filters = com.tags;
        if (!Array.isArray(filters)) {
            filters = [filters];
        }
        var regexps = [];
        filters.forEach(function (filter) {
            regexps.push(new RegExp("^" + filter + "$", "i"));
        });
        TagRegExps.push(regexps);
    });
};


/**
 * @param {string} tagName Name of the HTML tag element.
 * @return {object|null} First component registered for this `tagName`.
 */
exports.getCompilerForTag = function(tagName) {
    var i, k, rx, regexps, component, cssFile;
    for (i = 0; i < Components.length; i++) {
        regexps = TagRegExps[i];
        for (k = 0; k < regexps.length; k++) {
            rx = regexps[k];
            if (rx.test(tagName)) {                
                component = Components[i];
                if (!component.$) {
                    component.$ = {
                        firstTime: true
                    };
                    // First use of this component.
                    // Look  for  CSS. If  component  is  in the  file
                    // `foo.com.js`,   we   look   for  the   CSS   in
                    // `foo.com.css`.
                    cssFile = component.$path.substr(0, component.$path.length - 3) + '.css';
                    if (FS.existsSync(cssFile)) {
                        component.$.css = FS.readFileSync(cssFile).toString();
                    }
                }
                return component;
            }
        }
    }
    return null;
};

/**
 * To be uptodate, an HTML page must be more recent that all its dependencies.
 */
function isHtmlFileUptodate(source) {
    var dependencies = source.tag("dependencies") || [];
    var i, dep, file, prj = source.prj(),
    stat,
    mtime = source.modificationTime();
    for (i = 0 ; i < dependencies.length ; i++) {
        dep = dependencies[i];
        file = prj.srcOrLibPath(dep);
        if (file) {
            stat = FS.statSync(file);
            if (stat.mtime > mtime) return false;
        }
    }
    return source.isUptodate();
}
