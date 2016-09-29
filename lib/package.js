/**
 * @module package
 *
 * @description
 * Export the parsing of the `package.json` file.
 *
 * @example
 * var pkg = require('package');
 * console.log( pkg.version );
 */
var FS = require("fs");
var Path = require("path");


var packageFile = Path.join(__dirname, "../package.json");
var cfg = {};
if( FS.existsSync( packageFile ) ) {
    try {
        cfg = JSON.parse( FS.readFileSync( packageFile ) );
    }
    // Just ignore parsing errors.
    catch(ex) {};
}


module.exports = cfg;
