var FS = require("fs");
var Path = require("path");

var CompilerINI = require("./compiler-ini");
var CompilerCOM = require("./compiler-com");
var ParserHTML = require("./tlk-htmlparser");
var PathUtils = require("./pathutils");
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
    // Output of the main file.
    output,
    // Output of a page file.
    outputPage,
    // In case of  multi-pages, the first page has the  same name as the
    // `file`. So it's output must become the output of the `file`.
    outputOfFirstPage,
    // Page filename relative to the sourceHTML.
    pageFilename,
    // Array of the sources we must link.
    sourcesToLink = [];
    // Check if
    if (!isUptodate(sourceHTML)) {
        Scopes[0].$filename = sourceHTML.name();
        console.log("Compile HTML: " + sourceHTML.name().cyan);
        var root = ParserHTML.parse(sourceHTML.read());
        output = compileRoot(root, sourceHTML, options);
        sourceHTML.tag('output', output);
        while (typeof root.type === 'undefined' && root.children && root.children.length == 1) {
            root = root.children[0];
        }
        if (root.type == Tree.PAGES) {
            outputPage = JSON.parse(JSON.stringify(output));
            root.children.forEach(function (child, idx) {
                console.log(("  Page " + (idx + 1)).cyan);
                var src = sourceHTML;
                pageFilename = src.name();
                if (idx != 0) {
                    pageFilename = file.substr(0, file.length - 4) + idx + '.html';
                    src = new Source(Project, pageFilename);
                }
                outputPage = compileRoot(child, src, options, JSON.parse(JSON.stringify(output)));
                outputPage.filename = pageFilename;
                src.tag("output", outputPage);
                src.save();
                sourcesToLink.push(pageFilename);
                if (idx == 0) {
                    // This is the first page.
                    outputOfFirstPage = outputPage;                    
                }
            });
            sourceHTML.tag('pages', sourcesToLink);
            sourceHTML.tag('output', outputOfFirstPage);
        }
        sourceHTML.save();
    }
    // Linking.
    console.log("Link: " + sourceHTML.name().yellow);
    sourcesToLink = sourceHTML.tag('pages');
    if (sourcesToLink) {
        // Multi-pages.
        sourcesToLink.forEach(function (pageFilename) {
            var src = new Source(Project, pageFilename);
            link(src, options);
        });
    } else {
        // Single page.
        link(sourceHTML, options);
    }
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
        // Javascript modules required.
        require: {},
        // Javascript code to insert in a `DOMContentLoaded` event.
        initJS: {},
        // Files needed to build this file. If a include change, we must recompile.
        include: {},
        // A resource is a file to create in the output folder when this HTML is linked.
        // the key is the resource name, and the value is an objet depending on the type of resource:
        //  * {dst: "img/plus.png", src: "../gfx/icon-plus.png"}
        //  * {dst: "img/face.svg", txt: "<svg xmlns:svg=..."}
        resource: {}
    };
    var libs = Libs(sourceHTML, Components, Scopes, output);
    libs.compile(root, options);
    Tree.trim(root);
    output.root = root;
    return output;
}

/**
 * A source needs to be rebuild if it is not uptodate.
 * Here are the reasons for a source not to be uptodate:
 * * Source code more recent than the tags (`Source.isUptodate()`).
 * * Includes source codes more recent than this source.
 */
function isUptodate(sourceHTML) {
    if (!sourceHTML.isUptodate()) return false;
    var output = sourceHTML.tag('output');
    if (!output || !output.include) return true;
    // File name relative to `sourceHTML`.
    var includeFilename;
    // Source object of the `sourceFilename`.
    var includeSource;
    for (includeFilename in output.include) {
        includeSource = new Source(
            Project,
            sourceHTML.getPathRelativeToSource(output.include[includeFilename])
        );
        if (includeSource.modificationTime() > sourceHTML.modificationTime()) {
            // An included file if more recent. We must recompile.
            return false;
        }
    }
    return true;
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

    // Writing resources if any.
    writeResources(output);
}


function writeResources(output) {
    // Name of the resource.
    var resourceName;
    // Data of the resource.
    var resourceData;
    // Destination path (in `www`folder).
    var dstPath;
    // Source path (in `src` folder).
    var srcPath;
    // Resource content.
    var content;

    for (resourceName in output.resource) {
        resourceData = output.resource[resourceName];
        dstPath = Project.wwwPath(resourceData.dst);
        // Create folders if needed.
        Project.mkdir(Path.dirname(dstPath));
        if (resourceData.src) {
            srcPath = Project.srcOrLibPath(resourceData.src);
            Project.copyFile(srcPath, dstPath);
        } else {
            content = resourceData.txt;
            PathUtils.file(dstPath, content);
        }
    }
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
