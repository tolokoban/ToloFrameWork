"use strict";

require("font.roboto");
var $ = require( "dom" );
var DB = require( "tfw.data-binding" );
var Icon = require( "wdg.icon" );
var Touchable = require( "tfw.touchable" );

var TYPES = [ 'standard', 'primary', 'warning' ];

/**
 * Liste des classes CSS applicables sur un bouton :
 * * __standard__ : Bouton par défaut. Il est blanc.
 * * __primary__ : Bouton bleu.
 * * __warning__ : Bouton orangé pour indiquer une action potentiellement dangereuse.
 *
 * @param {string} opts.text - Texte à afficher dans le bouton.
 * @param {boolean} opts.enabled - Mettre `false` pour désactiver le bouton.
 * @param {string} opts.href - Si défini, lien vers lequel dirigier la page en cas de click.
 * @param {object} opts.email - Associe le _Tap_ à l'envoi d'un mail.
 * @param {string} opts.email.to - destinataire.
 * @param {string} opts.email.subject - sujet du mail.
 * @param {string} opts.email.body - corps du mail.
 *
 * @example
 * var Button = require("tp4.button");
 * var instance = new Button();
 * @class Button
 */
var Button = function ( opts ) {
  var that = this;

  var icon = new Icon({ size: "24px" });
  var text = $.div( 'text' );
  var elem = $.elem( this, 'button', [icon, text] );

  var refresh = setStyle.bind( this, {
    icon: icon, text: text
  });

  DB.prop( this, 'value' );
  DB.propEnum( TYPES )( this, 'type' )( refresh );
  DB.prop( this, 'icon' )( refresh );
  DB.propBoolean( this, 'anim' )( refresh );
  var waitBackup = {
    enabled: true,
    icon: "?",
    anim: false
  };
  DB.propBoolean( this, 'wait' )( function ( v ) {
    if ( v ) {
      waitBackup.enabled = that.enabled;
      waitBackup.icon = that.icon;
      waitBackup.anim = that.anim;
      that.enabled = false;
      that.icon = 'wait';
      that.anim = true;
    } else {
      that.enabled = waitBackup.enabled;
      that.icon = waitBackup.icon;
      that.anim = waitBackup.anim;
    }    
  } );
  DB.propString( this, 'text' )( function ( v ) {
    text.textContent = v;
  } );
  var touchable = new Touchable( elem, {
    classToAdd: 'theme-elevation-8'
  } );
  DB.propBoolean( this, 'enabled' )( function ( v ) {
    touchable.enabled = v;
    refresh();
  } );
  DB.propBoolean( this, 'iconToLeft' )( refresh );
  DB.propBoolean( this, 'small' )( refresh );
  DB.propBoolean( this, 'flat' )( refresh );
  DB.prop( this, 'action', 0 );
  DB.propBoolean( this, 'wide' )( refresh );
  DB.propRemoveClass( this, 'visible', 'hide' );

  opts = DB.extend( {
    iconToLeft: true,
    type: "standard",
    text: "OK",
    href: null,
    target: null,
    value: "action",
    action: 0,
    anim: false,
    flat: false,
    small: false,
    enabled: true,
    wait: false,
    icon: null,
    wide: false,
    visible: true
  }, opts, this );

  // Animate the pressing.
  $.on( this.element, {
    keydown: function ( evt ) {
      if ( evt.keyCode == 13 || evt.keyCode == 32 ) {
        evt.preventDefault();
        evt.stopPropagation();
        that.fire();
      }
    }
  } );
  touchable.tap.add( that.fire.bind( that ) );

  refresh();
};

/**
 * @class Button
 * @function on
 * @param {function} slot - Function to call when `action` has changed.
 */
Button.prototype.on = function ( slot ) {
  DB.bind( this, 'action', slot );
  return this;
};

/**
 * Simulate a click on the button if it is enabled.
 */
Button.prototype.fire = function () {
  if ( this.enabled ) {
    var href = this.href;
    if ( typeof href !== 'string' || href.trim().length === 0 ) {
      DB.fire( this, 'action', this.value );
    } else if ( typeof this.target === 'string' && this.target.trim().length > 0 ) {
      window.open( href, this.target );
    } else {
      window.location = href;
    }
  }
};

function genericButton( id, type ) {
  if ( typeof type === 'undefined' ) type = 'standard';
  var iconName = id;
  var intl = id;
  if ( intl == 'yes' ) iconName = 'ok';
  if ( intl == 'no' ) iconName = 'cancel';
  var btn = new Button( {
    text: _( intl ),
    icon: iconName,
    value: id,
    type: type
  } );
  return btn;
}

Button.Cancel = function ( type ) {
  return genericButton( 'cancel', type || 'simple' );
};
Button.Close = function ( type ) {
  return genericButton( 'close', type || 'simple' );
};
Button.Delete = function ( type ) {
  return genericButton( 'delete', type || 'warning' );
};
Button.No = function ( type ) {
  return genericButton( 'no', type || 'simple' );
};
Button.Ok = function ( type ) {
  return genericButton( 'ok', type || 'simple' );
};
Button.Edit = function ( type ) {
  return genericButton( 'edit' );
};
Button.Save = function ( type ) {
  return genericButton( 'save', type || 'special' );
};
Button.Yes = function ( type ) {
  return genericButton( 'yes', type || 'default' );
};

Button.default = {
  caption: "OK",
  type: "simple"
};

module.exports = Button;


function setStyle( children ) {
  this.element.className = 'wdg-button';

  if( this.flat ) {
    $.addClass( this, 'flat' );

    switch( this.type ) {
    case 'primary':
      $.addClass( this, 'thm-fgP' );
      break;
    case 'warning':
      $.addClass( this, 'thm-fgS' );
      break;
    }
  } else {
    $.addClass( this, 'thm-ele2' );

    switch( this.type ) {
    case 'primary':
      $.addClass( this, 'thm-bgP' );
      break;
    case 'warning':
      $.addClass( this, 'thm-bgS' );
      break;
    default:
      $.addClass( this, 'thm-bg3' );
    }
  }

  if ( !this.icon || ( typeof this.icon === 'string' && this.icon.trim().length === 0 ) ) {
    children.icon.visible = false;
  } else {
    children.icon.visible = true;
    children.icon.content = this.icon;
    children.icon.rotate = this.anim;
  }

  if( !this.enabled ) $.addClass( this, 'disabled' );
  if( this.wide ) $.addClass( this, 'wide' );
  if( typeof this.icon === 'string' && this.icon.trim().length > 0 ) $.addClass( this, 'icon' );
  if( this.iconToLeft ) $.addClass( this, 'iconToLeft' );
}
