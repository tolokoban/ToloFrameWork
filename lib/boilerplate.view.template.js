"use strict";

var Common = require("./boilerplate.view.common");
var camelCase = Common.camelCase;
var CamelCase = Common.CamelCase;


var Template = function( codeBehind, moduleName ) {
  this._counter = -1;
  this.codeBehind = codeBehind;
  this.moduleName = moduleName;
  this.debug = false;
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
    init: null,
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
    links: [],
    ons: [],
    statics: []
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

  var names = this.neededBehindFunctions.map( name => '"' + name + '"' );
  return generateSection(
    "Check if needed functions are defined in code behind.",
    [
      "View.ensureCodeBehind( CODE_BEHIND, " + names.join(", ") + " );"
    ]
  );
};

Template.prototype.generateBehindCall = function( behindFunctionName, indent, args ) {
  if( typeof indent === 'undefined' ) indent = "";
  if( typeof args === 'undefined' ) args = "";
  this.addNeededBehindFunction( behindFunctionName );
  this.that = true;
  if( args.trim() != '' ) args = ", " + args;

  return [
    indent + "try {",
    indent + "  CODE_BEHIND." + behindFunctionName + ".call(that" + args + ");",
    indent + "}",
    indent + "catch( ex ) {",
    indent + "  console.error('Exception thrown in code behind `"
      + behindFunctionName + "`: ', ex);",
    indent + "}",
  ];
};

Template.prototype.generateRequires = function() {
  if( isEmpty( this.requires ) ) return [];

  var that = this;
  var keys = Object.keys( this.requires );
  keys.sort(function(a, b) {
    var deltaLen = a.length - b.length;
    if( deltaLen != 0 ) return deltaLen;
    if( a < b ) return -1;
    if( a > b ) return 1;
    return 0;
  });
  return generateSection(
    "Dependent modules.",
    keys.map(
      k => "var " + k + " = " + that.requires[k] + ";" ) );
};

Template.prototype.generateFunctions = function() {
  if( isEmpty( this.functions ) ) return [];

  var that = this;
  return generateSection(
    "Global functions.",
    Object.keys( this.functions ).map(
      k => "function " + k + that.functions[k] + ";" ) );
};

Template.prototype.generateGlobalVariables = function() {
  if( isEmpty( this.vars ) ) return [];

  var that = this;
  return generateSection(
    "Global variables.",
    Object.keys( this.vars ).map(
      k => "var " + k + " = " + that.vars[k] + ";" ) );
};

Template.prototype.generateLinks = function() {
  var that = this;

  try {
    var output = [];
    var links = this.section.links;
    if( links.length === 0 ) return output;

    links.forEach(function (link, index) {
      try {
        output.push( "new Link({" );
        if( that.debug ) {
          output.push( "  name: '" + that.moduleName + "#" + index + "'," );
        }
        output.push(
          "  A:" + pod2code.call( that, link.A ) + ",",
          "  B:" + pod2code.call( that, link.B ),
          "});");
      }
      catch( ex ) {
        throw ex + "\n" + "link = " + JSON.stringify( link );
      }
    });

    return generateSection( "Links", output );
  }
  catch( ex ) {
    throw ex + "\n" + JSON.stringify( this.section.links, null, "  " ) + "\n" + "generateLinks()";
  }
};

/**
 *
 */
function pod2code( pod ) {
  try {
    var that = this;
    var items = [];
    Object.keys( pod ).forEach(function (key) {
      var val = pod[key];
      if( key === 'path' ) return pod2CodePath.call( that, items, val );
      if( key === 'delay' ) return pod2CodeDelay.call( that, items, val );
      if( key === 'action' ) return pod2CodeAction.call( that, items, val );
      if( key === 'converter' ) return pod2CodeConverter.call( that, items, val );
      if( key === 'format' ) return pod2CodeFormat.call( that, items, val );
      if( key === 'map' ) return pod2CodeMap.call( that, items, val );
      if( key === 'open' ) return pod2CodeOpen.call( that, items, val );
    });
    return "{" + items.join(", ") + "}";
  }
  catch( ex ) {
    throw ex + "\n" + "pod2code( " + JSON.stringify( pod ) + " )";
  }
}

/**
 *
 */
function pod2CodePath( items, path ) {
  var pieces = path.split("/")
      .map( x => x.trim() )
      .filter( x => x.length > 0 );
  if( pieces.length === 1 ) {
    // The  simplest path  describes  an attribute  of  the main  view
    // object.
    items.push(
      "obj: that",
      "name: '" + camelCase( pieces[0] ) + "'");
  }
  else {
    var attName = camelCase( pieces.pop() );
    var firstPiece = pieces.shift();
    var objCode = isVarNameAndNotViewId( firstPiece )
        ? firstPiece : "that.$elements." + camelCase( firstPiece );
    objCode += pieces.map(x => keySyntax( x ) ).join("");
    items.push(
      "obj: " + objCode,
      "name: '" + attName + "'");
  }
}

/**
 *
 */
