"use strict";

module.exports = {

    /**
     * @param {string} js Script you want to zip.
     * @return zipped script.
     */
    zipJS,

    /**
     * @param {string} css Style you want to zip.
     * @return zipped cascading style sheet.
     */
    zipCSS,

    /**
     * Return a copy of an array after removing all doubles.
     * @param {array} arrInput array of any comparable object.
     * @returns {array} A copy of the input array without doubles.
     */
    removeDoubles,

    /**
     * Remove all files and directories found in `path`, but not `path` itself.
     * @param {string} path - The folder we want to clean the content.
     * @param {boolean} _preserveGit [false] - If `true`, the folder ".git" is not deleted.
     * @returns {undefined}
     */
    cleanDir,

    /**
     * @param {array} arr - Array in which we want to find `item`.
     * @param {any} item - Element to find in `arr`.
     * @returns {boolean} `true` is `item` is an element of `arr`;
     */
    isInArray,

    /**
     * @param {array|string} target - Any object providing a `length` method.
     * @returns {boolean} `true` is and only if `target.length !== 0`.
     */
    isEmpty,

    /**
     * @param {object} obj - Object to clone.
     * @returns {object} Copy of `obj`.
     */
    clone,

    /**
     * @param {string} path - Example: `mod/mymodule.js`.
     * @param {string} newFirstSubFolder - Example: `css`.
     * @return {string} We search for the first folder in `path` and
     * replace it with `newFirstSubFolder`.
     */
    replaceFirstSubFolder,

    /**
     * @param {string} path - Example: `mod/mymodule.js`.
     * @return {string} We search for the first folder in `path` and remove it.
     */
    removeFirstSubFolder,

    /**
     * @param {string} filename - Path of a file.
     * @param {string} newextension - New extension to give to the file `filename`.
     * @returns {string} `filename` with extension `newExtension`.
     */
    replaceExtension,

    /**
     * @param {string} filename - Path of a file.
     * @returns {string} `filename` without its extension.
     */
    removeExtension,

    /**
     * @param {string} filename - Path of a file.
     * @returns {string} The extension without leading dot.
     */
    getExtension,

    /**
     * @param {number} length - Number of bytes.
     * @returns {string} Conversion in kilobytes with 3 decimals if less than 3 kb.
     */
    convertToKiloBytes,

    /**
     * Check if at least one file is newer than the target one.
     *
     * @param {array}  inputs - Array of files (with full path) to compare to `target`.
     * @param {string} target - Full path of the reference file.
     * @returns {Boolean} `true` if `target` does not exist, or if at leat one input is newer than `target`.
     */
    isNewerThan,

    /**
     * @param {string} filename - Name of the file.
     * @param {string} extension - Extension.
     * @returns {boolean} `true` if the filename has the expected extension.
     */
    hasExtension,

    /**
     * @param {array} arr - Array at the end of which we want to push an unique item.
     * @param {any} element - The element we want to push, but only if it is not already in.
     * @returns {array} The initial array.
     */
    pushUnique,

    /**
     * A module called "tfw.view.textbox" can be stored in two different files:
     * * "tfw.view.textbox.js"
     * * "tfw/view/textbox.js"
     *
     * Prefer the second syntax because it makes easy to look for modules in a file manager.
     *
     * @param   {string} path - Syntax with dots.
     * @returns {string} Syntax with slashes.
     */
    replaceDotsWithSlashes,

    replaceSlashesWithDots
};

const PathUtils = require( "./pathutils" ),
      CleanCSS = require( "clean-css" ),
      UglifyJS = require( "uglify-js" ),
      Path = require( "path" ),
      FS = require( "fs" );


/**
 * A module called "tfw.view.textbox" can be stored in two different files:
 * * "tfw.view.textbox.js"
 * * "tfw/view/textbox.js"
 *
 * Prefer the second syntax because it makes easy to look for modules in a file manager.
 *
 * @param   {string} path - Syntax with dots.
 * @returns {string} Syntax with slashes.
 */
function replaceDotsWithSlashes( path ) {
    if ( typeof path !== 'string' ) return path;

    const
    pieces = Path.parse( path ),
    prefix = Path.join( pieces.root, pieces.dir ),
    name = pieces.name.split( '.' ).join( Path.sep );
    return Path.normalize( Path.join( prefix, `${name}${pieces.ext}` ) );
}


/**
 * @param {array} arr - Array at the end of which we want to push an unique item.
 * @param {any} element - The element we want to push, but only if it is not already in.
 * @returns {array} The initial array.
 */
function pushUnique( arr, element ) {
    if ( !isInArray( arr, element ) ) arr.push( element );
    return arr;
}

