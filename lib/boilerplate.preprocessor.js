"use strict";

/**
 * Expand variables and return the resulting object.
 * A  variable is  writtent like  this `%VarName%`.   And it  set like
 * this: `%VarName%: "blabla"`.  The value of a variable can be of any
 * type.   Variables defined  in the  value of  another variables  are
 * expanded only when the parent variable is expanded.
 *
 * @example:
 * {View SECTION
 *   %Button%: {tfw.view.button type: %Type% }
 *   %Type%: primary
 *   [
 *     {ARTICLE class: thm-bg3 %Button%}
 *     {ARTICLE class: thm-bgSL %Button%}
 *   ]}
 *
 * @description
 * It also possible to concatenate variables:
 * @example
 * view.attribs: {
 *   duration: {String}
 *   duration-selected: {Boolean true}
 *   level: {String}
 *   level-selected: {Boolean true}
 * }
 * %selected%: "-selected"
 * %Component%: {tfw.view.checkbox value: {Bind %type%+%selected%} content: {Bind %type%}}
 * [
 *   {%Component% %type%: duration}
 *   {%Component% %type%: level}
 * ]
 */
exports.parse = function ( def, moduleName, path ) {
    try {
        const
            context = { vars: {}, moduleName, path },
            preprocessedDef = process( context, def );
        return preprocessedDef;
    } catch ( ex ) {
        throw Error( `...in boilerplate.preprocessor( ${moduleName}, ${path} )\n${ex}` );
    }
};

const
    RX_VAR_NAME = /^%[a-zA-Z]+%$/u,
    RX_VAR_NAME_CONCAT = /^%[a-zA-Z]+%(\+%[a-zA-Z]+%)+$/u;

/**
 * Return a copy of `obj` after processing it.
 */
function process( ctx, obj ) {
    try {
        if ( Array.isArray( obj ) ) return processArray( ctx, obj );
        switch ( typeof obj ) {
        case "string":
            return processString( ctx, obj );
        case "object":
            return processObject( ctx, obj );
        default:
            return obj;
        }
    } catch ( ex ) {
        fatal( ctx, ex );
    }
}


function processArray( ctx, arr ) {
    try {
        const preprocessedArray = arr.map( process.bind( null, ctx ) );
        return preprocessedArray.filter( x => x !== undefined );
    } catch ( ex ) {
        throw Error( `...in processArray\n${ex}` );
    }
}


function processString( ctx, str ) {
    try {
        if ( RX_VAR_NAME.test( str ) ) {
            const value = ctx.vars[ str ];
            if ( typeof value === 'undefined' ) throw `Undefined variable ${str}!`;
            return value;
        }
        if ( RX_VAR_NAME_CONCAT.test( str ) ) {
            const variables = str.split( "+" );
            return variables.map( varName => {
                const value = ctx.vars[ varName ];
                if ( typeof value === 'undefined' ) throw `Undefined variable ${str}!`;
                return value;
            } ).join( "" );
        }
            return str;

    } catch ( ex ) {
        throw Error( `...in processString(${JSON.stringify( str )})\n${ex}` );
    }
}


function processObject( ctx, obj ) {
    try {
        if ( obj === null ) return null;

        if ( typeof obj[ 0 ] === 'string' && RX_VAR_NAME.test( obj[ 0 ] ) ) return processExtension( ctx, obj );
        const preprocessedObject = {};
        // Parse variable settings first.
        for ( const key in obj ) {
            if ( RX_VAR_NAME.test( key ) ) {
                ctx.vars[ key ] = obj[ key ];
            }
        }
        // Parse other attributes.
        for ( const key in obj ) {
            if ( RX_VAR_NAME.test( key ) ) continue;
            const val = process( ctx, obj[ key ] );
            preprocessedObject[ key ] = val;
        }
        return preprocessedObject;
    } catch ( ex ) {
        throw Error( `...in processObject()\n${ex}` );
    }
}


/**
 * @example
 * {%Panel% %background%: "thm-bgP"}
 */
function processExtension( ctx, obj ) {
    try {
        const
            varName = obj[ 0 ],
            baseObject = makeCopyOf( ctx.vars[ varName ] );
        if ( typeof baseObject === 'undefined' ) {
            throw Error( `Undefined variable for extension {${varName}}!` );
        }
        // Parse variable settings first.
        for ( const key in obj ) {
            if ( RX_VAR_NAME.test( key ) ) {
                ctx.vars[ key ] = obj[ key ];
            }
        }
        // Parse other attributes.
        for ( const key in obj ) {
            if ( key === "0" ) continue;
            if ( RX_VAR_NAME.test( key ) ) continue;
            const val = process( ctx, obj[ key ] );
            baseObject[ key ] = val;
        }
        return processObject( ctx, baseObject );
    } catch ( ex ) {
        throw Error( `...in processExtension()\n${ex}` );
    }
}


function fatal( ctx, message ) {
    throw `Error while preprocessig module ${ctx.module}:\n${
        message}\n` +
        `Defined variables at this point:\n${
        Object.keys( ctx.vars )
        .map( k => `  ${k}: ${JSON.stringify( ctx.vars[ k ] )}` )
        .join( "\n" )}`;
}


function makeCopyOf( obj ) {
    return JSON.parse( JSON.stringify( obj ) );
}