function pod2CodeDelay( items, delay ) {
  items.push("delay: " + parseInt( delay ) );
}

function pod2CodeOpen( items, open ) {
  if( open === false ) {
    items.push("open: false");
  }
}

/**
 *
 */
function pod2CodeAction( items, actions ) {
  items.push(
    "action: function(v) {\n"
      + actions.map( x => "          " + x ).join("\n")
      + "}");
}

function pod2CodeConverter( items, converter ) {
  items.push("converter: " + converter);
}

function pod2CodeFormat( items, format ) {
  items.push("format: [_, " + JSON.stringify( format ) + "]");
}

function pod2CodeMap( items, codeLines ) {
  items.push(
    "map: function(v) {\n"
      + codeLines.map( x => "          " + x ).join("\n")
      + "}");
}

Template.prototype.addNeededBehindFunction = function( functionName ) {
  this.requires.View = "require('tfw.view');";
  pushUnique( this.neededBehindFunctions, functionName );
};

Template.prototype.addCast = function( name, value ) {
  if( name.substr(0, 7) === 'behind.' ) {
    var funcName = name.substr( 7 );
    this.addNeededBehindFunction( funcName );
    return "CODE_BEHIND." + funcName + ".bind( this )";
  }
  else {
    if( typeof value === 'undefined' ) value = "Converters.get('" + name + "')";
    this.requires["Converters"] = "require('tfw.binding.converters')";
    this.vars["conv_" + name] = value;
    return "conv_" + name;
  }
};

/**
 * @example
 * bind:   {Bind duration}
 * to:     "value"
 * return: {A:{path: "duration"}, B:{path: "value"}}
 *
 * bind:   {Bind names, converter: length}
 * to:     "count"
 * return: {A:{path: "names"}, B:{path: "count", converter: length}}
 *
 * bind:   {Bind duration, delay: 300}
 * to:     "value"
 * return: {A:{path: "duration"}, B:{path: "value", delay: 300}}
 *
 * bind:   {Bind duration, delay: 300}
 * to:     ["$.addClass(elem000, 'hide')"]
 * return: {A:{path: "duration"}, B:{action: ["$.addClass(elem000, 'hide')"], delay: 300}}
 *
 * bind:   {Bind duration, delay: 300}
 * to:     {Behind onDurationChange}
 * return: {A:{path: "duration"}, B:{action: {Behind onDurationChange}, delay: 300}}
 *
 */
Template.prototype.addLinkFromBind = function( bind, to ) {
  try {
    var A = {path: bind[1] || bind.path};
    var B = processLinkFromBindArgumentTo.call( this, to );

    processBindArguments.call( this, A, B, bind );
    return this.addLink( A, B );
  }
  catch( ex ) {
    throw Error(
      ex + "\n" + "addLinkFromBind("
        + JSON.stringify( bind ) + ", "
        + JSON.stringify( to ) + ")" );
  }
};

function processBindArguments( A, B, bind ) {
  processBindArgsForSource.call( this, A, bind );
  processBindArgsForDestination.call( this, B, bind );
}

function processBindArgsForSource( src, bind ) {
  if( bind.back !== false ) return;
  src.open = false;
}

function processBindArgsForDestination( dst, bind ) {
  try {
    var name, value;
    for( name in bind ) {
      value = bind[name];
      switch( name ) {
      case 'delay':
        if( typeof value !== 'number' )
          throw "In a {Bind...} declaration, `delay` must be a number!";
        dst.delay = value;
        break;
      case 'converter':
        dst.converter = parseConverter.call( this, value );
        break;
      case 'format':
        dst.format = parseFormat.call( this, value );
        break;
      }
    }
  }
  catch( ex ) {
    throw ex + "\n...in processBindArgsForDestination()";
  }
}

function parseFormat( syntax ) {
  if( typeof syntax !== 'string' )
    throw "In {Bind format:...}, `format` must be a string!";
  return syntax;
}

function parseConverter( syntax ) {
  if( typeof syntax === 'string' ) return parseConverterString.call( this, syntax );
  throw "In a {Bind converter:...}, `converter` must be a string!";
}

function parseConverterString( syntax ) {
  if( syntax.substr(0, 7) === 'behind.' ) {
    var funcName = syntax.substr( 7 );
    this.addNeededBehindFunction( funcName );
    return "CODE_BEHIND." + funcName + ".bind( this )";
  }
  else {
    this.vars["conv_" + syntax] = "Converters.get('" + syntax + "')";
    return "conv_" + syntax;
  }
}

/**
 * "value"                 -> { path: "value" }
 * ["$.clear(elem0)"]      -> { action: ["$.clear(elem0)"] }
 * {Behind onValueChanged} -> { action: ["CODE_BEHIND.onValueChanged.call( this, v )"] }
 */
function processLinkFromBindArgumentTo( to ) {
  if( typeof to === 'string' ) return { path: to };
  if( Array.isArray( to ) ) return { action: to };
  if( isSpecial( to, "behind" ) ) {
    return processLinkFromBindArgumentTo_behind.call( this, to );
  }
  else if( isSpecial( to, "bind" ) ) {
    return processLinkFromBindArgumentTo_bind.call( this, to );
  }
  throw "`to` argument can be only a string, an array or {Behind ...}!";
}

