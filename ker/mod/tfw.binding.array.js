"use strict";

var Listeners = require("tfw.listeners");

var ID = "_tfw_binding_array_";

/**
 * Convert an array into an observable array.
 */
module.exports = function( arr ) {
  var listener = new Listeners();
  arr[ID] = listener;
  arr.on = function( slot ) {
    listener.add( slot );
  };
  arr.off = function( slot ) {
    listener.remove( slot );
  };
  [
    "push", "pop", "shift", "unshift", "sort"
  ].forEach(function (functionName) {
    arr[functionName] = function() {
      var args = Array.prototype.slice.call(arguments);
      listener.fire( arr, functionName, args );
      Array.prototype[functionName].apply( arr, args );
    };
  });

  return arr;
};
