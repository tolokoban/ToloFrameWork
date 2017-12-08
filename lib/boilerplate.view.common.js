"use strict";

module.exports = {
  camelCase: camelCase,
  CamelCase: CamelCase
};



function camelCase( name ) {
  return name.split('.').map(function( word, wordIdx ) {
    return word.split('-').map(function( piece, pieceIdx ) {
      if( wordIdx + pieceIdx === 0 ) return piece;
      return piece.charAt(0).toUpperCase() + piece.substr(1);
    }).join("");
  }).join("");
}

function CamelCase( name ) {
  var transformed = camelCase( name );
  return transformed.charAt(0).toUpperCase() + transformed.substr( 1 );
}

