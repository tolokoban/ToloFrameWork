"use strict";

var Converters = require("tfw.binding.converters");

describe('Module tfw.binding.converters', function() {
  describe('array', function() {
    
  });
  describe('boolean', function() {
    
  });
  describe('booleans', function() {
    
  });
  describe('color', function() {
    
  });
  describe('date', function() {
    var conv = Converters.get('date');
    it('should return a Date verbatim', function() {
      var d = new Date();
      expect( conv( d ) ).toBe( d );
    });
    
  });
  describe('enum', function() {
    
  });
  describe('float', function() {
    
  });
  describe('integer', function() {
    
  });
  describe('intl', function() {
    
  });
  describe('isEmpty', function() {
    
  });
  describe('isNotEmpty', function() {
    
  });
  describe('keys', function() {
    
  });
  describe('length', function() {
    
  });
  describe('list', function() {
    
  });
  describe('multilang', function() {
    
  });
  describe('not', function() {
    
  });
  describe('sortedKeys', function() {
    
  });
  describe('string', function() {
    
  });
  describe('strings', function() {
    
  });
  describe('time', function() {
    var conv = Converters.get('time');
    it('should return a Date verbatim', function() {
      var d = new Date();
      expect( conv( d ) ).toBe( d );
    });

    [
      ['(12 05 27)', 12, 5, 27],
      ['1200', 12, 0, 0],
      ['12:00', 12, 0, 0],
      ['1H2M3S', 1, 2, 3],
      ['12', 12, 0, 0],
      ['1,200', 1, 20, 0],
      ['4700', 23, 0, 0],
      ['', 0, 0, 0]
    ].forEach(function (testcase) {
      var input = testcase[0];
      var expectedHour = testcase[1];
      var expectedMinute = testcase[2];
      var expectedSecond = testcase[3];
      describe(`"${input}"`, function() {
        debugger;        
        var result = conv( input );
        it('getHours() should give ' + expectedHour, function() {
          expect( result.getHours() ).toBe( expectedHour );
        });
        it('getMinutes() should give ' + expectedMinute, function() {
          expect( result.getMinutes() ).toBe( expectedMinute );
        });
        it('getSeconds() should give ' + expectedSecond, function() {
          expect( result.getSeconds() ).toBe( expectedSecond );
        });
      });
    });
  });
  describe('unit', function() {
    
  });
  describe('units', function() {
    
  });
  describe('validator', function() {
    
  });
});