/**
 * @param {number} length - Number of bytes.
 * @returns {string} Conversion in kilobytes with 3 decimals if less than 3 kb.
 */
function convertToKiloBytes( length ) {
    const
    DECIMALS = 3,
    KILOBYTE = 1024,
    THRESHOLD = 3 * KILOBYTE;
    if ( length < THRESHOLD ) return ( length / KILOBYTE ).toFixed( DECIMALS );
    return Math.ceil( length / KILOBYTE );
}


/**
 * @param {string} path - Example: `mod/mymodule.js`.
 * @param {string} newFirstSubFolder - Example: `css`.
 * @return {string} We search for the first folder in `path` and
 * replace it with `newFirstSubFolder`.
 */
function replaceFirstSubFolder( path, newFirstSubFolder ) {
    const
    slashPosition = path.indexOf( '/' ),
    NOT_FOUND = -1;
    if ( slashPosition === NOT_FOUND ) {
        return path;
    }
    if ( newFirstSubFolder.endsWith( '/' ) ) {
        return newFirstSubFolder + path.substr( slashPosition + 1 );
    }
    return newFirstSubFolder + path.substr( slashPosition );
}


/**
 * @param {string} path - Example: `mod/mymodule.js`.
 * @return {string} We search for the first folder in `path` and remove it.
 */
function removeFirstSubFolder( path ) {
    const slashPosition = path.indexOf( '/' ),
          NOT_FOUND = -1;
    if ( slashPosition === NOT_FOUND ) return path;
    return path.substr( slashPosition + 1 );
}

/**
 * @param {string} filename - Path of a file.
 * @returns {string} `filename` without its extension.
 */
function removeExtension( filename = "" ) {
    const file = Path.parse( filename );
    const result = Path.join( file.dir, file.name );
    return result;
}


/**
 * @param {string} filename - Path of a file.
 * @returns {string} Extension without leading dot.
 */
function getExtension( filename = "" ) {
    const file = Path.parse( filename );
    if( file.ext.length > 0 ) return file.ext.substr(1);
    return file.ext;
}


/**
 * @param {string} filename - Path of a file.
 * @param {string} newExtension - New extension to give to the file `filename`.
 * @returns {string} `filename` with extension `newExtension`.
 */
function replaceExtension( filename, newExtension ) {
    if( typeof filename !== 'string' ) return filename;
    const dotPosition = filename.lastIndexOf( '.' ),
          NOT_FOUND = -1;
    if ( dotPosition === NOT_FOUND ) return filename;
    if ( newExtension.startsWith( '.' ) ) return filename.substr( 0, dotPosition ) + newExtension;
    // newExtension has been given without starting dot.
    return filename.substr( 0, dotPosition + 1 ) + newExtension;
}

/**
 * @param {object} obj - Object to clone.
 * @returns {object} Copy of `obj`.
 */
function clone( obj ) {
    return JSON.parse( JSON.stringify( obj ) );
}


/**
 * @param {array} arr - Array in which we want to find `item`.
 * @param {any} item - Element to find in `arr`.
 * @returns {boolean} `true` is `item` is an element of `arr`;
 */
function isInArray( arr, item ) {
    const NOT_IN_ARRAY = -1;
    return arr.indexOf( item ) !== NOT_IN_ARRAY;
}


/**
 * @param {array|string} target - Any object providing a `length` property.
 * @returns {boolean} `false` is and only if `target.length === 0`.
 */
function isEmpty( target ) {
    if ( !target ) return true;
    if ( typeof target.length !== 'number' ) return true;
    return target.length !== 0;
}

/**
 * @param {string} js Script you want to zip.
 * @return {string} zipped script.
 */
function zipJS( js ) {
    try {
        return UglifyJS.minify( js, { fromString: true } ).code;
    } catch ( x ) {
        throwUglifyJSException( js, x );
    }
    return null;
}

/**
 * @param {string} css Style you want to zip.
 * @return {string} zipped cascading style sheet.
 */
function zipCSS( css ) {
    return new CleanCSS( {} ).minify( css );
}

/**
 * Return a copy of an array after removing all doubles.
 * @param {array} arrInput array of any comparable object.
 * @returns {array} A copy of the input array without doubles.
 */
function removeDoubles( arrInput ) {
    const
    arrOutput = [],
    map = {};
    arrInput.forEach( function forEachItem( itm ) {
        if ( itm in map ) return;
        map[ itm ] = 1;
        arrOutput.push( itm );
    } );
    return arrOutput;
}

/**
 * Remove all files and directories found in `path`, but not `path` itself.
 * @param {string} path - The folder we want to clean the content.
 * @param {boolean} _preserveGit [false] - If `true`, the folder ".git" is not deleted.
 * @returns {undefined}
 */
