"use strict";

exports.compile = compileJS;

const
    CompilerINI = require( "./compiler-ini" ),
    Fatal = require( "./fatal" ),
    ModuleAnalyser = require( "./module-analyser" ),
    PathUtils = require( "./pathutils" ),
    Source = require( "./source" ),
    ToloframeworkPermissiveJson = require( "toloframework-permissive-json" ),
    Tpl = require( "./template" ),
    Transpiler = require( "./transpiler" ),
    Util = require( "./util" ),
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
function compileJS( project, path, options ) {
    const
        src = new Source( project, path ),
        srcXJS = src.clone( "xjs" );

    ensureJavascriptFileExists( project, src );
    if ( isModuleUptodate( src, srcXJS ) ) return src;

    const
        moduleName = src.name(),
        watch = [],
        moduleShortName = Util.removeExtension( Util.removeFirstSubFolder( moduleName ) );

    console.log( `Compiling JS ${moduleShortName.yellow}` );

    const head = compileDEP( project, src, watch );
    compileINI( project, src );
    let code = convertIntoModule( src, moduleShortName, head );

    // Export internationalization.
    if ( path !== 'mod/$.js' ) {
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


/**
 * @param  {string} src          description
 * @param  {string} code         description
 * @param  {string} zip          description
 * @param  {string} map          description
 * @param  {string} dependencies description
 * @returns {undefined}
 */
function saveTags( src, code, zip, map, dependencies ) {
    src.tag( 'src', code );
    src.tag( 'zip', zip );
    src.tag( 'map', map );
    src.tag( 'dependencies', dependencies );
    src.save();
}

/**
 * @param {project} project - Current project.
 * @param {Source} src - JS source file.
 * @returns {undefined}
 */
function ensureJavascriptFileExists( project, src ) {
    const srcXJS = src.clone( "xjs" );
    if ( !src.exists() ) {
        if ( !srcXJS.exists() ) {
            // This file does not exist!
            Fatal.fire( `Javascript file not found: "${src.name()}"!`, src.name() );
        } else {
            // XJS exists but not JS. That's why we create a minimal one.
            src.write( "// Code behind.\n\"use strict\";\n" );
        }
    }
}


/**
 * DEP file is here to load GLOBAL variable into the module.
 * @param {Project} project - Current project.
 * @param {Source} src - Module source file.
 * @param {array} watch - Array of files to watch for rebuild.
 * @returns {string} Javascript defining the const variable GLOBAL.
 */
function compileDEP( project, src, watch ) {
    const
        moduleName = src.name(),
        depFilename = Util.replaceExtension( moduleName, '.dep' );

    if ( !project.srcOrLibPath( depFilename ) ) return '';

    const depFile = new Source( project, depFilename );
    let code = '';
    try {
        const depJSON = ToloframeworkPermissiveJson.parse( depFile.read() );
        code = processAttributeVar( project, depJSON, watch, depFile.getAbsoluteFilePath() );
    } catch ( ex ) {
        Fatal.fire( `Unable to parse JSON dependency file!\n${ex}`, depFile.getAbsoluteFilePath() );
    }

    /*
     * List of files to watch. If  one of those files is newer
     * that the JS file, we have to recompile.
     */
    src.tag( 'watch', watch );
    return code;
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
    if ( typeof depJSON.var === 'undefined' ) return '';

    let
        head = 'const GLOBAL = {',
        firstItem = true;

    Object.keys( depJSON.var ).forEach( function forEachVarName( varName ) {
        const
            varFilename = depJSON.var[ varName ],
            srcVar = project.srcOrLibPath( `mod/${varFilename}` ) || project.srcOrLibPath( varFilename );

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


/**
 * Internationalization.
 * @param {Project} project - Current project.
 * @param {Source} src - Module source file.
 * @returns {undefined}
 */
function compileINI( project, src ) {
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


/**
 * @param {Source} src - Module source file.
 * @param {string} moduleShortName - Name of the module without folder and without extension.
 * @param {string} head - Javascript already present at the top of the module (i.e.: internationalization).
 * @returns {string} Resulting code.
 */
function convertIntoModule( src, moduleShortName, head ) {
    const options = {
        name: moduleShortName,
        code: Xjs.generateCodeFrom( src ),
        intl: src.tag( 'intl' ),
        head: `${head} `,
        foot: ""
    };
    return Tpl.file( "module.js", options ).out;
}


/**
 * A module can be made of both a JS and a XJS file.
 * @param {Source} src - JS source file.
 * @param {Source} srcXJS - XJS source file.
 * @returns {boolean} `true` if everything is uptodate.
 */
function isModuleUptodate( src, srcXJS ) {
    if ( !srcXJS.exists() ) {
        // There is only a JS file.
        return src.isUptodate();
    }
    return src.isUptodate() && srcXJS.isUptodate();
}

/**
 * @param {Source} src - Module source.
 * @param {objetc} info - `{ requires, exports }`.
 * @param {array} info.publics - `[{ id, type, params, comments }, ...]`.
 * @returns {undefined}
 */
function createMarkdownDoc( src, info ) {
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

// __`width`__ (_number_) **⏵** Width of the frame view.