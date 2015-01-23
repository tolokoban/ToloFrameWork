var Marked = require("marked");
var Highlight = require("./highlight");

var LANGUAGES = ['js', 'css', 'html', 'xml'];

Marked.setOptions(
    {
        // Git Flavoured Markdown.
        gfm: true,
        // Use tables.
        tables: true,
        highlight: function (code, lang) {
            return Highlight(code, lang);
        }
    }
);

module.exports.toHTML = function(content) {
    LANGUAGES.forEach(
        function(item) {
            content = content.replace('[' + item + ']', '```' + item + ' ');
            content = content.replace('[/' + item + ']', '```');
        }
    );

    return Marked(content);
};
