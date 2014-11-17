/**
 *
 * @module project
 */

var Path = require("path");
var FS = require("fs");
var CompilerHTML = require("./compiler-html");
var Tree = require("./htmltree");
var Util = require("./util");
var Source = require("./source");
var Template = require("./template");

/**
 * @class Project
 */
var Project = function(prjDir) {
    this._prjDir = Path.resolve(prjDir);
    this._libDir = Path.resolve(Path.join(Path.dirname(process.argv[1]), "lib"));
    this._srcDir = this.mkdir(prjDir, "src");
    this._tmpDir = this.mkdir(prjDir, "tmp");
    this._wwwDir = this.mkdir(prjDir, "www");
    this.Util = require("./lib/wdg/util.js");
    var configFile = Path.join(this._prjDir, "project.tfw.json");
    if (!FS.existsSync(configFile)) {
        FS.writeFileSync(
            configFile,
            "{\n"
            + "    'name': '" + Path.basename(this._prjDir) + "',\n"
            + "    'version': '0.0.1'\n}"
        );
    }
};

/**
 * @return module `Template`.
 */
Project.prototype.Template = Template;

/**
 * @return Tree module.
 */
Project.prototype.Tree = Tree;

/**
 * @param {string} path path relative to `lib/` in ToloFrameWork folder.
 * @return an absolute path.
 */
Project.prototype.libPath = function(path) {
    return Path.resolve(Path.join(this._libDir, path));
};

/**
 * @param {string} path path relative to `src/`.
 * @return an absolute path.
 */
Project.prototype.srcPath = function(path) {
    if (typeof path === 'undefined') return this._srcDir;
    return Path.resolve(Path.join(this._srcDir, path));
};

/**
 * @param {string} path path relative to `src/` or `lib/`.
 * @return an absolute path or null if the file does not exist.
 */
Project.prototype.srcOrLibPath = function(path) {
    var result = this.srcPath(path);
    if (FS.existsSync(result)) return result;
    result = this.libPath(path);
    if (FS.existsSync(result)) return result;
    return null;
};

/**
 * @param {string} path path relative to `tmp/`.
 * @return an absolute path.
 */
Project.prototype.tmpPath = function(path) {
    if (typeof path === 'undefined') return this._tmpDir;
    return Path.resolve(Path.join(this._tmpDir, path));
};

/**
 * @param {string} path path relative to `www/`.
 * @return an absolute path.
 */
Project.prototype.wwwPath = function(path) {
    if (typeof path === 'undefined') return this._wwwDir;
    return Path.resolve(Path.join(this._wwwDir, path));
};

/**
 * @return Dictionary  of available widget  compilers. The key  is the
 * widget name, the value is an object:
 * * __path__: absolute path of the compiler's' directory.
 * * __name__: widget's name.
 * * __compiler__: compiler's module owning functions such as `compile`, `precompile`, ...
 * * __precompilation__: is this widget in mode _precompilation_? In this case, it must be called in the Top-Down walking.
 */
Project.prototype.getAvailableWidgetCompilers = function() {
    if (!this._availableWidgetsCompilers) {
        var map = {};
        var dirs = [this._srcDir, this._libDir];
        console.log("Available widgets:");
        dirs.forEach(
            // Resolve paths for "wdg/" directories.
            function(itm, idx, arr) {
                var path = Path.resolve(Path.join(itm, "wdg"));
                if (!FS.existsSync(path)) {
                    path = null;
                }
                arr[idx] = path;
            }
        );
        dirs.forEach(
            function(dir, idx) {
                if (typeof dir !== 'string') return;
                var files = FS.readdirSync(dir);
                files.forEach(
                    function(filename) {
                        var file = Path.join(dir, filename);
                        var stat = FS.statSync(file);
                        if (stat.isFile()) return;
                        if (!map[filename]) {
                            map[filename] = {path: file, name: filename};
                            var modulePath = Path.join(file, "compile-" + filename + ".js");
                            if (FS.existsSync(modulePath)) {
                                var compiler = require(modulePath);
                                if (typeof compiler.precompile === 'function') {
                                    map[filename].precompilation = true;
                                    map[filename].compiler = compiler;
                                }
                                else if (typeof compiler.compile === 'function') {
                                    map[filename].compiler = compiler;
                                }
                            }
                            var name = (filename.substr(0, 1).toUpperCase()
                                        + filename.substr(1).toLowerCase()).cyan;
                            if (idx == 0) {
                                name = name.bold;
                            }
                            console.log(
                                "   " + (map[filename].precompilation ? "<w:".yellow.bold : "<w:")
                                + name + (map[filename].precompilation ? ">".yellow.bold : ">")
                                + "\t" + file
                            );
                        }
                    }
                );
            }
        );
        this._availableWidgetsCompilers = map;
    }
    return this._availableWidgetsCompilers;
};

