"use strict";

/**
 * @export @class Parser
 */
var Parser = parser_constructor;

/**
 * @param {object} xjs -
 */
Parser.prototype.parse = parser_parse;
/**
 * @param {object} attribs - for example `{ is-valid:{boolean false}, ... }`.
 */
Parser.prototype.parseViewAttribs = parser_parseViewAttribs;
/**
 * @param {object} type
 * `converter: string`
 * `converter: {float() 0}`
 * `converter: {boolean2string() CORRECT WRONG}`
 * `converter: {Behind myConverter}`
 * `converter: {| neg abs [integer 0]}`
 */
Parser.prototype.parseConverter = parser_parseConverter;

module.exports = Parser;


var Util = require("./boilerplate.util");

var RX_VIEW_ATTRIB = /^[a-z](-[a-z0-9]+)*$/;
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


function parser_constructor( moduleName ) {
  this.moduleName = moduleName;
  this.sections = {
    converters: []
  };
}

function parser_parse( xjs ) {
  try {

  }
  catch( ex ) {
    Util.throwError( "Error in module `boilerplate.view.parser`", ex );
  }
}

function parser_parseViewAttribs( attribs ) {
  try {
    var attribName, attribValue;
    for( attribName in attribs ) {
      attribValue = attribs[attribName];
      parser_parseViewAttribs_parseAttrib.call( this, attribName, attribValue );
    }
  }
  catch( ex ) {
    Util.throwError( "Error while parsing `view.attribs`", ex );
  }
}

function parser_parseViewAttribs_parseAttrib( attribName, attribValue ) {
  parser_parseViewAttribs_parseAttrib_check( attribName, attribValue );

  try {
    var type = attribValue['0'].toLowerCase();
    if( CONVERTERS.indexOf( type ) > -1 )
      return parser_parseViewAttribs_parseAttrib_simple.call( this, type );
  }
  catch( ex ) {
    Util.throwError( "Error while parsing attribute `" + attribName + "`", ex );
  }
}

function parser_parseViewAttribs_parseAttrib_simple( type ) {
  var varName = this.parseConverter( type );
}

function parser_parseViewAttribs_parseAttrib_check( attribName, attribValue ) {
  if( !RX_VIEW_ATTRIB.test( attribName ) ) {
    throw "`" + attribName
      + "` is not a valid attribute name. Examples of valid names are: `x`, `orientation`, `is-enabled`.";
  }
  if( !Util.isSpecial( attribValue ) && !Array.isArray( attribValue['0'] )) {
    throw "`" + attribName + "` must be a special object";
  }
}

/**
 * @exemple
 * converter: string
 * converter: {float() 0}
 * converter: {boolean2string() CORRECT WRONG}
 * converter: {Behind myConverter}
 * converter: {| neg abs [integer 0]}
 */
function parser_parseConverter( type ) {
  if( typeof type === 'string' ) return parser_parseConverter_string.call( this, type );
  if( Array.isArray( type ) ) return parser_parseConverter_array.call( this, type );
  if( Util.isSpecial( type, "behind" ) ) return parser_parseConverter_behind.call( this, type );
  if( Util.isSpecial( type, "|" ) ) return parser_parseConverter_pipe.call( this, type );
  if( Util.isSpecial( type, "*" ) ) return parser_parseConverter_args.call( this, type );
  throw "Bad converter syntax: " + JSON.stringify( type );
}

function parser_parseConverter_string( type ) {
  if( CONVERTERS.noargs.indexOf( type ) === -1 ) {
    throw "Unknown simple converter `" + type + "`!\nAvailable simple converters are: "
      + CONVERTERS.noargs.join(", ") + ".";
  }

  return {
    name: type,
    conv: `Converters.get('${type}')`
  };
}

function parser_parseConverter_array( type ) {
}

function parser_parseConverter_behind( type ) {
}

function parser_parseConverter_pipe( type ) {
}

function parser_parseConverter_args( type ) {
}
