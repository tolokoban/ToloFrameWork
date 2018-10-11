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


const
    Babel = require( "@babel/core" ),
    Fatal = require( "./fatal" ),
    Minify = require( "babel-preset-minify" ),
    Path = require( "path" ),
    Preset = require( "@babel/preset-env" );

const OPTIONS = {
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


/**
 * Transpile code into Javascript equivalent that can be read on currently supported browsers.
 * @param {string} sourceCode - Code in cutting edge Javascript.
 * @param {string} sourceName - Name of the file.
 * @returns {object} The transpiled code and its source map.
 * __code__: code compatible with currently supported browsers.
 * __map__: source map.
 */
function transpile( sourceCode, sourceName ) {
    try {
        OPTIONS.sourceFileName = Path.basename( sourceName );
        const
            ast = parseToAST( sourceCode ),
            transfo = Babel.transformSync( sourceCode, OPTIONS ),
            // transfo = Babel.transformFromAstSync( ast, OPTIONS ),
            transpiledCode = transfo.code;

        return {
            code: `${transpiledCode}\n//# sourceMappingURL=${OPTIONS.sourceFileName}.map`,
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