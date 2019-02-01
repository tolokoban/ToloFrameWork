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
 * @param {object} def - Defaults.
 * @returns {object} The options found on the command line.
 */
exports.parse = function ( commandLineArgs, def ) {
    const options = {};
    // Remove `node` and the script name.
    commandLineArgs.shift();
    commandLineArgs.shift();

    let currentCommand = null;

    while ( commandLineArgs.length > 0 ) {
        const arg = commandLineArgs.shift();
        if ( isOption( arg ) ) {
            // That's an option.
            // Remove heading dash.
            const opt = arg.substr( 1 );
            checkIfCommandHasThisOption( currentCommand, opt, def );
            options[ currentCommand ][ opt ] = parseOptionArguments( commandLineArgs, currentCommand, opt, def );
        } else {
            // That's a command.
            const cmd = arg;
            checkIfCommandExists( cmd, def );
            options[ cmd ] = {};
            currentCommand = cmd;
        }
    }

    applyDefaultValuesForOptionsArguments( options, def );
    return options;
};


/**
 * @return Text description of arguments based on `def`.
 */
exports.usage = function ( def ) {
    let output = "Accepted arguments:\n";
    const
        commandNames = Object.keys( def ),
        commandMaxLength = commandNames.reduce( ( acc, val ) => Math.max( acc, val.length ), 0 );

    commandNames.forEach( function ( commandName ) {
        output += `  ${commandName.yellow}:`;
        output += spc( 1 + commandMaxLength - commandName.length );
        const cmd = def[ commandName ];
        if ( typeof cmd.desc === 'string' ) output += cmd.desc;
        output += "\n";
        if ( !cmd.opts ) return;
        const optionNames = Object.keys( cmd.opts );
        optionNames.forEach( function ( optName ) {
            output += `    -${optName.yellow}:`.yellow;
            output += spc( 1 + commandMaxLength - commandName.length );
            const opt = cmd.opts[ optName ];
            if ( typeof opt.desc === 'string' ) output += opt.desc;
            output += "\n";
        } );

    } );

    return `${output}\n`;
};

/**
 * @param {number} nbSpaces - Number of spaces.
 * @returns {string} A string containing `nbSpaces` spaces.
 */
function spc( nbSpaces ) {
    let
        output = "",
        counter = typeof nbSpaces !== "number" ? nbSpaces : 0;
    while ( counter-- > 0 ) output += " ";
    return output;
}

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
    Object.keys( options ).forEach( function ( cmdName ) {
        const
            cmdOpts = options[ cmdName ],
            defOpts = def[ cmdName ].opts;
        if ( defOpts ) {
            Object.keys( defOpts ).forEach( function ( defOptName ) {
                if ( cmdOpts[ defOptName ] ) return;
                const defOptValue = defOpts[ defOptName ];
                if ( countArgs( defOptValue ) > 0 ) {
                    cmdOpts[ defOptName ] = defOptValue.args;
                }
            } );
        }
    } );
}


function isOption( name ) {
    return name.charAt( 0 ) === '-';
}


function checkIfCommandExists( cmd, def ) {
    if ( !def[ cmd ] )
        throw `Unknown command '${cmd}'!`;
}


function checkIfCommandHasThisOption( cmd, opt, def ) {
    if ( !cmd )
        throw "Expected a command, but found '" + opt + "'!";
    var availableOptions = def[ cmd ].opts;
    if ( !availableOptions )
        throw "Command '" + cmd + "' does not accept any option, but you provided '" + opt + "'!";
    if ( !availableOptions[ opt ] )
        throw "Command '" + cmd + "' does not accept the option you provided: '" + opt + "'!";
}


function parseOptionArguments( commandLineArgs, currentCommand, opt, def ) {
    var args = [];
    var count = countArgs( def[ currentCommand ].opts[ opt ] );
    while ( count-- > 0 ) {
        if ( commandLineArgs.length === 0 )
            throw `Missing mandatory argument for option '${opt}' of command '${currentCommand}'!`;
        args.push( commandLineArgs.shift() );
    }
    return args;
}


function countArgs( opt ) {
    if ( !opt.args ) return 0;
    if ( !Array.isArray( opt.args ) ) opt.args = [ opt.args ];
    return opt.args.length;
}