/**
 * Throw a fatal exception.
 */
Project.prototype.fatal = function(msg, id, src) {
    if (!id) id = -1;
    if (!src) src = "(unknown)";
    var ex = new Error(msg);
    ex.fatal = msg.bold;
    ex.id = id;
    ex.src = src;
    throw ex;
};

/**
 * Compile every `*.html` file found in _srcDir_.
 */
Project.prototype.compile = function() {
    this.findHtmlFiles().forEach(
        function(filename) {
            try {
                CompilerHTML.compile(this, filename);
            }
            catch (ex) {
                if (ex.fatal) {
                    ex.fatal = "Error in " + filename + "...\n" + ex.fatal;
                }
                throw ex;
            }
        },
        this
    );
};

/**
 * Link every `*.html` file found in _srcDir_.
 */
Project.prototype.link = function() {
    console.log("Cleaning output: " + this.wwwPath());
    Util.cleanDir(this.wwwPath());
    this.mkdir(this.wwwPath("DEBUG"));
    this.mkdir(this.wwwPath("RELEASE"));
    this.findHtmlFiles().forEach(
        function(filename) {
            console.log("Linking " + filename.yellow.bold);
            this.linkForDebug(filename);
            this.linkForRelease(filename);
        },
        this
    );
};

/**
 * Linking in DEBUG mode.
 */
Project.prototype.linkForDebug = function(filename) {
    var srcHTML = new Source(this, filename);
    //var linkJS = ["tfw3.js"].concat(srcHTML.tag("linkJS") || []);
    var linkJS = [].concat(srcHTML.tag("linkJS") || []);
    var linkCSS = srcHTML.tag("linkCSS") || [];
    var tree = Tree.clone(srcHTML.tag("tree"));
    var head = Tree.getElementByName(tree, "head");
    if (!head) {
        this.fatal(
            "Invalid HTML file: missing <head></head>!"
            + "\n\n"
            + Tree.toString(tree)
        );
    }
    var jsDir = this.mkdir(this.wwwPath("DEBUG/js"));
    var cssDir = this.mkdir(this.wwwPath("DEBUG/css"));
    var manifestFiles = [];
    linkCSS.forEach(
        function(item) {
            var srcCSS = srcHTML.create(item);
            var shortName = Path.basename(srcCSS.getAbsoluteFilePath());
            var output = Path.join(cssDir, shortName);
            FS.writeFileSync(output, srcCSS.tag("debug"));
            if (!head.children) head.children = [];
            head.children.push(
                Tree.tag(
                    "link",
                    {
                        href: "css/" + shortName,
                        rel: "stylesheet",
                        type: "text/css"
                    }
                )
            );
            manifestFiles.push("css/" + shortName);
        } ,
        this
    );
    linkJS.forEach(
        function(item) {
            var srcJS = srcHTML.create(item);
            var shortName = Path.basename(srcJS.getAbsoluteFilePath());
            var output = Path.join(jsDir, shortName);
            var code = srcJS.read();
            if (item.substr(0, 4) == 'mod/') {
                // This is a module. We need to wrap it in module's declaration snippet.
                code =
                    "window['#" 
                    + shortName.substr(0, shortName.length - 3).toLowerCase()
                    + "'] = function(exports, module){\n"
                    + code 
                    + "\n};\n";
            }
            FS.writeFileSync(output, code);
            if (!head.children) head.children = [];
            head.children.push(
                Tree.tag(
                    "script",
                    {src: "js/" + shortName}
                )
            );
            manifestFiles.push("js/" + shortName);
        } ,
        this
    );
    srcHTML.tag("resources").forEach(
        function(itm, idx, arr) {
            var src = itm;
            var dst = src;
            if (Array.isArray(src)) {
                dst = src[1];
                src = src[0];
            }
            manifestFiles.push(dst);
            src = this.srcPath(src);
            dst = Path.join(this.wwwPath("DEBUG"), dst);
            this.copyFile(src, dst);
        }, this
    );

    // Adding innerJS and innerCSS.
    var shortNameJS = "@" + filename.substr(0, filename.length - 5) + ".js";
    head.children.push(
        Tree.tag(
            "script",
            {src: "js/" + shortNameJS}
        )
    );
    manifestFiles.push("js/" + shortNameJS);
    FS.writeFileSync(
        Path.join(jsDir, shortNameJS),
        srcHTML.tag("innerJS")
    );
    var shortNameCSS = "@" + filename.substr(0, filename.length - 5) + ".css";
    head.children.push(
        Tree.tag(
            "link",
            {
                href: "css/" + shortNameCSS,
                rel: "stylesheet",
                type: "text/css"
            }
        )
    );
    manifestFiles.push("css/" + shortNameCSS);
    FS.writeFileSync(
        Path.join(cssDir, shortNameCSS),
        srcHTML.tag("innerCSS")
    );

    // Writing HTML file.
    FS.writeFileSync(
        Path.join(this.wwwPath("DEBUG"), filename),
        "<!DOCTYPE html>" + Tree.toString(tree)
    );
    // Writing manifest file.
    FS.writeFileSync(
        Path.join(this.wwwPath("DEBUG"), filename + ".manifest"),
        "CACHE MANIFEST\n"
            + "# " + Date.now() + "\n\n"
            + "CACHE:\n"
            + manifestFiles.join("\n")
            + "\n\nNETWORK:\n*\n"
    );
    // Looking for webapp manifest for Firefox OS.
    copyManifestWebapp.call(this, "DEBUG");
};

