"use strict";

exports.parse = parse;


const RX_JSDOC_TAG = /@[a-z]+/;


class ParserDesc {
    constructor( output ) {
        this.output = output;
    }

    flush( text ) {
        this.output.desc += text;
    }

    close() {
        this.output = this.output.trim();
    }
}

/**
 * @param {string} comments - Comments with JSDoc tags.
 * @return {object} `{ desc, returns: {type, desc}, params: [{name, type, desc}, ...], examples: []}`
 */
function parse( comments ) {
    const
        output = {
            desc: '',
            returns: {
                type: null,
                desc: ''
            },
            params: [],
            examples: []
        },
        parserDesc = new ParserDesc( output ),
        parser = parserDesc;

    return output;
}