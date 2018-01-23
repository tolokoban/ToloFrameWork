"use strict";


/**
 * Suppose you have
 * ```js
 * var def = {
 *   test: {
 *     desc: "prepare Karma tests.",
 *     opts: {
 *       dir: {
 *         desc: "Karma spec folder. Default is 'spec'.",
 *         defv: "spec",
 *         args: 1
 *       }
 *     }
 *   },
 *   doc: {
 *     desc: "create documentation."
 *   }
 * };
 * ```
 * Then
 * ```js
 * parse( "node tfw.js", def ) === {}
 * ```
 * 
 * ```js
 * parse( "node tfw.js doc", def ) === { doc:{} }
 * ```
 * 
 * ```js
 * parse( "node tfw.js test", def ) === { test: { dir: "spec" } }
 * ```
 * 
 * ```js
 * parse( "node tfw.js test -dir jasmin/", def ) === { test: { dir: "jasmine/" } }
 * ```
 * 
 * 
 * @param {array} commandLineArgs  - Array of strings  provided by the
 * command  line. Most  of the  time, you  will use  `process.argv` to
 * populate this.
 */
exports.parse = function( commandLineArgs, def ) {
  var options = {};
  // Remove `node` and the script name.
  options.shift();
  options.shift();

  var arg, opt, cmd;
  var currentCommand = null;

  while( options.length > 0 ) {
    arg = options.shift();
    if( isOption( arg ) ) {
      // That's an option.
      opt = arg.substr( 1 );   // Remove heading dash.
      checkIfCommandHasThisOption( currentCommand, opt, def );
      options[currentCommand][opt] = parseOptionArguments( options, currentCommand, opt, def );
    } else {
      // That's a command.
      cmd = arg;
      checkIfCommandExists( cmd, def );
      options[cmd] = {};
    }
  }

  applyDefaultValuesForOptionsArguments( options, def );
  return options;
};


/**
 * @return Text description of arguments based on `def`.
 */
exports.usage = function( def ) {

};


function applyDefaultValuesForOptionsArguments( options, def ) {
  var cmdName, cmdValue, optName, optValue;
  for( cmdName in options ) {
    cmdValue = options[cmdName];
    for( optName in cmdValue ) {
      optValue = cmdValue[optName];
      
    }
  }
}


function isOption( name ) {
  return name.charAt( 0 ) === '-';
}


function checkIfCommandExists( cmd, def ) {
  if( !def[cmd] )
    throw `Unknown command '${cmd}'!`;
}


function checkIfCommandHasThisOption( cmd, opt, def ) {
  if( !cmd )
    throw "Expected a command, but found '" + opt + "'!";
  var availableOptions = def[cmd].opts;
  if( !availableOptions )
    throw "Command '" + cmd + "' does not accept any option, but you provided '" + opt + "'!";
  if( !availableOptions[opt] )
    throw "Command '" + cmd + "' does not accept the option you provided: '" + opt + "'!";  
}


function parseOptionArguments( options, currentCommand, opt, def ) {
  var args = [];
  var count = def[currentCommand][opt].args;
  if( typeof count !== 'number' ) count = 0;
  while( count --> 0 ) {
    if( options.length === 0 )
      throw `Missing mandatory argument for option '${opt}' of command '${currentCommand}'!`;
    args.push( options.shift() );
  }
  return args;
}
