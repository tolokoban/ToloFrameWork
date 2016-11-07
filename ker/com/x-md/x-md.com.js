/**
 * Component x-md
 */

var Marked = require("./marked");
var S = require("string");

exports.tags = ["x-md"];
exports.priority = 0;

/**
 * Compile a node of the HTML tree.
 */
exports.compile = function(root, libs) {
    Marked.setOptions(
        {
            // Git Flavoured Markdown.
            gfm: true,
            // Use tables.
            tables: true
/*
            highlight: function (code, lang) {
                return Highlight.parseCode(code, lang, libs);
            }
*/
        }
    );

    var src = (root.attribs || {}).src,
        node,
        content,
        out;
    if (src) {
        // Loading form external file.
        if (!libs.fileExists(src)) {
            src += '.md';
        }
        if (!libs.fileExists(src)) {
            libs.fatal("File not found: \"" + src + "\"!");
        }
        libs.addInclude(src);
        node = libs.parseHTML(
            libs.readFileContent(src)
        );
        libs.compileChildren(node);
        content = libs.Tree.toString(node);
    } else {
        // Loading tag's content.
        root.type = libs.Tree.VOID;
        libs.compileChildren(root);
        content = libs.Tree.toString(root);
    }

    var tree = libs.parseHTML( content );
    var newChildren = [];
    var markdown = '';
    var preservedTags = [];
    tree.children.forEach(function (child) {
        if (child.type != libs.Tree.TEXT) {
            markdown += "{{{MD-" + preservedTags.length + "}}}";
            preservedTags.push( libs.Tree.toString(child) );
        } else {
            markdown += child.text;
        }
    });
    
    out = Marked( markdown );
    newChildren.push( libs.parseHTML(restorePreservedTags( out, preservedTags )) );

    root.name = "div";
    root.attribs = {"class": "x-md custom"};
    root.children = newChildren;
};


function restorePreservedTags( html, preservedTags ) {
    var out = '';
    var cursor = 0;
    var pos;
    var c;
    var num;
    
    while(-1 != (pos = html.indexOf( "{{{MD-", cursor ))) {
        out += html.substr( cursor, pos - cursor );
        cursor = pos + 6;
        num = 0;
        for(;;) {
            c = html.charAt( cursor++ );
            if (c < '0' || c > '9') break;
            num = num * 10 + (c.charCodeAt(0) - 48);
        }
        if (html.substr( cursor - 1, 3 ) === '}}}') {
            out += preservedTags[num];
            cursor += 2;
        } else {
            cursor = pos + 1;
        }
    }
    
    out += html.substr( cursor );
    return out;
};
