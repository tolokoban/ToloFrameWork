"use strict";

var OptionsParser = require("../lib/options-parser");


describe('Module `options-parser`', function() {
  describe('function `parse()`', function() {
    function check(should, commandLineArgs, def, expectedResult) {
      it("should " + should, function() {
        var result = OptionsParser.parse( commandLineArgs, def );
        var resultAsString = JSON.stringify( result );
        var expectedAsString = JSON.stringify( expectedResult );
        if( resultAsString != expectedAsString ) {
          fail("\nExpected " + expectedAsString + "\n"
               + " but got " + resultAsString);
        }
      });
    }

    check(
      "parse a command with an option",
      ["A", "B", "build", "-out", "www"], DEF1(),
      { build: { out: ["www"] } }
    );
    check(
      "parse a command without the options, but the default value must be added",
      ["A", "B", "build"], DEF1(),
      { build: { out: ["/var/www"] } }
    );
  });
});


function DEF1() {
  return {
    build: {
      opts: {
        out: {
          args: "/var/www"
        }
      }
    }
  };
}
