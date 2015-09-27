/**
 * Component x-md
 */

var Marked = require("./marked");
var S = require("string");

exports.tags = ["x-md"];
exports.priority = 0;

/**
 * Called the  first time the  component is  used in the  complete build
 * process.
 */
exports.initialize = function(libs) {};

/**
 * Called after the complete build process is over (success or failure).
 */
exports.terminate = function(libs) {};

/**
 * Called the first time the component is used in a specific HTML file.
 */
exports.open = function(file, libs) {};

/**
 * Called after a specific HTML file  as been processed. And called only
 * if the component has been used in this HTML file.
 */
exports.close = function(file, libs) {};

/**
 * Compile a node of the HTML tree.
 */
exports.compile = function(root, libs) {
    Marked.setOptions(
        {
            // Git Flavoured Markdown.
            gfm: true,
            // Use tables.
            tables: true
/*
            highlight: function (code, lang) {
                return Highlight.parseCode(code, lang, libs);
            }
*/
        }
    );

    var src = root.attribs.src,
        node,
        content,
        out;
    if (src) {
        // Loading form external file.
        if (!libs.fileExists(src)) {
            src += '.md';
        }
        if (!libs.fileExists(src)) {
            libs.fatal("File not found: \"" + src + "\"!");
        }
        node = libs.parseHTML(
            libs.readFileContent(src)
        );
        libs.compileChildren(node);
        content = libs.Tree.toString(node);
    } else {
        // Loading tag's content.
        root.type = libs.Tree.VOID;
        libs.compileChildren(root);
        content = libs.Tree.toString(root);
    }

    out = Marked(content);
    var tree = libs.parseHTML(out);

    root.name = "div";
    root.attribs = {"class": "x-md custom"};
    root.children = tree.children;
};
