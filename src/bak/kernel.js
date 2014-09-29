/**
 * @module kernel
 */

var FS = require("fs");
var Path = require("path");
var Readline = require("readline-sync");

function ask(caption, def) {
    var question = caption.yellow + (def ? "[Y/n]" : "[N/y]").grey + "  ";
    var answer = Readline.question(question).trim().toUpperCase();
    if (def) {
        if (answer == 'N') return false;
        return true;
    } else {
        if (answer == 'Y') return true;
        return false;
    }
}

var curPath = process.cwd();
var tfwPath = Path.dirname(process.argv[1]);
var prjPath = curPath;
var srcPath = Path.join(prjPath, "src");
var tmpPath = Path.join(prjPath, "tmp");
var wwwPath = Path.join(prjPath, "www");
var debugMode = false;

// Used for file copy.
var buffer = new Buffer(64 * 1024);

/**
 * Find all files matching the pattern.
 *
 * @param rootpath : root path for the search.
 * @param  patterns :  array  of patterns  (RegExp  objects). Each  item
 *        represents a directory.  They are stored in reverse order.
 * @param files : output array of mathing files.
 */
function expandPattern(rootpath, patterns, files) {
    if (patterns.length == 0) return;

    var pattern = patterns.pop();
    var localFiles = FS.readdirSync(rootpath);
    if (patterns.length == 0) {
        // We are looking for files.
        localFiles.forEach(
            function(filename) {
                var file = Path.join(rootpath, filename);
                var stat = FS.statSync(file);
                if (stat.isFile()) {
                    if (pattern.test(filename)) {
                        files.push(file);
                    }
                }
            }
        );
    } else {
        // We are looking for directories.
        localFiles.forEach(
            function(filename) {
                var file = Path.join(path, filename);
                var stat = FS.statSync(file);
                if (stat.isDirectory()) {
                    if (pattern.test(filename)) {
                        expandPattern(file, patterns, files);
                    }
                }
            }
        );
    }
    patterns.push(pattern);
};

var copyFile = function(src, dst) {
    var bytesRead, pos, rfd, wfd;
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
 * Make directories recursively if they don't exist yet.
 */
var mkdir = function(p) {
    p = Path.normalize(p).replace(/\\/g, '/');
    var items = p.split('/'),
    item, i,
    curPath = "";
    for (i = 0 ; i < items.length ; i++) {
        item = items[i];
        curPath += item + "/";
        if (FS.existsSync(curPath)) {
            var stat = FS.statSync(curPath);
            if (!stat.isDirectory()) {
                return false;
            }
        } else {
            FS.mkdirSync(curPath);
        }
    }
    return true;
};

var writeFile = function(file, content) {
    var path = Path.dirname(file);
    mkdir(path);
    FS.writeFileSync(file, content);
};

/**
 * Put a content in a file.
 *
 * If the file already exists, it will be overriden.
 * If the path of the file does not exists, it will be creater.
 *
 * @param file Full path of the destination file.
 * @param content Content as string.
 */
module.exports.writeFile = function(file, content) {
    writeFile(file, content);
};

/**
 * Recursivelly create directory.
 * @param path The full path of the directory to create.
 */
module.exports.mkdir = function(path) {
    mkdir(path);
};

/**
 * Throw a fatal error.
 */
exports.fatal = function(msg) {
    var e = new Error(msg);
    e.fatal = msg;
    throw e;
}

/**
 * Copy "src" to "dst" recursively.
 */
exports.copy = function(src, dst) {
    src = Path.normalize(src);
    if (!FS.existsSync(src)) {
        throw {fatal: "[kernel.copy] source missing: \"" + src + "\"!"};
    }
    var statSrc = FS.statSync(src);
    dst = Path.normalize(dst);
    if (!statSrc.isFile() && !FS.existsSync(dst)) {
        console.log("New folder: " + dst.yellow);
        FS.mkdirSync(dst);
    }
    var statDst = FS.existsSync(dst) ? FS.statSync(dst) : null;

    if (statSrc.isFile()) {
        // The source is a file.
        if (statDst && statDst.isDirectory()) {
            dst = Path.join(dst, Path.basename(src));
        }
        copyFile(src, dst);
    } else {
        // The source is a folder.
        if (statDst.isFile()) {
            // Ensure "dst" is a folder.
            dst = Path.dirname(dst);
        }
        var that = this;
        FS.readdirSync(src).forEach(
            function(filename) {
                var srcPath = Path.join(src, filename);
                var dstPath = Path.join(dst, filename);
                try {
                    var stat = FS.statSync(srcPath);
                    if (stat.isDirectory() && !FS.existsSync(dstPath)) {
                        FS.mkdirSync(dstPath);
                    }
                    that.copy(srcPath, dstPath);
                } catch (x) {
                    console.error("ERROR! Unable to copy this file: " + srcPath);
                }
            }
        );
    }
};

/**
 * Read the content of a file and parse it as JSON.
 * @param file : the full path of the file.
 * @param defaultObject  : the  object to  return if  the file  does not
 * exist or if the JSON is not parsable.
 */
exports.loadJSON = function(file, defaultObject) {
    if (!FS.existsSync(file)) {
        return defaultObject;
    }
    try {
        var content = FS.readFileSync(file);
        return JSON.parse(content);
    }
    catch (e) {
        console.error(e);
        console.error("Unable to parse file content as JSON: " + file + "!");
        return defaultObject;
    }
};

/**
 * Set/Get debug mode.
 */
exports.debug = function(status) {
    if (typeof status === 'undefined') {
        return debugMode;
    }
    debugMode = status;
};

/**
 * Write the content  of the file "file" with the  JSON serialization of
 * "obj".
 * @param file : the full path of the file.
 * @param obj : the object to serialize.
 */
exports.saveJSON = function(file, obj) {
    var dir = Path.dirname(file);
    var content = JSON.stringify(obj);
    mkdir(dir);
    FS.writeFileSync(file, content);
};

exports.curPath = function(p) {
    if (typeof p === 'undefined') {
        return curPath;
    }
    return Path.join(curPath, p);
};
exports.tfwPath = function(p) {
    if (typeof p === 'undefined') {
        return tfwPath;
    }
    return Path.join(tfwPath, p);
};
exports.prjPath = function(p) {
    if (typeof p === 'undefined') {
        return prjPath;
    }
    return Path.join(prjPath, p);
};
exports.srcPath = function(p) {
    if (typeof p === 'undefined') {
        return srcPath;
    }
    var fullPath = Path.join(srcPath, p);
    if (!FS.existsSync(fullPath)) {
        fullPath = Path.join(tfwPath, p);
        if (!FS.existsSync(fullPath)) {
            return null;
        }
    }
    return fullPath;
};
exports.tmpPath = function(p) {
    if (typeof p === 'undefined') {
        return tmpPath;
    }
    return Path.join(tmpPath, p);
};
exports.wwwPath = function(p) {
    if (typeof p === 'undefined') {
        return wwwPath;
    }
    return Path.join(wwwPath, p);
};
exports.expandPattern = expandPattern;

/**
 * Return the list of asked actions.
 * Actions are words given on the command line.
 * For example: node tfw3.js /my/project/folder DEBUG DEPLOY
 * In this case, two actions are specified : DEBUG and DEPLOY.
 */
exports.actions = function() {
    var actions = [];
    for (var i = 2 ; i < process.argv.length ; i++) {
        actions.push(process.argv[i].trim().toUpperCase());
    }
    return actions;
};

/**
 * Display a question and return true if "Y" has been typed, or false for "N".
 */
exports.ask = ask;
