"use strict";

var Names = require("../lib/boilerplate.view.parser.names")(function() {});


describe('Module `boilerplate.view.parser.names`', function() {
  describe('function addName', function() {
    var names = new Names();
    it('("foo") should return true the first time', function() {
      expect( names.addName( "foo" ) ).toBe( true );
    });
    it('("foo") should return false the second time', function() {
      expect( names.addName( "foo" ) ).toBe( false );
    });
    it('("foo") should return false the third time', function() {
      expect( names.addName( "foo" ) ).toBe( false );
    });
    it('("bar") should return true the first time', function() {
      expect( names.addName( "bar" ) ).toBe( true );
    });
    it('("bar") should return false the second time', function() {
      expect( names.addName( "bar" ) ).toBe( false );
    });
    it('("bar") should return false the third time', function() {
      expect( names.addName( "bar" ) ).toBe( false );
    });
  });

  describe('function getFreeName', function() {
    var names = new Names();
    it('("foo") should return "foo1"', function() {
      expect( names.getFreeName("foo") ).toBe("foo1");
    });
    it('("bar") should return "bar1"', function() {
      expect( names.getFreeName("bar") ).toBe("bar1");
    });
    it('("foo") should return "foo2"', function() {
      expect( names.getFreeName("foo") ).toBe("foo2");
    });
    it('("foo") should return "foo3"', function() {
      expect( names.getFreeName("foo") ).toBe("foo3");
    });
    it('("bar") should return "bar2"', function() {
      expect( names.getFreeName("bar") ).toBe("bar2");
    });
  });
});
