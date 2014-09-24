/**
 * @module Input
 */

var Util = require("../util");
var Tree = require("../../htmltree");

/**
 * @example
 * <w:input data="name" valid="@popup:welcome"></w:input>
 */
module.exports.compile = function(root) {
    Util.fireable(this, root);
    Tree.addClass(root, "wtag-input");
    root.name = "input";
    root.extra.init.data = root.attribs.data;
};
