"use strict";

var FS = require("fs");
var Tpl = require("./template");
var Const = require("os").constants;
var Source = require("./source");
var DepFind = require("./dependencies-finder");
var CompileModule = require("./compile-module");


module.exports = function( prj, compiledFiles ) {
    var modules = [];
    var webWorkerFiles = [];
    
    compiledFiles.forEach(function (file) {
        var output = file.tag('output');
        output.modules.forEach(function (mod) {
            if( modules.indexOf( mod ) == -1 ) {
                var webWorkerFile = prj.srcPath( mod + ".wrk" );
                if( FS.existsSync( webWorkerFile ) ) {
                    webWorkerFiles.push( new Source( prj, mod + ".wrk" ) );
                }
                modules.push( mod );
            }
        });
    });

    if( webWorkerFiles.length == 0 ) return;

    console.log( "WebWorkers...".cyan );
    webWorkerFiles.forEach(function (webWorkerFile) {
        var dst = webWorkerFile.name().substr( 4 );
        console.log( ">>> " + dst.cyan );
        dst = prj.wwwPath( dst );
        var stream = FS.createWriteStream( dst );
        stream.once('open', function() {
            stream.write( "var window = self;\n\n" );
            stream.write( Tpl.file( 'require.js' ).out );

            var fringe = DepFind( webWorkerFile.read() ).requires;
            var dependentModules = [];
            var module, modContent;
            while( fringe.length > 0 ) {
                module = fringe.pop();
                if( dependentModules.indexOf( module ) != -1 ) continue;
                dependentModules.push( module );
                modContent = new Source( prj, 'mod/' + module + '.js' ).read();
                DepFind( modContent ).requires.forEach(function( childModule ) {
                    if( fringe.indexOf( childModule ) == -1 ) {
                        fringe.push( childModule );
                    }
                });
            }

            dependentModules.sort();
            dependentModules.forEach(function( moduleName ) {
                var result = CompileModule( prj, moduleName );
                stream.write( result.code );
            });

            console.info("[web-workers] dependentModules=...", dependentModules);

            stream.end();
        });
    });

};
