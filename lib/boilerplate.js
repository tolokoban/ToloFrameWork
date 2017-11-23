"use strict";

var ToloframeworkPermissiveJson = require("toloframework-permissive-json");
var Fatal = require("./fatal");

module.exports = function( src ) {
  var xjs = src.clone("xjs");
  if( false == xjs.exists() ) return src.read();

  try {
    var def = parseXJS( xjs );
    var out = src.read() + "\n";

    out += "module.exports = function(){\n";
    out += "  var Tag = require('tfw.view').Tag;\n";
    out += "  var ViewClass = function(args) {\n";
    var boilerplate = def[0];
    if( boilerplate != 'View' ) {
      throw "The only boilerplate we can deal with is `View`, but we found `" + boilerplate + "`!";
    }
    var code = buildView( def );
    out += code.code;
    out += "  };\n";
    out += "  return ViewClass;\n";
    out += "}();";
    return out;
  }
  catch( ex ) {
    Fatal.fire(
      "Fatal error in XJS!\n" + ex,
      src.name(),
      xjs.getAbsoluteFilePath());
  }
};


function parseXJS( xjs ) {
  try {
    return ToloframeworkPermissiveJson.parse( xjs.read() );
  }
  catch( ex ) {
    throw "Invalid permissive JSON syntax:\n" + ex;
  }
}


function buildView( root ) {
  var code = {
    requires: [],
    code: "",
    counter: 0
  };
  root[0] = root[1];
  root[1] = root[2];
  buildTag(root, code);
  return code;
}


var DIGITS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
function buildTag( def, code, varName ) {
  var tagName = def[0];
  var children = def[1];
  if( typeof varName === 'undefined' ) varName = 'elem';
  code.code += "    var " + varName + " = document.createElement('" + tagName + "'";
  var tagAttribs = extractTagAttribs( def );
  if( tagAttribs.length > 0 ) {
    code.code += ", " + JSON.stringify(tagAttribs);
  }
  code.code += ");\n";
  if( Array.isArray(children) ) {
    var childrenVarNames = [];
    children.forEach(function (child, idx) {
      var childVarName = varName + DIGITS.charAt(idx);
      childrenVarNames.push( childVarName );
      buildTag(child, code, childVarName);
    });
    if( childrenVarNames.length > 0 ) {
      var tmp = JSON.stringify(childrenVarNames);
      tmp = tmp.substr(1, tmp.length - 2);
      code.code += "    " + varName + ".add(" + tmp + ");\n";
    }
  }  
}



var RX_TAGATTRIB = /^[a-z]+[a-z-]*$/i;
function extractTagAttribs( def ) {
  var key, attribs = [];
  for( key in def ) {
    if( RX_TAGATTRIB.test( key ) ) {
      addUnique( attribs, key.toLowerCase() );
    }
  }
  return attribs;
}

function addUnique(arr, item) {
  if( arr.indexOf( item ) === -1 ) {
    arr.push( item );
  }
}
