/**
 * @module Include
 */


var FS = require("fs");

/**
 * @summary
 * Include a piece of HTML at current position.
 */
module.exports.compile = function(root) {
    var Tree = this.Tree;
    var filename = Tree.att(root, "src").trim();
    var file = this.srcPath(filename);
    if (!FS.existsSync(file)) {
        throw "Include file not found: \"" + file + "\"!";
    }
    var stat = FS.statSync(file);
    if (!stat.isFile) {
        throw "";
    }
    var content = FS.readFileSync(file).toString().trim();
    delete root.type;
    delete root.name;
    delete root.params;
    root.children = [Tree.parse(content)];
};
