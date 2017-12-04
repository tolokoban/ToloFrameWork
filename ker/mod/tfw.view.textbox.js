"use strict";

var $ = require("dom");

var CODE_BEHIND = {
  onValueChanged: onValueChanged
};


function onValueChanged( v ) {
  var that = this;
  var list = this.list;
  if( !Array.isArray( list ) || list.length === 0 ) return;

  var elemCompletion = this.$elements.completion;
  $.clear( elemCompletion );
  var textToSearch = v.trim().toLowerCase();
  var elementsCount = 0;
  list.forEach(function (completionText) {
    var pos = completionText.toLowerCase().indexOf( textToSearch );
    if( pos !== 0 ) return;
    elementsCount++;
    if( elementsCount > 8 ) return;
    addCompletionItem.call( that, elemCompletion, completionText, pos, textToSearch.length );
  });
  if( elementsCount < 8 ) {
    list.forEach(function (completionText) {
      var pos = completionText.toLowerCase().indexOf( textToSearch );
      if( pos < 1 ) return;
      elementsCount++;
      if( elementsCount > 8 ) return;
      addCompletionItem.call( that, elemCompletion, completionText, pos, textToSearch.length );
    });
  }
}


function addCompletionItem( elemCompletion, completionText, begin, length ) {
  var that = this;
  var elem = $.div();
  if( begin > 0 ) {
    $.add( elem, $.tag('span', [completionText.substr(0, begin)]) );
  }
  $.add( elem, $.tag('b', [completionText.substr(begin, length)]) );
  if( begin + length < completionText.length ) {
    $.add( elem, $.tag('span', [completionText.substr(begin + length)]) );
  }
  $.on( elem, function(v) {
    that.value = completionText;
  });
  $.add( elemCompletion, elem );
}
