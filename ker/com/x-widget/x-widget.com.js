/**
 * Component x-widget
 */

exports.tags = ["x-widget"];
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
    var name = root.attribs.name;
    if (!name || name.length == 0) {
        libs.fatal("[x-widget] Missing attribute \"name\"!");
    }
    var id = root.attribs.id || name;
    root.attribs = {
        id: id,
        style: "display:none"
    };
    var args = libs.Tree.text(root).trim();
    if (args.charAt(0) == '{' || args.charAt(0) == '[') {
        try {
            args = JSON.parse(args);
        }
        catch (ex) {
            libs.fatal("Invalid JSON: " + args);
        }
    }
    root.children = [];
    root.name = "div";
    delete root.autoclose;

    libs.require(name);
    libs.require("x-widget");
    libs.addInitJS("require('x-widget')('" + id + "','" + name + "'," + JSON.stringify(args) + ");");
};
