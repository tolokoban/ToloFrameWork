"use strict";


module.exports = {
    findFilesByExtension,
    findFiles,
    addPrefix,
    mkdir,
    rmdir,
    file,
    isDirectory,
    isNewer,
    touch,
    size
};

const FS = require( "fs" ),
      Path = require( "path" );

const BYTES_TO_KB = 0.001;

/**
 * @param {string} root Root folder in which we will search.
 * @param {rx|array} _filters  If it is not an array,  it is considered
 * as an array  with only one element. In the  array, the last element
 * is the regexp of a file to match, the other elements are regexp for
 * containing folders.
 * If filter is missing, return all files in `root`.
 * @param {number} index Used internally for recursion purpose.
 *
 * @return {array} Array of full pathes of found files.
 */
function findFiles( root, _filters, index = 0 ) {
    if ( !FS.existsSync( root ) ) return [];
    if ( !isDirectory( root ) ) return [];

    const filters = Array.isArray( _filters ) ? _filters : [_filters];
    if ( index >= filters.length ) return [];

    let files = [];
    if ( filters.length > index + 1 ) {
        // Looking for directories.
        const filter = filters[ index ];
        FS.readdirSync( root ).forEach(function ( filename ) {
            if ( isDirectory( Path.join( root, filename ) ) ) {
                if ( !filters || !filter || filter.test( filename ) ) {
                    files = files.concat(findFiles( Path.join( root, filename ), filters, index + 1 ));
                }
            }
        });
    } else {
        // Looking for files.
        const filter = filters[ index ];
        FS.readdirSync( root ).forEach(function ( filename ) {
            if ( isDirectory( Path.join( root, filename ) ) ) return;
            if ( !filters || !filter || filter.test( filename ) ) {
                files.push(Path.join( root, filename ));
            }
        });
    }
    return files;
}

function findFilesByExtension( root, ext ) {
    const files = [],
          fringe = [ root ];

    while ( fringe.length > 0 ) {
        const path = fringe.pop();
        if ( FS.existsSync( path ) ) {
            const subfiles = FS.readdirSync( path );
            for( const filename of subfiles ) {
                const f = Path.join( path, filename );
                const stat = FS.statSync( f );
                if ( !stat.isFile() ) {
                    fringe.push( f );
                } else if ( filename.substr( -ext.length ) === ext ) {
                    files.push( f );
                }
            }
        }
    }
    return files;
}


function addPrefix( path, prefix ) {
    return Path.join(
        Path.dirname( path ),
        prefix + Path.basename( path )
    ).split( Path.sep ).join( "/" );
}

function isDirectory( path ) {
    if ( !FS.existsSync( path ) ) return false;
    const stat = FS.statSync( path );
    return stat.isDirectory();
}

function mkdir( ...pathes ) {
    const path = Path.resolve( ...pathes );
    let curPath = "";
    const items = path.replace( /\\/gu, '/' ).split( "/" );
    for ( let i = 0; i < items.length; i++ ) {
        const item = items[ i ];
        curPath += `${item}/`;
        if ( FS.existsSync( curPath ) ) {
            const stat = FS.statSync( curPath );
            if ( !stat.isDirectory() ) {
                break;
            }
        } else {
            try {
                if ( curPath !== '.' ) {
                    FS.mkdirSync( curPath );
                }
            } catch ( ex ) {
                throw Error(`Unable to create directory "${curPath}"!\n${ex}`);
            }
        }
    }
    return path;
}

function rmdir( path ) {
    if ( !FS.existsSync( path ) ) return false;
    const stat = FS.statSync( path );
    if ( stat.isDirectory() ) {
        FS.readdirSync( path ).forEach(function ( filename ) {
            const fullpath = Path.join( path, filename );
            try {
                rmdir( fullpath );
            } catch ( ex ) {
                console.error( `Unable to remove directory "${fullpath.redBG.white}"!` );
                console.error( String(ex).red );
            }
        });
        try {
            FS.rmdirSync( path );
        } catch ( err ) {
            console.error( `Unable to remove directory '${path}'!` );
            console.error( err );
        }
    } else {
        try {
            FS.unlinkSync( path );
        } catch ( err ) {
            console.error( `Unable to delete file '${path}'!` );
            console.error( err );
        }
    }
    return true;
}

/**
 * Read or write the content of a file.
 *
 * If  `content` is  undefined, the  content  is read,  otherwise it  is
 * written.
 * If the  file to be  written is in  a non-existent subfolder,  the whole
 * path will be created with the `mkdir`function.
 *
 * @param {string} path - Path of the file to read or write.
 * @param {string} content - Optional. If omitted, we return the content of the file.
 * Otherwise, we save this content to the file.
 * @returns {string} The file content.
 */
function file( path, content ) {
    try {
        if ( typeof content === 'undefined' ) {
            if ( !FS.existsSync( path ) ) return null;
            return FS.readFileSync( path );
        }
        const dir = Path.dirname( path );
        mkdir( dir );
        FS.writeFileSync( path, content );
        return content;
    } catch ( ex ) {
        console.warn( "content:", content );
        throw new Error( `${ex}\n...in pathutils/file("${path}", ${typeof content})` );
    }
}

/**
 * @param {string} sourcePath - Full path.
 * @param {string} referencePath - Full path.
 * @return {boolean} `true` if `sourcePath` exists and is more recent than `referencePath`,
 * `true` if `referencePath` does not exist,
 * `false` otherwise.
 */
function isNewer( sourcePath, referencePath ) {
    if ( !FS.existsSync( referencePath ) ) return true;
    if ( !FS.existsSync( sourcePath ) ) return false;
    const statSrc = FS.statSync( sourcePath );
    const statRef = FS.statSync( referencePath );
    const timeSrc = statSrc.mtime.getTime();
    const timeRef = statRef.mtime.getTime();
    return timeSrc > timeRef;
}

/**
 * Set current date as modification time to a file.
 *
 * @param   {string} path - Path of the file to touch.
 * @returns {boolean} `true` is the file exists.
 */
function touch( path ) {
    if ( FS.existsSync( path ) ) {
        const content = FS.readFileSync( path );
        FS.writeFileSync( path, content );
        console.log( `File has been touched: ${path.yellow} (${(size(path) * BYTES_TO_KB).toFixed(1)} kb)` );
        return true;
    }
    return false;
}


/**
 * @param {string} path - Path of the file we want to know the size.
 * @returns {int} Size in bytes.
 */
function size( path ) {
    if( !FS.existsSync( path ) ) return 0;

    const stat = FS.statSync( path );
    return stat.size;
}
