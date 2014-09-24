/**
 * Compiler for JS files.
 */

var UglifyJS = require("uglify-js");
var Path = require("path");
var FS = require("fs");

var Visitor = function(source) {
    /**
     * Throw a fatal exception with a portion of the buggy code.
     */
    function fatal(node, msg) {
        throw {
            fatal: msg + "\n"
                + source.errorAt(node.start.line, node.start.col)
        };
    }

    /**
     * Extract comments before a node.
     */
    function comment(node) {
        var txt = '';
        var comments = node.start.comments_before;
        if (comments) {
            comments.forEach(
                function(comment) {
                    txt += comment.value;
                }
            );
        }
        return txt;
    }

    var cls = {needs:[], functions:{}};
    var currentMethod;
    var nodePath = '', nodePathStack = [];
    var envFatal = function(msg) {
        return function(node) {
            fatal(node, msg);
        };
    };
    var env;

    /**
     * Add a dependency in "cls.needs" if it is not yet in the array.
     * @return true if the class exists.
     */
    function need(name) {
        var i, item;
        for (i = 0 ; i < cls.needs.length ; i++) {
            item = cls.needs[i];
            if (item == name) {
                return true;
            }
        }
        if (!source.exists("cls/" + name + ".js")) {
            return false;
        }
        cls.needs.push(name);
        return true;
    }

    var env$$3 = function(node) {
        if (node.TYPE == 'String') {
            if (!need(node.value)) {
                fatal(node, "Class not found: \"" + node.value + "\"!");
            }
        } else {
            fatal(node, "Instanciation of TFW classes must be done with static strings!");
        }
        env = env$$1;
    };

    var env$$2 = function(node) {
        if (node.TYPE == 'SymbolRef' && node.name == '$$') {
            env = env$$3;
        } else {
            env = env$$1;
        }
    };

    function env$$1(node) {
        if (node.TYPE == 'Call') {
            env = env$$2;
        }
    };


    var classProperty = "";
    var registry = {
        "Toplevel/": function(node) {
            cls.comment = comment(node);
        },
        "Toplevel/SimpleStatement/Assign/Sub/SymbolRef/": function(node) {
            if (node.name == 'window') {
                return {
                    //"Toplevel/SimpleStatement/Assign/Sub/String/": function(node) {
                    "../String/": function(node) {
                        var className = node.value;
                        if (className.substr(0, 5) != 'TFW::') {
                            fatal(node, "Class name must begin with \"TFW::\"!");
                        }
                        className = className.substr(5);
                        cls.name = className;
                        return {
                            "Toplevel/SimpleStatement/Assign/Object/ObjectKeyVal/": function(node) {
                                switch (node.key) {
                                case 'superclass':
                                    env = function(node) {
                                        if (node.TYPE != "String") {
                                            fatal(node, "superclass must be a STRING!");
                                        }
                                        if (!need(node.value)) {
                                            fatal(node, "Class not found: \"" + node.value + "\"!");
                                        }
                                        cls.superclass = node.value;
                                    };
                                    break;
                                case 'singleton':
                                    env = function(node) {
                                        if (node.TYPE != "True") {
                                            fatal(
                                                node,
                                                "Property \"singleton\" is not mandatory. "
                                                    + "But if you use it, it must be equal to \"true\"!"
                                            );
                                        }
                                        cls.singleton = true;
                                        env = null;
                                    };
                                    break;
                                case 'init':
                                    cls.init = comment(node);
                                    return {
                                        "./Function/": function(node) {
                                            env = env$$1;
                                        },
                                        "./Function/SymbolFunarg/":
                                        envFatal(
                                            "Arguments are not allowed in constructor! "
                                                + "Use \"attributes\" instead."
                                        )
                                    };
                                case 'functions':
                                    return {
                                        "./Object/ObjectKeyVal/": function(node) {
                                            if (cls.functions[node.key]) {
                                                fatal(node, "Already defined function \"" + node.key + "\"!");
                                            }
                                            currentMethod = {
                                                comment: comment(node),
                                                args: []
                                            };
                                            cls.functions[node.key] = currentMethod;
                                            env = env$$1;
                                            return {
                                                "./Function/SymbolFunarg/": function(node) {
                                                    currentMethod.args.push(node.name);
                                                },
                                                "..": function(node) {
                                                    env = null;
                                                }
                                            };
                                        }
                                    };
                                case 'lang':
                                case 'attributes':
                                case 'signals':
                                case 'classInit':
                                    env = null;
                                    break;
                                default:
                                    fatal(node, "Unknown class property: \"" + node.key + "\"!");
                                }
                            }
                        }
                    }
                };
            }
            return false;
        }
    };

    return {
        walk: function(node, down) {
            nodePathStack.push(node.TYPE);
            nodePath += node.TYPE + "/";
            //console.log(nodePath + "\t" + (node.key || node.name || node.value));
            var f = registry[nodePath];
            if (f && typeof f === 'function') {
                var result = f(node, down);
                if (typeof result === 'object') {
                    var newReg = {}, key, val;
                    for (key in result) {
                        val = result[key];
                        if (key.charAt(0) == '.') {
                            // Chemin relatif.
                            key = Path.normalize(Path.join(nodePath, key)).replace(/\\/g, '/');
                        }
                        registry[key] = val;
                    }
                    down();
                }
                else if (result !== false) {
                    down();
                }
            } else {
                if (!env) {
                    down();
                }
                else if (false !== env(node)) {
                    down();
                }
            }
            nodePath = nodePath.substr(0, nodePath.length - nodePathStack.pop().length - 1);
            return true;
        },

        result: function() {
            return cls;
        }
    };
};

exports.analyse = function(source) {
    if (!source.isUptodate()) {
        // Compile only if needed.
        console.log("[CLS] " + source.filename());
        var tree = source.parseJS(false);
        var visitor = Visitor(source);
        var walker = new UglifyJS.TreeWalker(visitor.walk);
        tree.walk(walker);
        var def = visitor.result();
        source.clearNeeds();
        source.clearIncludes();
        def.needs.forEach(
            function(item) {
                source.addNeed(
                    source.absPath("cls/" + item + ".js")
                );
            }
        );
        var zip = source.zipJS();
        source.tag("def", def);
        source.tag("zip", zip);
        source.save();
        console.log("      zipped at "
                    + Math.floor(1000 * zip.length / source.content().length) / 10 + " %");
    }

    // Look for linked CSS file.
    var jsFile = source.file();
    var cssFile = jsFile.substr(0, jsFile.length - 2) + "css";
    if (FS.existsSync(cssFile)) {
        if (source.addInclude(cssFile)) {
            source.save();
        }
    } else {
        if (source.remInclude(cssFile)) {
            source.save();
        }
    }
    source.setUptodate();
};
