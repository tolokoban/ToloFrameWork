/**
 * @module x-spc.com
 *
 * @description
 * Add an horizontal or vertical space.
 * * `<x-spc/>` is equivalent to `<x-spc w="1em"/>`
 * * `<x-spc w/>` is equivalent to `<x-spc w="1em"/>`
 * * `<x-spc h/>` is equivalent to `<x-spc h="1em"/>`
 * * `<x-spc w="3em" h="12px"/>` is equivalent to `<x-spc h="3em"/>`
 *
 * @example
 * <x-spc w="3em"/>
 * <x-spc h="12px"/>
 */

exports.tags = ["x-spc"];
exports.priority = 0;

/**
 * Compile a node of the HTML tree.
 */
exports.compile = function(root, libs) {
    root.children = [];
    var att = root.attribs || { w: "1em" };
    // Removing all attributes.
    root.attribs = { "class": "x-spc" };
    root.name = "div";
    if (att.w) {
        // Horizontal space.
        if (!att.w) att.w = "1em";
        root.attribs.class += " W";
        root.attribs.style = "width:" + att.w;
    } else {
        if (!att.h) att.h = "1em";
        // Vertical space.
        root.attribs.class += " H";
        root.attribs.style = "height:" + att.w;
    }
};
