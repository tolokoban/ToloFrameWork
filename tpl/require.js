/*
 require( 'require' )
 -----------------------------------------------------------------------
 @example

 var Path = require("node://path");  // Only in NodeJS/NW.js environment.
 var Button = require("tfw.button");

 */
"use strict";

// window.require =
( function ( workspace ) {
    const
        NODE_PREFIX = "node://",
        NODE_PREFIX_SIZE = NODE_PREFIX.length,
        modules = {},
        definitions = {},
        nodejsRequire = typeof window.require === 'function' ? window.require : null;
    const f = function ( id, body ) {
        if ( id.substr( 0, NODE_PREFIX_SIZE ) === NODE_PREFIX ) {
            // Calling for a NodeJS module.
            if ( !nodejsRequire ) {
                throw Error( "[require] NodeJS is not available to load module " + id.substr( NODE_PREFIX_SIZE ) );
            }
            return nodejsRequire( id.substr( NODE_PREFIX_SIZE ) );
        }

        if ( typeof body === 'function' ) {
            definitions[ id ] = body;
            return body;
        }
        const moduleInit = definitions[ id ];
        if ( typeof moduleInit === 'undefined' ) {
            const err = new Error( "Required module is missing: " + id );
            console.error( err.stack );
            throw err;
        }
        var mod = modules[ id ];
        if ( typeof mod === 'undefined' ) {
            mod = { exports: {} };
            const exports = mod.exports;
            moduleInit.call( workspace, f, mod, exports );
            modules[ id ] = mod.exports;
            mod = mod.exports;
        }
        return mod;
    };

    workspace.APP = {};
    workspace.require = f;
    return f;
}( this ) );