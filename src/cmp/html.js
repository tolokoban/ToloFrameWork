/**
 * Compiler for HTML files.
 *
 * Databindings are stored on the DOM elements as property `$data`.
 *
 * @module cmp/html
 */
var FS = require("fs");
var Path = require("path");
var Tree = require("../htmltree");
var Kernel = require("../kernel");
var Template = require("../template");

var ParserContext = function(source) {
    this._source = source;
    this.newNode = null;
    this.result = {};
};

ParserContext.prototype.srcPath = function(localPath) {
    return this._source.srcPath(localPath);
};

/**
 * @return Name of the HTML file, without any path.
 */
ParserContext.prototype.filename = function() {
    return this._source.filename();
};

ParserContext.prototype.Tree = Tree;




/**
 * Return true if there is a tag with namespace "w:" in the tree whom "node" is the root.
 */
function needsWidgetCompilation(node) {
    if (!node) return false;
    if (node.name && node.name.substr(0, 2) == 'w:') return true;
    if (!node.children) return false;
    var i, child;
    for (i = 0 ; i < node.children.length ; i++) {
        child = node.children[i];
        if (needsWidgetCompilation(child)) return true;
    }
    return false;
}

/**
 * Deeply look for widgets and compile them.
 */
function compilationDeepWalk(source, children) {
    if (!children) return;
    var i, child, newNode;
    for (i = 0 ; i < children.length ; i++) {
        child = children[i];
        if (child.children) {
            compilationDeepWalk(source, child.children);
        }
        if (child.name && child.name.substr(0, 2) == 'w:') {
            newNode = compileWidget(source, child);
            if (typeof newNode === 'object') {
                children[i] = newNode;
            }
        }
    }
}

function findWidgetPath(widgetName) {
    var path = Kernel.tfwPath("wdg/" + widgetName);
    if (FS.existsSync(path)) {
        return path;
    }
    path = Kernel.prjPath("wdg/" + widgetName);
    if (FS.existsSync(path)) {
        return path;
    }
    throw {fatal: "Widget definition not found: \"" + widgetName + "\"!"};
};

function compileWidget(source, root) {
    var widgetName = root.name.substr(2).toLowerCase();
    root.name = "div";
    var widgetPath = findWidgetPath(widgetName);
    var parserPath = widgetPath + "/compile-" + widgetName + ".js";
    var att;
    var id = Tree.att(root, "id");
    if (!id) {
        id = Tree.nextId();
        Tree.att(root, "id", id);
    }
    root.extra = {
        widgetName: widgetName,
        init: {id: id},
        js: null,
        css: null
    };
    root.extra.controller =
        "wtag." + widgetName.substr(0, 1).toUpperCase() + widgetName.substr(1);

    if (FS.existsSync(parserPath)) {
        var Parser = require(parserPath);
        var compiler = Parser.compile;
        if (typeof compiler !== 'function') {
            throw {fatal: "Module \"parse.js\" of widget \"" + widgetName
                   + "\" must export a function called \"compile\"!"};
        }
        var ctx = new ParserContext(source);
        try {
            compiler.call(ctx, root);
        }
        catch (ex) {
            root.children = root.children ? root.children.length : 0;
            Kernel.fatal(
                "Exception thrown from compilation of widget \"" + widgetName + "\":\n\n" + ex
                    + "\n\nNODE: " + JSON.stringify(root)
            );
        }
    } else {
        root.name = "div";
    }
    Tree.addClass(root, "custom", "wtag-" + widgetName);
}

function compileWidgets(source, root) {
    var depth = 0;

    while (needsWidgetCompilation(root)) {
        depth++;
        if (depth > 32) {
            throw {fatal: "Widget expansion runs too deep!"};
        }
        compilationDeepWalk(source, root.children);
    }
    return root;
}

function addExtraCode(root, extraCode, source) {
    Tree.walk(
        root,
        function(node) {
            var item = node.extra;
            if (!item) return;
            if (item.controller) {
                var ctrlFilename = "cls/" + item.controller + ".js";
                var ctrlFullPath = Kernel.srcPath(ctrlFilename);
                if (FS.existsSync(ctrlFullPath)) {
                    source.addNeed(ctrlFilename);
                    extraCode.js += "$$('" + item.controller + "'";
                    if (typeof item.init === 'object') {
                        var sep = ',{', key, val;
                        for (key in item.init) {
                            val = item.init[key];
                            if (typeof val === 'string' && val.substr(0, 9) == 'function(') {
                                // This is a function: we don't want to stringify it.
                            } else {
                                val = JSON.stringify(val);
                            }
                            extraCode.js += sep;
                            sep = ',';
                            extraCode.js += key + ":" + val;
                        }
                        extraCode.js += "}";

                    }
                    extraCode.js += ");\n";
                }
            }
            if (item.css) {
                extraCode.css += item.css;
            }
        }
    );
}

