"use strict";

var ToloframeworkPermissiveJson = require("toloframework-permissive-json");
var Fatal = require("./fatal");

module.exports = function( src ) {
  var xjs = src.clone("xjs");
  if( false == xjs.exists() ) return src.read();

  try {
    var def = parseXJS( xjs );
    var boilerplate = def[0];
    if( boilerplate != 'View' ) {
      throw "The only boilerplate we can deal with is `View`, but we found `" + boilerplate + "`!";
    }

    var out = src.read() + "\n";
    out += "module.exports = function() {\n";
    out += "  var that = this;\n";
    out += "  var $ = require('dom');\n";
    out += "  var PM = require('tfw.binding.property-manager');\n";
    out += "  var Tag = require('tfw.view').Tag;\n";
    out += "  var ViewClass = function( args ) {\n";
    var code = buildView( def );
    if( code.needThatVar ) out += "    var that = this;\n";
    out += code.head + code.code + code.tail + code.sectionInitAttribs;
    out += "    Object.defineProperty(this, '$', {\n"
      + "      value: elem.$, writable: false, enumerable: true, configurable: false\n"
      + "    })\n";
    out += "  };\n";
    out += "  return ViewClass;\n";
    out += "}();";
    out += "\n\nvar XXX=" + JSON.stringify(def, null, "  ") + ";\n";
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
    head: "",
    code: "",
    tail: "",
    sectionInitAttribs: "",
    counter: 0
  };
  buildViewAttribs( root, code );
  root[0] = root[1];
  root[1] = root[2];
  delete root[2];
  buildTag(root, code);
  return code;
}


function buildViewAttribs( root, code ) {
  var attribs = root["view.attribs"];
  if( typeof attribs === 'unndefined' ) return;
  code.code += "    var pm = PM(this);\n";
  code.needThatVar = true;
  code.sectionInitAttribs += "    // Initialize attributes.\n"
    + "    if( typeof args === 'undefined' ) args = {};\n"
    + "    var defVal = function(attName,attValue) {\n"
    + "      if( typeof args[attName] !== 'undefined' ) attValue = args[attName];\n"
    + "      that[attName] = attValue;\n"
    + "    };\n";
  var attName, attValue;
  for( attName in attribs ) {
    attValue = attribs[attName];
    code.code += "    pm.create('" + attName + "');\n";
    code.sectionInitAttribs += "    defVal(" + JSON.stringify(attName)
      + ", " + JSON.stringify(attValue) + ");\n";
  }
}

var DIGITS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
function buildTag( def, code, varName ) {
  try {
    var tagName = def[0];
    if( typeof tagName !== 'string' || tagName !== tagName.toUpperCase() ) {
      throw "Tag name '" + tagName + "' must be uppercase!";
    }
    var children = def[1];
    if( typeof varName === 'undefined' ) varName = 'elem';
    code.code += "    var " + varName + " = new Tag('" + tagName + "'";
    var tagAttribs = extractTagAttribs( def );
    var tagAttribsNames = Object.keys(tagAttribs);
    if( tagAttribsNames.length > 0 ) {
      code.code += ", " + JSON.stringify(tagAttribsNames);
    }
    code.code += ");\n";
    buildTagAttribsInit( tagAttribs, varName, code );
    buildTagChildren( children, varName, code );
  }
  catch( ex ) {
    throw "Error in buildTag(" + JSON.stringify({
      varName: varName,
      tag: def[0]
    }) + "\n" + ex;
  }
}

function buildTagAttribsInit( tagAttribs, varName, code ) {
  var attName, attValue;
  for( attName in tagAttribs ) {
    code.code += "    " + varName + "." + attName + " = "
      + JSON.stringify(tagAttribs[attName]) + ";\n";
  }
}

function buildTagChildren( children, varName, code ) {
  if( typeof children === 'undefined' ) return;
  if( !Array.isArray(children) ) children = [children];
  var childrenVarNames = [];
  children.forEach(function (child, idx) {
    switch( child[0] ) {
    case 'Attrib':
      code.tail += "    pm.on('" + child[1] + "', function(v) { $.clear(" + varName + ", v); });\n";
      break;
    default:
      var childVarName = varName + (idx > 35 ? '_' + idx + '_' : DIGITS.charAt(idx));
      childrenVarNames.push( childVarName );
      buildTag(child, code, childVarName);
    }
  });
  if( childrenVarNames.length > 0 ) {
    code.code += "    $.add(" + varName;
    childrenVarNames.forEach(function (child, idx) {
      code.code += ", " + child;
    });
    code.code += ");\n";
  }
}



var RX_TAGATTRIB = /^[a-z]+[a-z0-9]*$/i;
/**
 * 
 */
function extractTagAttribs( def ) {
  var key, attribs = [];
  for( key in def ) {
    if( RX_TAGATTRIB.test( key ) ) {
      addUnique( attribs, key.toLowerCase() );
    }
  }
  var result = {};
  attribs.forEach(function (attName) {
    result[attName] = def[attName];
  });
  return result;
}

function addUnique(arr, item) {
  if( arr.indexOf( item ) === -1 ) {
    arr.push( item );
  }
}
