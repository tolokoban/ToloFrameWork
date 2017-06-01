var Path = require("path");

var TOKENS = {
    js: {
        space: /^[ \t]+/,
        comment: /^(\/\/[^\n]*[\n]|\/\*([^\*]+|\*[^\/])*\*\/)/,
        "function": /^([$_a-zA-Z][$_a-zA-Z0-9]*)(?=([ \n\r\t]*\())/,
        string: /^("(\\"|[^"])*")|('(\\'|[^'])*')/,
        keyword: /^(?:[^a-zA-Z$_0-9])(break|continue|do|for|import|new|this|void|case|default|else|function|in|return|typeof|while|comment|delete|export|if|label|switch|var|with|catch|enum|throw|class|extends|try|const|finally|debugger|super|let)(?=[^a-zA-Z$_0-9])/,
        keyword2: /^(?:[^a-zA-Z$_0-9])(window|require|module|exports)(?=[^a-zA-Z$_0-9])/,
        number: /^[-+]?[0-9]+/,
        regexp: /^\/(\\\/|[^\/\n\t])+\/[gmi]*/,
        symbol: /^\[\(\),;:\{\}\[\]]+/,
        operator: /^(\&[a-zA-Z]+;|===|!==|==|!=|<=|>=|<|>|\|\||&&|\*|\+|\-|\/|%|[\+=&\|\-]+)/
    }
};

var rxLT = /</g;
var rxGT = />/g;
var rxAMP = /&/g;

function h(code, lang, libs) {
    var N = libs.Tree;
    code = code.trim();
    var tokens = TOKENS[lang] || TOKENS.js,
        buff = '',
        idx = 0,
        key,
        rx,
        match,
        found,
        c;
    try {
        code = code.replace(rxAMP, '&amp;');
        code = code.replace(rxLT, '&lt;');
        code = code.replace(rxGT, '&gt;');
        while (idx < code.length) {
            found = false;
            for (key in tokens) {
                rx = tokens[key];
                match = rx.exec(code.substr(idx));
                if (match) {
                    buff += '<span class="' + key + '">' + match[0] + "</span>";
                    idx += match[0].length;
                    found = true;
                    break;
                }
            }
            if (!found) {
                buff += code.charAt(idx);
                idx++;
            }
        }
    }
    catch (ex) {
        libs.fatal("Unexpected error while highlighting '" + lang + "' code!\n" + ex);
    }
    buff = "<pre class='custom highlight " + lang + "'>\n    " +
        buff.split('\n').join('\n    ') + "</pre>";
    return buff;
}

h.cssFile = Path.join(__dirname, "highlight.css");

exports.parseCode = h;
