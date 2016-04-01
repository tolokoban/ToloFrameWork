/**********************************************************************
 require( 'x-template' )
 -----------------------------------------------------------------------
 
 **********************************************************************/

var templates = {};

exports.register = function( id, slot ) {
    templates[id] = slot;
};

exports.appendTo = function( id, element ) {
    var slot = templates[id];
    if( typeof slot === 'undefined' ) throw Error( "[x-template.create] Template not found: " + id + "!" );
    if( typeof slot !== 'function' ) {
        throw Error( "[x-template.create] Template is not a function: " + id + "!" );
    }
    return slot( element );
};
