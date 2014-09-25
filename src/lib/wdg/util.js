/**
 * @module util
 */

var Tree = require("../../htmltree");

/**
 * Split a text on commas.
 */
function splitter(text) {
    var arr = [],
    i, c, mode = 1,
    buff = '';
    for (i = 0 ; i < text.length ; i++) {
        c = text.charAt(i);
        switch (mode) {
        case 1:
            switch (c) {
            case "\\":
                mode = -mode; break;
            case "'":
                mode = 2; break;
            case '"':
                mode = 3; break;
            case ",":
                arr.push(buff.trim());
                buff = '';
                mode = 1;
                break;
            default:
                buff += c;
            }
            break;
        case 2:
            switch (c) {
            case "'": 
                mode = 1; break;
            case "\\": 
                mode = -mode; break;
            default:
                buff += c;
            }
            break;
        case 3:
            switch (c) {
            case '"': 
                mode = 1; break;
            case "\\": 
                mode = -mode; break;
            default:
                buff += c;
            }
            break;
        default:
            buff += c;
            mode = -mode;
        }
    }
    buff = buff.trim();
    if (buff.length > 0) {
        arr.push(buff.trim());
    }
    return arr;
}

exports.fireable = function(obj, root) {
    var attFire = Tree.att(root, "fire");
    var attFireArg = Tree.att(root, "fire-arg");
    if (attFire) {
        var fire = splitter(attFire);
        var fireArg;
        if (attFireArg) {
            fireArg = splitter(attFireArg);
            if (fire.length != fireArg.length) {
                throw "Attribute \"fire\" and \"fire-arg\" are both list, "
                    + "but without the same number of items!";
            }
        } else {
            var i, item, pos, sig, arg;
            fireArg = [];
            for (i = 0 ; i < fire.length ; i++) {
                item = fire[i];
                pos = item.indexOf(":");
                if (pos > -1) {
                    sig = item.substr(0, pos);
                    arg = item.substr(pos + 1);
                    fire[i] = sig;
                } else {
                    arg = "";
                }
                fireArg.push(arg);
            }
        }
        delete root.attribs.fire;
        delete root.attribs["fire-arg"];
        root.extra.init.fire = fire;
        root.extra.init.fireArg = fireArg;
    }
};

/**
 * Turn an element into a template one. A template is an element you can clone at runtime.
 * @return javascript code of the anonymous creation function. 
 * This function has two argument : 
 * * __tpl__: ID of the template element or an DOM element.
 * * __id__: ID of the cloned element.
 */
exports.templatize = function(root) {
    var code = "id+='.';";

    Tree.walk(
        root,
        function(node) {
            if (!node.extra) return;
            var x = node.extra;
            if (!x.controller) return;
            var id = x.init.id;
            delete x.init.id;
            code += "$$('" + x.controller + "',{id:id+" + id;
            var key, val;
            for (key in x.init) {
                val = x.init[key];
                code += "," + key + ":" + JSON.stringify(val);
            }

            code += "});\n";
            delete node.extra;
        }
    );
    code = "function(tpl,id){" + code + "}";
    return code;
};


function defaultConverter(txt) {
    return txt;
}

/**
 * Remove an attribute from the DOM element and copy it to the controller attributes.
 * @param root htmlnode in which you want to move an attribute.
 * @param att name of the attribute.
 * @param converter 
 * [optional] function that takes the attribute value as input and returns the value for the controller.
 * By default, we return the same string.
 */
exports.moveAttrib = function(root, att, converter) {
    if (!root.attribs) return undefined;
    if (!root.attribs[att]) return undefined;
    if (typeof converter !== 'function') converter = defaultConverter;
    var v = converter(root.attribs[att]);
    root.extra.init[att] = v;
    delete root.attribs[att];
    return v;
};
