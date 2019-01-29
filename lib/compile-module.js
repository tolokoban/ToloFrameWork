
"use strict";

var Jx = require("toloframework-permissive-json");
var Tpl = require("./template");
var Source = require("./source");
var MinifyJS = require("./minifyJS");
var CompilerINI = require("./compiler-ini");


/**
 * Compile a javascriot module if needed.
 * @return `{ code: <string>, zip: <string> }`
 */
module.exports = function( prj, moduleName ) {
  var jsSrc = new Source( prj, "mod/" + moduleName + ".js" );
  var iniSrc = new Source( prj, "mod/" + moduleName + ".ini" );
  var depSrc = new Source( prj, "mod/" + moduleName + ".dep" );
  var jsxSrc = new Source( prj, "mod/" + moduleName + ".jsx" );

  if( jsxSrc ) {
    // Extended JSON.
    
  }
  else if( !jsSrc.isUptodate() ) {
    console.log("Compile JS module: " + moduleName.cyan
                + "  "
                + jsSrc.getAbsoluteFilePath().substr(
                  0, jsSrc.getAbsoluteFilePath().length - moduleName.length - 3).grey);
    var replacements = {};
    manageDependencies( jsSrc, replacements );
    manageInternationalization( jsSrc, replacements );
  }

  var code = Tpl.file(
    "module.js",
    {
      name: moduleName,
      code: jsSrc.read(),
      intl: jsSrc.tag('intl') || '',
      head: jsSrc.tag('head') || '',
      foot: jsSrc.tag('foot') || ''
    }
  ).out + '});';
  var minification = MinifyJS({
    name: moduleName + ".js",
    content: code
  });
  return {
    code: code,
    zip: minification.zip
  };
};



function manageInternationalization( jsSrc ) {
  if( jsSrc.name() == 'mod/$.js' ) {
    jsSrc.tag("intl", "");
    jsSrc.tag('foot', '');
    return;
  }

  var prj = jsSrc.prj();
  var iniName = jsSrc.name().substr(0, jsSrc.name().length - 2) + "ini";
  var iniPath = prj.srcOrLibPath( iniName );
  if (iniPath) {
    jsSrc.tag("intl", CompilerINI.parse(iniPath));
  } else {
    jsSrc.tag("intl", "var _=function(){return ''};");
  }
  jsSrc.tag('foot', "module.exports._ = _;\n" );
}


function manageDependencies( jsSrc ) {
  var watch = [];
  var prj = jsSrc.prj();
  var depFilename = jsSrc.name( 'dep' );
  var firstItem, varName, varFilename, srcVar;
  var head = '';

  if( prj.srcOrLibPath( depFilename ) ) {
    var depFile = new Source( prj, depFilename );
    try {
      var depJSON = JSON.parse( depFile.read() );
      head = '';
      if( typeof depJSON.var !== 'undefined' ) {
        head = 'var GLOBAL = {';
        firstItem = true;
        for ( varName in depJSON.var ) {
          varFilename = depJSON.var[varName];
          srcVar = prj.srcOrLibPath( 'mod/' + varFilename );
          if( !srcVar ) {
            srcVar = prj.srcOrLibPath( varFilename );
          }
          if( !srcVar ) {
            throw "[" + depFilename
              + "] Unable to find var file `" + varFilename + "` nor `mod/"
              + varFilename + "`!";
          }
          pushUnique( watch, "mod/" + varFilename );
          if (firstItem) {
            firstItem = false;
          } else {
            head += ',';
          }
          srcVar = new Source( prj, srcVar );
          head += '\n  ' + JSON.stringify( varName )
            + ": " + JSON.stringify( srcVar.read() );
        }
        head += "};\n";
      }
    }
    catch ( ex ) {
      throw "Unable to parse JSON dependency file!\n" + ex, depFile.getAbsoluteFilePath();
    }

    jsSrc.tag( 'head', head );
    // List of files to watch. If  one of those files is newer
    // that the JS file, we have to recompile.
    jsSrc.tag('watch', watch);
  }
}


function pushUnique( arr, item ) {
  if( arr.indexOf( item ) != -1 ) return false;
  arr.push( item );
  return true;
}
