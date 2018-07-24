"use strict";
var Xjs = require("./xjs.parser");
var Util = require("../lib/boilerplate.util");
var Parser = require("../lib/boilerplate.view.parser.constructor");
require("../lib/boilerplate.view.parser.names")(Parser);
require("../lib/boilerplate.view.parser.parseData")(Parser);

describe('Module `boilerplate.view.parser.parseData`', function() {
  function check( usecase ) {
    var input = usecase.in;
    var expected = usecase.ex;
    it(`${JSON.stringify(input)} should give ${JSON.stringify(expected)}`, function() {
      var parser = new Parser();
      var result = parser.parseData( input );
      expect( result ).toEqual( expected );
    });
  }

  function checkDebug( usecase ) {
    var input = usecase.in;
    var expected = usecase.ex;
    var parser = new Parser();
    var result = parser.parseData( input );
    console.log("============================================================");
    console.log(JSON.stringify( input ));
    console.log("============================================================");
    console.log("Expected: ");
    console.log(JSON.stringify( expected, null, '  ' ));
    console.log("------------------------------------------------------------");
    console.log(Util.generateCode( expected ));
    console.log("============================================================");
    console.log("Got:      ");
    console.log(JSON.stringify( result, null, '  ' ));
    console.log("------------------------------------------------------------");
    console.log(Util.generateCode( result ));
  }

  debugger;
  //checkDebug({ in: { bar: {$f: [{foo: "Foo", cor: []}]}, tor: 666}, ex: [

  describe('{intl ...}', function() {
    [
      { in: {0: "intl", 1: "title"}, ex: "_(\"title\")" },
      { in: {0: "intl", 1: "button/title"}, ex: "this.$elements.button._(\"title\")" },
      { in: {0: "intl", 1: "foo-bar/title"}, ex: "this.$elements[\"foo-bar\"]._(\"title\")" }
    ].forEach( check );
  });
  
  describe('object', function() {
    [
      //{ in: [], ex: [] },
      { in: {}, ex: ["{}"] },
      { in: {a:27}, ex: ["{a:27}"] },
      { in: {a:[27]}, ex: ["{a:[27]}"] },
      { in: {a:27, b:18}, ex: ["{", ["a:27,", "b:18", ], "}"] },
      { in: { bar: {$f: [{foo: "Foo", cor: []}]}, tor: 666}, ex: [
        "{",
        [
          "bar:{$f:[",
          [
            "{",
            [
              "foo:\"Foo\",",
              "cor:[]"
            ],
            "}"
          ],
          "]},",
          "tor:666"
        ],
        "}"
      ]
      },
      { in: {foo:[18,27],"6":666}, ex: [
        "{", [
          '"6":666,',
          "foo:[", [
            "18,",
            "27"],
          "]" ],
        "}"] },
      { in: [{}], ex: ["[{}]"] }
    ].forEach( check );
  });

  describe('array', function() {
    [
      //{ in: [], ex: [] },
      { in: [], ex: ["[]"] },
      { in: [27], ex: ["[27]"] },
      { in: [18,27], ex: [
        "[", [
          "18,",
          "27"],
        "]"] },
      { in: [[[]]], ex: ["[[[]]]"] },
      { in: [[1], [2,3]], ex: [
        "[", [
          "[1],",
          "[", [
            "2,",
            "3" ],
          "]" ],
        "]" ] },
      { in: [[]], ex: ["[[]]"] }
    ].forEach( check );
  });
});
