"use strict";

/**
 * Try to figure oout which modules are needed from this javascript code.
 * @param {object} ast - Abstract Syntax Tree from Babel.
 * @returns {object} `{ requires: [] }`.
 */
exports.extractInfoFromAst = extractInfoFromAst;


const
    JsDoc = require( "./js-doc" ),
    Util = require( "./util" );


/**
 * Try to figure oout which modules are needed from this javascript code.
 * @param {object} ast - Abstract Syntax Tree from Babel.
 * @returns {object} `{ requires: [] }`.
 */
function extractInfoFromAst( ast ) {
    const output = {
        requires: [],
        exports: findExports( ast )
    };
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
    // Filter node modules.
    if ( typeof arg.value !== 'string' || arg.value.startsWith( "node://" ) ) return;
    Util.pushUnique( output.requires, arg.value );
}


/**
 * Look for the exports of the module with their comments.
 * This will be used for documentation.
 * @param {object} ast - AST of the module.
 * @returns {array} `{ id, type, comments }`
 */
function findExports( ast ) {
    try {
        const
            publics = {},
            privates = {},
            body = ast.program.body[ 0 ].expression.arguments[ 1 ].body.body;

        body.forEach( function ( item ) {
            if ( parseExports( item, publics ) ) return;
            if ( parseModuleExports( item, publics ) ) return;
            parseFunctionDeclaration( item, privates );
        } );

        const output = [];
        Object.keys( publics ).forEach( function ( exportName ) {
            const
                exportValue = publics[ exportName ],
                target = privates[ exportValue.target ];
            if ( target ) {
                exportValue.comments = exportValue.comments || target.comments;
                exportValue.type = target.type;
                exportValue.params = target.params;
            }
            output.push( {
                id: exportName,
                type: exportValue.type,
                params: exportValue.params,
                comments: exportValue.comments
            } );
        } );

        return output;
    } catch ( ex ) {
        throw new Error( `${ex}\n...in module-analyser/findExports()` );
    }
}

/**
 * @param {object} ast - AST for an Expression Statement.
 * @param {object} publics - Dictionary of exported elements.
 * @returns {boolean} `true` if `ast.type === "ExpressionStatement"`
 */
function parseExports( ast, publics ) {
    try {
        if ( ast.type !== "ExpressionStatement" ) return false;
        const expression = ast.expression;
        if ( expression.operator !== '=' ) return false;

        const left = expression.left;
        if ( left.type !== "MemberExpression" ) return false;
        const object = left.object;
        if ( object.type !== "Identifier" && object.name !== "exports" ) return false;

        const right = expression.right;
        if ( right.type !== "Identifier" ) return false;

        publics[ right.name ] = {
            type: "function",
            comments: parseComments( ast.leadingComments )
        };
    } catch ( ex ) {
        throw new Error( `${ex}\n...in module-analyser/parseExports(${JSON.stringify(ast)})` );
    }
    return true;
}

/**
 * @param {object} ast - AST for an Expression Statement.
 * @param {object} publics - Dictionary of exported elements.
 * @returns {boolean} `true` if `ast.type === "ExpressionStatement"`
 */
function parseModuleExports( ast, publics ) {
    try {
        if ( ast.type !== "ExpressionStatement" ) return false;
        const expression = ast.expression;
        if ( expression.operator !== '=' ) return false;

        const left = expression.left;
        if ( left.type !== "MemberExpression" ) return false;
        const object = left.object;
        if ( object.type !== "Identifier" && object.name !== "exports" ) return false;

        const right = expression.right;
        if ( right.type !== "ObjectExpression" ) return false;

        const properties = right.properties;
        properties.forEach( function ( property ) {
            const name = property.key.name;
            publics[ name ] = {
                target: name,
                comments: parseComments( property.leadingComments )
            };

        } );
    } catch ( ex ) {
        throw new Error( `${ex}\n...in module-analyser/parseExports(${JSON.stringify(ast)})` );
    }
    return true;
}

/**
 * @param {object} ast - AST for an Expression Statement.
 * @param {object} privates - Dictionary of delcarations.
 * @returns {boolean} `true` if `ast.type === "ExpressionStatement"`
 */
function parseFunctionDeclaration( ast, privates ) {
    if ( ast.type !== "FunctionDeclaration" ) return false;
    const name = ast.id.name;

    privates[ name ] = {
        type: "function",
        params: ast.params.map( mapParam ),
        comments: parseComments( ast.leadingComments )
    };
    return true;
}

/**
 * @param {array} comments - Array of AST describing comments.
 * @returns {string} Join of all comments.
 */
function parseComments( comments ) {
    if ( !Array.isArray( comments ) ) return "";

    let output = "";
    comments.forEach( function ( commentAst ) {
        const comment = commentAst.value;
        output += comment.trim().split( "\n" )
            .map( ( line ) => line.trim() )
            .map( ( line ) => removeLeadingStar( line ) )
            .join( "\n" )
            .trim();
    } );
    return JsDoc.parse( output );
}

/**
 * @param {string} line - A comment line.
 * @return {string} Same line without any leading star.
 */
function removeLeadingStar( line ) {
    return line.charAt( 0 ) === '*' ? line.substr( 1 ) : line;
}

/**
 * @param {object} param - AST describing a function parameter.
 * @returns {object|string} Name of the param, of object such as `{ name: "loop", value: "false"}`.
 */
function mapParam( param ) {
    try {
        switch ( param.type ) {
        case "Identifier":
            return param.name;
        case "AssignmentPattern":
            return {
                name: param.left.name,
                value: param.right.value
            };
        default:
            return "?";
        }
    } catch ( ex ) {
        throw new Error( `${ex}\n...in module-analyser/mapParam(${JSON.stringify(param)})` );
    }
}
// https://astexplorer.net/