function processLinkFromBindArgumentTo_behind( to ) {
  var behindFunctionName = to[1];
  if( typeof behindFunctionName !== 'string' )
    throw "In a {Behind ...} statement, the second argument must be a string!";
  pushUnique( this.neededBehindFunctions, behindFunctionName );
  return { action: ["CODE_BEHIND." + behindFunctionName + ".call(that, v)"]};
}

function processLinkFromBindArgumentTo_bind( to ) {
  var binding = {};
  if( Array.isArray( to.action ) ) binding.action = to.action;
  if( typeof to.map === 'string' ) {
    var behindFunctionName = to.map;
    pushUnique( this.neededBehindFunctions, behindFunctionName );
    binding.map = ["return CODE_BEHIND." + behindFunctionName + ".call(that, v)"];
  }
  return binding;
}

/**
 * Prepare a link with `path` insteadof `obj`/`name`.
 */
Template.prototype.addLink = function( A, B ) {
  try {
    this.requires["Link"] = "require('tfw.binding.link')";
    this.that = true;
    checkLinkPod( A );
    checkLinkPod( B );
    var link = JSON.parse( JSON.stringify ({ A:A, B:B }) );
    this.section.links.push( link );
    return link;
  }
  catch( ex ) {
    throw Error(
      ex + "\n" + "addLink("
        + JSON.stringify( A ) + ", "
        + JSON.stringify( B ) + ")" );
  }
};

function checkLinkPod( pod ) {
  try {
    var pathType = typeof pod.path;
    if( pathType !== 'undefined' && pathType !== 'string' )
      throw "Attribute `path` in a link's pod must be a <string>, not a <" + pathType + ">!\n"
      + "pod.path = " + JSON.stringify( pod.path );

    var actionType = typeof pod.action;
    if( actionType !== 'undefined' && !Array.isArray( pod.action ) )
      throw "Attribute `action` in a link's pod must be an <array>, not a <" + actionType + ">!\n"
      + "pod.action = " + JSON.stringify( pod.action );

    if( !pod.path && !pod.action )
      throw "A link's pod must have at least an attribute `path` or `action`!";
  }
  catch( ex ) {
    throw Error(
      ex + "\n"
        + "checkLinkPod( " + JSON.stringify( pod ) + " )");
  }
}

function pushUnique( arr, item ) {
  if( arr.indexOf( item ) === -1 )
    arr.push( item );
}

function generateSection( sectionName, contentArray, indent ) {
  if( typeof indent === 'undefined' ) indent = "";

  var firstLine = indent + "//";
  var count = sectionName.length + 2;
  while( count --> 0 ) firstLine += "-";
  var lines = [firstLine, indent + "// " + sectionName];
  return lines.concat( contentArray );
}

function isEmpty( value ) {
  if( Array.isArray( value ) ) return value.length === 0;
  if( typeof value === 'string' ) return value.trim().length === 0;
  for( var k in value ) return false;
  return true;
}

function object2code( obj ) {
  if( Array.isArray( obj ) ) {
    return "[" + obj.map(x => object2code(x)).join(", ") + "]";
  }
  switch( typeof obj ) {
  case 'object':
    return "{"
      + Object.keys( obj )
      .map( k => quotesIfNeeded(k) + ": " + object2code( obj[k] ) )
      .join(", ")
      + "}";
  default:
    return JSON.stringify( obj );
  }
}

/**
 * If   `name`   is  a   valid   Javascript   identifier,  return   it
 * verbatim. Otherwise, return it surrounded by double quotes.
 */
var RX_JAVASCRIPT_IDENTIFIER = /^[_$a-z][_$a-z0-9]*$/i;
function quotesIfNeeded( name ) {
  return RX_JAVASCRIPT_IDENTIFIER.test( name ) ? name : JSON.stringify( name );
}

/**
 * @example
 * keySyntax( "value" ) === ".value"
 * keySyntax( "diff-value" ) === '["diff-value"]'
 */
function keySyntax( name ) {
  if( RX_JAVASCRIPT_IDENTIFIER.test( name ) ) return "." + name;
  return "[" + JSON.stringify( name ) + "]";
}

/**
 * An object is special of and only  if it's attribute of key "0" is a
 * string.
 */
function isSpecial( obj, name ) {
  if( !obj ) return false;
  if( typeof obj[0] !== 'string' ) return false;
  if( typeof name === 'string' ) {
    return obj[0].toLowerCase() === name;
  }
  return true;
}

/**
 * In a binding, you can use  the "source/attribute" syntax to bind to
 * an attribute of a descendant of the root element. If the source has
 * a "view.id", it is refered like this: `that.$elements.id`.
 * If not, it is refered by its var name: `e_xxx`.
 *
 * ViewId are camelCase and VarName start with "e_".
 */
function isVarNameAndNotViewId( name ) {
  return name.substr(0, 2) === 'e_';
}
