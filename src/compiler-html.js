/**
 * @module compile-html
 */

var FS = require("fs");
var Path = require("path");
var Source = require("./source");
var Tree = require("./htmltree");
var Util = require("./util");
var CompilerJS = require("./compiler-js");
var CompilerCSS = require("./compiler-css");
var Template = require("./template");


/**
 * Compile an HTML file if it is not uptodate.
 * @param {Project} prj Project object.
 * @param {string} filename name of the HTML file without the full path.
 * @see project~Project
 */
module.exports.compile = function(prj, filename) {
    var source = new Source(prj, filename);

    if (!isHtmlFileUptodate(source)) {
        console.log("Compiling " + filename.yellow);
        var root = Tree.parse(source.read());
        source.tag("resources", []);
        lookForStaticJavascriptAndStyle(root, source);
        expandDoubleCurlies(root, source);
        expandWidgets(root, source);
        initControllers(root, source);
        zipInnerScriptsAndStyles(root, source);
        cleanupTreeAndStoreItInTag(root, source);
        var resources = new Util.Resources(source.tag("resources"));
        source.tag("resources", resources.data());
    }
    compileDependantScripts(root, source);
    compileDependantStyles(root, source);
    source.tag("dependencies", Util.removeDoubles(source.tag("dependencies")));
    source.tag("innerMapCSS", null);
    source.save();

    return source;
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
        null,
        // Top-down.
        function (node, parent) {
            if (node.type === Tree.TAG) {
                if (node.name.substr(0, 2) == 'w:') {
                    var widgetName = node.name.substr(2).toLowerCase();
                    var widget = availableWidgets[widgetName];
                    if (!widget) {
                        prj.fatal(
                            "Unknown widget: \"" + widgetName + "\"!",
                            prj.ERR_WIDGET_NOT_FOUND
                        );
                    }
                    precompileWidget(node, source, widget);
                }
            }
        }
    );
    Tree.walk(
        root,
        // Bottom-up.
        function (node, parent) {
            if (node.type === Tree.TAG) {
                if (node.name.substr(0, 2) == 'w:') {
                    var widgetName = node.name.substr(2).toLowerCase();
                    var widget = availableWidgets[widgetName];
                    if (!widget) {
                        prj.fatal(
                            "Unknown widget: \"" + widgetName + "\"!",
                            prj.ERR_WIDGET_NOT_FOUND
                        );
                    }
                    compileWidget(node, source, widget);
                }
            }
        }
    );
}

/**
 * Compile the widget.
 */
function precompileWidget(root, source, widget) {
    if (!widget.precompilation) return;
    root.extra = {dependencies: [], resources: []};
    root.name = "div";
    widget.compiler.precompile.call(this, root);
}

/**
 * Compile the widget.
 */
