"use strict";

var CODE_BEHIND = {
  onIntlValueChanged: onIntlValueChanged,
  onLanguageChanged: onLanguageChanged,
  onValueChanged: onValueChanged
};


var Tfw = require("$");


function onLanguageChanged( newLang ) {
  if( newLang.length != 2 ) {
    this.language = Tfw.lang();
    return;
  }

  var newText = this.value[newLang];
  this.$elements.textbox.value = "";
  if( newText && newText.trim().length > 0 ) {
    this.$elements.textbox.value = newText;
  }
}


function onIntlValueChanged( newIntlValue ) {
  var newText = newIntlValue[this.language];
  if( typeof newText === 'string' && newText.trim().length > 0 ) {
    this.$elements.textbox.value = newText;
  }
}


function onValueChanged( newValue ) {
  if( typeof newValue !== 'string' || newValue.trim().length === 0 ) {
    // Empty value.
    delete this.value[this.language];
  } else {
    this.value[this.language] = newValue;
  }
}
