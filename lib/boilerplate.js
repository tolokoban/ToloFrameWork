"use strict";

var ToloframeworkPermissiveJson = require("toloframework-permissive-json");
var Fatal = require("./fatal");

var codeGenerators = {
  View: require("./boilerplate.view")
};

exports.registerCodeGenerator = function(name, generator) {
  codeGenerators[name] = generator;
};

exports.generateCodeFrom = function( src ) {
  var xjs = src.clone("xjs");
  if( false == xjs.exists() ) return src.read();

  try {
    var def = parseXJS( xjs );
    var boilerplate = codeGenerators[def[0]];
    if( !boilerplate ) {
      throw "Unknown code generator \"" + def[0] + "\"!\n"
        + "Registred generators are: " + Object.keys(codeGenerators).join(", ") + ".";
    }
    var output = boilerplate.generateCodeFrom( def, src.read() );
    return output;
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
    buildTagEvent( def, varName, code );
    buildTagClassSwitcher( def, varName, code );
    buildTagChildren( children, varName, code );
  }
  catch( ex ) {
    throw "Error in buildTag(" + JSON.stringify({
      varName: varName,
      tag: def[0]
    }) + "\n" + ex;
  }
}

/**
 * Generate code for events.
 */
function buildTagEvent( def, varName, code) {
  var attName, attValue, eventName;
  for( attName in def ) {
    if( !hasPrefix( attName, "event" ) ) continue;
    attValue = def[attName];
    eventName = attName.substr(6);
    code.code += "    $.on(" + varName + ", {" + JSON.stringify(eventName) + ": function(evt) {\n";
    buildFunctionBody( attValue, varName, code, "      " );
    code.code +="    }});\n";
  }
}

function buildFunctionBody( attValue, varName, code, indent ) {
  if( typeof attValue === 'string' ) {
    code.code += indent + attValue + ".call(that, evt, " + varName + ");\n";
  }
  else if( Array.isArray(attValue) ) {
    attValue.forEach(function (itm) {
      buildFunctionBody( itm, varName, code, indent );
    });
  }
  else if( attValue[0] === 'Toggle' ) {
    code.code += indent + "that." + attValue[1] + " = that." + attValue[1]
      + " ? false : true;\n";
  }
  else {
    code.code += indent + "console.error('Unknown function: " + JSON.stringify(attValue) + "')\n";
  }
}

/**
 * Generate code from attributes starting with "class.".
 * For instance  `class.blue: {Attrib  focused}` means that  the class
 * `blue`  must be  added if  the  attribute `focused`  is `true`  and
 * removed if `focused` is `false`.
 * On  the contrary,  `class.|red:  {Attrib focused}`  means that  the
 * class `red`  must be removed  if `focused`  is `true` and  added if
 * `focused` is `false`.
 * Finally,  `class.blue|red: {Attrib  focused}`  is the  mix of  both
 * previous syntaxes.
 */
function buildTagClassSwitcher( def, varName, code ) {
  var attName, attValue, classes;
  for( attName in def ) {
    if( !hasPrefix( attName, "class" ) ) continue;
    attValue = def[attName];
    if( !attValue || attValue[0] !== 'Attrib' ) {
      throw "Only links on attributes are accepted as values for class-switchers!\n"
        + attName + ": " + JSON.stringify(attValue);
    }
    classes = attName.substr(6).split("|");
    code.code += "    pm.on(" + JSON.stringify(attValue[1]) + ", function(v) {\n";
    if( classes[0].length > 0 ) {
      code.code += "      if( v ) $.addClass(" + varName + ", "
        + JSON.stringify(classes[0]) + ");\n"
        + "      else $.removeClass(" + varName + ", " + JSON.stringify(classes[0]) + ");\n";
    }
    if( classes.length > 1 && classes[1].length > 0 ) {
      code.code += "      if( v ) $.removeClass(" + varName + ", "
        + JSON.stringify(classes[1]) + ");\n"
        + "      else $.addClass(" + varName + ", " + JSON.stringify(classes[1]) + ");\n";
    }
    code.code += "    });\n";
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

/**
 * `hasPrefix("class.joe", "class") === true`
 * `hasPrefix("class-joe", "class") === false`
 */
function hasPrefix( name, prefix ) {
  return name.substr(0, prefix.length + 1) === prefix + ".";
}