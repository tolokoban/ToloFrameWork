var FS = require("fs");
var Template = require("./template");

exports.parse = function(file) {
    var content = FS.readFileSync(file).toString();
    var dic = {};
    var currentLang = null;
    content.split("\n").forEach(
        function(line, idx) {
            line = line.trim();
            if (line == '') return;
            var c = line.charAt(0);
            if (c == '#' || c == '/') return;
            var pos, lang, key, text;
            if (c == '[') {
                pos = line.indexOf(']');
                lang = line.substr(1, pos - 1).toLowerCase();
                currentLang = dic[lang];
                if (!currentLang) {
                    dic[lang] = {};
                    currentLang = dic[lang];
                }
                return;
            }
            if (c == '_' || (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z')) {
                pos = line.indexOf(':');
                key = line.substr(0, pos).trim();
                text = line.substr(pos + 1).trim();
                currentLang[key] = text;
            }
        }
    );

    var params = {dico: JSON.stringify(dic)};
    return Template.file("intl.js", params).out;
};