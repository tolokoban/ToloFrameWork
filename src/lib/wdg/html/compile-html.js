/**
 * @module Html
 */

/**
 *
 */
module.exports.compile = function(root) {
    var Tree = this.Tree;
    var app = Tree.att(root, "app");
    var title = Tree.att(root, "title") || "Toloframework";
    var body = Tree.tag("body", {}, root.children);
    if (app) {
        Tree.att(body, "app", app);
    }
    var head = [
        Tree.tag(
            "meta", {"http-equiv": "Content-Type", content: "text/html; charset=UTF-8"}
        ),
        Tree.tag(
            "meta", {"http-equiv": "description", content: title}
        ),
        Tree.tag(
            "meta", {"http-equiv": "X-UA-Compatible", content: "IE=Edge"}
        ),
        Tree.tag(
            "meta", {"http-equiv": "apple-mobile-web-app-capable", content: "yes"}
        ),
        Tree.tag(
            "meta", {
                "http-equiv": "viewport",
                content: "width=device-width, user-scalable=no"
            }
        )
    ];
    if (title) {
        var titleTag = Tree.tag("title");
        Tree.text(titleTag, title);
        head.push(titleTag);
    }
    root.name = "html";
    root.children = [
        Tree.tag("head", null, head),
        body
    ];
};
