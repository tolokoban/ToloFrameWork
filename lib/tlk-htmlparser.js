var Tree = require("./htmltree");

var VOID_ELEMENTS = ["area", "base", "br", "col", "command", "embed", "hr", "img", "input", "keygen", "link", "meta", "param", "source", "track", "wbr"];

var rxEntity = /&[a-zA-Z]+;/;
var rxStartTag = /<\/[a-zA-Z_$][a-zA-Z0-9$_:-]*/;
var rxAttrib = /[ \t\n\r]*([a-zA-Z_$][a-zA-Z0-9$_:-]*)([ \t\n\r]*=[ \t\n\r]*("(\\"|[^"]+)"|'(\\'|[^']+)'))?/;
var rxEndTag = /[ \t\n\r]*>/;
var rxAutoCloseTag = /[ \t\n\r]*\/>/;
var rxCloseTag = /<\/[a-zA-Z_$][a-zA-Z0-9$_:-]*>/;

function parse(content) {
    var cursor = 0,
        index = 0,
        c, m,
        node,
        root = {children: []},
        stack = [root];

    function append(node) {
        if (node.type == Tree.TEXT
            && root.children.length > 0
            && root.children[root.children.length - 1].type == Tree.TEXT)
        {
            root.children[root.children - 1].text += node.text;
        } else {
            root.children.push(node);
        }
    }
    function flushText() {
        var text = content.substr(cursor, index - cursor);
        if (text.length > 0) {
            append({type: Tree.TEXT, text: text});
        }
        cursor = index;
    }
    function match() {
        var i, rule, rx, m;
        for (i = 0 ; i < arguments.length ; i++) {
            rule = arguments[i];
            rx = rule[0];
            m = rx.exec(content.substr(index));
            if (m) {
                rule[1](m);
                return true;
            }
        }
        return false;
    }

    while (index < content.length) {
        c = content.charAt(index);
        if (c == '&') {
            match([rxEntity, function (m) {
                // This is an HTML entity.
                flushText();
                index += m[0].length - 1;
                cursor = index + 1;
                append({type: Tree.ENTITY, text: m[0]});
            }]);
        }
        else if (c == '<') {
            flushText();
            match(
                [rxStartTag, function (m) {
                    
                }]
            );


            m = rxStartTag.exec(content.substr(index));
            if (m) {
                node = {type: Tree.TAG, name: m[0].substr(1), attribs: {}, children: []};
                index += m[0].length;
                for(;;) {
                    m = rxAttrib.exec(content.substr(index));
                    if (!m) break;
                    node.attribs[m[1]] = m[4] || m[5];
                    index += m[0].length;
                }
                m = rxAutoCloseTag.exec(content.substr(index));
                if (m) {
                    index += m[0].length - 1;
                    cursor = index + 1;
                    node.autoclose = true;
                    root.push(node);
                }
                else {
                    m = rxEndTag.exec(content.substr(index));
                    if (m) {
                        index += m[0].length - 1;
                        cursor = index + 1;
                        root.push(node);
                        if (VOID_ELEMENTS.indexOf(node.name.toLowerCase()) > -1) {
                            node.void = true;
                        } else {
                            stack.push(node);
                            root = node;
                        }
                    }
                }
            }
            index++;
        }
        index++;
    }
    flushText();

    return stack[0];
}


exports.parse = parse;
