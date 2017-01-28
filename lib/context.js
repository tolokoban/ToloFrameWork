"use strict";

var FS = require("fs");
var Path = require("path");


/**
 * This is the context of a project. A project is definied by its `package.json` file.
 */
var Context = function( packageFilename, options ) {
    if( typeof options === 'undefined' ) options = {};

    packageFilename = Path.resolve( packageFilename );
    if( false == FS.existsSync() ) 
        this.fatal( "Package file not found: \"" + packageFilename + "\"" );
    
    var prjDir = Path.dirname( packageFilename );
    this._prjDir = Path.resolve( prjDir );
    this._libDir = Path.resolve( Path.join(__dirname, "../ker") );
    this._tplDir = Path.resolve( Path.join(__dirname, "../tpl") );
    this._srcDir = mkdir.call( this, prjDir, "src" );
    this._docDir = mkdir.call( this, prjDir, "doc" );
    this._tmpDir = mkdir.call( this, prjDir, "tmp" );
    this._wwwDir = mkdir.call( this, prjDir, "www" );

};


/**
 * @member Context.fatal
 * @param 
 */
Context.prototype.fatal = function( msg ) {
    throw msg;
};


/**
 * @param arguments all arguments will be joined to form the path of the directory to create.
 * @return the name of the created directory.
 */
function mkdir( dir ) {
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
            try {
                FS.mkdirSync(curPath);
            }
            catch (ex) {
                this.fatal( "Unable to create directory \"" + curPath + "\"!\n" + ex );
            }
        }
    }
    return path;    
}


module.exports = Context;
