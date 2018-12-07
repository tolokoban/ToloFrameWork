"use strict";

module.exports = {
    camelCase,
    CamelCase,
    isSpecial,
    contains
};


const NOT_FOUND = -1;

/**
 * Does the array `arr` contains the element `item`?
 *
 * @param {array} arr - Array in which to look.
 * @param {any} item - Item we are looking for.
 * @returns {boolean} Return `true` is the array contains the given element.
 */
function contains( arr, item ) {
    return arr.indexOf( item ) !== NOT_FOUND;
}

function camelCase( name ) {
    return name.split( '.' ).map( function ( word, wordIdx ) {
        return word.split( '-' ).map( function ( piece, pieceIdx ) {
            if ( wordIdx + pieceIdx === 0 ) return piece;
            return piece.charAt( 0 ).toUpperCase() + piece.substr( 1 );
        } ).join( "" );
    } ).join( "" );
}

function CamelCase( name ) {
    var transformed = camelCase( name );
    return transformed.charAt( 0 ).toUpperCase() + transformed.substr( 1 );
}

/**
 * Determine if an object is special or not.
 * An object is special as soon as it own the "0" attribute.
 * @param {string=undefined} expectedName - _If defined, test the value of `obj[0]`.
 */
function isSpecial( obj, expectedName ) {
    var type = typeof obj;
    if ( type === 'string' || type !== 'object' || Array.isArray( obj ) ) return false;
    if ( !obj ) return false;
    var name = obj[ 0 ];

    if ( typeof name !== 'string' ) return false;
    if ( typeof expectedName === 'string' ) {
        return name.toLowerCase() === expectedName.toLowerCase();
    }
    return true;
}