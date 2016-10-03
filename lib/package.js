/**
 * @module package
 *
 * @description
 * Return the content of `package.json`.
 *
 * @example
 * var mod = require('package');
 */
var FS = require("fs");
var Path = require("path");


var packageFile = Path.join(__dirname, "../package.json");
var cfg = {};
if( FS.existsSync( packageFile ) ) {
    cfg = JSON.parse( FS.readFileSync( packageFile ) );
}

module.exports = cfg;
