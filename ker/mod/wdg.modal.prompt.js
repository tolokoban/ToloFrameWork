"use strict";

var $ = require( "dom" );
var DB = require( "tfw.data-binding" );
var Flex = require( "wdg.flex" );
var Text = require( "wdg.text" );
var Combo = require( "wdg.combo" );
var Modal = require( "wdg.modal" );
var Button = require( "wdg.button" );

/**
@param {string} title - Title to display in the prompt window.
@param {function} onValidation - Function to call when the OK button has been
hitten. The only argument of the function will be the value of the input.
@param {undefined} content - An empty input box is displayed.
@param {array} content - An input box is displayed with this completion list.
It must be an array of strings.
@param {object} content - A combo box is displayed. Each key of the object will
be a potential return value. Each value is displayed has a selectable item.
*/
module.exports = function( title, content, onValidation ) {
  var modal = new Modal();
  var input;  
  if ( typeof content === 'function' ) {
    onValidation = content;
    content = undefined;
  }
  if ( typeof onValidation !== 'function' ) {
    onValidation = function() {
      throw Error("What the point of a prompt without a callback function?");
    };
  }
  if ( Array.isArray( content ) ) {
    input = new Text({
      label: title, list: content, wide: true
    });
  }
  else if ( typeof content === 'object' ) {
    input = new Combo({ width: "460px", label: title, content: content, wide: true });
  }
  else {
    input = new Text({ width: "460px", label: title, wide: true });
  }
  var validate = function() {
    modal.detach();
    onValidation( input.value );
  };
  DB.bind( input, 'action', validate );
  var btnCancel = Button.Cancel();
  var btnOK = Button.Ok();
  modal.content = [
    input, $.tag('hr'),
    new Flex({ content: [btnCancel, btnOK]})
  ];
  btnCancel.on( function() {
    modal.detach();
  });
  btnOK.on( validate );
  modal.attach();
  input.focus = false;
  window.setTimeout(function() {
    input.focus = true;
  }, 300);
};
