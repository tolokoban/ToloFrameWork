"use strict";

const
    FS = require( "fs" ),
    Tpl = require( "./template" ),
    Util = require( "./util" ),
    Source = require( "./source" ),
    DepFind = require( "./dependencies-finder" ),
    MinifyJS = require( "./minifyJS" ),
    Transpiler = require( "./transpiler" ),
    CompileModule = require( "./compile-module" );

/**
 * @param {object} prj - Current project.
 * @param {array} compiledFiles - Array of compiled Html files.
 * @returns {undefined}
 */
exports.compile = function compile( prj, compiledFiles ) {
    const
        modules = [],
        webWorkerFiles = [];

    compiledFiles.forEach( function forEachCompiledFile( file ) {
        const output = file.tag( 'output' );
        output.modules.forEach( function forEachModule( mod ) {
            if ( Util.isInArray( modules, mod ) ) {
                const
                    webWorkerName = `${mod}.wrk`,
                    webWorkerFile = prj.srcPath( webWorkerName );
                if ( FS.existsSync( webWorkerFile ) ) {
                    webWorkerFiles.push( new Source( prj, webWorkerName ) );
                }
                modules.push( mod );
            }
        } );
    } );

    if ( Util.isEmpty( webWorkerFiles ) ) return;

    console.log( "WebWorkers...".cyan );
    webWorkerFiles.forEach( function forEachwebWorkerFile( webWorkerFile ) {
        const
            nameAsJs = Util.replaceExtension( Util.removeFirstSubFolder( webWorkerFile.name() ), ".js" ),
            dst = prj.wwwPath( nameAsJs ),
            fringe = DepFind( webWorkerFile.read() ).requires,
            dependentModules = [ '$' ];

        let output = `const window = self;\n\n${Tpl.file( 'require.js' ).out}`;

        while ( fringe.length > 0 ) {
            const module = fringe.pop();
            if ( Util.isInArray( dependentModules, module ) ) continue;
            dependentModules.push( module );
            const
                modContent = new Source( prj, `mod/${module}.js` ).read(),
                requires = DepFind( modContent ).requires;
            requires.forEach( function forEachRequire( childModule ) {
                if ( Util.isInArray( fringe, childModule ) ) return;
                fringe.push( childModule );
            } );
        }

        output += processDependentModules( prj, dependentModules ) +
            webWorkerFile.read();
        const transpiled = Transpiler.transpile( output );
        output = transpiled.code;

        console.log( `>>> ${dst.cyan} ${Util.convertToKiloBytes(output.length)} kb.` );
        if ( !prj.options.debug ) {
            const minification = MinifyJS.minify( {
                name: webWorkerFile.name(),
                content: output
            } );
            output = minification.zip;
            console.log( `Minified to ${Util.convertToKiloBytes(output.length)} kb.` );
        }

        const stream = FS.createWriteStream( dst );
        stream.once( 'open', function onStreamOpen() {
            stream.write( output );
            stream.end();
        } );
    } );

};


/**
 * @param {object} project - Current project.
 * @param {array} dependentModules - Name of modules the WebWorker depends on.
 * @returns {string} Source code to output.
 */
function processDependentModules( project, dependentModules ) {
    let output = '';
    dependentModules.sort();
    dependentModules.forEach( function forEachDependentModule( moduleName ) {
        const result = CompileModule( project, moduleName );
        output += result.code;
    } );
    return output;
}