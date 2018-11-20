"use strict";

/**
 * Transpile code into Javascript equivalent that can be read on currently supported browsers.
 * @param {string} sourceCode - Code in cutting edge Javascript.
 * @returns {object} The transpiled code and its source map.
 * __code__: code compatible with currently supported browsers.
 * __map__: source map.
 */
exports.transpile = transpile;

exports.parseToAST = parseToAST;


require( "@babel/polyfill" );

const
    Path = require( "path" ),
    Babel = require( "@babel/core" ),
    Fatal = require( "./fatal" ),
    Minify = require( "babel-preset-minify" ),
    Preset = require( "@babel/preset-env" );

/**
 * Transpile code into Javascript equivalent that can be read on currently supported browsers.
 * @param {string} sourceCode - Code in cutting edge Javascript.
 * @param {string} sourceName - Name of the file.
 * @param {boolean} minify - Default `false`.
 * @returns {object} The transpiled code and its source map.
 * __code__: code compatible with currently supported browsers.
 * __map__: source map.
 */
function transpile( sourceCode, sourceName, minify ) {
    try {
        const
            sourceFileName = Path.basename( sourceName ),
            ast = parseToAST( sourceCode ),
            transfo = Babel.transformSync( sourceCode, buildOptions( sourceFileName, minify ) ),
            // transfo = Babel.transformFromAstSync( ast, OPTIONS ),
            transpiledCode = transfo.code;

        return {
            code: `${transpiledCode}\n//# sourceMappingURL=${sourceFileName}.map`,
            zip: transpiledCode,
            map: transfo.map,
            ast
        };
    } catch ( ex ) {
        console.warn( "================================================================================" );
        console.warn( sourceCode );
        console.warn( "================================================================================" );
        Fatal.fire( `Babel parsing error in ${sourceName}:\n${ex}`, sourceName );
    }
    return null;
}


/**
 * @param {string} code - Javascript source code.
 * @returns {object}
 *  AST.
 */
function parseToAST( code ) {
    try {
        return Babel.parseSync( code );
    } catch ( ex ) {
        Fatal.fire( `Babel cannot produce an AST: ${ex}` );
        return null;
    }
}

/**
 * @param {string} sourceFileName - Name of the file.
 * @param {boolean} mustMinify - Default `false`.
 * @returns {object} Options to use in Babel transformation.
 */
function buildOptions( sourceFileName, mustMinify ) {
    if ( mustMinify ) return {
        sourceFileName,
        ast: false,
        comments: false,
        sourceMaps: true,
        presets: [
            [
                Minify,
                {
                    builtIns: false,
                    mangle: false
                }
            ],
            [
                Preset,
                { useBuiltIns: "entry" }
            ]
        ]
    };

    return {
        sourceFileName,
        ast: false,
        comments: true,
        sourceMaps: true,
        presets: [
            [
                Preset,
                { useBuiltIns: "entry" }
            ]
        ]
    };
}