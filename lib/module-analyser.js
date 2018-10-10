"use strict";

/**
 * Try to figure oout which modules are needed from this javascript code.
 * @param {object} ast - Abstract Syntax Tree from Babel.
 * @returns {object} `{ requires: [] }`.
 */
exports.extractInfoFromAst = extractInfoFromAst;


const Util = require( "./util" );


/**
 * Try to figure oout which modules are needed from this javascript code.
 * @param {object} ast - Abstract Syntax Tree from Babel.
 * @returns {object} `{ requires: [] }`.
 */
function extractInfoFromAst( ast ) {
    const output = { requires: [] };
    recursivelyExtractInfoFromAst( ast.program.body, output );
    return output;
}


/**
 * @param {array} ast - Array of AST objects.
 * @param {object} output - `{ requires: [] }`.
 * @returns {undefined}
 */
function recursivelyExtractInfoFromAst( ast, output ) {
    if ( !Array.isArray( ast ) ) return;
    ast.forEach( ( item ) => {
        if ( !item ) return;
        if ( item.type === 'CallExpression' ) {
            parseCallExpression( item, output );
        }

        // Now, we explore other branches.
        Object.keys( item ).forEach( ( key ) => {
            const child = item[ key ];
            if ( Array.isArray( child ) ) {
                recursivelyExtractInfoFromAst( child, output );
            } else if ( typeof child === 'object' ) {
                recursivelyExtractInfoFromAst( [ child ], output );
            }
        } );
    } );
}


/**
 * @param {object} item - AST object.
 * @param {object} output - `{ requires: [] }`.
 * @return {undefined}
 */
function parseCallExpression( item, output ) {
    const
        callee = item.callee,
        args = item.arguments;
    if ( !callee || !args ) return;
    if ( callee.name !== 'require' ) return;
    if ( args.length !== 1 ) return;

    const arg = args[ 0 ];
    if ( arg.type !== 'StringLiteral' ) return;
    Util.pushUnique( output.requires, arg.value );
}