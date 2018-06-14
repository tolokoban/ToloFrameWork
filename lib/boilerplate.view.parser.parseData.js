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
  if( data && typeof data === 'object' ) return parseObject.call( this, data );
  return [JSON.stringify( data )];
}

/**
 * @example
 * [] -> ["[]"]
 * [27] -> ["[27]"]
 * [18, 27] -> ["[", ["18", "27" ], "]"]
 */
function parseArray( data ) {
  if( data.length === 0 ) return ["[]"];
  if( data.length === 1 ) {
    var parsedItem = parseData.call( this, data[0] );
    if( Array.isArray( parsedItem ) ) {
      if( parsedItem.length === 0 ) return ["[[]]"];
      if( parsedItem.length === 1 ) return ["[" + parsedItem[0] + "]"];
      return ["[", parsedItem, "]"];
    } else {
      return ["[" + parsedItem  + "]"];
    }
  }
  var result = [];
  data.map( parseData.bind( this ) ).forEach(function(itm, idx, arr) {
    var isLastItem = idx === arr.length - 1;
    itm.forEach(function (elem, idx, arr) {
      if( !isLastItem || idx < arr.length - 1 ) {
        result.push( appendComma( elem ) );
      } else {
        result.push( elem );
      }
    });
  });
  return ["[", result, "]"];
}


function parseObject( data ) {
  if( Util.isSpecial(data) ) return parseSpecial( data[0], data );

  var that = this;

  var keys = Object.keys( data );
  if( keys.length === 0 ) return ["{}"];
  if( keys.length === 1 ) {
    var parsedItem = parseData.call( this, data[keys[0]] );
    return Util.surroundCode( parsedItem, "{" + protectKey(keys[0])+ ":", "}" );
  }
  var result = [];
  keys.forEach(function (key, k) {
    var isLast = k === keys.length - 1;
    var itm = parseData.call( that, data[key] );
    Util.surroundCode( itm, protectKey(keys[k])+ ":", isLast ? '' : ',' ).forEach(function( elem ) {
      result.push( elem );
    });
  });
  return ["{", result, "}"];
}


var RX_TAG = /^(H[1-9]|[A-Z]+)$/g;
var RX_XJS = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/g;
function parseSpecial( id, data ) {
  if( RX_TAG.test( id ) ) return parseSpecialTag( id, data );
  if( RX_XJS.test( id ) ) return parseSpecialXjs( id, data );
  
  switch( id.toLowerCase() ) {
  case 'intl': return parseSpecialIntl( data );
  }

  Util.throwError( "Unknown special form: \"" + id + "\"!" );
}


function parseSpecialTag( is, data ) {
  
}


function parseSpecialXjs( is, data ) {
  
}


function parseSpecialIntl( data ) {
  var id = data[1];
  if( typeof id !== 'string' ) {
    Util.throwError(
      "In {intl <id>}, <id> must be a string! Instead, we found <id>="
        + JSON.toString( id )
    );
  }

  var pieces = id.split( '/' );
  if( pieces.length === 1 ) return "_(" + JSON.stringify( id ) + ")";
  if( pieces.length > 2 ) {
    Util.throwError( "In {intl <id>}, <id> can contain at most one slash!" );
  }
  return "this.$elements" + Util.att( pieces[0] ) + "._(" + JSON.stringify( pieces[1] ) + ")";
}


function appendComma( data ) {
  if( Array.isArray( data ) ) {
    return data;
  } else if( data === '[' || data === '{' ) {
    return data;
  } else {
    return data + ",";
  }
}


/**
 * Ensure `key` is a valid Javascript identifier by quoting it if necessary.
 */
function protectKey( key ) {
  if( Util.isJavascriptIdentifier( key ) ) return key;
  return JSON.stringify( "" + key );
}

/**
 * If `arr` is an array of length 1, return `unbox( arr[0] )`.
 * Otherwise, return `arr`.
 */
function unbox( arr ) {
  if( Array.isArray( arr ) && arr.length === 1 ) {
    return unbox( arr[0] );
  } else {
    return arr;
  }
}
