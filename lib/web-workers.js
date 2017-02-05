"use strict";

var FS = require("fs");
var Tpl = require("./template");
var Const = require("os").constants;
var Source = require("./source");
var DepFind = require("./dependencies-finder");
var MinifyJS = require("./minifyJS");
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
        dst = dst.substr(0, dst.length - 3) + 'js';
        dst = prj.wwwPath( dst );

        var output = "var window = self;\n\n";
        output += Tpl.file( 'require.js' ).out;

        var fringe = DepFind( webWorkerFile.read() ).requires;
        var dependentModules = ['$'];
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
            output += result.code;
        });

        output += webWorkerFile.read();
        console.log( ">>> " + dst.cyan, "  " + Math.ceil(output.length / 1024) + " kb." );
        if( !prj.options.debug ) {
            var minification = MinifyJS({
                name: webWorkerFile.name(),
                content: output
            });
            output = minification.zip;
            console.log( "Minified to " + Math.ceil(output.length / 1024) + " kb." );
        }

        var stream = FS.createWriteStream( dst );
        stream.once('open', function() {
            stream.write( output );
            stream.end();
        });
    });

};
