"use strict";

var PM = require("tfw.binding.property-manager");
var List = require("tfw.binding.list");
var Link = require("tfw.binding.link");


describe('tfw.binding.list', function() {
  describe('List.isList()', function() {
    it('should recognize a List build from an array', function() {
      var lst = new List([]);
      expect( List.isList( lst ) ).toBe( true );
    });
    it('should recognize a List build from another List', function() {
      var lst2 = new List([]);
      var lst = new List(lst2);
      expect( List.isList( lst ) ).toBe( true );
    });
  });

  describe('forEach', function() {
    it('should work like with a standard array', function() {
      var lst = new List([1,2,3]);
      var result = 0;
      lst.forEach(function (value) {
        result = result * 10 + value;
      });
      expect( result ).toBe( 123 );
    });
  });

  describe('push', function() {
    it('should work like with a standard array', function() {
      var lst = new List([1,2,3]);
      lst.push( 4 );
      expect( lst.slice() ).toEqual([ 1,2,3,4 ]);
    });
  });

  describe('linking', function() {
    it('should propagate value when item is added to a List', function(){
      var lst1 = new List([1,2]);
      var lst2 = new List([3,4]);
      var obj1 = {};
      var obj2 = {};
      PM( obj1 ).create( "list", lst1 );
      PM( obj2 ).create( "list", lst2 );
      
      new Link({
        A: { obj:obj1, name:'list' },
        B: { obj:obj2, name:'list' }
      });

      console.log("AAA");
      obj1.list.push( 9 );
      console.log("BBB");
      expect( obj2.list.slice() ).toEqual([ 1,2,9 ]);
      console.log("CCC");
    });

  });
});
