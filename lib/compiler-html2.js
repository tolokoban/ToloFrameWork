var FS = require("fs");
var Path = require("path");

var CompilerINI = require("./compiler-ini");
var CompilerCOM = require("./compiler-com");
var ParserHTML = require("./tlk-htmlparser");
var UglifyJS = require("uglify-js");
var Source = require("./source");
var Fatal = require("./fatal");
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
exports.compile = function(file, options) {
    var sourceHTML = new Source(Project, file),
    output;
    Scopes[0].$filename = sourceHTML.name();
    console.log("Compile HTML: " + sourceHTML.name().cyan);
    var root = ParserHTML.parse(sourceHTML.read());
    output = compileRoot(root, sourceHTML, options);
    while (typeof root.type === 'undefined' && root.children && root.children.length == 1) {
        root = root.children[0];
    }
    if (root.type == Tree.PAGES) {
        root.children.forEach(function (child, idx) {
            console.log(("  Page " + (idx + 1)).cyan);
            var src = sourceHTML;
            if (idx != 0) {
                src = new Source(Project, file.substr(0, file.length - 4) + idx + '.html');
            }
            output = compileRoot(child, src, options, output);                
            src.tag("output", output);
            link(src, options);
        });

    } else {
        sourceHTML.tag("output", output);
        link(sourceHTML, options);
    };
    console.log("Done!".green);
};

function compileRoot(root, sourceHTML, options, output) {
    // Stuff to create HTML file.
    if (typeof output === 'undefined') output = {
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
    libs.compile(root, options);
    Tree.trim(root);
    output.root = root;
    return output;
}


function link(src, options) {
    var pathWWW = Project.wwwPath();
    var pathJS = Path.join(pathWWW, "js");
    var pathCSS = Path.join(pathWWW, "css");

    Project.mkdir(pathJS);
    Project.mkdir(Path.join(pathJS, "src"));
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
    writeRequires(output.require, pathJS, pathCSS, head, options);

    FS.writeFileSync(
        Project.wwwPath(src.name()),
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


function writeRequires(modules, pathJS, pathCSS, head, options) {
    var cache = {},
    fringe = [],
    moduleName,
    src,
    path,
    dependencies;
    // Always include the module `$`.
    modules.$ = 1;
    for (moduleName in modules) {
        fringe.push(moduleName);
    }
    while (fringe.length > 0) {
        moduleName = fringe.pop();
        cache[moduleName] = 1;
        // JS.
        path = "mod/" + moduleName + ".js";
        src = compileJS(path, options);
        writeJS(moduleName, src.tag('zip'), options.noMap ? '' : JSON.stringify(src.tag('map')));
        head.children.push(
            {type: Tree.TAG, name: 'script', attribs: {
                src: "js/" + moduleName + ".js"
            }}
        );
        dependencies = src.tag("dependencies");
        if (Array.isArray(dependencies)) {
            dependencies.forEach(function (dep) {
                if (!cache[dep]) {
                    fringe.push(dep);
                }
            });
        }
        // CSS.
        path = "mod/" + moduleName + ".css";
        src = compileCSS(path);
        if (src) {
            writeCSS(moduleName, src.tag('zip'), src.tag('map'));
            head.children.push(
                {type: Tree.TAG, name: 'link', attribs: {
                    rel: "stylesheet", type: "text/css",
                    href: "css/" + moduleName + ".css"
                }}
            );
        }
    }
}


function writeJS(name, sourceZip, sourceMap) {
    if (name.substr(-3) == '.js') {
        name = name.substr(0, name.length - 3);
    }
    var path = Path.join(Project.wwwPath("js"), name + ".js");
    FS.writeFileSync(path, sourceZip);
    if (sourceMap) {
        path = Path.join(Project.wwwPath("js"), name + ".js.map");
        FS.writeFileSync(path, sourceMap);
    }
    // Look for resources.
    var src = Project.srcOrLibPath("mod/" + name);
    if (FS.existsSync(src)) {
        var dst = Path.join(Project.wwwPath("css"), name);
        Project.copyFile(src, dst);
    }
}

function writeCSS(name, content, sourceMap) {
    if (name.substr(-4) == '.css') {
        name = name.substr(0, name.length - 4);
    }
    var path = Path.join(Project.wwwPath("css"), name + ".css");
    FS.writeFileSync(path, content);
    if (sourceMap) {
        path = Path.join(Project.wwwPath("css"), name + ".css.map");
        FS.writeFileSync(path, sourceMap);
    }
}


function moduleExists(requiredModule) {
    var path = Project.srcOrLibPath("mod/" + requiredModule + ".js");
    if (path) return true;
    return false;
}

function minifyJS(name, code) {
    var minification = UglifyJS.minify(code, {
        fromString: true,
        outSourceMap: name + ".map"
    });
    var sourceMap = JSON.parse(minification.map);
    sourceMap = {
        version: sourceMap.version,
        file: sourceMap.file,
        sources: [name],
        sourcesContent: [code],
        names: sourceMap.names,
        mappings: sourceMap.mappings
    };
    return {src: code, zip: minification.code, map: sourceMap};
}
/**
 * @param {string} path Source path relative to the `src` folder.
 */
function compileJS(path, options) {
    var src = new Source(Project, path),
    code,
    moduleName = src.name(),
    moduleShortName,
    iniName, iniPath,
    compilation,
    mode,
    requiredModule,
    dependencies,
    minification,
    minifiedCode,
    sourceMap;
    if (!src.isUptodate()) {
        moduleShortName = moduleName.substr(4);
        moduleShortName = moduleShortName.substr(0, moduleShortName.length - 3);
        console.log("Compile JS module: " + moduleShortName.cyan);

        // Intl.
        iniName = src.name().substr(0, src.name().length - 2) + "ini";
        iniPath = Project.srcOrLibPath(iniName);
        if (iniPath) {
            src.tag("intl", CompilerINI.parse(iniPath));
        } else {
            src.tag("intl", "");
        }

        code = Tpl.file(
            "module.js",
            {name: moduleShortName, code: src.read(), intl: src.tag('intl')}
        ).out;

        minification = minifyJS(moduleShortName + ".js", code);
        dependencies = findDepedencies(minification.zip, src);
        if (options.noZip) {
            src.tag('zip', code);
            src.tag('map', '');
        } else {
            src.tag('zip', minification.zip);
            src.tag('map', minification.map);
        }
        src.tag('dependencies', dependencies);
        src.save();
    }
    return src;
}

function findDepedencies(minifiedCode, src) {
    var rx = /[^a-zA-Z0-9$_\.]require[ \t\n\r]*\([ \t\n\r]*('[^']+'|"[^"]+")/g,
    content = ' ' + minifiedCode,
    cursor,
    dependencies = [],
    requiredModule,
    match;
    while (null != (match = rx.exec(content, cursor))) {
        requiredModule = match[1].substr(1);
        requiredModule = requiredModule.substr(0, requiredModule.length - 1);
        if (!moduleExists(requiredModule)) {
            Fatal.fire(
                'Unknown module "' + requiredModule + '"!',
                src.getAbsoluteFilePath()
            );
        }
        if (dependencies.indexOf(requiredModule) < 0) {
            dependencies.push(requiredModule);
            console.log("  require: " + requiredModule.bold);
        }
    }
    return dependencies;
}


/**
 * @param {string} path Source path relative to the `src` folder.
 */
function compileCSS(path) {
    var src = new Source(Project, path);
    if (!src.exists()) return null;

    src.tag("zip", src.read());
    return src;
}
