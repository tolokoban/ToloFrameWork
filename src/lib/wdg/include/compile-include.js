/**
 * @module Include
 */


var FS = require("fs");

/**
 * Include a piece of HTML at current position.
 * @example
 * <w:include $name="my_name">page-help.htm</w:include>
 */
module.exports.precompile = function(root) {
    var Tree = this.Tree;
    var filename = Tree.text(root).trim();
    var file = this.srcOrLibPath(filename);
    if (!FS.existsSync(file)) {
        this.fatal(
            "Include file not found: \"" + filename + "\"!",
            -1, 
            "<w:include>"
        );
    }
    var stat = FS.statSync(file);
    if (!stat.isFile) {
        this.fatal("This is not a file: \"" + file + "\"!", -1, "<w:include>");
    }
    root.extra.dependencies.push(filename);
    var content = FS.readFileSync(file).toString().trim();
    delete root.type;
    delete root.name;
    root.type = Tree.VOID;
    if (root.attribs) {
        content = this.Template.text(content, root.attribs).out;
    }
    delete root.attribs;
    root.children = [Tree.parse(content)];
};
