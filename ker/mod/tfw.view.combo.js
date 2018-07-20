"use strict";

var CODE_BEHIND = {
  onItemsChange: onItemsChange,
  onValueChange: onValueChange,
  onExpandedChange: onExpandedChange
};

var $ = require("dom");

function onItemsChange( items ) {
  var that = this;
  var list = $(this.$elements.list);
  var button = $(this.$elements.button);
  $.clear( list );
  this._itemsDivs = [];
  this._listHeight = 0;

  Object.keys(items).forEach(function (key, index) {
    that._listHeight += 32;
    var val = items[key];
    var item = $.div([ val ]);
    that._itemsDivs.push([ key, item ]);
    $.add( list, item );
    $.on( item, function() {
      if( that.expanded ) {
        $.css( list, {
          transform: "translateY(-" + 32*index + "px)",
          left: 0, top: 0,
          height: "auto"
        });
      } else {
        $.addClass( item, 'thm-bgSL' );
        var rect = button.getBoundingClientRect();
        var top = rect.top - 32 * index;
        var topLimit = top - 32 * Math.floor( top / 32 );
        if( top < 0 ) top = topLimit;
        while( top > topLimit && top + that._listHeight > document.body.clientHeight - 8 ) {
          top -= 32;
        }
        top += 32 * index;
        $.css( list, {
          left: rect.left + "px",
          top: top + "px",
          height: "auto"
        });
      }
      that.expanded = !that.expanded;
    });
  });
}


function onValueChange( value ) {

}


function onExpandedChange( expanded ) {
  if( !expanded ) {
    this._itemsDivs.forEach(function (itemDiv) {
      $.removeClass( itemDiv[1], 'thm-bgSL' );
    });
  }
}
