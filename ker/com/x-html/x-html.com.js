/**
 * Component x-html, w:html
 */

exports.tags = ["x-html", "w:html"];
exports.priority = 0;

/**
 * Called the  first time the  component is  used in the  complete build
 * process.
 */
exports.initialize = function(libs) {};

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
    var N = libs.Tree,
    head = {type: N.TAG, name: "head", children: []},
    body = {type: N.TAG, name: "body", children: []};
    N.forEachAttrib(root, function (attName, attValue) {
        if (attName.toLowerCase() == 'title') {
            head.children.push(N.tag("title", {}, attValue));
        }
    });
    N.forEachChild(root, function (child) {
        if (child.type == N.TAG) {
            if (child.name.toLowerCase() == 'head') {
                N.forEachChild(child, function(subchild) {
                    head.child.push(subchild);
                });
            } 
            else if (child.name.toLowerCase() == 'body') {
                body.attribs = child.attribs;
                N.forEachChild(child, function(subchild) {
                    body.child.push(subchild);
                });
            } else {
                body.children.push(child);
            }
        } else {
            body.children.push(child);
        }
    });

    root.name = "html";
    delete root.attribs;
    libs.compileChildren(head);
    libs.compileChildren(body);
    root.children = [head, body];
};
