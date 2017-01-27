"use strict";

var FS = require("fs");
var Tpl = require("./template");
var Const = require("os").constants;
var Source = require("./source");


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
            stream.end();
        });
    });

};
