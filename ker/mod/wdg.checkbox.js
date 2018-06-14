var $ = require("dom");
var DB = require("tfw.data-binding");
var Icon = require("wdg.icon");
var Touchable = require("tfw.touchable");

/**
 * @param opts.value {boolean} - `true` if checked, `false` otherwise.
 * @param opts.text {string} - Text to display.
 * @param opts.wide {boolean} - If `true`, expand on whole line.
 * @param opts.visible {boolean} - Show/hide this widget.
 */
var Checkbox = function(opts) {
  var that = this;

  var btn = $.div( 'btn', 'thm-ele2' );
  var bar = $.div( 'bar' );
  var text = $.div();
  var elem = $.elem( this, 'button', 'wdg-checkbox', [$.div([btn, bar]), text] );

  var refresh = function() {
    if( typeof that.text !== 'string' || that.text.trim().length === 0 ) {
      $.addClass( that, 'no-text' );
    } else {
      $.textOrHtml( text, that.text );
      $.removeClass( that, 'no-text' );
    }
    if( that.inverted ) {
      $.addClass( that, 'inverted' );
    } else {
      $.removeClass( that, 'inverted' );
    }
    if( that.wide ) {
      $.addClass( that, 'wide' );
    } else {
      $.removeClass( that, 'wide' );
    }
    if( that.value ) {
      $.addClass( that, 'checked' );
      $.addClass( bar, 'thm-bgSL' );
      $.removeClass( bar, 'thm-bg2' );
      $.addClass( btn, 'thm-bgS' );
      $.removeClass( btn, 'thm-bg1' );
    } else {
      $.removeClass( that, 'checked' );
      $.removeClass( bar, 'thm-bgSL' );
      $.addClass( bar, 'thm-bg2' );
      $.removeClass( btn, 'thm-bgS' );
      $.addClass( btn, 'thm-bg1' );
    }
  };

  DB.propBoolean(this, 'value' );
  DB.propString(this, 'text');
  DB.propInteger(this, 'action', 0);
  DB.propBoolean(this, 'wide');
  DB.propBoolean(this, 'inverted');
  DB.propRemoveClass(this, 'visible', 'hide');

  DB.extend({
    value: false,
    text: "checked",
    inverted: false,
    wide: false,
    visible: true
  }, opts, this, refresh);

  var touchable = new Touchable( elem );
  touchable.tap.add( this.fire.bind( this ) );
  $.on( elem, {
    keydown: function( evt ) {
      if (evt.keyCode == 13 || evt.keyCode == 32) {
        evt.preventDefault();
        evt.stopPropagation();
        that.fire();
      }
    }
  });

  this.focus = elem.focus.bind( elem );
};

/**
 * @return void
 */
Checkbox.prototype.fire = function() {
  this.value = !this.value;
};



module.exports = Checkbox;
