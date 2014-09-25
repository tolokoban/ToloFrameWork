/**
 * @module compile-html
 */

var FS = require("fs");
var Path = require("path");
var Source = require("./source");
var Tree = require("./htmltree");
var Util = require("./util");
var CompilerJS = require("./compiler-js");

/**
 * Compile an HTML file if it is not uptodate.
 * @param {Project} prj Project object.
 * @param {string} filename name of the HTML file without the full path.
 * @see project~Project
 */
module.exports.compile = function(prj, filename) {
    var source = new Source(prj, filename);

    if (!source.isUptodate()) {
        console.log("Compiling " + filename.yellow);
        var root = Tree.parse(source.read());
        lookForStaticJavascriptAndStyle(root, source);
        expandWidgets(root, source);
        initControllers(root, source);
        zipInnerScriptsAndStyles(root, source);
        compileDependantScripts(root, source);
        cleanupTreeAndStoreItInTag(root, source);
        source.save();
    } else {
        console.log("Uptodate!");
    }

    return source;
};


/**
 * Remove all `extra` properties in the tree and store it in tag __`tree`__.
 */
function cleanupTreeAndStoreItInTag(root, source) {
    Tree.walk(
        root,
        function(node) {
            delete node.extra;
            if (node.children && node.children.length == 0) {
                delete node.children;
            }
            if (node.attribs) {
                var count = 0, key;
                for (key in node.attribs) {
                    count++;
                }
                if (count == 0) {
                    delete node.attribs;
                }
            }
        }
    );
    source.tag("tree", root);
}

/**
 * Work on following tags:
 * ```
 * <script src="foo.js"></script>
 * <script>Hello world!</script>
 * <link href="mystyle.css" rel="stylesheet" type="text/css" />
 * <style>body {background: orange;}</style>
 * ```
 */
function lookForStaticJavascriptAndStyle(root, source) {
    function clear(node) {
        node.type = Tree.VOID;
        delete node.attribs;
        delete node.children;
    }
    var innerJS = "";
    var innerCSS = "";
    var outerJS = [];
    var outerCSS = [];
    source.tag("outerJS", outerJS);
    source.tag("outerCSS", outerCSS);
    Tree.walk(
        root,
        null,
        function(node) {
            if (node.type !== Tree.TAG) return;
            var src;
            switch (node.name) {
                case "script":
                    src = Tree.att(node, "src");
                    if (typeof src === 'string' && src.length > 0) {
                        outerJS.push(src);
                    } else {
                        innerJS += Tree.text(root);
                    }
                    clear(root);
                    break;
                case "style":
                    innerCSS += Tree.text(root);
                    clear(root);
                    break;
                case "link":
                    if (Tree.att("rel").toLowerCase() == "stylesheet") {
                        src = Tree.att("href").trim();
                        if (typeof src === 'string' && src.length > 0) {
                            outerCSS.push(src);
                        }
                    }
                    break;
            }
        }
    );
    source.tag("innerJS", "");
    source.tag("innerCSS", "");
}

/**
 * All elements  with the namespace `w:`  are widgets. If the  HTML file
 * contains, for instance,  the widgets `<w:foo>` and  `<w:bar>`, we put
 * `["wdg/foo/compile-foo.js",  "wdg/bar/compile-bar.js"]` into  the tag
 * __`dependencies`__.
 *
 * Then we eventually add the content of `root.extra.css` to the tag __`innerCSS`__.
 */
function expandWidgets(root, source) {
    var prj = source.prj();
    source.tag("dependencies", []);
    var availableWidgets = prj.getAvailableWidgetCompilers();
    Tree.walk(
        root,
        function (node, parent) {
            if (node.type === Tree.TAG) {
                if (node.name.substr(0, 2) == 'w:') {
                    var widgetName = node.name.substr(2).toLowerCase();
                    var compilerDir = availableWidgets[widgetName];
                    if (typeof compilerDir !== 'string') {
                        prj.fatal(
                            "Unknown widget: \"" + widgetName + "\"!",
                            prj.ERR_WIDGET_NOT_FOUND
                        );
                    }
                    compileWidget(node, source, widgetName, compilerDir);
                }
            }
        }
    );
}

/**
 * Compile the widget.
 */
