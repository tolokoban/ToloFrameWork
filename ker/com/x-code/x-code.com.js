/**
 * Component x-code
 *
 * @example
 * <x-code>var toto = 'Hello World!';</x-code>
 * <x-code src="file.cpp" />
 * <x-code src="file.cpp" section="initialize-webgl" />
 */
var Highlight = require("./highlight");

var LANGUAGES = ['js', 'css', 'html', 'xml'];


exports.tags = ["x-code"];
exports.priority = 0;

/**
 * Called the  first time the  component is  used in the  complete build
 * process.
 */
exports.initialize = function(libs) {};

/**
 * Called after the complete build process is over (success or failure).
 */
exports.terminate = function(libs) {};

/**
 * Called the first time the component is used in a specific HTML file.
 */
exports.open = function(file, libs) {};

/**
 * Called after a specific HTML file  as been processed. And called only
 * if the component has been used in this HTML file.
 */
exports.close = function(file, libs) {};

/**
 * Compile a node of the HTML tree.
 */
exports.compile = function(root, libs) {
    if( typeof root.attribs === 'undefined' ) root.attribs = {};

    var src = root.attribs.src;
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
    if (root.attribs.section) code = restrictToSection( code, root.attribs.section );
    var highlightedCode = Highlight.parseCode(code, 'js', libs);
    root.type = libs.Tree.VOID;
    delete root.attribs;
    delete root.name;
    libs.Tree.text(root, highlightedCode);
};


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
