"use strict";

var Parser = require("../lib/text-parser");

describe('Module "Parser"', function() {
    it('should "eat" text', function() {
        expect(Parser({
            text: "I say YesNo, but also No ... and maybe Yes again!",
            grammar: {
                a: function( stream, state ) {
                    var res = stream.eat("Yes", "No");
                    if (res) state.out += res;
                    else stream.next();
                    return undefined;
                }
            },
            state: { out: '' }
        }).out).toBe("YesNoNoYes");
    });

    it('should "eatUntilChar', function() {
        expect(Parser({
            text: "I say YesNo, but also No ... and maybe Yes again!",
            grammar: {
                a: function( stream, state ) {
                    state.out = stream.eatUntilChar(",");
                    return null;
                }
            },
            state: { out: '' }
        }).out).toBe("I say YesNo");        
    });

    it('should "eatUntilText', function() {
        expect(Parser({
            text: "I say YesNo, but also No ... and maybe Yes again!",
            grammar: {
                a: function( stream, state ) {
                    state.out = stream.eatUntilText(", ");
                    return null;
                }
            },
            state: { out: '' }
        }).out).toBe("I say YesNo");        
    });

});