function compileWidget(root, source, widget) {
    if (widget.precompilation) return;
    var prj = source.prj();
    var dependencies = source.tag("dependencies");
    var resources = source.tag("resources");
    var outerJS = source.tag("outerJS");
    var innerCSS = source.tag("innerCSS");
    var innerMapCSS = source.tag("innerMapCSS") || {};
    root.name = "div";
    Tree.addClass(root, "custom wtag-" + widget.name);
    root.extra = {dependencies: [], resources: []};
    var id = Tree.att(root, "id") || Tree.nextId();
    Tree.att(root, "id", id);
    root.extra.init = {id: id};
    var controller = "wtag." + widget.name.substr(0, 1).toUpperCase()
        + widget.name.substr(1).toLowerCase();
    if (prj.srcOrLibPath("cls/" + controller + ".js")) {
        root.extra.controller = controller;
        outerJS.push("cls/" + controller + ".js");
    }
    // Looking for extra CSS.
    FS.readdirSync(widget.path).forEach(
        function(filename) {
            if (Path.extname(filename) !== '.css') return;
            if (filename.substr(0, widget.name.length + 1) !== widget.name + "-") return;
            var file = Path.resolve(Path.join(widget.path, filename));
            if (file in innerMapCSS) return;
            innerMapCSS[file] = 1;
            var content = FS.readFileSync(file).toString();
            console.log("inner CSS: " + filename.yellow);
            innerCSS += Util.lessCSS(file, content, false);
            dependencies.push("wdg/" + widget.name + "/" + filename);
        }
    );
    source.tag("innerCSS", innerCSS);
    source.tag("innerMapCSS", innerMapCSS);
    // Compilation.
    var compiler = widget.compiler;
    if (compiler) {
        // There is a transformer: we will call it.
        try {
            compiler.compile.call(prj, root);
            dependencies.push("wdg/" + widget.name + "/compile-" + widget.name + ".js");
            root.extra.resources.forEach(
                function(itm) {
                    resources.push(itm);
                }
            );
            root.extra.dependencies.forEach(
                function(itm) {
                    dependencies.push(itm);
                }
            );
        }
        catch (ex) {
            if (ex.fatal) {
                throw ex;
            } else {
                prj.fatal(
                    ex,
                    prj.ERR_WIDGET_TRANSFORMER,
                    widget.path
                );
            }
        }
    }

    var deepness = 64;
    while (needsWidgetCompilation(root)) {
        compileWidget(root, source, widget);
        deepness--;
        if (deepness < 1) {
            prj.fatal(
                "Too much recursions for widget \"" + widget.name + "\"!",
                prj.ERR_WIDGET_TOO_DEEP,
                widget.path
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

    innerJS += "    }\n);\n";
    source.tag("innerJS", innerJS);
}

/**
 * If the text contains a inner binding syntax, expand it.
 * ```
 * <p>Hello {{name}}!</p>
 * ```
 * will become
 * ```
 * <p>Hello <w:bind>name</w:bind>!</p>
 * ```
 * @param {object} node node of type `Tree.TEXT`.
 */
function expandDoubleCurliesInTextNode(node) {
    var doubleCurliesReplacer = function(txt) {
        return "<w:bind>" + txt.trim() + "</w:bind>";
    };
    var result = Template.text(node.text, doubleCurliesReplacer);
    if (result.count > 0) {
        node.type = Tree.VOID;
        node.children = [Tree.parse(result.out)];
    }
}

/**
 * Look for all TEXT nodes and eventually replace double curlies.
 */
function expandDoubleCurlies(root, source) {
    Tree.walk(
        root,
        null,
         // Top-Down walk for databindings.
        function(node)  {
            if (node.type !== Tree.TEXT) return;
            if (typeof node.text !== 'string') return;
            var text = node.text;
            if (text.trim().length == 0) return;
            expandDoubleCurliesInTextNode(node);
        }
    );
}

/**
 * Write tags __`zipJS`__ and __`zipCSS`__.
 */
function zipInnerScriptsAndStyles(root, source) {
    source.tag("zipJS", Util.zipJS(source.tag("innerJS")));
    source.tag("outerJS", Util.removeDoubles(source.tag("outerJS")));
    source.tag("outerCSS", Util.removeDoubles(source.tag("outerCSS")));
}

/**
 * Compile dependant JS scripts in cascade.
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
            srcJS.tag("needs").forEach(
                function(item) {
                    jobs.push(item);
                }
            );
        }
        catch (ex) {
            prj.fatal(ex, -1, file);
        }
    }

    // Save __`linkJS`__ tag.
    var linkJS = [], key;
    for (key in needed) {
        linkJS.push(key);
    }
    source.tag("linkJS", Util.removeDoubles(linkJS));
}

/**
 * Compile dependant CSS styles in cascade.
 */
function compileDependantStyles(root, source) {
    var needed = {};
    var jobs = [];
    var prj = source.prj();
    var file;
    // Add CSS from JS classes.
    source.tag("linkJS").forEach(
        function(item) {
            var srcJS = source.create(item);
            var css = srcJS.tag("css");
            if (css) {
                jobs.push(css);
            }
        }
    );
    // Add
    source.tag("outerCSS").forEach(
        function(file) {
            jobs.push(file);
        }
    );
    while (jobs.length > 0) {
        file = jobs.pop();
        if (file in needed) continue;
        var srcCSS = source.create(file);
        try {
            CompilerCSS.compile(srcCSS);
            needed[file] = srcCSS;
        }
        catch (ex) {
            prj.fatal(ex, -1, file);
        }
    }

    // Save __`linkCSS`__ tag.
    var linkCSS = [], key;
    for (key in needed) {
        linkCSS.push(key);
    }
    source.tag("linkCSS", Util.removeDoubles(linkCSS));
}
