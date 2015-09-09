var FS = require("fs");
var Path = require("path");

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
    // Stuff to create HTML file.
    var output = {
        innerCSS: {},
        outerCSS: {},
        dependencies: {}
    };
    var libs = Libs(sourceHTML, Components, Scopes, output);
    libs.compile(root);
    output.root = root;
    sourceHTML.tag("output", output);

    link(sourceHTML);
    console.log("Done!".green);
};


function link(src) {
    var pathWWW = Project.wwwPath("DEBUG");
    var pathJS = Path.join(pathWWW, "js");
    var pathCSS = Path.join(pathWWW, "css");

    Project.mkdir(pathJS);
    Project.mkdir(pathCSS);

    var nameWithoutExt = src.name().substr(0, src.name().length - 4);
    var output = src.tag("output");
    var root = output.root;
    var head = Tree.getElementByName(root, "head");
    if (!head) {
        // There is no <head> tag. Create it!
        var html = Tree.getElementByName(root, "html");
        if (!html) {
            html = {type: Tree.TAG, name: "html", children: []};
            root.children.push(html);
        }
        head = {type: Tree.TAG, name: "head", children: []};
        html.children.push(head);
    }
    var innerCSS = concatMap(output.innerCSS);
    if (innerCSS.length > 0) {
        // Add inner CSS file.
        FS.writeFileSync(Path.join(pathCSS, '@' + nameWithoutExt + ".css"), innerCSS);
        head.children.push(
            {type: Tree.TAG, name: 'link', void: true, attribs: {
                rel: "stylesheet", type: "text/css",
                href: "css/@" + nameWithoutExt + ".css" 
            }}
        );
    }

    FS.writeFileSync(
        Project.wwwPath("DEBUG/" + src.name()),
        Tree.toString(root)
    );

}


function concatMap(map) {
    if (!map) return '';
    var key, out = '';
    for (key in map) {
        out += key;
    }
    return out;
}
