"use strict";
var Xjs = require("./xjs.parser");
var Parser = require("../lib/boilerplate.view.parser.constructor");
require("../lib/boilerplate.view.parser.names")(Parser);
require("../lib/boilerplate.view.parser.parseConverter")(Parser);

describe('Module `boilerplate.view.parser.parseConverter`', function() {
  describe('no-arg converters', function() {
    ['array', 'boolean', 'booleans', 'color', 'intl',
     'isEmpty', 'isNotEmpty', 'keys', 'length', 'list',
     'multilang', 'not', 'sortedKeys', 'string', 'strings',
     'unit', 'units', 'validator'].forEach(function (name) {
       var input = Xjs( `"${name}"` );
       var parser = new Parser();
       var result = parser.parseConverter( input );
       it(`Parser.parseConverter("${name}") should return the converter variable name`, function() {
         expect( result ).toEqual( `conv_${name}` );
       });
       it(`Parser.parseConverter("${name}") should use require("tfw.binding.converters")`, function() {
         expect( parser.sections.requires.Converters ).toEqual( "require('tfw.binding.converters');" );
       });
       it(
         `Parser.parseConverter("${name}") should add global "var conv_${name} = Converters.get('${name}');"`,
         function() {
           expect( parser.sections.converters ).toEqual( [`var conv_${name} = Converters.get('${name}');`] );
         }
       );
     });

    it('should throw an exception for unknown converter ZIZITOP54575', function() {
      var input = Xjs( '"ZIZITOP54575"' );
      var parser = new Parser();
      var result = null;
      try {
        result = parser.parseConverter( input );
        fail("No exception thrown! But we expected one.");
      }
      catch( ex ) {
        expect( result ).toBe( null );
      }
    });

  });

  describe('array converters', function() {
    var input = ["Yes","No"];
    var parser = new Parser();
    var result = parser.parseConverter( input );
    it('should make an enum converter', function() {
      expect( result ).toBe( "conv_enum1" );
    });
    it(`Parser.parseConverter(["Yes","No"]) should use require("tfw.binding.converters")`, function() {
      expect( parser.sections.requires.Converters ).toEqual( "require('tfw.binding.converters');" );
    });
    it(
      `Parser.parseConverter(["Yes","No"]) should add global "var conv_enum1 = Converters.get('enum')(["Yes","No"]);"`,
      function() {
        expect( parser.sections.converters ).toEqual(
          [`var conv_enum1 = Converters.get('enum')(["Yes","No"]);`]
        );
      }
    );
  });
});
