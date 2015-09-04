var FS = require("fs");
var Path = require("path");

var Tree = require("./htmltree");
var Util = require("./util");
var Fatal = require("./fatal");
var Source = require("./source");
var Template = require("./template");
var CompilerCOM = require("./compiler-com");


module.exports = function(source, components, scopes) {
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
        setVar: setVar,
        getVar: getVar
    };
    setVar('$filename', source.name());

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
