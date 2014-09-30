/**
 * @module util
 */

var FS = require("fs");
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


/**
 * Get size and type from a PNG, JPG, GIF or BMP file.
 * @return an object with three attributes:
 * * __type__: "PNG", "JPG" or "GIF".
 * * __width__: width in pixels.
 * * __height__: height in pixels.
 * @example
 * Util.getImageInfo("logo.png") == {type: "PNG", width: 320, height: 240}
 */
exports.getImageInfo = function(file) {
    var info = {type: null, width: 0, height: 0};
    if (FS.existsSync(file)) {
        var BUFF_SIZE = 32;
        var buffer = new Buffer(BUFF_SIZE);
        var fd = FS.openSync(file, "r");
        var header = FS.readSync(fd, buffer, 0, BUFF_SIZE, 0);
        FS.close(fd);
        if (buffer[1] == 80 && buffer[2] == 78 && buffer[3] == 71 
            && buffer[4] == 13 && buffer[5] == 10 
            && buffer[6] == 26 && buffer[7] == 10) 
        {
            // This is a PNG file: http://www.w3.org/TR/PNG/
            info.type = 'PNG';
            if (buffer[12] == 0x49 && buffer[13] == 0x48 && buffer[14] == 0x44 && buffer[15] == 0x52) {
                info.width = (buffer[16] * 256 * 256 * 256) + (buffer[17] * 256 * 256) 
                    + (buffer[18] * 256) + buffer[19];
                info.height = (buffer[20] * 256 * 256 * 256) + (buffer[21] * 256 * 256) 
                    + (buffer[22] * 256) + buffer[23];
            }
        }
        if (buffer[0] == 0x47 && buffer[1] == 0x49 && buffer[2] == 0x46) {
            // This is a GIF file: http://www.w3.org/Graphics/GIF/spec-gif89a.txt
            info.type = "GIF";
            info.width = (buffer[7] * 256) + buffer[6];
            info.height = (buffer[9] * 256) + buffer[8];
            return info;
        }
        if (buffer[0] == 0xFF && buffer[1] == 0xD8 && buffer[2] == 0xFF && buffer[3] == 0xE0) {
            // This is a JPG file:
            info.type = "JPG";
            var size = buffer[4] * 256 + buffer[5];
            var idx = 6 + size;
            var jpegType;
            while (1) {
                buffer = new Buffer(BUFF_SIZE);
                fd = FS.openSync(file, "r");
                buffer = FS.readSync(fd, buffer, idx, BUFF_SIZE, idx);
                FS.close(fd);
                if (buffer.length == 0) {
                    throw {fatal: "Unable to find JPEG dimension: " + file};
                }
                if (buffer[0] != 0xFF) {
                    throw {fatal: "Invalid JPEG format: " + file};
                }
                jpegType = buffer[1];
                if (jpegType == 0xC2 || jpegType == 0xC0) {
                    info.height = buffer[5] * 256 + buffer[6];
                    info.width = buffer[7] * 256 + buffer[8];
                    return info;
                }
                size = buffer[2] * 256 + buffer[3];
                idx += 4 + size;                
            }
        }
    }
    return info;
};
