var FS = require("fs");
var Path = require("path");

var Tree = require("./htmltree");
var Util = require("./util");
var Fatal = require("./fatal");
var Source = require("./source");
var Template = require("./template");
var ParserHTML = require("./tlk-htmlparser");
var CompilerCOM = require("./compiler-com");


module.exports = function(source, components, scopes, output) {
    var ID = 0;
    function setVar(key, val) {
        scopes[scopes.length - 1][key] = val;
    }
    function getVar(key) {
        var k, v;
        for (k = scopes.length - 1; k >= 0; k--) {
            v = scopes[k][key];
            if (typeof v !== 'undefined') {
                return v;
            }
        }
        return '';
    }
    var prj = source.prj(),
    libs = {
        Tree: Tree,
        Template: Template,
        fatal: function(msg) {
            Fatal.fire(msg, "Component");
        },
        nextID: function() {
            ID++;
            return 'x-' + ID;
        },
        setVar: setVar,
        getVar: getVar,
        fileExists: function(relPath) {
            var absPath = source.getPathRelativeToSource(relPath);
            return FS.existsSync(absPath);
        },
        readFileContent: function(relPath) {
            var absPath = source.getPathRelativeToSource(relPath);
            if (!FS.existsSync(absPath)) return "";
            return FS.readFileSync(absPath).toString();
        },
        addInnerCSS: function(contentCSS) {
            output.innerCSS[contentCSS] = 1;
        },
        addInitJS: function(code) {
            output.initJS[code] = 1;
        },
        addInclude: function(src) {
            output.include[src] = 1;
        },
        addResourceText: function(name, dst, txt) {
            output.resource[name] = {dst: dst, txt: txt};
        },
        require: function(moduleName) {
            output.require[moduleName] = 1;
        },        
        parseHTML: ParserHTML.parse
    };

    var cfg = prj._config;
    setVar('$filename', source.name());
    setVar('$title', cfg.name);
    setVar('$author', cfg.author);
    setVar('$version', cfg.version);


    function compileChildren(root) {
        if (Array.isArray(root.children)) {
            root.children.forEach(function (child) {
                libs.compile(child);
            });
        }
    }
    libs.compileChildren = compileChildren;
    libs.compile = function(root) {
        if (root.type !== Tree.TAG) {
            compileChildren(root);
            return;
        } else {
            var component = CompilerCOM.getCompilerForTag(root.name);
            if (component) {
                if (component.$.css) {
                    libs.addInnerCSS(component.$.css);
                }
                try {
                    scopes.push({});
                    component.compile(root, libs);
                    scopes.pop();
                }
                catch (ex) {
                    Fatal.bubble(ex, "Tag: " + root.name + ", HTML file: " + source.name());
                }
            } else {
                // This is a standard TAG. Let's loop on children.
                compileChildren(root);
            }
        }
    };
    return libs;
};