function cleanDir( path, _preserveGit ) {
    const
    preserveGit = typeof _preserveGit !== 'undefined' ? _preserveGit : false,
    fullPath = Path.resolve( path );
    // If the pah does not exist, everything is fine!
    if ( !FS.existsSync( fullPath ) ) return;

    if ( preserveGit ) {

        /*
         * We must delete the content of this folder but preserve `.git`.
         * The `www` dir, for instance, can be used as a `gh-pages` branch.
         */
        const files = FS.readdirSync( path );
        files.forEach( function forEachFile( filename ) {
            if ( filename === '.git' ) return;
            const
            filepath = Path.join( path, filename ),
            stat = FS.statSync( filepath );
            if ( stat.isDirectory() ) {
                if ( filepath !== '.' && filepath !== '..' ) PathUtils.rmdir( filepath );
            } else FS.unlinkSync( filepath );
        } );
    } else {
        // Brutal clean: remove dir and recreate it.
        PathUtils.rmdir( path );
        PathUtils.mkdir( path );
    }
}

/**
 * @class Dependencies
 */
const Resources = function ( data ) {
    this.clear();
    this.data( data );
};

/**
 * Set/Get the list of dependencies.
 */
Resources.prototype.data = function ( data ) {
    if ( typeof data === 'undefined' ) {
        const copy = [];
        this._data.forEach(function ( itm ) {
            copy.push( itm );
        });
        return copy;
    }
    this.clear();
    if ( Array.isArray( data ) ) {
        data.forEach(function ( itm ) {
            this.add( itm );
        }, this);
    }
    return [];
};

/**
 * Remove all the dependencies.
 */
Resources.prototype.clear = function () {
    this._data = [];
    this._map = {};
};

/**
 * Add a dependency.
 * @param {string/array} item As an array, it is the couple `[source, destination]`.
 * If the `source` is the same as the `destination`, just pass one string.
 */
Resources.prototype.add = function ( item ) {
    let key = item;
    if ( Array.isArray( item ) ) {
        key = item[ 0 ];
    }
    if ( this._map[ key ] ) return;
    this._map[ key ] = 1;
    this._data.push( item );
};

/**
 * Loop on the dependencies.
 */
Resources.prototype.forEach = function ( f, selfReference ) {
    this._data.forEach(function ( itm, idx, arr ) {
        f( itm, idx, arr );
    }, selfReference);
};


exports.Resources = Resources;


function throwUglifyJSException( js, ex ) {
    let msg = `${ex.message}\n`;
    msg += `  line: ${ex.line}\n`;
    msg += `  col.: ${ex.col}\n`;
    msg += "----------------------------------------" +
        "----------------------------------------\n";
    const content = js;
    const lines = content.split( "\n" ),
          min = Math.max( 0, ex.line - 1 - 2 ),
          max = ex.line;
    let indent = '';
    for ( let lineIndex = min; lineIndex < max; lineIndex++ ) {
        msg += `${lines[ lineIndex ].trimRight()}\n`;
    }
    for ( let lineIndex = 0; lineIndex < ex.col; lineIndex++ ) {
        indent += ' ';
    }
    msg += `\n${indent}^\n`;
    throw {
        fatal: msg,
        src: "util.zipJS"
    };
}

/**
 * @param {string} filename - Name of the file.
 * @param {string} extension - Extension.
 * @returns {boolean} `true` if the filename has the expected extension.
 */
function hasExtension( filename, extension ) {
    if ( extension.charAt( 0 ) !== '.' ) {
        return hasExtension( filename, `.${extension}` );
    }
    return filename.endsWith( extension );
}

/**
 * Check if at least one file is newer than the target one.
 *
 * @param {array}  inputs - Array of files (with full path) to compare to `target`.
 * @param {string} target - Full path of the reference file.
 * @returns {Boolean} `true` if `target` does not exist, or if at leat one input is newer than `target`.
 */
function isNewerThan( inputs, target ) {
    if ( !FS.existsSync( target ) ) return true;

    const files = Array.isArray( inputs ) ? inputs : [ inputs ],
          statTarget = FS.statSync( target ),
          targetTime = statTarget.mtime;

    for ( const file of files ) {
        if ( !FS.existsSync( file ) ) continue;

        const stat = FS.statSync( file );
        if ( stat.mtime > targetTime ) {
            return true;
        }
    }
    return false;
}


function replaceSlashesWithDots( name ) {
    if( name.startsWith( 'mod/') ) return `mod/${name.substr('mod/'.length).split( '/' ).join( '.' )}`;
    return name.split( '/' ).join( '.' );
}