function doubleCurliesReplacer(txt) {
    return "<w:bind>" + txt + "</w:bind>";
}

function expandDoubleCurlies(node) {
    if (node.text) {
        var result = Template.text(node.text, doubleCurliesReplacer);
        if (result.count > 0) {
            node.type = Tree.VOID;
            node.children = [Tree.parse(result.out)];
        }
    }
    else if (node.children) {
        node.children.forEach(
            function(itm) {
                expandDoubleCurlies(itm);
            }
        );
    }
}

exports.analyse = function(source) {
    source.clearNeeds();
    source.clearIncludes();
    source.widgets = [];
    var current = Tree.parse(source.content());
    var node;
    var tfw_scripts = null;
    var debug = false;
    var widgets = [];
    var extraCode = {js: "", css: ""};
    var headTag = null;

    expandDoubleCurlies(current);
    current = compileWidgets(source, current);
    addExtraCode(current, extraCode, source);

    // Add needed extra CSS and JS for widgets.
    // Also, look for attribute "app" in tag <body>.
    Tree.walk(
        current,
        function(node) {
            var i, item, scriptCode, app, id,
            scripts, script, obj, scriptName,
            key, val, sep;
            if (node.type == Tree.TAG) {
                if (node.name == 'head') {
                    headTag = node;
                }
                else if (node.name == 'body') {
                    app = Tree.att(node, "app");
                    if (app) {
                        delete node.attribs.app;
                        source.addNeed("cls/" + app + ".js");
                        source.addNeed("tfw/tfw3.js");
                        extraCode.js += "document.body.$widget=$$.App=$$('" + app + "',{id:document.body});"
                            + "$$.App.lang($$.App.lang());\n";
                    }
                    id = Tree.nextId();
                    extraCode.js += "\ndocument.body.removeChild(document.getElementById('" + id + "'))";
                    node.children.push(
                        {
                            type: Tree.TAG,
                            name: "div",
                            attribs: {
                                id: id,
                                style: "position:absolute;"
                                    + "display:block;"
                                    + "left:0;"
                                    + "top:0;"
                                    + "right:0;"
                                    + "bottom:0;"
                                    + "background:#000;"
                            }
                        }
                    );
                }
                else if (node.name == 'html') {
                    if (!headTag) {
                        headTag = Tree.tag("head");
                        if (!node.children) node.children = [];
                        node.children.push(headTag);
                    }
                    if (!headTag.children) headTag.children = [];
                    if (extraCode.js.length > 0) {
                        source.addNeed("tfw/tfw3.js");
                        if (extraCode.js.length > 0) {
                            // Adding root WTag for global data binding.
                            extraCode.js =
                                "document.body.parentNode.$data={};\n"
                                + extraCode.js;
                        }
                        FS.writeFileSync(
                            source.wwwPath(source.basename() + ".js"),
                            "window.addEventListener('load',function(){\n"
                                + extraCode.js
                                + "})"
                        );
                        headTag.children.push(
                            Tree.tag(
                                "script",
                                {
                                    src: source.basename() + ".js"
                                }
                            )
                        );
                    }
                }
            }
        }
    );

    source.tag("tree", current);
    source.tag("debug", debug);
    source.save();
    console.log("Debug mode: ", debug);
};


function insertScriptsAndStyles(source, children) {
    if (typeof children === 'undefined') children = [];

    var debug = source.debug();
    var dependencies = source.findAllDependencies();
    var cssReleaseContent = '';
    var jsReleaseContent = '';

    dependencies.forEach(
        function(dep) {
            var targetFilename;
            var cssResources;
            var dst;

            if (dep.hasFileExtension("css")) {
                if (debug) {
                    // DEBUG mode.
                    targetFilename = "dbg/css/" + dep.basename();
                    dep.wwwCopy(targetFilename);
                    children.push(
                        {
                            type: Tree.TAG,
                            name: "link",
                            attribs: {
                                style: "text/css",
                                rel: "stylesheet",
                                href: targetFilename
                            }
                        }
                    );
                } else {
                    // RELEASE mode.
                    cssReleaseContent += dep.tag("zip");
                }
                // Looking for CSS resource folder.
                cssResources = dep.file();
                cssResources = cssResources.substr(0, cssResources.length - 4);
                if (FS.existsSync(cssResources)) {
                    dst = dep.wwwPath(
                        (debug ? "/dbg" : "") + "/css/"
                            + dep.basename().substr(0, dep.basename().length - 4)
                    );
                    dep.mkdir(dst);
                    dep.copy(cssResources, dst);
                }
            } else {
                if (debug) {
                    // DEBUG mode.
                    targetFilename = "dbg/js/" + dep.basename();
                    dep.wwwCopy(targetFilename);
                    children.push(
                        {
                            type: Tree.TAG,
                            name: "script",
                            attribs: {
                                src: targetFilename
                            }
                        }
                    );
                } else {
                    // RELEASE mode.
                    jsReleaseContent += dep.tag("zip");
                }
            }
            children.push(
                {
                    type: Tree.TEXT,
                    text: "\n"
                }
            );
        }
    );

    if (false == debug) {
        // RELEASE mode: we will aggregate CSS and JS zipped files.
        console.log();
        FS.writeFileSync(
            source.wwwPath(source.basename() + ".js"),
            jsReleaseContent
        );
        children.push(
            {
                type: Tree.TAG,
                name: "script",
                attribs: {
                    src: source.basename() + ".js"
                }
            }
        );
        Kernel.writeFile(
            source.wwwPath("css/" + source.basename() + ".css"),
            cssReleaseContent
        );
        FS.writeFileSync(
        );
        children.push(
            {
                type: Tree.TAG,
                name: "link",
                attribs: {
                    style: "text/css",
                    rel: "stylesheet",
                    href: "css/" + source.basename() + ".css"
                }
            }
        );
    }
    return {children: children};
}

