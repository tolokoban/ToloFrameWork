"use strict";

var Template = function( codeBehind, moduleName ) {
  this._counter = -1;
  this.codeBehind = codeBehind;
  this.moduleName = moduleName;
  // List of behind function that need to be defined.
  this.neededBehindFunctions = [];
  this.requires = {};
  this.functions = {};
  this.elementNames = [];
  this.vars = {};
  this.that = false,
  this.pm = false;
  this.aliases = {};
  this.section = {
    comments: [],
    attribs: {
      define: [],
      init: []
    },
    elements: {
      define: [],
      init: []
    },
    events: [],
    links: []
  };
};

module.exports = Template;


var DIGITS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * @member Template.id
 * @param
 */
Template.prototype.id = function( prefix, counter ) {
  if( typeof prefix === 'undefined' ) prefix = "";
  if( typeof counter !== 'number' ) {
    this._counter++;
    counter = this._counter;
  }
  while( counter >= DIGITS.length ) {
    var modulo = counter % DIGITS.length;
    prefix += DIGITS.charAt(modulo);
    counter = Math.floor( counter / DIGITS.length );
  }
  prefix += DIGITS.charAt(counter);
  return prefix;
};


Template.prototype.generateNeededBehindFunctions = function() {
  if( this.neededBehindFunctions.length === 0 ) return [];

  return generateSection(
    "Check if needed functions are defined in code behind.",
    [
      "if( !CODE_BEHIND ) throw Error('Module "
        + this.moduleName + " must declare the global variable CODE_BEHIND!'),",
      "[" + this.neededBehindFunctions.map(name => '"' + name + '"').join(", ")
        + "].forEach(function(funcName) {",
      "  if( typeof CODE_BEHIND[funcName] !== 'function' )",
      "    throw Error('Module " + this.moduleName + " must define the function"
        + " CODE_BEHIND.' + funcName + '!');",
      "}),",
    ]
  );
};


Template.prototype.addNeededBehindFunction = function( functionName ) {
  pushUnique( this.neededBehindFunctions, functionName );
};


function pushUnique( arr, item ) {
  if( arr.indexOf( item ) === -1 )
    arr.push( item );
}


function generateSection( sectionName, contentArray ) {
  var firstLine = "//";
  var count = sectionName.length + 2;
  while( count --> 0 ) firstLine += "-";
  var lines = [firstLine, "// " + sectionName];
  return lines.concat( contentArray );
}
