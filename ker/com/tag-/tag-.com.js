"use strict";

/**
 * Component tag:.+
 */

exports.tags = ["tag[\\-:].+"];
exports.priority = 0;

/**
 * Compile a node of the HTML tree.
 */
exports.compile = function(root, libs) {
    var children = [];
    root.name = root.name.substr(4);
    if (!root.attribs) {
        root.attribs = {};
    }
    root.children.forEach(function (child) {
        if (child.type == libs.Tree.TAG && child.name.substr(0, 3) == 'att' &&
            (child.name.charAt(3) == '-' || child.name.charAt(3) == ':'))
        {
            libs.compileChildren(child);
            var value = libs.Tree.text(child).trim();
            value = value.replace(/[\t ]*[\n\r]+[\t ]*/g, ' ');
            root.attribs[child.name.substr(4)] = value;
            children = [];
        } else {
            children.push(child);
        }
    });
    root.children = children;
    libs.compile(root);
};
