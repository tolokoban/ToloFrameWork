"use strict";

var Util = require("./boilerplate.util");

module.exports = function( cls ) {
  /**
   * @member parseConverter
   * @param {object} type
   * `unit`
   * `{float() 0}`
   * `{boolean2string() CORRECT WRONG}`
   * `{Behind myConverter}`
   * `{| neg abs [integer 0]}`
   * `[yes no maybe]`
   */
  cls.prototype.parseConverter = parseConverter;
  return cls;
};


function parseConverter( type ) {
  if( typeof type === 'string' ) return convString.call( this, type );
  if( Array.isArray( type ) ) return convArray.call( this, type );
  if( Util.isSpecial( type, "behind" ) ) return convBehind.call( this, type );
  if( Util.isSpecial( type, "|" ) ) return convPipe.call( this, type );
  if( Util.isSpecial( type, "*" ) ) return convArgs.call( this, type );
  throw "Bad converter syntax: " + JSON.stringify( type );
};


function convString( type ) {
  if( CONVERTERS.noargs.indexOf( type ) === -1 ) {
    throw "Unknown simple converter `" + type + "`!\nAvailable simple converters are: "
      + CONVERTERS.noargs.join(", ") + ".";
  }

  return {
    name: type,
    conv: `Converters.get('${type}')`
  };
}

function convArray( type ) {
}

function convBehind( type ) {
}

function convPipe( type ) {
}

function convArgs( type ) {
}


var CONVERTERS = {
  noargs: [
    "array",
    "boolean",
    "booleans",
    "color",
    "intl",
    "isEmpty",
    "isNotEmpty",
    "keys",
    "length",
    "list",
    "multilang",
    "not",
    "sortedKeys",
    "string",
    "strings",
    "unit",
    "units",
    "validator"
  ]
};
