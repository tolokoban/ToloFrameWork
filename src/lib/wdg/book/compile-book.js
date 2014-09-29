/**
 *
 * @module Book
 */


/**
 * Display one child element at the time and provide nice transition between pages.
 * @example
 * <w:Book></w:Book>
 */
exports.compile = function(root) {
    var N = this.Node;
    N.keepOnlyTagChildren(root);
};





/**
 * A book is made of sliding pages.
 */
exports.parse = function(node, source, Node) {
    var div = Node.createFrom(node, "div");
    var children = [];
    var func = function(child) {
        if (child.type == Node.TAG) {
            if (child.attribs) {
                if (child.attribs["-name"]) {
                    // The page's name is usefull to switch to the page.
                    child.attribs["data--name"] = child.attribs["-name"];
                    delete child.attribs["-name"];
                }
            }
            children.push(child);
        }
        else if (!child.type) {
            Node.forEachChild(child, func);
        }
    };
    // Keep only true elements as pages.
    Node.forEachChild(div, func);
    div.children = children;
    Node.addClass(div, "wtag-book");
    return div;
};
