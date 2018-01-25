// Code behind.
"use strict";

var PM = require("tfw.binding.property-manager");
var List = require("tfw.binding.list");
var Link = require("tfw.binding.link");


exports.start = function() {
  var lst1 = new List( [1,2] );
  var lst2 = new List( [3,4] );
  var obj1 = {};
  var obj2 = {};
  PM( obj1 ).create( "list", { init: lst1 } );
  PM( obj2 ).create( "list", { init: lst2 } );

  new Link({
    A: { obj:obj1, name:'list' },
    B: { obj:obj2, name:'list' }
  });

  obj1.list.push( 9 );
  console.info("[test] obj2.list.slice()=", obj2.list.slice());
};
