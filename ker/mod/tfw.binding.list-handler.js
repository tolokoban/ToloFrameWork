/*
The list handler is used to map a List into children of an element.
With simple data binding, if you add  an item to the List, you have to
clear the element and  add all the items of the  List again.  The list
handler is able to add only the new items.
 */
"use strict";

var $ = require("dom");
var PM = require("tfw.binding.property-manager");
var List = require("tfw.binding.list");


/**
 * @param {View} view - An object with linkable properties.
 * @param  {object} element  -  An object  a DOM  element  as its  `$`
 * property.
 * @param {string} listName  - Name of the view's  property which must
 * be a List.
 * @param {function=undefined}  options.map -  Function which  takes a
 * List's item  as input  and returns what  to add as  a child  of the
 * view.
 * The first argument id the current value.
 * The second argument is a set of attributes:
 * * index: Index of the current value.
 * * list: The list object itself.
 * * context: An empty object the map can use.
 * If the  `map` function  returns `null`  or `undefined`,  nothing is
 * added. If it returns an array, all the elements are added.
 */
var Context = function( view, element, listName, options ) {
  if( typeof options === 'undefined' ) options = {};
  if( typeof options.map !== 'function' ) options.map = function(v) { return v; };

  this.view = view;
  this.element = element;
  this.listName = listName;
  this.options = options;

  // Current list's value.
  this.list = null;
};

/**
 * If the  whole list is replaced  by another one, we  must remove the
 * previous listener and attach another one.
 */
Context.prototype.attachEventListener = function() {
  var that = this;
  var onListChanged = that.onListChanged.bind( that );
  
  PM( this.view ).on( this.listName, function( newList ) {
    if( !List.isList( newList ) ) {
      console.error({
        view: that.view,
        element: that.element,
        listName: that.listName,
        newList: newList
      });
      throw Error("[tfw.binding.list-handler] Property \"" + that.listName + "\" must be of type List!");
    }    
    if( that.list ) {
      that.list.removeListener( onListChanged );
    }
    that.list = newList;
    that.list.addListener( onListChanged );
    that.resetChildren();
  });
};

Context.prototype.resetChildren = function() {
  var map = this.options.map;
  var element = this.element;
  var list = this.list;
  var context = {};
  
  $.clear( element );
  list.forEach(function (item, index) {
    $.add( element, map( item, {
      index: index,
      list: list,
      context: context
    } ) );
  });
};

/**
 * When the list is modified.
 */
Context.prototype.onListChanged = function( changeType, args ) {
  console.log("onListChanged", changeType, args);

  switch( changeType ) {
  case 'push': return applyPush.call( this, args );
  default: return this.resetChildren();
  }
};


/**
 * Optimization in case of `push()`.
 */
function applyPush( args ) {
  var map = this.options.map;
  var element = this.element;
  var list = this.list;
  var context = {};

  args.forEach(function (item, index) {
    $.add( element, map( item, {
      index: index,
      list: list,
      context: context
    } ) );
  });
}

module.exports = function( view, element, listName, options ) {
  var context = new Context( view, element, listName, options );
  context.attachEventListener();
};
