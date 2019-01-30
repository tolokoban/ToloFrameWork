"use strict";

const
ToloframeworkPermissiveJson = require( "toloframework-permissive-json" ),
Preprocessor = require( "./boilerplate.preprocessor" ),
Fatal = require( "./fatal" ),
View = require( "./boilerplate.view" ),
Global = require( "./boilerplate.global" );


const codeGenerators = { View, Global };
const DEFAULT_NUMBER_OF_LINES_TO_DISPLAY = 3;

exports.registerCodeGenerator = function ( name, generator ) {
    codeGenerators[ name ] = generator;
};


exports.generateCodeFrom = function ( module ) {
    if( !module.existsXjs ) {
        // No XJS: we just read the JS.
        return module.contentJS;
    }

    try {
        const
        rawDef = parseXJS( module.contentJS ),
        def = Preprocessor.parse( rawDef ),
        boilerplate = codeGenerators[ def[ 0 ] ];

        if ( !boilerplate ) {
            throw Error( `Unknown code generator "${def[0]}"!\n` +
                         `Available generators are: ${Object.keys(codeGenerators).join(", ")}.` );
        }
        return boilerplate.generateCodeFrom( def, module );
    } catch ( ex ) {
        Fatal.fire(
            `Fatal error in ${module.pathJs}!\n${ex}`,
            module.name,
            module.pathXjs
        );
    }
    return null;
};

/**
 * @param   {string} xjsFileContent - Source of the XJS file.
 * @returns {undefined}
 */
function parseXJS( xjsFileContent ) {
    try {
        return ToloframeworkPermissiveJson.parse( xjsFileContent );
    } catch ( ex ) {
        const code = getFewLinesOfCode( xjsFileContent, ex.index );
        throw Error( `Invalid permissive JSON syntax:${ex.message}\n\n${code}` );
    }
}


function getFewLinesOfCode( code, _issuePosition, linesToDisplay = DEFAULT_NUMBER_OF_LINES_TO_DISPLAY) {
    const issuePosition = Math.min( _issuePosition, code.length - 1 );

    let lineCount = 1;
    let currentIndex = 0;
    let previousIndex = 0;
    const lines = [];
    while ( currentIndex < code.length ) {
        if ( code.charAt( currentIndex ) === '\n' ) {
            lines.push( { line: lineCount, begin: previousIndex, end: currentIndex } );
            if ( lines.length > linesToDisplay ) lines.shift();
            previousIndex = currentIndex + 1;
            lineCount++;
            if ( currentIndex >= issuePosition ) break;
        }
        currentIndex++;
    }

    const columnsSeparator = ": ";
    const lineNumbersLengths = lines.map( x => `${x.line}`.length );
    const spaceForLineNumbers = lineNumbersLengths.reduce( ( a, v ) => Math.max( a, v ), 0 );
    let output = lines.map(x => padStart( x.line, spaceForLineNumbers ) +
            columnsSeparator + code.substring( x.begin, x.end ) ).join( "\n" );
    const lastLineBegin = lines.pop().begin;
    output += `\n${padStart(
 "^",
                               spaceForLineNumbers + columnsSeparator.length + issuePosition - lastLineBegin - 1
)}`;
    return output;
}

function padStart( _text, targetLength, _padString ) {
    const padString = typeof _padString === 'undefined' ? ' ' : _padString;
    let text = String(_text);
    while ( text.length < targetLength ) text = padString + text;
    return text;
}