function compileWidget(root, source, widgetName, compilerDir) {
    var prj = source.prj();
    var dependencies = source.tag("dependencies");
    var outerJS = source.tag("outerJS");
    root.name = "div";
    Tree.addClass(root, "custom wtag-" + widgetName);
    root.extra = {};
    var id = Tree.att(root, "id") || Tree.nextId();
    Tree.att(root, "id", id);
    root.extra.init = {id: id};
    var controller = "wtag." + widgetName.substr(0, 1).toUpperCase()
        + widgetName.substr(1).toLowerCase();
    if (prj.srcOrLibPath("cls/" + controller + ".js")) {
        root.extra.controller = controller;
        outerJS.push("cls/" + controller + ".js");
    }
    var compilerModule = Path.join(compilerDir, "compile-" + widgetName + ".js");
    if (FS.existsSync(compilerModule)) {
        // There is a transformer: we will call it.
        var compiler = require(compilerModule);
        if (typeof compiler.compile !== 'function') {
            prj.fatal(
                "Missing mandatory function \"compile\" in\n\"" + compilerModule + "\""
            );
        }
        try {
            compiler.compile.call(prj, root);
            dependencies.push("wdg/" + widgetName + "/compile-" + widgetName + ".js");
        }
        catch (ex) {
            prj.fatal(
                ex,
                prj.ERR_WIDGET_TRANSFORMER,
                compilerModule
            );
        }
    }

    var deepness = 64;
    while (needsWidgetCompilation(root)) {
        compileWidget(root, source, widgetName, compilerDir);
        deepness--;
        if (deepness < 1) {
            prj.fatal(
                "Too much recursions for widget \"" + widgetName + "\"!",
                prj.ERR_WIDGET_TOO_DEEP,
                widgetName
            );
        }
    }
}

/**
 * @return `true` if there is an element with the namespace `w:`.
 */
function needsWidgetCompilation(root) {
    if (root.type == Tree.TAG && root.name && root.name.substr(0, 2) == 'w:') {
        return true;
    }
    if (!root.children) return false;
    var i, node;
    for (i = 0 ; i < root.children.length ; i++) {
        node = root.children[i];
        if (needsWidgetCompilation(node)) return true;
    }
    return false;
}

/**
 * Initialize controllers by adding script in the __`innerJS`__ tag.
 */
function initControllers(root, source) {
    var innerJS = source.tag("innerJS")
        + "\nwindow.addEventListener(\n"
        + "    'DOMContentLoaded',\n"
        + "    function() {\n"
        + "        document.body.parentNode.$data = {};\n"
        + "        // Attach controllers.\n";
    var extraCSS = "";
    Tree.walk(
        root,
        function(node) {
            var item = node.extra;
            if (!item) return;
            if (item.controller) {
                var ctrlFilename = "cls/" + item.controller + ".js";
                innerJS += "        $$('" + item.controller + "'";
                if (typeof item.init === 'object') {
                    var sep = ', {', key, val;
                    for (key in item.init) {
                        val = item.init[key];
                        if (typeof val === 'string' && val.substr(0, 9) == 'function(') {
                            // This is a function: we don't want to stringify it.
                        } else {
                            val = JSON.stringify(val);
                        }
                        innerJS += sep;
                        sep = ', ';
                        innerJS += key + ": " + val;
                    }
                    innerJS += "}";

                }
                innerJS += ");\n";
            }
            if (item.css) {
                extraCSS += item.css;
            }
        }
    );

    innerJS += "        // Remove logo's screen.\n"
        + "        // document.body.removeChild(document.getElementById(...));\n"
        + "    }\n);\n";
    source.tag("innerJS", innerJS);
}

/**
 * Write tags __`zipJS`__ and __`zipCSS`__.
 */
function zipInnerScriptsAndStyles(root, source) {
    source.tag("zipJS", Util.zipJS(source.tag("innerJS")));
    source.tag("outerJS", uniquify(source.tag("outerJS")));
    source.tag("outerCSS", uniquify(source.tag("outerCSS")));
}

/**
 * @param {array} arr a string array.
 * @return a copy of this array, sorted and with no doublons.
 */
function uniquify(arr) {
    var result = [];
    var last = "";
    arr.sort();
    arr.forEach(
        function(itm) {
            if (itm != last) {
                result.push(itm);
                last = itm;
            }
        } 
    );
    return result;
}

/**
 * Compile dependant JS scripts.
 */
function compileDependantScripts(root, source) {
    var needed = {};
    var jobs = [];
    var prj = source.prj();
    var file;
    source.tag("outerJS").forEach(
        function(file) {
            jobs.push(file);
        }
    );
    while (jobs.length > 0) {
        file = jobs.pop();
        if (file in needed) continue;
        var srcJS = source.create(file);
        try {
            CompilerJS.compile(srcJS);
            needed[file] = srcJS;
        }
        catch (ex) {
            prj.fatal(ex, -1, file);
        }
    } 
}
