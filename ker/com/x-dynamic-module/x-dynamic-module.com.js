/**********************************************************************
 x-dynamic-module
 -----------------------------------------------------------------------

 The following statement will seek for all `*.js` files in `data/actions` directory and create a module called `mymodules.actions` which exports as many attributes as found files.
 For instance, if you have `foo.js` and `bar.js`, the module will be:

 ```
 exports.foo = ...
 exports.bar = ...


 @example

 <x-dynamic-module src="data/actions" name="mymodules.actions" />


 **********************************************************************/
var FS = require("fs");
var Path = require("path");


exports.tags = ["x-dynamic-module"];
exports.priority = 0;

/**
 * Compile a node of the HTML tree.
 */
exports.compile = function(root, libs) {
    var src = root.attribs.src;
    var name = root.attribs.name;

    if( !src ) libs.fatal( 'Missing mandatory attribute `src` in <x-dynamic-module>!' );
    if( !name ) libs.fatal( 'Missing mandatory attribute `name` in <x-dynamic-module>!' );
    if( !libs.fileExists( src ) ) libs.fatal( 'Folder not found in <x-dynamic-module>: "' + src + '"!' );

    var path = libs.filePath( src );
    var mod = readdir( path );
    /*
    var files = FS.readdirSync( path );
    files.forEach(function ( file ) {
        if( file.substr( file.length - 3 ) == '.js' ) {
            mod += "exports['" + file.substr( 0, file.length - 3 ) + "'] = ";
            mod += FS.readFileSync( Path.join( path, file ) ).toString() + "\n";
        }
    });
     */
    libs.addDynamicModule( name, mod );
    root.type = libs.Tree.VOID;
    delete root.children;
};


function readdir( path, prefix ) {
    if( typeof prefix === 'undefined' ) prefix = '';
    var mod = '';
    var files = FS.readdirSync( path );
    files.forEach(function ( filename ) {
        var filepath = Path.join( path, filename );
        var stats = FS.statSync( filepath );
        if( stats.isDirectory() ) {
            mod += readdir( filepath, prefix + filename + ":" );
        } else {
            if( filename.substr( filename.length - 3 ) == '.js' ) {
                mod += "exports['" + prefix + filename.substr( 0, filename.length - 3 ) + "'] = ";
                var content = FS.readFileSync( Path.join( path, filename ) ).toString();
                mod += content + "\n";
                try {
                    var evaluation = eval( content );
                }
                catch( ex ) {
                    console.log( "ERROR in your Dynamic module: `" + prefix + filename + "`".red );
                }
            }
        }
    });
    return mod;
}
