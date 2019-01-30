"use strict";

const
Fs = require("fs"),
Path = require("path"),
Util = require("./util");

const EXTENSIONS = ['js', 'xjs', 'css', 'ini', 'dep', 'vert', 'frag', 'wrk'];
const OLD_MOD_PREFIX = "mod/";

/**
 * A module is something you can `require()`.
 * * `mymodule.js`
 * * `mymodule.xjs`
 * * `mymodule.css`
 * * `mymodule.ini`
 * * `mymodule.dep`
 * * `mymodule.vert`
 * * `mymodule.frag`
 * * `mymodule.wrk`

 */
class Module {

    /**
     * @param {string} _moduleName - Name of the module (with dots).
     * @param {array} _srcPath - Array of absolute pathes where to look for sources.
     */
    constructor(_moduleName, _srcPath) {
        const
        moduleName = typeof _moduleName === 'string' && _moduleName.startsWith(OLD_MOD_PREFIX)
            ? _moduleName.substr( OLD_MOD_PREFIX.length ) : _moduleName,
        srcPath = Array.isArray(_srcPath) ? _srcPath : [_srcPath],
        candidates = getCandidates(moduleName, srcPath),
        candidate = getFirstViableCandidate(candidates),
        properties = { name: moduleName };
        for( const extension of EXTENSIONS) {
            properties[`path${Util.capitalize( extension )}`] = `${candidate}.${extension}`;
            properties[`exists${Util.capitalize( extension )}`] =
                () => Fs.existsSync( `${candidate}.${extension}` );
            properties[`content${Util.capitalize( extension )}`] = () => {
                if( Fs.existsSync( `${candidate}.${extension}` ) ) {
                    return Fs.readFileSync( `${candidate}.${extension}` );
                }
                return "";
            };
        }
        properties.lastModificationTime = () => {
            let time = 0;
            for( const extension of EXTENSIONS) {
                const filename = `${candidate}.${extension}`;
                if( !Fs.exists(filename) ) continue;
                const stat = Fs.statSync( filename );
                time = Math.max( time, stat.mtime.getTime() );
            }
            return time;
        };
        properties.directory = Path.dirname( `${candidate}.js` );
        Util.readonly(this, properties);
    }

    resolve( path ) {
        return Path.resolve( this.directory, path );
    }
}


/**
 * List all possible absolute pathes for the given module.
 *
 * @param {string} moduleName - Name of the module (with dots).
 * @param {array} srcPath - Array of absolute pathes where to look for sources.
 * Module's files lie in the subdirectory `mod/` of a source directory.
 * @returns {array} Array of absolute module pathes in order of preferrence.
 * Because a module can be made of several different files with the same basename,
 * These pathes have no file extension.
 */
function getCandidates(moduleName, srcPath) {
    const
    candidates = [],
    moduleNames = getSynonyms(moduleName);

    for( const path of srcPath) {
        for( const name of moduleNames) {
            candidates.push( Path.resolve( path, "mod", name) );
        }
    }
    return candidates;
}


/**
 * Names with dots can be found in subfolder.
 * For instance a module named "tfw.view.textbox" can have its javascript code
 * in "tfw/view/textbox.js" or in "tfw.view.textbox.js".
 * The first syntax is prefered.
 *
 * @param {string} moduleName - Name of the module with dots.
 * @returns {array} One or two synonyms for this module name.
 */
function getSynonyms(moduleName) {
    const preferredName = moduleName.split(".").join("/");
    if( preferredName === moduleName) {
        return [moduleName];
    }
    return [preferredName, moduleName];
}


/**
 * A candidate is viable if the `js` or the `xjs` file exists.
 *
 * @param {array} candidates - Pathes of module files (without extension).
 * @returns {string} The first candidate if no module has been found.
 */
function getFirstViableCandidate(candidates) {
    for( const candidate of candidates) {
        const fileJS = `${candidate}.js`;
        if( Fs.existsSync(fileJS) ) return candidate;
        const fileXJS = `${candidate}.xjs`;
        if( Fs.existsSync(fileXJS) ) return candidate;
    }

    return candidates[0];
}


/**
 * Create a Module object from a filename.
 * If this filename is not from an existing Module, return `null`.
 *
 * @param {string} filename - Name of the module (with dots).
 * @param {array} _srcPath - Array of absolute pathes where to look for sources.
 * @return {Module} Or `null` if no matching module.
 *
 * @todo this is a work in progress, maybe useless...
 */

/*
  Module.fromFilename = function(filename, _srcPath) {
  const
  srcPath = Array.isArray(_srcPath) ? _srcPath : [_srcPath];

  for( const path of srcPath ) {
  const absPath = Path.resolve( path );
  const relative = Path.relative( absPath, path );

  }

  return null;
  };
*/

module.exports = Module;
