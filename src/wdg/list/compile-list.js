/**
 *
 * @module list
 */

var Util = require("../util");
var Tree = require("../../htmltree");

/**
 * Display a binded list. Items are clones of the chldren of the list.

 * @example
 * <ul>
 *   <w:list list="names" item="name">
 *     <li>{{name}}}</li>
 *   </w:list>
 * </ul>
 */
exports.compile = function(root) {
    Tree.keepOnlyTagChildren(root);
    if (!root.attribs) root.attribs = {};
    root.name = root.attribs.tag || "div";
    Tree.addClass(root, "wtag-list");
    var tplId, tpl;
    if (root.children > 1) {
        tplId = Tree.nextId();
        root.children = [
            {
                type: Tree.TAG,
                name: "div",
                attribs: {id: tplId},
                children: root.children
            }
        ];
        tpl = root.children[0];
    } else {
        tpl = root.children[0];
        if (!tpl.attribs) tpl.attribs = {};
        tplId = tpl.attribs.id;
        if (!tplId) {
            tplId = Tree.nextId();
            tpl.attribs.id = tplId;
        }
    }
    tpl.attribs.style = "display:none";
    tplId = tpl.attribs.id;
    root.extra.init.maker = Util.templatize(tpl);
    root.extra.init.tpl = tplId;
    Util.moveAttrib(root, "list");
    Util.moveAttrib(root, "item");
};
