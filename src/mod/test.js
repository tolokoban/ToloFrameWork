// Code behind.
"use strict";

var PM = require("tfw.binding.property-manager");
var List = require("tfw.binding.list");
var Link = require("tfw.binding.link");


exports.start = function() {
  var obj1 = {};
  PM( obj1 ).create( "list", {init: new List([])} );
  var obj2 = {};
  PM( obj2 ).create( "size", {init: 0} );

  new Link({ debug: "<LINK>",
             A: { obj:obj1, name:'list' },
             B: { obj:obj2, name:'size', converter: lengthConverter }
           });

  console.log("AAA");
  obj1.list.push( 6 );
  console.log("BBB");
  obj1.list.push( 3 );
  console.log("CCC");
};


function lengthConverter(v) {
  return v.length;
}
