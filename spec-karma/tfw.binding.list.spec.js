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
      var obj1 = {};
      PM( obj1 ).create( "list", {init: new List([1,2])} );
      var obj2 = {};
      PM( obj2 ).create( "list", {init: new List([3,4])} );
      
      new Link({
        A: { obj:obj1, name:'list' },
        B: { obj:obj2, name:'list' }
      });

      obj1.list.push( 9 );
      expect( obj2.list.slice() ).toEqual([ 1,2,9 ]);
    });

    it('should propagate the length when an item is pushed', function(){
      var obj1 = {};
      PM( obj1 ).create( "list", {init: new List([])} );
      var obj2 = {};
      PM( obj2 ).create( "size", {init: 0} );
      
      new Link({ name: "<LINK>",
        A: { obj:obj1, name:'list' },
        B: { obj:obj2, name:'size', converter: a => a.length }
      });

      obj1.list.push( 6 );
      obj1.list.push( 3 );
      expect( obj2.size ).toBe( 2 );
    });

  });
});
