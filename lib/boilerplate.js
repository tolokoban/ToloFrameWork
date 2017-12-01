"use strict";

var ToloframeworkPermissiveJson = require("toloframework-permissive-json");
var Preprocessor = require("./boilerplate.preprocessor");
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
    var rawDef = parseXJS( xjs );
    var def = Preprocessor( rawDef );
    
    var boilerplate = codeGenerators[def[0]];
    if( !boilerplate ) {
      throw "Unknown code generator \"" + def[0] + "\"!\n"
        + "Registred generators are: " + Object.keys(codeGenerators).join(", ") + ".";
    }
    var output = boilerplate.generateCodeFrom( def, src.read(), src.name() );
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
