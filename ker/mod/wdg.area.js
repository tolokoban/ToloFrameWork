"use strict";
var $ = require("dom");
var Fx = require("dom.fx");
var DB = require("tfw.data-binding");
var Icon = require("wdg.icon");
var Flex = require("wdg.flex");
var Modal = require("wdg.modal");
var Button = require("wdg.button");

/**
 * @class AreaEditor
 */
var Area = function( opts ) {
    var that = this;

    var elem = $.elem(this, 'div', 'wdg-area', 'theme-elevation-2');
    var iconFullscreen = new Icon({ content: Icon.Icons.fullscreen, size: '1.5rem', button: true });
    var label = $.div('theme-label');
    var header = $.div('header', 'theme-color-bg-1', [iconFullscreen, label]);
    var slider = $.div('slider');
    var area = $.tag('textarea');
    var body = $.div('body', [area]);
    $.add( elem, header, body, slider);

    DB.propBoolean(this, 'focus')(function(v) {
        if (v) {
            area.focus();
        } else {
            area.blur();
        }
    });
    DB.propString(this, 'label')(function(v) {
        if (typeof v === 'number') v = '' + v;
        if (typeof v !== 'string') v = '';
        label.textContent = v;
    });
    DB.propInteger(this, 'height')(function(v) {
        $.css(elem, {height: v + "px"});
    });
    DB.propString(this, 'value')(function(v) {
        area.value = v;
    });
    DB.propAddClass(this, 'wide');
    DB.propRemoveClass(this, 'visible', 'hide');

    DB.extend({
        label: "",
        value: "",
        height: 90,
        wide: true,
        visible: true
    }, opts, this);

    var initialHeight = this.height;

    $.on( slider, {
        down: function() {
            initialHeight = that.height;
        },
        drag: function(evt) {
            that.height = Math.max( 90, initialHeight + evt.dy );
        }
    });

    // Managing fullscreen display.
    var fullscreen = new Fx.Fullscreen({
        target: elem
    });
    DB.bind(iconFullscreen, 'action', function() {
        fullscreen.value = !fullscreen.value;
    });

    area.addEventListener('keyup', function() {
        that.value = area.value;
    }, false);
};

module.exports = Area;


Area.promptIntl = function( title, value, onValidate ) {
  if( typeof onValidate !== 'function' ) {
    onValidate = function() {};
  }
  var description = JSON.parse( JSON.stringify( value || '' ) );
  var subset = [];
  if( typeof description === 'string' ) {
    // Turn it multilang.
    var text = description;
    description = {};
    description[require('$').lang()] = text;
  }
  var lang;
  for( lang in description ) {
    subset.push( lang );
  }
  
  var btnCancel = Button.Cancel();
  btnCancel.$grow = 0;
  var btnOK = Button.Ok();
  btnOK.$grow = 0;
  var inpLang = new Lang({ subset: subset, value: subset[0] });
  var divLang = $.div([ _('lang'), "<html>&nbsp;", inpLang ]);
  divLang.$grow = 1;
  var inpCom = new Area({ 
    label: title,
    wide: true,
    height: 'auto',
    value: description
  });
  var body = $.div( 'tp4-edit-markers-button-body', [ inpCom ] );
  body.$grow = 1;
  var head = new Flex({ 
    type: 'fill',
    justify: 'between',
    content: [divLang, btnCancel, btnOK] 
  });
  head.$grow = 0;
  
  var modal = new Modal({
    fullscreen: true,
    content: [
      new Flex({ orientation: 'V', justify: 'between', type: 'fill', content: [
        head,
        body
      ] })
    ]
  });
  
  btnCancel.on( modal.detach.bind( modal ) );
  btnOK.on(function() {
    onValidate( description );
    modal.detach();
  });
  modal.attach();
  inpCom.value = description[inpLang.value];
  DB.bind( inpCom, 'value', function( html ) {
    description[inpLang.value] = html;
  });
  DB.bind( inpLang, 'value', function( language ) {
    inpCom.value = description[language];
    var lang;
    subset = [];
    for( lang in description ) {
      subset.push( lang );
    }
    inpLang.subset = subset;
  });
  inpCom.focus = true;  
};
