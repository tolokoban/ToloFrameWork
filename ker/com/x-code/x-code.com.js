/**
 * Component x-code
 *
 * @example
 * <x-code>var toto = 'Hello World!';</x-code>
 * <x-code src="file.cpp" />
 * <x-code src="file.cpp" section="initialize-webgl" />
 */
var Highlight = require("./highlight");

var LANGUAGES = ['js', 'glsl', 'css', 'html', 'xml'];


exports.tags = ["x-code"];
exports.priority = 0;

/**
 * Compile a node of the HTML tree.
 */
exports.compile = function(root, libs) {
    if( typeof root.attribs === 'undefined' ) root.attribs = {};

    var src = root.attribs.src;
    var lang = root.attribs.lang || 'js';
    if (LANGUAGES.indexOf( lang ) === -1) {
      libs.fatal("Unknown language: " + lang + "!");
    }
    var code = '';
    if (src) {
        if (!libs.fileExists(src)) {
            src += '.js';
        }
        if (!libs.fileExists(src)) {
            libs.fatal("File not found: \"" + src + "\"!");
        }
        libs.addInclude(src);
        code = libs.readFileContent(src);
    } else {
        code = libs.Tree.text(root);
    }
    if (root.attribs.section) {
      code = restrictToSection( code, root.attribs.section );
      if( code.length === 0 ) {
        libs.fatal("Unable to find section #(" + root.attribs.section + ")");
      }
    }
    code = removeLeftMargin( code );
    var highlightedCode = Highlight.parseCode(code, lang, libs);
    root.type = libs.Tree.VOID;
    delete root.attribs;
    delete root.name;
    libs.Tree.text(root, highlightedCode);
};

/**
 * Remove common indentation.
 */
function removeLeftMargin( code ) {
  var margin = 999;
  var lines = code.split("\n");
  lines.forEach(function (line) {
    var s = line.length;
    var m = 0;
    while( m < s && line.charAt(m) == ' ' ) m++;
    margin = Math.min( m, margin );
  });
  return lines.map(function(line) {
    return line.substr( margin );
  }).join("\n");
}

/**
 * it can be useful to restrict the display to just a section of the entire file.
 * Such sections must start with the following line where we find it's name.
 * Look at the definition of the section `init` in the following example.
 *
 * @example
 *   var canvas = $.elem( this, 'div' );
 *   // #(init)
 *   var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
 *   gl.clearColor(0.0, 0.3, 1.0, 1.0);
 *   gl.enable(gl.DEPTH_TEST);
 *   gl.depthFunc(gl.LEQUAL);
 *   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
 *   // #(init)
 *
 */
function restrictToSection( code, section ) {
    var linesToKeep = [];
    var outOfSection = true;
    var lookFor = '#(' + section + ')';

    code.split('\n').forEach(function( line ) {
        if (outOfSection) {
            if (line.indexOf( lookFor ) > -1) {
                outOfSection = false;
            }
        } else {
            if (line.indexOf( lookFor ) > -1) {
                outOfSection = true;
            } else {
                linesToKeep.push( line );
            }
        }
    });

    return linesToKeep.join('\n');
}
