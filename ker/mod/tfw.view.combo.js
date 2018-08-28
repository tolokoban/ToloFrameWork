"use strict";

var CODE_BEHIND = {
  onIndexChange: onIndexChange,
  onKeysChange: onKeysChange,
  onItemsChange: onItemsChange,
  onValueChange: onValueChange,
  onExpandedChange: onExpandedChange
};

var $ = require("dom");
var PM = require("tfw.binding.property-manager");
var Touchable = require("tfw.touchable");


function onItemsChange( items ) {
  var that = this;
  var list = $(this.$elements.list);
  var button = $(this.$elements.button);
  $.clear( list );
  this._listHeight = 0;
  this._itemsDivs = [];

  items.forEach(function (val, index) {
    that._listHeight += 32;
    var item = $.div([ val ]);
    that._itemsDivs.push( item );
    $.add( list, item );
    var touchable = new Touchable( item );
    touchable.tap.add( onItemTap.bind( that, item, list, index, button ) );
  });

  if( !this.index ) this.index = 0;
}


function onItemTap( item, list, index, button ) {
  var itemsCount = getLength.call( this, this.items );
  if( itemsCount < 2 ) return;
  
  if( this.expanded ) {
    // List is expanded.
    $.css( list, {
      transform: "translateY(-" + 32*index + "px)",
      left: 0, top: 0,
      height: "auto"
    });
  } else {
    // List is collapsed.
    $.addClass( item, 'thm-bgSL' );
    if( itemsCount === 2 ) {
      this.index = 1 - this.index;
      return;
    }
    var rect = button.getBoundingClientRect();
    var top = rect.top - 32 * index;
    var topLimit = top - 32 * Math.floor( top / 32 );
    if( top < 0 ) top = topLimit;
    while( top > topLimit && top + this._listHeight > document.body.clientHeight - 8 ) {
      top -= 32;
    }
    top += 32 * index;
    $.css( list, {
      left: rect.left + "px",
      top: top + "px",
      height: "auto"
    });
    $.css( button, {
      width: this.wide ? 'auto' : list.getBoundingClientRect().width + 'px'
    });
  }
  this.index = index;
  this.expanded = !this.expanded;
}


function onIndexChange( index ) {
  if( hasKeys.call( this ) ) {
    this.value = this.keys[index];
  }
  else {
    this.value = index;
  }
}


function hasKeys() {
  var keysCount = getLength.call( this, this.keys );
  if( keysCount < 1 ) return false;
  return keysCount === getLength.call( this, this.items );
}


function getLength( arr ) {
  if( !arr ) return 0;
  if( !Array.isArray( arr ) ) return 0;
  return arr.length;
}


function onKeysChange( keys ) {
  if( typeof this.index !== 'number' ) return;
  onIndexChange.call( this, this.index );
}


function onValueChange( value ) {
  var index;
  if( hasKeys.call( this ) ) {
    index = this.keys.indexOf( value );
    if( index < 0 ) index = 0;
    PM( this ).set( "index", index );
  }
  else {
    index = parseInt( value );
    if( !isNaN( index ) && index >= 0 && index < getLength.call( this, this.items ) ) {
      PM( this ).set( "index", index );
    }
  }
  var list = $(this.$elements.list);
  $.css( list, {
    transform: "translateY(-" + 32*this.index + "px)",
    left: 0, top: 0,
    height: "auto"
  });
}


function onExpandedChange( expanded ) {
  if( !expanded ) {
    this._itemsDivs.forEach(function (itemDiv) {
      $.removeClass( itemDiv, 'thm-bgSL' );
    });
  }
}
