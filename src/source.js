var Kernel = require("./kernel");
var Path = require("path");
var FS = require("fs");

var sources = {};
var db = Kernel.loadJSON(
    Kernel.tmpPath("db.json"),
    {
        id: 0,
        files: {}
    }
);

/**
 * Save database.
 */
function saveDB() {
    Kernel.saveJSON(Kernel.tmpPath("db.json"), db);
}

function absPath(file) {
    var choices = [Kernel.srcPath(file), Kernel.tfwPath(file), file];
    var i, path;
    for (i = 0 ; i < choices.length ; i++) {
        path = choices[i];
        if (FS.existsSync(path)) {
            return path;
        }
    }
    throw new Error("[absPath] File not found:\n\"" + file + "\"!");
}

/**
 * Retrieve the  corresponding Source  object of  a relative  file path.
 * These objects  are stored in cache.  So there can be  only one object
 * per file.
 * First, we  look for  an absolute  path, then for  a relative  path in
 * source directory, finally for a relative path in TFW directory.
 */
function getSourceObject(file) {
    if (FS.existsSync(file)) {
        var src = sources[file];
        if (typeof src === 'undefined') {
            src = new Source(file);
            sources[file] = src;
        }
        return src;
    }
    throw {fatal: "File not found: \"" + file + "\"!"};
};

/**
 * Source class.
 */
var Source = function(file) {
    this._file = Path.normalize(file);
    this._key = Path.relative(Kernel.srcPath(), this._file);
    this._id = db.files[this._key];
    if (!this._id) {
        // There is no tags file yet. Create it.
        var id = db.id.toString(16).toLowerCase(), i;
        this._id = "";
        for (i = 0 ; i < id.length ; i += 2) {
            this._id += id.substr(i, 2) + "/";
        }
        this._id += id.substr(i);
        db.id++;
        db.files[this._key] = this._id;
        saveDB();
    }
    this.load();
};

Source.prototype.absPath = absPath;

/**
 * Return the full path for a relative path in prjPath.
 */
Source.prototype.prjPath = function(relativePath) {
    return Kernel.prjPath(relativePath);
};

/**
 * Return the full path for a relative path in srcPath.
 */
Source.prototype.srcPath = function(relativePath) {
    return Kernel.srcPath(relativePath);
};

/**
 * Return the full path for a relative path in wwwPath.
 */
Source.prototype.wwwPath = function(relativePath) {
    return Kernel.wwwPath(relativePath);
};

/**
 * @param filename : relative path to the source directory.
 * @return true if the filename exists in the sources directory.
 */
Source.prototype.exists = function(filename) {
    var file = absPath(filename);
    return FS.existsSync(file);
};

/**
 * Save/Load a tag.
 * @param key : name of the tag.
 * @param val : value of the tag. If undefined, the tag will be loaded.
 */
Source.prototype.tag = function(key, val) {
    var data = this._data;
    if (!data) {
        data = this.load();
    }
    if (typeof val === 'undefined') {
        if (!data.tags) return undefined;
        return data.tags[key];
    }
    if (!data.tags) {
        data.tags = {};
    }
    data.tags[key] = val;
};

/**
 * Return a minified version of the Javascript content of this source.
 * @throw {fatal: ...}
 */
Source.prototype.zipJS = function() {
    return require("./fileJS").zip(this.file());
};

/**
 * Return AST for Javascript content of this source.
 */
Source.prototype.parseJS = function(fullScope) {
    var tree = require("./fileJS").parse(this.file());
    if (fullScope) {
        tree.figure_out_scope();
    }
    return tree;
};

/**
 * Return a portion of code with error highlighted.
 */
Source.prototype.errorAt = function(line, col) {
    var msg= '';
    msg += "----------------------------------------"
        + "----------------------------------------\n";
    msg += "  file: " + this.file() + "\n";
    msg += "  line: " + line + "\n";
    msg += "  col.: " + col + "\n";
    msg += "----------------------------------------"
        + "----------------------------------------\n";
    var content = this.content();
    var lines = content.split("\n"),
    lineIndex, indent = '',
    min = Math.max(0, line - 1 - 2),
    max = line;
    for (lineIndex = min ; lineIndex < max ; lineIndex++) {
        msg += lines[lineIndex].trimRight() + "\n";
    }
    for (lineIndex = 0 ; lineIndex < col ; lineIndex++) {
        indent += ' ';
    }
    msg += "\n" + indent + "^\n";
    return msg;
}

/**
 * Return the content of this source file.
 */
Source.prototype.content = function() {
    return FS.readFileSync(this.file()).toString();
};

/**
 * Load the data object mapped to this source.
 */
Source.prototype.load = function() {
    this._data = Kernel.loadJSON(
        Kernel.tmpPath(this._id + "data.json"),
        {
            needs: [],
            includes: [],
            timestamp: 0,
            tags: {}
        }
    );
    return this._data;
};

/**
 * Remove all elements of the "needs" array.
 */
Source.prototype.clearNeeds = function() {
    this._data.needs = [];
};

/**
 * Add a "need" if it does not exist yet.
 */
