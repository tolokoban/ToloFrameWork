"use strict";

/**
 * @export @class Parser
 */
var Parser = require("./boilerplate.view.parser.constructor");

/**
 * @member addName
 * When  you need  a  variable  name, this  method  helps  you to  not
 * duplicate its name.
 * @param {string} name - Name to add to the list of already used names.
 * @return {boolean} `true` if the name did not exist until now.
 */
/**
 * @member getFreeName
 * @param {string} name - Prefix of the name you want to get.
 * @return {string} A name with a number appened to it.
 * @example
 * var p = new Parser();
 * p.getFreeName("foo");  // -> "foo1"
 * p.getFreeName("foo");  // -> "foo2"
 * p.getFreeName("bar");  // -> "bar1"
 * p.getFreeName("foo");  // -> "foo3"
 */
require("./boilerplate.view.parser.names")(Parser);

/**
 * @param {object} xjs -
 */
Parser.prototype.parse = parser_parse;
/**
 * @param {object} attribs - for example `{ is-valid:{boolean false}, ... }`.
 */
Parser.prototype.parseViewAttribs = parser_parseViewAttribs;
/**
 * @member parseConverter
 * @param {object} type
 * `converter: string`
 * `converter: {float() 0}`
 * `converter: {boolean2string() CORRECT WRONG}`
 * `converter: {Behind myConverter}`
 * `converter: {| neg abs [integer 0]}`
 */
require("./boilerplate.view.parser.parseConverter")(Parser);

module.exports = Parser;


var Util = require("./boilerplate.util");

var RX_VIEW_ATTRIB = /^[a-z](-[a-z0-9]+)*$/;


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

