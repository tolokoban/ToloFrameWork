"use strict";

exports.compile = compileJS;

const
ToloframeworkPermissiveJson = require( "toloframework-permissive-json" ),
ModuleAnalyser = require( "./module-analyser" ),
CompilerINI = require( "./compiler-ini" ),
Transpiler = require( "./transpiler" ),
PathUtils = require( "./pathutils" ),
Fatal = require( "./fatal" ),
Util = require( "./util" ),
Tpl = require( "./template" ),
Xjs = require( "./boilerplate" ),
FS = require("fs");


/**
 * @param {project} project - Current project.
 * @param {string} moduleName - Module name.
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
        if ( module.lastModificationTime <= tags.timeModJs(module.name) ) return module;

        const watch = [];

        console.log( `Compiling module ${module.name.yellow}` );

        const head = compileDEP( module, tags, watch );
        compileINI( module, tags );
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

        return module;
    } catch( ex ) {
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
    try {
        src.tag( 'src', code );
        src.tag( 'zip', zip );
        src.tag( 'map', map );
        src.tag( 'dependencies', dependencies );
        src.save();
    } catch( ex ) {
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
        } else if( !module.existsJs ) {
            Fatal.fire( `Module not found: "${module.name}"!`, module.pathJs );
        }
    } catch( ex ) {
        Fatal.bubble( ex, `[compiler-js] ensureJavascriptFileExists(${module.name})` );
    }
}


/**
 * DEP file is here to load GLOBAL variable into the module.
 * @param {Source} module - Module source file.
 * @param {TagsManager} tags -
 * @param {array} watch - Array of files to watch for rebuild.
 * @returns {string} Javascript defining the const variable GLOBAL.
 */
function compileDEP( module, tags, watch ) {
    try {
        if( !module.existsDep ) return "";

        const
        moduleName = module.name(),
        depFilename = module.pathDep,
        depContent = JS.readFileSync( depFilename );

        let code = '';
        try {
            const depJSON = ToloframeworkPermissiveJson.parse( depContent );
            code = processAttributeVar( module, depJSON, watch );
        } catch ( ex ) {
            Fatal.fire( `Unable to parse JSON dependency file!\n${ex}`, depFilename );
        }

        // List of files to watch. If  one of those files is newer
        // that the JS file, we have to recompile.
        tags.saveModDepWatch( module.name, watch );
        return code;
    } catch( ex ) {
        Fatal.bubble(ex, `[compiler-js] compileDEP(${depFilename})`);
    }
}


/**
 * In the DEP file, we can find the attribute "var".
 * It will load text file contents into the GLOBAL variable of the module.
 *
 * @param {Module} module -
 * @param {objetc} depJSON - Parsing of the JSON DEP file.
 * @param {array} watch - Array of files (relatives to DEP file) to watch for rebuild.
 * @returns {string} Javascript defining the const variable GLOBAL.
 */
function processAttributeVar( module, depJSON, watch ) {
    try {
        if ( typeof depJSON.var === 'undefined' ) return '';

        let
        head = 'const GLOBAL = {',
        firstItem = true;

        for( const varName of Object.keys( depJSON.var ) ) {
            const varFilename = depJSON.var[ varName ],
                  varFile = module.resolve( varFilename );
            if( !FS.exists( varFile ) ) {
                Fatal.fire(`Unable to find GOBAL.var[${varName}] dependency file: "${varFile}"!`);
            }
            Util.pushUnique( watch, `mod/${varFilename}` );
            if ( firstItem ) {
                firstItem = false;
            } else {
                head += ',';
            }
            const content = JSON.stringify( FS.fileReadSync( varFile ) );
            head += `\n  ${JSON.stringify(varName)}: ${content}`;
        }
        head += "};\n";

        return head;
    } catch( ex ) {
        Fatal.bubble( ex, `[compiler-js] processAttributeVar(...)` );
    }
}


/**
 * Internationalization.
 * @param {Module} module -
 * @param {TagsManager} tags -
 * @returns {undefined}
 */
function compileINI( module, tags ) {
    try {
        // Intl.
        if ( module.name === '$' ) {
            // Internationalization for all modules except the special one: '$'.
            tags.saveModIni( module.name, "" );
        } else if ( module.existsIni ) {
                tags.saveModIni( module.name, CompilerINI.parse( module.pathIni ) );
            } else {
                tags.saveModIni( module.name, "var _=function(){return ''};" );
            }
    } catch( ex ) {
        Fatal.bubble(ex, `[compiler-js] compileINI(${module.name()})`);
    }
}


/**
 * @param {string} module - Name of the module without folder and without extension.
 * @param {TagsManager} tags -
 * @param {string} head - Javascript already present at the top of the module (i.e.: internationalization).
 * @returns {string} Resulting code.
 */
function convertIntoModule( module, tags, head ) {
    try {
        const options = {
            name: module.name,
            code: Xjs.generateCodeFrom( module, tags ),
            intl: tags.loadModIni( module.name ),
            head: `${head} `,
            foot: ""
        };
        return Tpl.file( "module.js", options ).out;
    } catch( ex ) {
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
            output += info.requires.map( req => `* [${req}](${req}.md)` ).join( "\n" );
        }
        PathUtils.file( dstPath, output );
    } catch( ex ) {
        Fatal.bubble(ex, `[compiler-js] createMarkdownDoc(...)`);
    }
}
