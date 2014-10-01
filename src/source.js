/**
 * @module source
 */

var FS = require("fs");
var Path = require("path");

/**
 * @class Source
 * @param {Project} prj {@link project~Project}
 * @param {string} file path to the source file, relative to the source path.
 * @see {@link project~Project}
 */
var Source = function(prj, file) {
    this._prj = prj;
    this._name = file;
    this._tmpFile = prj.tmpPath(file);
    if (!FS.existsSync(this._tmpFile)) {
        prj.mkdir(Path.dirname(this._tmpFile));
    }
    this._absPath = prj.srcOrLibPath(file);
    this._tags = null;
};

/**
 * @return name of the file. It can be `index.html` or `cls/wtag.Button.js`.
 */
Source.prototype.name = function() {
    return this._name;
};

/**
 * @return the project ob
 */
Source.prototype.prj = function() {
    return this._prj;
};

/**
 * @return an instance of Source based on the same project.
 */
Source.prototype.create = function(file) {
    return new Source(this._prj, file);
};

/**
 * @return Text content of the source.
 */
Source.prototype.read = function() {
    if (typeof this._absPath !== 'string') {
        this._prj.fatal("File not found: \"" + this._name + "\"!");
    }
    return FS.readFileSync(this._absPath).toString();
};

/**
 * @return `true` if the tags' file exists and is more recent than the source file.
 */
Source.prototype.isUptodate = function() {
    if (!FS.existsSync(this._tmpFile)) {
        return false;
    }
    var statSrc = FS.statSync(this._absPath);
    var statTmp = FS.statSync(this._tmpFile);
    if (statSrc.mtime < statTmp.mtime) {
        return true;
    }
    return false;
};

/**
 * @return Last modification time of the source.
 */
Source.prototype.modificationTime = function() {
    if (!FS.existsSync(this._tmpFile)) {
        var statSrc = FS.statSync(this._absPath);
        return statSrc.mtime;
    }
    var statTmp = FS.statSync(this._tmpFile);
    return statTmp.mtime;
};

/**
 * Store tags on disk and mark the source file as _uptodate_.
 */
Source.prototype.save = function() {
    FS.writeFileSync(this._tmpFile, JSON.stringify(this._tags || {}));
};

/**
 * @return Absolute  path of the source  file. It can be  in the project
 * `src/` file  or in the ToloFrameWork  `lib/` path. If it  is nowhere,
 * return _null_.
 */
Source.prototype.getAbsoluteFilePath = function() {
    return this._absPath;
};

/**
 * Get/Set tags.
 * Don't forget to call method `save()` to store tags on disk and mark the source file has _uptodate_.
 * @param {string} name name of the tag.
 * @param value (optional) if defined, the value to set.
 * @return If `value` is _undefined_, return the tag's value.
 */
Source.prototype.tag = function(name, value) {
    if (!this._tags) {
        if (FS.existsSync(this._tmpFile)) {
            try {
                this._tags = JSON.parse(FS.readFileSync(this._tmpFile).toString());
            }
            catch (ex) {
                this._tags = {};
            }
        } else {
            this._tags = {};
        }
    }
    if (typeof value === 'undefined') {
        return this._tags[name];
    }
    if (value === null) {
        delete this._tags[name];
    } else {
        this._tags[name] = value;
    }
};



/**
 * Provides the class `Source` used to add __tags__ on source files.
 */
module.exports = Source;

