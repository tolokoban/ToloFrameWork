var UglifyJS = require("uglify-js");
var JSON = require("./tolojson");

var declarations = {};
var rxTest = /^[ \t]*\[[ \t]*([a-z_][a-z_0-9]*)[ \t]*(=[^\]]+)?[ \t]*\]/i;
function test(tree, path) {
    var i, k, c, item;
    var items = path.split("/");
    var m, key, val;
    for (i = 0 ; i < items.length ; i++) {
        item = items[i].trim();
        if (item == ("" + parseInt(item))) {
            if (!Array.isArray(tree)) return false;
            tree = tree[parseInt(item)];
        }
        else {
            while(item.length > 0) {
                m = item.match(rxTest);
                if (!m) break;
                key = m[1];
                val = m[2];
                if (!val) {
                    val = key;
                    key = "TYPE";
                } else {
                    val = val.substr(1);
                }
                if (tree[key] != val) return false;
                item = item.substr(m[0].length);
            }
            key = item.trim();
            if (key.length > 0) {
                tree = tree[key];
                if (typeof tree === 'undefined') return false;
            }
        }
    }
    return true;
}

function comments(node) {
    var comments = node.start.comments_before;
    if (comments.length == 0) return "";
    comments = comments[comments.length - 1].value.trim();
    return comments;
}

module.exports = function(code) {
    declarations = {};
    var tree = UglifyJS.parse(code);
    var items = tree.body;
    items.forEach(
        function(node) {
            var name, method, declaration;
            if (test(node, "[Var]definitions/0/[VarDef]value/[Function]")) {
                name = node.definitions[0].name.name;
                declarations[name] = {
                    TYPE: "Function",
                    name: name,
                    comments: comments(node)
                };
            }
            else if (
                test(
                    node, 
                    "[SimpleStatement]body/[Assign]left/[Dot]expression/[Dot][property=prototype]"
                )
            ) 
            {
                name = node.body.left.expression.expression.name;
                declaration = declarations[name];
                if (declaration) {
                    declaration.TYPE = "Class";
                    if (typeof declaration.methods !== 'object') {
                        declaration.methods = {};
                    }
                    method = node.body.left.property;
                    declaration.methods[method] = {
                        TYPE: "Method",
                        name: method,
                        comments: comments(node)
                    };
                }
            }
        }
    );
console.log(JSON.stringify(declarations, "  "));
    return tree;
};
