"use strict";

const
    ToloframeworkPermissiveJson = require( "toloframework-permissive-json" ),
    Preprocessor = require( "./boilerplate.preprocessor" ),
    Fatal = require( "./fatal" ),
    View = require( "./boilerplate.view" ),
    Global = require( "./boilerplate.global" );


const codeGenerators = { View, Global };


exports.registerCodeGenerator = function ( name, generator ) {
    codeGenerators[ name ] = generator;
};


exports.generateCodeFrom = function ( src ) {
    const xjs = src.clone( "xjs" );
    if ( xjs.exists() === false ) return src.read();

    try {
        const
            rawDef = parseXJS( xjs ),
            def = Preprocessor( rawDef ),
            boilerplate = codeGenerators[ def[ 0 ] ];

        if ( !boilerplate ) {
            throw Error( `Unknown code generator "${def[0]}"!\n` +
                `Available generators are: ${Object.keys(codeGenerators).join(", ")}.` );
        }
        return boilerplate.generateCodeFrom( def, src.read(), src.name() );
    } catch ( ex ) {
        Fatal.fire(
            `Fatal error in ${xjs.getAbsoluteFilePath()}!\n${ex}`,
            src.name(),
            xjs.getAbsoluteFilePath()
        );
    }
    return null;
};

/**
 * @param   {Source} xjs - Source of the XJS file.
 * @returns {undefined}
 */
function parseXJS( xjs ) {
    const xjsFileContent = xjs.read();
    try {
        return ToloframeworkPermissiveJson.parse( xjsFileContent );
    } catch ( ex ) {
        const code = getFewLinesOfCode( xjsFileContent, ex.index, 3 );
        throw Error( `Invalid permissive JSON syntax:${ex.message}\n\n${code}` );
    }
}


function getFewLinesOfCode( code, issuePosition, linesToDisplay ) {
    if ( typeof linesToDisplay === 'undefined' ) linesToDisplay = 3;
    var lineCount = 1;
    var currentIndex = 0;
    var previousIndex = 0;
    var lines = [];
    issuePosition = Math.min( issuePosition, code.length - 1 );
    while ( currentIndex < code.length ) {
        if ( code.charAt( currentIndex ) === '\n' ) {
            lines.push( { line: lineCount, begin: previousIndex, end: currentIndex } );
            if ( lines.length > linesToDisplay )
                lines.shift();
            previousIndex = currentIndex + 1;
            lineCount++;
            if ( currentIndex >= issuePosition ) break;
        }
        currentIndex++;
    }

    debugger;
    var columnsSeparator = ": ";
    var lineNumbersLengths = lines.map( x => ( "" + x.line ).length );
    var spaceForLineNumbers = lineNumbersLengths.reduce( ( a, v ) => Math.max( a, v ), 0 );
    var output = lines.map(
        x => padStart( x.line, spaceForLineNumbers ) +
        columnsSeparator + code.substring( x.begin, x.end ) ).join( "\n" );
    var lastLineBegin = lines.pop().begin;
    output += "\n" + padStart( "^",
        spaceForLineNumbers + columnsSeparator.length + issuePosition - lastLineBegin - 1 );
    return output;
}

function padStart( text, targetLength, padString ) {
    if ( typeof padString === 'undefined' ) padString = ' ';
    text = "" + text;
    while ( text.length < targetLength )
        text = padString + text;
    return text;
}