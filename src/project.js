/**
 *
 * @module project
 */

var Path = require("path");
var FS = require("fs");
var CompilerHTML = require("./compiler-html");
var Tree = require("./htmltree");

/**
 * @class Project
 */
var Project = function(prjDir) {
    this._prjDir = Path.resolve(prjDir);
    this._libDir = Path.resolve(Path.join(Path.dirname(process.argv[1]), "lib"));
    this._srcDir = this.mkdir(prjDir, "src");
    this._tmpDir = this.mkdir(prjDir, "tmp");
    this._wwwDir = this.mkdir(prjDir, "www");
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
    return Path.resolve(Path.join(this._tmpDir, path));
};

/**
 * @param {string} path path relative to `www/`.
 * @return an absolute path.
 */
Project.prototype.wwwPath = function(path) {
    return Path.resolve(Path.join(this._wwwDir, path));
};

/**
 * @return  Dictionary of  available widget  compilers. The  key is  the
 * widget  name,  the  value  is  the  absolute  path  of  the  compiler
 * directory.
 */
Project.prototype.getAvailableWidgetCompilers = function() {
    if (!this._availableWidgetsCompilers) {
        var map = {};
        var roots = [this._srcDir, this._libDir];
        console.log("Available widgets:");
        roots.forEach(
            function(itm, idx, arr) {
                var path = Path.resolve(Path.join(itm, "wdg"));
                if (!FS.existsSync(path)) {
                    path = null;
                }
                arr[idx] = path;
            } 
        );
        roots.forEach(
            function(root) {
                if (typeof root !== 'string') return;
                var files = FS.readdirSync(root);
                files.forEach(
                    function(filename) {
                        var file = Path.join(root, filename);
                        var stat = FS.statSync(file);
                        if (stat.isFile()) return;
                        if (!map[filename]) {
                            map[filename] = file;
                            console.log(
                                "   <w:" + (filename.substr(0, 1).toUpperCase() 
                                    + filename.substr(1).toLowerCase()).cyan + ">"
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
    throw {
        fatal: msg,
        id: id || -1,
        src: src || "(unknown)"
    };
};

/**
 * compile every `*.html` file found in _srcDir_.
 */
Project.prototype.compile = function() {
    var files = FS.readdirSync(this._srcDir);
    files.forEach(
        function(filename) {
            var file = Path.resolve(Path.join(this._srcDir, filename));
            if (FS.existsSync(file)) {
                var stat = FS.statSync(file);
                if (stat.isFile() && Path.extname(file) == '.html') {
                    try {
                        CompilerHTML.compile(this, filename);
                    }
                    catch (ex) {
                        if (ex.fatal) {
                            console.error(
                                (
                                    "----------------------------------------\n"
                                        + filename + "\nError #" + ex.id + " in " + ex.src + "\n"
                                        + "----------------------------------------\n"
                                        + ex.fatal + "\n"
                                ).err()
                            );
                        } else {
                            throw ex;
                        }
                    }
                }
            }
        },
        this
    );
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
