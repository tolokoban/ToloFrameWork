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
  if( Util.isSpecial( type, "const" ) ) return convConst.call( this, type );
  if( Util.isSpecial( type, "behind" ) ) return convBehind.call( this, type );
  if( Util.isSpecial( type, "|" ) ) return convPipe.call( this, type );
  if( Util.isSpecial( type, "*" ) ) return convArgs.call( this, type );
  throw "Bad converter syntax: " + JSON.stringify( type );
};

/**
 * convert: {Const Hello!}
 */
function convConst( type ) {

}


function convString( type ) {
  if( CONVERTERS.args0.indexOf( type ) === -1 ) {
    throw "Unknown simple converter `" + type + "`!\nAvailable simple converters are: "
      + CONVERTERS.args0.join(", ") + ".";
  }

  var name = `conv_${type}`;
  if( this.addName( name ) ) {
    this.sections.converters.push(
      `var ${name} = Converters.get('${type}');`
    );
  }
  this.sections.requires.Converters = "require('tfw.binding.converters');";
  return name;
}

function convArray( type ) {
  var name = this.getFreeName( "conv_enum" );
  this.sections.converters.push(
    `var ${name} = Converters.get('enum')(${JSON.stringify( type )});`
  );
  this.sections.requires.Converters = "require('tfw.binding.converters');";
  return name;
}

function convBehind( type ) {
  
}

function convPipe( type ) {
}

function convArgs( type ) {
}


var CONVERTERS = {
  args0: [
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
