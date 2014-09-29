/**
 *
 * @module Img
 */


/**
 *
 * @example
 * <w:Img src="img/menu/quetes.png"></w:Img>
 */
exports.compile = function(root) {
    var N = this.Tree;
    var style = N.att(root, "style") || "";
    var src = N.att(root, "src");
    delete root.attribs.src;
    N.att(root, "style", "background-image:url('" + src + "');" + style);
    root.extra.resources.push(src);
};