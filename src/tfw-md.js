var Markdown = require("markdown");
var JSON = require("./tolojson");

var LANGUAGES = ['js', 'css', 'html', 'xml'];

function walk(arr) {
    if (!Array.isArray(arr)) return null;
    if (arr[0] == 'inlinecode') {
        var content = arr[1];
        var pos = content.indexOf("\n");
        if (pos < 0) return null;
        var language = content.substr(0, pos).trim();
        if (LANGUAGES.indexOf(language) < 0) return null;
        return "<pre>" // class='code-highlight " + language + "'>"
            + content.substr(pos + 1) + "</pre>";
    } else {
        arr.forEach(
            function(item, idx) {
                var result = walk(item);
                if (typeof result === 'string') {
                    arr[idx] = result;
                }
            }
        );
        return null;
    }
}

module.exports.toHTML = function(content) {

    LANGUAGES.forEach(
        function(item) {
            content = content.replace('[' + item + ']', '```' + item + ' ');            
            content = content.replace('[/' + item + ']', '```');            
        }
    );
    var tree = Markdown.markdown.parse(content);
    console.log(JSON.stringify(tree, "  ").green.bold);
    walk(tree);
    console.log(JSON.stringify(tree, "  ").yellow.bold);
    var txt = Markdown.markdown.renderJsonML(Markdown.markdown.toHTMLTree(tree));
    return txt;
};
