"use strict";

exports.compile = compileJS;

const
ToloframeworkPermissiveJson = require( "toloframework-permissive-json" ),
ModuleAnalyser = require( "./module-analyser" ),
CompilerINI = require( "./compiler-ini" ),
Transpiler = require( "./transpiler" ),
PathUtils = require( "./pathutils" ),
Source = require( "./source" ),
Fatal = require( "./fatal" ),
Path = require( "path" ),
Util = require( "./util" ),
Tpl = require( "./template" ),
Xjs = require( "./boilerplate" );


/**
 * @param {project} project - Current project.
 * @param {string} path - Source path relative to the `src` folder.
 * @param {object} options - Build options. `{ debug, transpilation, ... }`.
 * @return {Source}
 * Tags:
 *  * __src__: debug content.
 *  * __zip__: release content.
 *  * __dependencies__: array of dependent modules.
 */
function compileJS( project, moduleName, options ) {
    try {
        const module = project.createModule( moduleName );
        const tags = project.createTagsManager();
        ensureJavascriptFileExists( module );
        
        if ( module.lastModificationTime <= tags.timeModJs(module.name) ) return src;

        const watch = [];

        console.log( `Compiling module ${module.name.yellow}` );

        const head = compileDEP( project, module, watch );
        compileINI( project, src );
        let code = convertIntoModule( module, head );

        // Export internationalization except for special module '$'.
        if ( module.name !== '$' ) {
            code += "module.exports._ = _;\n";
        }
        code += "})";

        const transpiled = Transpiler.transpile(
            code,
            src.getAbsoluteFilePath(),
            !( options.debug || options.dev )
        );

        const
        info = ModuleAnalyser.extractInfoFromAst( transpiled.ast ),
        dependencies = info.requires.map( function mapDependencies( itm ) {
            return `mod/${itm}`;
        } );
        console.log( `Dependent modules (${info.requires.length}): `, info.requires.join( ', ' ).grey );

        createMarkdownDoc( src, info );
        if ( options.transpilation ) {
            saveTags( src, transpiled.code, transpiled.zip, transpiled.map, dependencies );
        } else {
            console.log( "Transpilation: OFF".red.bold );
            saveTags( src, code, transpiled.zip, null, dependencies );
        }

        return src;
    }
    catch( ex ) {
        Fatal.bubble(ex, `[compiler-js] compileJS(${moduleName})`);
    }
}


/**
 * @param  {string} src          description
 * @param  {string} code         description
 * @param  {string} zip          description
 * @param  {string} map          description
 * @param  {string} dependencies description
 * @returns {undefined}
 */
function saveTags( src, code, zip, map, dependencies ) {
    try  {
        src.tag( 'src', code );
        src.tag( 'zip', zip );
        src.tag( 'map', map );
        src.tag( 'dependencies', dependencies );
        src.save();
    }
    catch( ex ) {
        Fatal.bubble(ex, `[compiler-js] saveTags(...)`);
    }
}

/**
 * @param {Module} module -
 * @returns {undefined}
 */
function ensureJavascriptFileExists( module ) {
    try {
        if( module.existsXjs && !module.existsJs ) {
            FS.writeFileSync( module.pathJS, `// Code behind for view ${module.name}.xjs\n"use strict";\n\n` );
        }
        else if( !module.existsJs ) {
            Fatal.fire( `Module not found: "${module.name}"!`, module.pathJs );
        }
    }
    catch( ex ) {
        Fatal.bubble( ex, `[compiler-js] ensureJavascriptFileExists(${module.name})` );
    }
}


/**
 * DEP file is here to load GLOBAL variable into the module.
 * @param {Project} project - Current project.
 * @param {Source} module - Module source file.
 * @param {array} watch - Array of files to watch for rebuild.
 * @returns {string} Javascript defining the const variable GLOBAL.
 */
function compileDEP( project, module, watch ) {
    try {
        if( !module.existsDep ) return "";
        
        const
        moduleName = module.name(),
        depFilename = module.pathDep,
        depContent = JS.readFileSync( depFilename );

        let code = '';
        try {
            const depJSON = ToloframeworkPermissiveJson.parse( depContent );
            code = processAttributeVar( project, depJSON, watch, depFilename );
        } catch ( ex ) {
            Fatal.fire( `Unable to parse JSON dependency file!\n${ex}`, depFilename );
        }

        // List of files to watch. If  one of those files is newer
        // that the JS file, we have to recompile.
        const tags = project.createTagsManager();
        tags.saveModDepWatch( module.name, watch );
        return code;
    }
    catch( ex ) {
        Fatal.bubble(ex, `[compiler-js] compileDEP(${depFilename})`);
    }
}