exports.compile = function(source) {
    console.log("[HTM] " + source.filename());
    var tree = source.tag("tree");
    Tree.walk(
        tree,
        function(node) {
            if (node.type == Tree.TAG) {
                if (node.name == 'head') {
                    return insertScriptsAndStyles(source, node.children);
                }
            }
        }
    );
    source.wwwSave(source.filename(), Tree.toString(tree));
};


/**
 * When the  HTML file contains a  tag with the namespace  "w:", we look
 * for an expansion plugin that will modify the HTML resulting code.
 * Moreover, if  there is an  attribute called  "widget", we look  for a
 * class with that name.  If there is no shuc class, we  create it an it
 * will inherit from the default wtag.* class.
 */
function parseWidgetTag(node, source, widgets) {
    var widgetName = node.name.substr(2).toLowerCase();
    var widgetFile = Path.join(source.prjPath("wdg"), widgetName + ".js");
    var widgetClass = "wtag." + widgetName.substr(0, 1).toUpperCase() + widgetName.substr(1);
    var newNode = node;

    if (node.attribs && node.attribs.widget) {
        // A user specific class which must inherit from wtag.* class.
        var subclassName = node.attribs.widget;
        var subclassFile = source.srcPath("cls/" + subclassName + ".js");
        if (!FS.existsSync(subclassFile)) {
            console.log("Create source file: " + subclassFile);
            FS.writeFileSync(
                subclassFile,
                widgetClass == "wtag.Page"
                    ? "window['TFW::" + subclassName + "'] = {\n"
                    + "    superclass: '" + widgetClass + "',\n"
                    + "    init: function() {\n"
                    + "        this.registerSignal('show', this.onShow);\n"
                    + "        this.registerSignal('hide', this.onHide);\n"
                    + "    },\n"
                    + "    functions: {\n"
                    + "        onShow: function(arg, signal, emitter) {},\n"
                    + "        onHide: function(arg, signal, emitter) {}\n"
                    + "    }\n"
                    + "};"
                    : "window['TFW::" + subclassName + "'] = {\n"
                    + "    superclass: '" + widgetClass + "',\n"
                    + "    init: function() {\n"
                    + "        this.registerSignal('signal', this.slot);\n"
                    + "    },\n"
                    + "    functions: {\n"
                    + "        slot: function(arg, signal, emitter) {}\n"
                    + "    }\n"
                    + "};"
            );
        }
        widgetClass = subclassName;
    }
    if (FS.existsSync(widgetFile)) {
        var widget = require(widgetFile);
        if (typeof widget.parse === "function") {
            newNode = widget.parse(node, source, Tree) || node;
        } else {
            throw {
                fatal: "The widget plugin \"" + widgetName
                    + "\" must export a function called \"parse\"!"
            };
        }
    } else {
        // Default node transformation.
        newNode = Tree.createFrom(node);
        Tree.addClass(newNode, "wtag-" + widgetName);
    }
    source.addNeed(
        "cls/" + widgetClass + ".js",
        "wtag.js",
        {
            widgetName: widgetName,
            widgetClass: widgetClass
        }
    );
    if (!newNode.attribs) {
        newNode.attribs = {};
    }
    if (!newNode.attribs.id) {
        newNode.attribs.id = Tree.nextId();
    }
    node.attribs.id = newNode.attribs.id;
    var attribs = {}, key, val;
    if (typeof newNode.init === 'object') {
        for (key in newNode.init) {
            val = newNode.init[key];
            attribs[key] = val;
        }
    }
    attribs.id = newNode.attribs.id;
    widgets.push([widgetClass, attribs]);
    return newNode;
}