/**
 * Linking in RELEASE mode.
 */
Project.prototype.linkForRelease = function(filename) {
    var srcHTML = new Source(this, filename);
    //var linkJS = ["tfw3.js"].concat(srcHTML.tag("linkJS") || []);
    var linkJS = [].concat(srcHTML.tag("linkJS") || []);
    if (!Array.isArray(linkJS)) linkJS = [];
    var linkCSS = srcHTML.tag("linkCSS") || [];
    if (!Array.isArray(linkCSS)) linkCSS = [];
    var tree = Tree.clone(srcHTML.tag("tree"));
    var head = Tree.getElementByName(tree, "head");
    if (!head) {
        this.fatal(
            "Invalid HTML file: missing <head></head>!"
        );
    }
    var jsDir = this.mkdir(this.wwwPath("RELEASE/js"));
    var cssDir = this.mkdir(this.wwwPath("RELEASE/css"));
    var manifestFiles = [];
    var shortedName = filename.substr(0, filename.length - 5);
    var fdJS = FS.openSync(Path.join(jsDir, "@" + shortedName + ".js"), "w");
    FS.writeSync(fdJS, srcHTML.tag("zipJS"));
    var fdCSS = FS.openSync(Path.join(cssDir, "@" + shortedName + ".css"), "w");
    FS.writeSync(fdCSS, srcHTML.tag("zipCSS"));
    linkJS.forEach(
        function(item) {
            var srcJS = srcHTML.create(item);
            var content = srcJS.tag("zip");
            if (item.substr(0, 4) == 'mod/') {                
                // This is a module. We need to wrap it in module's declaration snippet.
                var shortName = item.substr(4);
                shortName = shortName.substr(0, shortName.length - 3).toLowerCase();
                content =
                    "\nwindow['#" + shortName
                    + "']=function(exports,module){" + content + "};";
            }
            FS.writeSync(fdJS, content);
        } ,
        this
    );
    FS.writeSync(
        fdCSS,
        Util.lessCSS("css/@" + shortedName + ".css", srcHTML.tag("innerCSS"), true)
    );
    linkCSS.forEach(
        function(item) {
            var srcCSS = srcHTML.create(item);
            var content = srcCSS.tag("release");
            FS.writeSync(fdCSS, content);
        } ,
        this
    );
    // Resources.
    srcHTML.tag("resources").forEach(
        function(itm, idx, arr) {
            var src = itm;
            var dst = src;
            if (Array.isArray(src)) {
                dst = src[1];
                src = src[0];
            }
            manifestFiles.push(dst);
            src = this.srcPath(src);
            dst = Path.join(this.wwwPath("RELEASE"), dst);
            this.copyFile(src, dst);
        }, this
    );
    // Writing HTML file.
    if (!head.children) head.children = [];
    head.children.push(
        Tree.tag(
            "script",
            {
                src: "js/@" + shortedName + ".js"
            }
        )
    );
    head.children.push(
        Tree.tag(
            "link",
            {
                href: "css/@" + shortedName + ".css",
                rel: "stylesheet",
                type: "text/css"
            }
        )
    );
    FS.writeFileSync(
        Path.join(this.wwwPath("RELEASE"), filename),
        "<!DOCTYPE html>" + Tree.toString(tree)
    );
    // Writing manifest file.
    FS.writeFileSync(
        Path.join(this.wwwPath("RELEASE"), filename + ".manifest"),
        "CACHE MANIFEST\n"
            + "# " + Date.now() + "\n\n"
            + "CACHE:\n"
            + shortedName + ".html\n"
            + "js/@" + shortedName + ".js\n"
            + "css/@" + shortedName + ".css\n"
            + "\nNETWORK:\n*\n"
    );
    FS.close(fdJS);
    FS.close(fdCSS);
    // Looking for webapp manifest for Firefox OS.
    copyManifestWebapp.call(this, "RELEASE");
};

