#! /usr/bin/env node
 // -*- js -*-

"use strict";

/**
 *
 * @module tfw
 */
require( "colors" );
const
    FS = require( "fs" ),
    DEF = require( "../lib/usage" ),
    Path = require( "path" ),
    Util = require( "../lib/util" ),
    Init = require( "../lib/init" ),
    Project = require( "../lib/project" ),
    Package = require( "../lib/package" ),
    PathUtils = require( "../lib/pathutils" ),
    OptionsParse = require( "../lib/options-parser" );

// Read the version in the package file.
const cfg = Package;
const txt = ` ToloFrameWork ${cfg.version} `;
let sep = "";
for ( let i = 0; i < txt.length; i++ ) {
    sep += "-";
}
sep = `+${sep}+`;
console.log( sep );
console.log( `| ToloFrameWork ${cfg.version.yellow} |` );
console.log( sep );
console.log();

String.prototype.err = function () {
    var sep =
        "+------------------------------------------------------------------------------------------------------------------------+";
    var txt = '';
    this.split( "\n" ).forEach( function ( line ) {
        var buff = '| ',
            i, c, mode = 0;
        for ( i = 0; i < line.length; i++ ) {
            c = line.charCodeAt( i );
            if ( mode == 0 ) {
                if ( c > 31 ) {
                    buff += line.charAt( i );
                } else if ( c == 7 ) {
                    buff += "    ";
                } else if ( c == 27 ) {
                    // Remove all color information.
                    mode = 1;
                }
            } else {
                if ( c == 109 ) {
                    mode = 0;
                }
            }
        }
        while ( buff.length < 120 ) {
            buff += ' ';
        }
        txt += ( buff + " |" ).redBG.white + "\n";
    } );
    return sep.redBG.white + "\n" + txt + sep.redBG.white + "\n";
};

var firstProcess = true;
var tasks = [];
var options = { transpilation: true };
var args = process.argv;
var parsedCommandLine = OptionsParse.parse( args, DEF );
if ( parsedCommandLine.init ) {
    Init.start( cfg );
}
if ( parsedCommandLine.clean ) {
    tasks.push( function ( prj ) {
        console.log( "Cleaning...".green );
        Util.cleanDir( "./tmp" );
        var cfgFile = prj.srcPath( '$.js' );
        if ( FS.existsSync( cfgFile ) ) {
            FS.unlinkSync( filepath );
        }
    } );
}
if ( parsedCommandLine.version ) {
    tasks.push( function ( prj ) {
        if ( firstProcess ) {
            console.log( "Incrementing version...".green );
            prj.makeVersion();
        }
    } );
}
if ( parsedCommandLine.debug ) {
    tasks.push( function ( prj ) {
        console.log( "Build for DEVELOPMENT. Don't minify, don't combine.".green );
        options.dev = true;
        options.debug = true;
        options.transpilation = ( parsedCommandLine[ 'no-transpilation' ] ? false : true );
    } );
}
if ( parsedCommandLine.build ) {
    tasks.push( function ( prj ) {
        prj.compile( options );
    } );
}
if ( parsedCommandLine.php ) {
    tasks.push( function ( prj ) {
        prj.services( options );
    } );
}
if ( parsedCommandLine.doc ) {
    tasks.push( function ( prj ) {
        prj.makeDoc( options );
    } );
}
if ( parsedCommandLine.jsdoc ) {
    tasks.push( function ( prj ) {
        prj.makeJSDoc( options );
    } );
}
if ( parsedCommandLine.test ) {
    tasks.push( function ( prj ) {
        var modules = prj.getCompiledFiles();
        if ( modules.length == 0 ) {
            modules = prj.compile( options );
        }
        prj.makeTest( modules, parsedCommandLine.test.dir[ 0 ] );
    } );
}
if ( tasks.length == 0 ) {
    console.log();
    console.log( OptionsParse.usage( DEF ) );
    console.log( "Examples:" );
    console.log( "  tfw build clean" );
    console.log( "  tfw test -dir \"./spec-jasmine\"" );
    console.log();
} else {
    function start() {
        try {
            console.log();
            console.log( ( "" + ( new Date() ) ).green );
            console.log();
            var time = Date.now();
            var prj = Project.createProject( '.' );
            tasks.forEach( function ( task ) {
                task( prj );
            } );
            var now = Date.now();
            console.log( '----------------------------------------' );
            console.log(
                "Time: " +
                ( ( now - time ) / 1000 ).toFixed( 3 ).yellow +
                " seconds." );
            return prj;
        } catch ( x ) {
            x.fatal = x.fatal || "" + x;
            x.src = x.src || [ "" ];
            x.id = x.id || "Internal javascript error";
            console.error( "\n" );
            console.error( "+-------------+".redBG.white );
            console.error( "| FATAL ERROR |".redBG.white + " " +
                ( typeof x.id === 'string' ? x.id.red : '' ) );
            console.error( ( x.fatal ).err() );
            x.src.forEach( function ( src, idx ) {
                src = src || "";
                console.error( src.red );
            } );
            console.error( "\n" );
            if ( x.stack ) {
                console.error( x.stack.trim().red );
                console.error( "\n" );
            }
            return false;
        }
    }

    var timer = 0;
    var watchedDirectories = [];

    function watch( path ) {
        try {
            if ( watchedDirectories.indexOf( path ) == -1 ) {
                if ( !FS.existsSync( path ) ) {
                    console.error( `Can't watch missing file "${path}"!` );
                }
                //console.log("Watching ".cyan + path);
                watchedDirectories.push( path );
                FS.watch( path, processLater.bind( null, path ) );
            }
        } catch ( ex ) {
            console.error( `Unable to watch "${path}": \n${ex}\n`.redBG.white );
        }
    }

    var prj = start();
    firstProcess = false;

    function processLater( root, eventName, filename ) {
        if ( filename ) {
            // Don't compile if only `manifest.webapp` changed.
            if ( filename == 'manifest.webapp' ) return;
            if ( filename.startsWith( '#' ) ) return;
            if ( filename.startsWith( '.#' ) ) return;
            if ( filename.endsWith( '~' ) ) return;
            var path = Path.join( root, filename );
            if ( PathUtils.isDirectory( path ) ) {
                if ( !FS.existsSync( path ) ) return;
                if ( watchedDirectories.indexOf( filename ) == -1 ) {
                    watch( path );
                }
                return;
            }
            console.log( "File change: " + path.yellow );
            // If a resource file changes, we have to touch the corresponding module's JS file.
            prj.cascadingTouch( path );
        }
        if ( timer ) {
            clearTimeout( timer );
        }
        timer = setTimeout( start, 50 );
    }

    // Watch files?
    if ( parsedCommandLine.watch && prj ) {
        console.log();
        const fringe = [
            Path.join( __dirname, "../ker" ),
            prj.srcPath(),
            prj.srcPath( "../package.json" )
        ];
        fringe.push( ...prj.getExtraModulesPath() );
        while ( fringe.length > 0 ) {
            const path = fringe.pop();
            watch( path );
            if ( !PathUtils.isDirectory( path ) ) continue;
            FS.readdirSync( path ).forEach( filename => {
                const subpath = Path.join( path, filename );
                if ( PathUtils.isDirectory( subpath ) ) {
                    fringe.push( subpath );
                }
            } );
        }
        console.log();
    }
}
