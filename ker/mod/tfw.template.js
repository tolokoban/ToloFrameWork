"use strict";

var REGEXP = /\{\{([A-Z_]+)\}\}/g;

/**
 * @exports {class}
 * @param {string} template - String code with insets.
 * @param {} regexp - Regular expression that matches variables. The first group will be the name of the variable.
 *
 * @member build()
 * @param {object} variables - Map of the variables to put in the template.
 * @return {string} The result of variables application to this template.
 */
function Template( template, regexp ) {
  if( typeof regexp === 'undefined' ) regexp = REGEXP;

  var lastIndex = 0;
  var match;
  var pieces = [];
  var varLength;
  regexp.lastIndex = 0;

  while( null != (match = regexp.exec( template )) ) {
    varLength = match[0].length;
    pieces.push( template.substr( lastIndex, regexp.lastIndex - lastIndex - varLength) );
    lastIndex = regexp.lastIndex;
    pieces.push( match[1] );
  }

  if( lastIndex < template.length ) {
    pieces.push( template.substr( lastIndex ) );
  }

  this.build = build.bind( this, pieces );
}


function build( pieces, variables ) {
  if( typeof variables === 'undefined' ) variables = {};
  var output = '';
  var piece;
  
  for( var i = 0 ; i < pieces.length ; i++ ) {
    piece = pieces[i];
    if( i % 2 === 0 ) {
      output += piece;
    } else {
      output += variables[piece];
    }
  }

  return output;
}


module.exports = Template;