/**
 * @param mode : "DEBUG" or "RELEASE".
 */
function copyManifestWebapp(mode) {
    // Looking for webapp manifest for Firefox OS.
    var webappFile = this.srcOrLibPath("manifest.webapp");
    if (webappFile) {
        this.copyFile(webappFile, Path.join(this.wwwPath(mode), "manifest.webapp"));
        var content = FS.readFileSync(webappFile);
        var json = null;
        try {
            json = JSON.parse(content);            
        } catch (x) {
            this.fatal("'manifest.webapp' must be a valid JSON file!\n" + x);
        }
        var icons = json.icons || {};
        var key, val;
        for (key in icons) {
            val = this.srcOrLibPath(icons[key]);
            if (val) {
                this.copyFile(val, Path.join(this.wwwPath(mode), icons[key]));
            }
        }
    }
}

/**
 * @return array of HTML files found in _srcDir_.
 */
Project.prototype.findHtmlFiles = function() {
    var files = [];
    FS.readdirSync(this._srcDir).forEach(
        function(filename) {
            var file = Path.resolve(Path.join(this._srcDir, filename));
            if (FS.existsSync(file)) {
                var stat = FS.statSync(file);
                if (stat.isFile() && Path.extname(file) == '.html') {
                    files.push(filename);
                }
            }
        },
        this
    );
    return files;
};

/**
 * @param arguments all arguments will be joined to form the path of the directory to create.
 * @return the name of the created directory.
 */
Project.prototype.mkdir = function() {
    var key, arg, items = [];
    for (key in arguments) {
        arg = arguments[key].trim();
        items.push(arg);
    }
    var path = Path.resolve(Path.normalize(items.join("/"))),
    item, i,
    curPath = "";
    items = path.replace(/\\/g, '/').split("/");
    for (i = 0 ; i < items.length ; i++) {
        item = items[i];
        curPath += item + "/";
        if (FS.existsSync(curPath)) {
            var stat = FS.statSync(curPath);
            if (!stat.isDirectory()) {
                break;
            }
        } else {
            FS.mkdirSync(curPath);
        }
    }
    return path;
};

// Used for file copy.
var buffer = new Buffer(64 * 1024);

/**
 * Copy a file from `src` to `dst`.
 * @param src full path of the source file.
 * @param dst full path of the destination file.
 */
Project.prototype.copyFile = function(src, dst) {
    var bytesRead, pos, rfd, wfd;
    this.mkdir(Path.dirname(dst));
    rfd = FS.openSync(src, "r");
    wfd = FS.openSync(dst, "w");
    bytesRead = 1;
    pos = 0;
    while (bytesRead > 0) {
        bytesRead = FS.readSync(rfd, buffer, 0, 64 * 1024, pos);
        FS.writeSync(wfd, buffer, 0, bytesRead);
        pos += bytesRead;
    }
    FS.closeSync(rfd);
    return FS.closeSync(wfd);
};


/**
 * @param prjDir root directory of the project. It is where we can find `project.tfw.json`.
 * @return instance of the class `Project`.
 */
exports.createProject = function(prjDir) {
    return new Project(prjDir);
};


exports.ERR_WIDGET_TRANSFORMER = 1;
exports.ERR_WIDGET_NOT_FOUND = 2;
exports.ERR_WIDGET_TOO_DEEP = 3;
exports.ERR_FILE_NOT_FOUND = 4;
