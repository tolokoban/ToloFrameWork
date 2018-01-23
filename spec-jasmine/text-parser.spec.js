"use strict";

var Parser = require("../lib/text-parser");

describe('Module "Parser"', function() {
    function chk( text, func, expected ) {
        expect(Parser({
            text: text,
            grammar: {start: func},
            state: { out: '' }
        }).out).toBe(expected);
    }

    it('should "eatRegex"', function() {
        chk("Hello world! We are 666 people here.",
           function( stream, state ) {
               if (stream.eatRegex(/[a-z]+/gi)) {
                   state.out += 'T';
                   return;
               }
               if (stream.eatRegex(/[0-9]+/g)) {
                   state.out += 'N';
                   return;
               }
               state.out += stream.next();
           },
           "T T! T T N T T.");
    });


    it('should "eat" text', function() {
        chk("I say YesNo, but also No ... and maybe Yes again!",
            function( stream, state ) {
                var res = stream.eat("Yes", "No");
                if (res) state.out += res;
                else stream.next();
                return undefined;
            },
            "YesNoNoYes");
    });

    it('should "eatUntilChar', function() {
        chk("I say YesNo, but also No ... and maybe Yes again!",
            function( stream, state ) {
                state.out = stream.eatUntilChar(",");
                return null;
            },
            "I say YesNo");
    });

    it('should "eatUntilText', function() {
        chk("I say YesNo, but also No ... and maybe Yes again!",
            function( stream, state ) {
                state.out = stream.eatUntilText(", ");
                return null;
            },
            "I say YesNo");
    });
});
