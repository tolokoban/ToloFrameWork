/**
 * @module Bind
 */

var Tree = require("../../htmltree");

/**
 * Bind the content of a SPAN on a data.
 * @example
 * <p>Hello <w:bind>name</w:bind>!</p>
 * <-- This is equivalent to -->
 * <p>Hello {{name}}!</p>
 */
module.exports.compile = function(root) {
    var name = Tree.text(root).trim() ;
    root.name = "span";
    root.extra.init.data = name;
}
