var CompilerCOM = require("./compiler-com");
var ParserHTML = require("./tlk-htmlparser");
var Source = require("./source");
var Tree = require("./htmltree");
var Libs = require("./compiler-com-libs");
var JSON = require("./tolojson");

var Project,
Components,
Scopes;



exports.initialize = function(prj) {
    Project = prj;
    Components = {};
    Scopes = [{}];
    CompilerCOM.loadComponents(prj);
};

exports.terminate = function() {
};

/**
 * @param {string} file Full path of the HTML file to compile.
 */
exports.compile = function(file) {
    var sourceHTML = new Source(Project, file);
    console.log("Compile HTML: " + sourceHTML.name().cyan);
    Scopes[0].$filename = sourceHTML.name();
    var root = ParserHTML.parse(sourceHTML.read());
//console.log(JSON.stringify(root, '  ').green);
    var libs = Libs(sourceHTML, Components, Scopes);
    libs.compile(root);
console.log("----------------------------------------".yellow);
debugger;
    console.log(Tree.toString(root));
console.log("----------------------------------------".yellow);
};