/**
 * In the DEP file, we can find the attribute "var".
 * It will load text file contents into the GLOBAL variable of the module.
 * @param {Project} project - Current project.
 * @param {objetc} depJSON - Parsing of the JSON DEP file.
 * @param {array} watch - Array of files to watch for rebuild.
 * @param {string} depAbsPath - Absolute path of the DEP file.
 * @returns {string} Javascript defining the const variable GLOBAL.
 */
function processAttributeVar( project, depJSON, watch, depAbsPath ) {
    try {
        if ( typeof depJSON.var === 'undefined' ) return '';

        let
        head = 'const GLOBAL = {',
        firstItem = true;

        Object.keys( depJSON.var ).forEach( function forEachVarName( varName ) {
            const
            varFilename = depJSON.var[ varName ],
            folder = Path.dirname( depAbsPath ),
            srcVar = project.srcOrLibPath( Path.join( folder, varFilename ) ) ||
                project.srcOrLibPath( `mod/${varFilename}` ) ||
                project.srcOrLibPath( varFilename );

            if ( !srcVar ) {
                Fatal.fire(
                    `Unable to find dendency file "${varFilename}" nor "mod/${varFilename}"!`,
                    depAbsPath
                );
            }
            Util.pushUnique( watch, `mod/${varFilename}` );
            if ( firstItem ) {
                firstItem = false;
            } else {
                head += ',';
            }
            const source = new Source( project, srcVar );
            head += `\n  ${JSON.stringify(varName)}: ${JSON.stringify(source.read())}`;
        } );
        head += "};\n";

        return head;
    }
    catch( ex ) {
        Fatal.bubble( ex, `[compiler-js] processAttributeVar(...)` );
    }
}


/**
 * Internationalization.
 * @param {Project} project - Current project.
 * @param {Source} src - Module source file.
 * @returns {undefined}
 */
function compileINI( project, src ) {
    try {
        // Intl.
        if ( src.name( "js" ) === 'mod/$.js' ) {
            // Internationalization for all modules except the special one: '$'.
            src.tag( "intl", "" );
        } else {
            const
            iniName = src.name( "ini" ),
            iniPath = project.srcOrLibPath( iniName );
            if ( iniPath ) {
                src.tag( "intl", CompilerINI.parse( iniPath ) );
            } else {
                src.tag( "intl", "var _=function(){return ''};" );
            }
        }
    }
    catch( ex ) {
        Fatal.bubble(ex, `[compiler-js] compileINI(${src.name()})`);
    }
}


/**
 * @param {Source} src - Module source file.
 * @param {string} module - Name of the module without folder and without extension.
 * @param {string} head - Javascript already present at the top of the module (i.e.: internationalization).
 * @returns {string} Resulting code.
 */
function convertIntoModule( src, module, head ) {
    try {
        const options = {
            name: module.name,
            code: Xjs.generateCodeFrom( src ),
            intl: src.tag( 'intl' ),
            head: `${head} `,
            foot: ""
        };
        return Tpl.file( "module.js", options ).out;
    }
    catch( ex ) {
        Fatal.bubble( ex, `[compiler-js] convertIntoModule(${moduleShortName})` );
    }
}

/**
 * @param {Source} src - Module source.
 * @param {objetc} info - `{ requires, exports }`.
 * @param {array} info.publics - `[{ id, type, params, comments }, ...]`.
 * @returns {undefined}
 */
function createMarkdownDoc( src, info ) {
    try {
        const
        publics = info.exports,
        prj = src.prj(),
        name = src.name(),
        dstPath = prj.docPath( Util.replaceExtension( name, '.md' ) );
        let output = `# ${name}\n`;
        publics.forEach( function ( item ) {
            const
            params = ( item.params || [] ).join( ', ' ),
            comments = item.comments;
            output += `## \`${item.id}(${params})\`\n\n${comments}\n\n`;
        } );

        if ( info.requires.length > 0 ) {
            output += "\n----\n\n## Dependencies\n";
            output += info.requires.map( ( req ) => `* [${req}](${req}.md)` ).join( "\n" );
        }
        PathUtils.file( dstPath, output );
    }
    catch( ex ) {
        Fatal.bubble(ex, `[compiler-js] createMarkdownDoc(...)`);
    }
}

// __`width`__ (_number_) **⏵** Width of the frame view.
