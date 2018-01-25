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
 *         args: "spec"
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
  commandLineArgs.shift();
  commandLineArgs.shift();

  var arg, opt, cmd;
  var currentCommand = null;

  while( commandLineArgs.length > 0 ) {
    arg = commandLineArgs.shift();
    if( isOption( arg ) ) {
      // That's an option.
      opt = arg.substr( 1 );   // Remove heading dash.
      checkIfCommandHasThisOption( currentCommand, opt, def );
      options[currentCommand][opt] = parseOptionArguments( commandLineArgs, currentCommand, opt, def );
    } else {
      // That's a command.
      cmd = arg;
      checkIfCommandExists( cmd, def );
      options[cmd] = {};
      currentCommand = cmd;
    }
  }

  applyDefaultValuesForOptionsArguments( options, def );
  return options;
};


/**
 * @return Text description of arguments based on `def`.
 */
exports.usage = function( def ) {
  var output = "Accepted arguments:\n";
  var commandNames = Object.keys( def );
  var commandMaxLength = commandNames.reduce(
    (acc, val) => Math.max( acc, val.length ), 0
  );
  commandNames.forEach(function (commandName) {
    output += "  " + commandName.yellow.bold + ":";
    var nbSpaces = 1 + commandMaxLength - commandName.length;
    while( nbSpaces --> 0 ) output += " ";
    var cmd = def[commandName];
    if( typeof cmd.desc === 'string' ) output += cmd.desc;
    output += "\n";
    if( !cmd.opts ) return;
    var optionNames = Object.keys( cmd.opts );
    var optionMaxLength = optionNames.reduce(
      (acc, val) => Math.max( acc, val.length ), 0
    );
    optionNames.forEach(function (optName) {
      output += "    -".yellow + optName.yellow + ":";
      var nbSpaces = 1 + commandMaxLength - commandName.length;
      while( nbSpaces --> 0 ) output += " ";
      var opt = cmd.opts[ optName ];
      if( typeof opt.desc === 'string' ) output += opt.desc;
      output += "\n";
    });

  });

  return output + "\n";
};

/**
 * If the command line is `node prog build -debug -output "www/assets"`, `options` will look like this:
 * ```
 * {
 *   build: {
 *     debug: [],
 *     output: ["www/assets"]
 *   }
 * }
 * ```
 *
 */
function applyDefaultValuesForOptionsArguments( options, def ) {
  var cmdName, cmdOpts, optName, optValue;
  var defOpts, defOptName, defOptValue;
  var defOptArgs, defOptDefv;

  for( cmdName in options ) {
    cmdOpts = options[cmdName];
    defOpts = def[cmdName].opts;
    if( defOpts ) {
      for( defOptName in defOpts ) {
        if( cmdOpts[defOptName] ) continue;
        defOptValue = defOpts[defOptName];
        if( countArgs( defOptValue ) > 0 ) {
          cmdOpts[defOptName] = defOptValue.args;
        }
      }
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


function parseOptionArguments( commandLineArgs, currentCommand, opt, def ) {
  var args = [];
  var count = countArgs( def[currentCommand].opts[opt] );
  while( count --> 0 ) {
    if( commandLineArgs.length === 0 )
      throw `Missing mandatory argument for option '${opt}' of command '${currentCommand}'!`;
    args.push( commandLineArgs.shift() );
  }
  return args;
}


function countArgs( opt ) {
  if( !opt.args ) return 0;
  if( !Array.isArray( opt.args ) ) opt.args = [opt.args];
  return opt.args.length;
}
