var FS = require("fs");
var Path = require("path");

var CompilerCOM = require("./compiler-com");
var ParserHTML = require("./tlk-htmlparser");
var Source = require("./source");
var Babel = require("babel-core");
var Tree = require("./htmltree");
var Libs = require("./compiler-com-libs");
var JSON = require("./tolojson");
var Tpl = require("./template");


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
        // Code CSS.
        innerCSS: {},
        // CSS files.
        outerCSS: {},
        // Code Javascript to embed in `js/@index.js` file.
        innerJS: {},
        // If a dependent  file is newer that this HTML  file, we must
        // recompile the HTML file.
        dependencies: {},
        // Javascript modules required.
        require: {},
        // Javascript code to insert in a `DOMContentLoaded` event.
        initJS: {}
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

    var nameWithoutExt = src.name().substr(0, src.name().length - 5);
    var output = src.tag("output");
    var root = output.root;
    var head = findHead(root);
    var innerCSS = concatMap(output.innerCSS);
    var innerJS = Tpl.file("require.js").out + concatMap(output.innerJS);
    

    innerJS += getInitJS(output);

    writeInnerCSS(innerCSS, pathCSS, nameWithoutExt, head);
    writeInnerJS(innerJS, pathJS, nameWithoutExt, head);
    writeRequires(output.require, pathJS, pathCSS, head);

    FS.writeFileSync(
        Project.wwwPath("DEBUG/" + src.name()),
        Tree.toString(root)
    );

}


function concatMap(map) {
    if (!map) return '';
    var key, out = '';
    for (key in map) {
        if (out != '') out += "\n";
        out += key;
    }
    return out;
}


function findHead(root) {
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
    return head;
}


function getInitJS(output) {
    var js = concatMap(output.initJS);
    if (js.length > 0) {
        return Tpl.file("init.js", {INIT_JS: js}).out;
    }
    return js;
}


function writeInnerCSS(innerCSS, pathCSS, nameWithoutExt, head) {
    if (innerCSS.length > 0) {
        // Add inner CSS file.
        writeCSS('@' + nameWithoutExt + ".css", innerCSS);
        head.children.push(
            {type: Tree.TAG, name: 'link', void: true, attribs: {
                rel: "stylesheet", type: "text/css",
                href: "css/@" + nameWithoutExt + ".css"
            }}
        );
    }
}


function writeInnerJS(innerJS, pathJS, nameWithoutExt, head) {
    if (innerJS.length > 0) {
        // Add inner JS file.
        writeJS('@' + nameWithoutExt + ".js", innerJS);
        head.children.push(
            {type: Tree.TAG, name: 'script', attribs: {
                src: "js/@" + nameWithoutExt + ".js"
            }}
        );
    }
}


function writeRequires(modules, pathJS, pathCSS, head) {
    var out = {},
        fringe = [],
        moduleName,
        src,
        path,
        code,
        compilation;
    for (moduleName in modules) {
        fringe.push(moduleName);
        out[moduleName] = {};
    }

    while (fringe.length > 0) {
        moduleName = fringe.pop();
        path = "mod/" + moduleName + ".js";
        src = new Source(Project, path);
        code = Tpl.file("module.js", {name: moduleName, code: src.read(), intl: ''}).out;
        compilation = Babel.transform(
            code, 
            {
                plugins: [{transformer: require('./babel-plugin-uglify'), position: 'after'}],
                comments: false,
                compact: true,
                sourceMaps: true,
                sourceMapTarget: moduleName + ".js",
                sourceFileName: moduleName + ".js"
            }
        );
        compilation.code += "\n//# sourceMappingURL=" + moduleName + ".map";
        writeJS(moduleName, compilation.code, JSON.stringify(compilation.map));
        head.children.push(
            {type: Tree.TAG, name: 'script', attribs: {
                src: "js/" + moduleName + ".js"
            }}
        );

        var mode = 0, requiredModule = '';
        compilation.ast.tokens.forEach(function (tkn) {
            if (mode == 0) {
                if (tkn.type.label == 'name' && tkn.value == 'require') {
                    mode = 1;
                }
            }
            else if (mode == 1) {
                if (tkn.type.label == '(') {
                    mode = 2;
                } else {
                    mode = 0;
                }
            }
            else if (mode == 2) {
                if (tkn.type.label == 'string') {
                    requiredModule = tkn.value;
                    mode = 3;
                } else {
                    mode = 1;
                }
            }
            else if (mode == 3) {
                if (tkn.type.label == ')') {                    
                    console.log(requiredModule.yellow);
                    mode = 0;
                }
            }
        });

    }
    
}


function writeJS(name, content, sourceMap) {
    if (name.substr(-3) == '.js') {
        name = name.substr(0, name.length - 3);
    }
    var path = Path.join(Project.wwwPath("DEBUG/js"), name + ".js");
    FS.writeFileSync(path, content);
    if (sourceMap) {
        path = Path.join(Project.wwwPath("DEBUG/js"), name + ".map");
        FS.writeFileSync(path, sourceMap);
    }
}

function writeCSS(name, content) {
    var path = Path.join(Project.wwwPath("DEBUG/css"), name);
    FS.writeFileSync(path, content);
}


