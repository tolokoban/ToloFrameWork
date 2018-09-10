"use strict";

var Path = require( "path" );

var TOKENS = {
  xjs: {
    comment: /^\/\/[^\n\r]*/,
    keyword: /^[a-z]+\.[^ \n\r\t{},'":]+\s*:/,
    "function": /^[^ \n\r\t{},'":]+\s*:/,
    string: /^"((\\"|[^"])*")|^('(\\'|[^']+)*')/,
    number: /^[-+]?[0-9]+(\.[0-9]+)?([eE][0-9]+)?/,
    symbol: /^[{}\[\]]+/
  },
  js: {
    comment: /^\/\/[^\n\r]*/,
    "function": /^[$_a-zA-Z][$_a-zA-Z0-9]*(?=([ \n\r\t]*\())/,
    string: /^"((\\"|[^"])*")|^('(\\'|[^']+)*')/,
    identifier: /^[$_a-zA-Z][$_a-zA-Z0-9]*/,
    number: /^[-+]?[0-9]+(\.[0-9]+)?([eE][0-9]+)?/,
    regexp: /^\/(\\\/|[^\/\n\t])+\/[gmi]*/,
    symbol: /^[\(\),;:\{\}\[\]]+/,
    operator: /^(&[a-zA-Z]+;|===|!==|==|!=|<=|>=|<|>|\|\||&&|\*|\+|\-|\/|%|[\+=&\|\-]+)/,
    KEYWORDS1: [
      "break",
      "continue",
      "do",
      "for",
      "import",
      "new",
      "this",
      "void",
      "case",
      "default",
      "else",
      "function",
      "in",
      "return",
      "typeof",
      "while",
      "comment",
      "delete",
      "export",
      "if",
      "label",
      "switch",
      "var",
      "with",
      "catch",
      "enum",
      "throw",
      "class",
      "extends",
      "try",
      "const",
      "finally",
      "debugger",
      "super",
      "let"
    ],
    KEYWORDS2: [
      "Math",
      "window",
      "require",
      "module",
      "exports",
      "Float32Array",
      "Float64Array",
      "Uint8ClampedArray",
      "Uint8Array",
      "Uint16Array",
      "Uint32Array",
      "Int8Array",
      "Int16Array",
      "Int32Array"
    ]
  },
  glsl: {
    //comment: /^\/\/[^\n\r]*/,
    comment: /^\/((\/[^\n\r]*)|(\*(\*[^\/]|[^*]+)*\*\/))/,
    "function": /^[$_a-zA-Z][$_a-zA-Z0-9]*(?=([ \n\r\t]*\())/,
    string: /^"((\\"|[^"])*")|^('(\\'|[^']+)*')/,
    identifier: /^[$_a-zA-Z][$_a-zA-Z0-9]*/,
    number: /^[-+]?[0-9]+(\.[0-9]+)?([eE][0-9]+)?/,
    regexp: /^\/(\\\/|[^\/\n\t])+\/[gmi]*/,
    symbol: /^[\(\),;:\{\}\[\]]+/,
    operator: /^(&[a-zA-Z]+;|===|!==|==|!=|<=|>=|<|>|\|\||&&|\*|\+|\-|\/|%|[\+=&\|\-]+)/,
    KEYWORDS1: [
      "attribute", "const", "uniform", "varying",
      "break", "continue", "do", "for", "while",
      "if", "else",
      "in", "out", "inout",
      "float", "int", "void", "bool",
      "true", "false",
      "lowp", "mediump", "highp", "precision", "invariant",
      "discard", "return",
      "mat2", "mat3", "mat4",
      "vec2", "vec3", "vec4", "ivec2", "ivec3", "ivec4", "bvec2", "bvec3", "bvec4",
      "sampler2D", "samplerCube",
      "struct"
    ],
    KEYWORDS2: [
      "radians", "degrees", "sin", "cos", "tan", "asin", "acos", "atan",
      "pow", "exp", "log", "exp2", "log2", "sqrt", "inversesqrt",
      "abs", "sign", "floor", "ceil", "fract", "mod", "min", "max",
      "clamp", "mix", "step", "smoothstep",
      "length", "distance", "dot", "cross", "normalize", "faceforward", "reflect", "refract",
      "matrixCompMult",
      "lessThan", "lessThanEqual", "greaterThan", "greaterThanEqual", "equal", "notEqual",
      "any", "all", "not",
      "texture2D", "texture2DProj", "texture2DLod", "texture2DProjLod",
      "textureCube", "textureCubeLod",
      "gl_Position", "gl_PointSize",
      "gl_FragColor", "gl_FragData", "gl_FragCoord", "gl_FrontFacing", "gl_PointCoord"
    ]
  }
};

var rxLT = /</g;
var rxGT = />/g;
var rxAMP = /&/g;

function h( code, lang, libs ) {
  var N = libs.Tree;
  code = code.trim( ) + " ";
  var tokens = TOKENS[lang] || TOKENS.js,
      buff = '',
      idx = 0,
      key,
      rx,
      match,
      found,
      c;
  if (!Array.isArray( tokens.KEYWORDS1 )) {
    tokens.KEYWORDS1 = [ ];
  }
  if (!Array.isArray( tokens.KEYWORDS2 )) {
    tokens.KEYWORDS2 = [ ];
  }
  try {
    code = code.replace( rxAMP, '&amp;' );
    code = code.replace( rxLT, '&lt;' );
    code = code.replace( rxGT, '&gt;' );
    while ( idx < code.length ) {
      found = false;
      for ( key in tokens ) {
        if (key === key.toUpperCase( ))
          break;
        rx = tokens[key];
        match = rx.exec(code.substr( idx ));
        if ( match ) {
          if ( key === 'function' ) {
            if ( tokens.KEYWORDS1.indexOf( match[0] ) != -1 ) {
              key = 'keyword';
            }
            else if ( tokens.KEYWORDS2.indexOf( match[0] ) != -1 ) {
              key = 'keyword2';
            }
          }
          else if ( key === 'identifier' ) {
            if ( tokens.KEYWORDS1.indexOf( match[0] ) != -1 ) {
              key = "keyword";
            } else if ( tokens.KEYWORDS2.indexOf( match[0] ) != -1 ) {
              key = "keyword2";
            }
          }
          buff += '<span class="' + key + '">' + match[0] + "</span>";
          idx += match[0].length;
          found = true;
          break;
        }
      }
      if ( !found ) {
        buff += code.charAt( idx );
        idx++;
      }
    }
  } catch ( ex ) {
    libs.fatal( "Unexpected error while highlighting '" + lang + "' code!\n" + ex );
  }
  buff = "<pre class='custom highlight " + lang + "'>" + buff.split( '\n' ).join( '\n' ) + "</pre>";
  return buff;
}

h.cssFile = Path.join( __dirname, "highlight.css" );

exports.parseCode = h;
