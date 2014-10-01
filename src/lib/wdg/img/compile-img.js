/**
 *
 * @module Img
 */

var Util = require("../util");

/**
 *
 * @example
 * <w:Img src="img/menu/quetes.png"></w:Img>
 */
exports.compile = function(root) {
    var N = this.Tree;
    var style = N.att(root, "style") || "";
    var src = N.att(root, "src");
    var file = this.srcOrLibPath(src);
    if (!file) {
        this.fatal("Unable to find image: " + src, this.ERR_FILE_NOT_FOUND, "<w:Img src='...'>");
    }
    var info = Util.getImageInfo(file);
    root.extra.innerCSS = "#" + root.attribs.id + ":not(.expand){width:"
        + info.width + "px;height:" + info.height + "px}";
    delete root.attribs.src;

    N.att(root, "style", "background-image:url('" + src + "');" + style);
    root.extra.resources.push(src);
};
