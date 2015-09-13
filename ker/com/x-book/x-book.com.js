/**
 * Component x-book
 */

exports.tags = ["x-book"];
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
    libs.require("tfw.wdg.book");
    var id = root.attribs.id || libs.nextID();
    root.name = "div";
    root.attribs.id = id;
    libs.addInitJS("require('tfw.wdg.book')('" + id + "');");
};
