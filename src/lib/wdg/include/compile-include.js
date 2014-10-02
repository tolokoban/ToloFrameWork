/**
 * @module Include
 */


var FS = require("fs");

/**
 * @summary
 * Include a piece of HTML at current position.
 * <w:include>page-help.htm</w:include>
 */
module.exports.precompile = function(root) {
    var Tree = this.Tree;
    var filename = Tree.text(root).trim();
    var file = this.srcOrLibPath(filename);
    if (!FS.existsSync(file)) {
        this.prj.fatal("Include file not found: \"" + file + "\"!", -1, "<w:include>");
    }
    var stat = FS.statSync(file);
    if (!stat.isFile) {
        this.prj.fatal("This is not a file: \"" + file + "\"!", -1, "<w:include>");
    }
    root.extra.dependencies.push(filename);
    var content = FS.readFileSync(file).toString().trim();
    delete root.type;
    delete root.name;
    delete root.attribs;
    root.type = Tree.VOID;
    root.children = [Tree.parse(content)];
};
