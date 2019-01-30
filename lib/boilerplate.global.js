"use strict";


exports.generateCodeFrom = function ( def, module ) {
    const global = {};

    for ( const attName in def ) {
        if ( attName === '0' ) continue;
        const attValue = def[ attName ];
        global[ attName ] = parseAttributeValue( attValue );
    }

    return `${module.contentJs}
//--------------------------
// Module global variables.
${Object.keys( global )
        .map( key => `GLOBAL[${JSON.stringify(key)}] = ${JSON.stringify(global[key])};\n` )}`;
};


function parseAttributeValue( value ) {
    return value;
}
