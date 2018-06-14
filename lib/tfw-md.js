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
      content = replaceAll( content, '[' + item + ']', '```' + item + ' ' );
      content = replaceAll( content, '[/' + item + ']', '```' );
    }
  );

  return Marked( content );
};


function replaceAll( str, search, replace ) {
  return str.split( search ).join( replace );
}
