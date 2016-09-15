/**
 * Component intl:
 */

exports.tags = ["intl:.+"];
exports.priority = 0;

var ID = 0;

/**
 * Compile a node of the HTML tree.
 */
exports.compile = function(root, libs) {
    // For <intl:my-title/>, `textId` will be "my-title".
    var textId = root.name.substr( 5 );
    
    libs.require("x-intl");
    libs.addInitJS("var I = require('x-intl');");
    root.children = [];
    root.name = "span";
    root.type = libs.Tree.TAG;
    delete root.autoclose;
    root.attribs = {
        id: "_I" + ID,
        style: "display:none"
    };
    libs.addPostInitJS("I(" + ID + "," + JSON.stringify(textId) + ")");
    ID++;
};
