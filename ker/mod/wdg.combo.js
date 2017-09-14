var $ = require("dom");
var DB = require("tfw.data-binding");
var Icon = require("wdg.icon");
var Modal = require("wdg.modal");
var Button = require("wdg.button");
var Touchable = require("tfw.touchable");


/**
 * @export @class
 *
 *
 * __Attributes__:
 * * {string} `label`:
 * * {string} `value`:
 * * {array|object} `content`:
 * * {boolean} `enabled`:
 * * {boolean} `focus`:
 * * {boolean} `wide`:
 * * {boolean} `visible`:
 */
var Combo = function(opts) {
  var that = this;

  this._children = {};
  var label = $.div( 'label' );
  var button = $.div( 'button', 'thm-bgP', [new Icon({content: 'tri-down', size: '24px'})] );
  var body = $.tag( 'div', 'body' );
  var datalist = $.div( 'datalist' );
  this._button = button;
  var table = $.div('table', 'thm-ele2', 'thm-bg3', [body, button]);
  var elem = $.elem( this, 'div', 'wdg-combo',
                     [label, table, datalist] );
  var touchable = new Touchable( elem );

  body.addEventListener('focus', function() {
    $.removeClass( table, 'thm-ele2' );
    $.addClass( table, 'thm-ele4' );
  });
  body.addEventListener('blur', function() {
    $.addClass( table, 'thm-ele2' );
    $.removeClass( table, 'thm-ele4' );
  });
  DB.propRemoveClass(this, 'enabled', 'disabled');
  DB.propBoolean(this, 'focus')(function(v) {
    if (v) body.focus();
    else body.blur();
  });
  DB.propString(this, 'label')(function(v) {
    if (v === null || (typeof v === 'string' && v.trim() == '')) {
      $.addClass(elem, 'no-label');
    } else {
      $.removeClass(elem, 'no-label');
      $.textOrHtml(label, v);
      if (v.substr(0, 6) == '<html>') {
        $.att(label, {title: ''});
      } else {
        $.att(label, {title: v});
      }
    }
  });
  DB.prop(this, 'content')(function(v) {
    var obj;
    if( typeof v === 'string' ) {
      v = v.split(",").map(function(itm) {
        return itm.trim();
      });
      obj = {};
      v.forEach( function( itm ){
        obj[itm] = itm;
      });
      v = obj;
    }
    if (Array.isArray( v )) {
      // Convert array into map.
      // Each item must have the `$key` property.
      // If not, the element is ignored.
      obj = {};
      v.forEach(function (itm, idx) {
        if( typeof itm.$key === 'undefined' ) return;
        obj[itm.$key] = itm;
      });
      v = obj;
    }
    that._children = v;
    DB.fire( that, 'value' );
  });
  DB.propString(this, 'value')(function(v) {
    var selectedItem = that._children[v];
    if( typeof selectedItem === 'undefined' ) {
      for( v in that._children ) break;
      selectedItem = that._children[v];
    }
    $.clear( body );
    if (!selectedItem) return;
    $.add( body, selectedItem );
  });
  DB.propAddClass(this, 'wide');
  DB.propRemoveClass(this, 'visible', 'hide');

  opts = DB.extend({
    value: '',
    content: [],
    label: null,
    enabled: true,
    wide: false,
    visible: true
  }, opts, this);

  touchable.tap.add( that.fire.bind( that ) );
};

/**
 * @return void
 */
Combo.prototype.fire = function() {
  var modalChildren = [];

  var ul = $.tag('ul', 'wdg-combo-modal');
  modalChildren.push( ul );

  var btnCancel = Button.Cancel();
  var label = $.div([ _('label') ]);
  if (typeof this.label === 'string') {
    $.textOrHtml( label, this.label );
  }
  
  var modal = new Modal({
    header: label,
    footer: btnCancel,
    content: modalChildren
  });
  modal.attach();

  var close = modal.detach.bind( modal );
  DB.bind(btnCancel, 'action', close);

  var key, val, container;
  for( key in this._children ) {
    val = this._children[key];
    if (typeof val.element === 'function') {
      val = val.element();
    }
    else if (typeof val.element !== 'undefined') {
      val = val.element;
    }
    container = $.tag('li', 'thm-ele2', key == this.value ? 'thm-bgSL' : 'thm-bg3');
    container.innerHTML = val.outerHTML;
    $.add( ul, container );
    attachEvent.call( this, key, container, close );
  }
};

/**
 * @export toArray @function
 * Arrays are useful for HTML content. But, for code, it is easier to write objects.
 * This function will create an array while assigning `$key` attribute to each element.
 */
Combo.toArray = function( obj ) {
  var key, val, div, output = [];
  for( key in obj ) {
    val = obj[key];
    if (typeof val === 'string') {
      div = document.createElement( 'div' );
      div.textContent = val;
      val = div;
    }
    val.$key = key;
    output.push( val );
  }

  return output;
};


function attachEvent( key, elem, close ) {
  var that = this;

  var touchable = new Touchable( elem );
  touchable.tap.add(function() {
    close();
    that.value = key;
  });
}

module.exports = Combo;
