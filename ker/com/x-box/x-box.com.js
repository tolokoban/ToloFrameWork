/**
 * Component x-box
 */

exports.tags = ["x-box"];
exports.priority = 0;

/**
 * Compile a node of the HTML tree.
 */
exports.compile = function(root, libs) {
    var att = root.attribs;
    var width = forceUnit( att.width || att.w || 280 );
    var height = forceUnit( att.height || att.h || 200 );

    var box = {
        type: libs.Tree.TAG, name: "div", children: root.children,
        attribs: {
            "class": "elevation-24",
            style: "width:" + width + ";height:" + height
        }
    };

    root.name = "div";
    root.children = [box];
    delete root.attribs.width;
    delete root.attribs.w;
    delete root.attribs.height;
    delete root.attribs.h;
    root.attribs.class = 'x-box';
};


var RX_NUMBER = /^[ \t\n]*[0-9]+[ \t\n]*$/;

function forceUnit( x ) {
    if (RX_NUMBER.test( x )) return x + "px";
    return x;
}