Source.prototype.addNeed = function(need, tpl, params) {
    need = absPath(need);
    var i, needs = this._data.needs;
    for (i = 0 ; i < needs.length ; i++) {
        if (need == needs[i]) {
            return false;
        }
    }
    needs.push(need);
    // If the  file needed does  not exist in  the src folder,  we can
    // create it from a template.
    if (typeof tpl === 'string') {
        var srcFile = Kernel.srcPath(need);
        if (!FS.existsSync(srcFile)) {
            console.log("New source file: " + srcFile.cyan);
            var tplFile = Kernel.tfwPath("tpl/" + tpl);
            if (!FS.existsSync(tplFile)) {
                throw {fatal: "Template file not found:\n" + tplFile};                
            }
            var content = FS.readFileSync(tplFile).toString();
            if (typeof params === 'object') {
                var key, val;
                for (key in params) {
                    val = params[key];
                    content = content.replace(new RegExp("\\{\\{" + key + "\\}\\}", "g"), val);
                }                
            }
            FS.writeFileSync(srcFile, content);
        }
    }
    return true;
};

/**
 * Remove a "need" from the "needs" list.
 */
Source.prototype.remNeed = function(need) {
    var i, needs = this._data.needs;
    for (i = 0 ; i < needs.length ; i++) {
        if (need == needs[i]) {
            needs.splice(i, 1);
            return true;
        }
    }
    return false;
};

/**
 * Loop on each "need" and call "fct" with it as argument.
 */
Source.prototype.forEachNeed = function(fct) {
    this._data.needs.forEach(fct, this);
};

/**
 * Remove all elements of the "includes" array.
 */
Source.prototype.clearIncludes = function() {
    this._data.includes = [];
};

/**
 * Add a "include" if it does not exist yet.
 */
Source.prototype.addInclude = function(include) {
    var i, includes = this._data.includes;
    for (i = 0 ; i < includes.length ; i++) {
        if (include == includes[i]) {
            return false;
        }
    }
    includes.push(include);
    return true;
};

/**
 * Remove a "include" from the "includes" list.
 */
Source.prototype.remInclude = function(include) {
    var i, includes = this._data.includes;
    for (i = 0 ; i < includes.length ; i++) {
        if (include == includes[i]) {
            includes.splice(i, 1);
            return true;
        }
    }
    return false;
};

/**
 * Loop on each "include" and call "fct" with it as argument.
 */
Source.prototype.forEachInclude = function(fct) {
    this._data.includes.forEach(fct, this);
};

/**
 * Find recursively all the dependencies.
 * Return them as source objects.
 */
Source.prototype.findAllDependencies = function() {
    var deps = [];
    var dic = {};
    var fringe = [];
    var source;
    var file;
    var add = function(file) {
        fringe.push(file);
    };
    dic[this.file()] = 1;   // Prevent circular dependencies.
    this.forEachNeed(add);
    this.forEachInclude(add);
    while (fringe.length > 0) {
        file = fringe.pop();
        if (!dic[file]) {
            dic[file] = 1;
            source = getSourceObject(file);
            deps.push(source);
            source.forEachNeed(add);
            source.forEachInclude(add);
        }
    }
    return deps;
};

/**
 * Check if the file has the given extension.
 */
Source.prototype.hasFileExtension = function(ext) {
    var file = this.file();
    var end = file.substr(file.length - ext.length - 1);
    return ("." + ext) == end;
};

/**
 * Save the data object mapped to this source.
 */
Source.prototype.save = function() {
    Kernel.saveJSON(
        Kernel.tmpPath(this._id + "data.json"),
        this._data
    );
};

/**
 * Get the uptodate status.
 */
Source.prototype.isUptodate = function() {
    return false;
};

/**
 * Mark source as uptodate.
 */
Source.prototype.setUptodate = function() {
    this._timestamp = Date.now();
};

/**
 * @return The full path of the source file.
 */
Source.prototype.file = function() {
    return this._file;
};

/**
 * @return Relative path to srcPath.
 */
Source.prototype.filename = function() {
    return this._key;
};

/**
 * @return The filename without any directory.
 */
Source.prototype.basename = function() {
    return Path.basename(this.file());
};

/**
 * Copy a source file to the WWW directory.
 */
Source.prototype.wwwCopy = function(wwwFile, srcFile) {
    if (typeof srcFile === 'undefined') srcFile = this.filename();
    var wwwDir = Path.dirname(Kernel.wwwPath(wwwFile));
    Kernel.mkdir(wwwDir);
    Kernel.copy(
        Kernel.srcPath(srcFile),
        wwwDir
    );
};

Source.prototype.wwwSave = function(wwwFile, content) {
    if (typeof content === 'undefined') content = this.content();
    wwwFile = Kernel.wwwPath(wwwFile);
    var wwwDir = Path.dirname(wwwFile);
    Kernel.mkdir(wwwDir);
    FS.writeFileSync(wwwFile, content);
};

Source.prototype.copy = Kernel.copy;
Source.prototype.mkdir = Kernel.mkdir;
Source.prototype.getSourceObject = getSourceObject;
Source.prototype.debug = Kernel.debug;


exports.Source = getSourceObject;
