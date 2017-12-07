"use strict";

var $ = require("dom");
var DB = require("tfw.data-binding");
var Cfg = require("$");
var Modal = require("wdg.modal");
var Button = require("wdg.button");
var BoxButton = require("wdg.box-button");

/**
 @exports {class}

 Icon button or language selection.

 @param {boolean} args.small - Small buttons can be used on other widgets.
 @param {array} args.subset - List of languages to highlight.
 @param {string} args.value - Language code (2 chars). For instance: fr, en, ...
 */
function Lang( args ) {
  var that = this;

  var modal = createModal( this );

  var elem = $.elem( this, 'div', 'wdg-lang',
                     'theme-elevation-2',
                     'theme-color-B0',
                     'theme-color-bg-A5' );
  var cell = $.div();
  $.add( elem, cell );
  DB.propString(this, 'value')(function(v) {
    cell.textContent = v.toUpperCase();
  });
  DB.propRemoveClass(this, 'visible', 'hide');
  DB.propAddClass(this, 'small', 'small');
  DB.propStringArray(this, 'subset');
  DB.extend({
    subset: [],
    value: Cfg.lang(),
    small: false,
    visible: true
  }, args, this);

  $.on(this.element, {
    down: function(evt) {
      $.addClass(elem, 'theme-elevation-8');
      evt.stopPropagation();
      evt.preventDefault();
    },
    up: function(evt) {
      $.removeClass(elem, 'theme-elevation-8');
    },
    tap: function() {
      fillBody( modal.body, that, modal);
      modal.attach();
    }
  });
}


module.exports = Lang;


function createModal( that ) {
  var btnCancel = Button.Cancel();
  var header = $.tag('header', [_('caption')]);
  var footer = $.tag('footer', [btnCancel]);
  var body = $.div();
  var content = $.div('wdg-lang-modal', [header, body, footer]);
  var modal = new Modal({ content: content });
  modal.body = body;
  btnCancel.on(modal.detach.bind( modal ));
  return modal;
}


function fillBody( body, that, modal ) {
  $.clear( body );
  var firstLang;
  for( firstLang in _.all ) break;
  var isoCountry;
  for( isoCountry in _.all[firstLang] ) {
    if( isoCountry.length != 2 ) continue;
    if( that.subset.indexOf( isoCountry ) != -1 ) {
      $.add( body, newButton(that, isoCountry, modal ) );
    }
  }
  if( that.subset.length > 0 ) {
    $.add( body, $.tag("hr") );
  }
  for( isoCountry in _.all[firstLang] ) {
    if( isoCountry.length != 2 ) continue;
    if( that.subset.indexOf( isoCountry ) == -1 ) {
      $.add( body, newButton(that, isoCountry, modal ) );
    }
  }
}


function newButton(that, isoCountry, modal) {
  var bb = new BoxButton({ content: $.div('wdg-lang-table', [
    $.div([
      $.div([isoCountry.toUpperCase()]),
      $.div([_(isoCountry)])
    ])
  ]), enabled: isoCountry != that.value });
  $.css( bb, { margin: '4px' } );
  bb.on(function() {
    that.value = isoCountry;
    modal.detach();
  });
  return bb;
}
