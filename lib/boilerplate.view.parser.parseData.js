"use strict";

var Util = require("./boilerplate.util");

module.exports = function( cls ) {
  /**
   * @member parseData
   * @param {amy} data
   * @example
   * x.parseData("Hello") === ['"Hello"']
   * x.parseData([27, "Hello"]) === ["[", ["27,", '"Hello"'], "]"]
   */
  cls.prototype.parseData = parseData;
  return cls;
};


/**
 * @return {array}
 */
function parseData( data ) {
  if( Array.isArray( data ) ) return parseArray.call( this, data );
  if( data && typeof data === 'object' ) return parseObject( this, data );
  return [JSON.stringify( data )];
}


function parseArray( data ) {
  if( data.length === 0 ) return ["[]"];
  if( data.length === 1 ) {
    var parsedItem = parseData.call( this, data[0] );
    
    return "[" +  + "]";
  }
}


function parseObject( data ) {
  
}
