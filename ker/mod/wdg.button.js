"use strict";

var $ = require( "dom" );
var DB = require( "tfw.data-binding" );
var Icon = require( "wdg.icon" );
var Touchable = require( "tfw.touchable" );

var TYPES = [ 'standard', 'simple', 'warning', 'shadow', 'special' ];

/**
 * Liste des classes CSS applicables sur un bouton :
 * * __simple__ : Simple lien, sans l'aspect "bouton".
 * * __shadow__ : Bouton légèrement plus foncé.
 * * __warning__ : Bouton orangé pour indiquer une action potentiellement dangereuse.
 * * __small__ : Bouton de petite taille (environ 70%).
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

  var elem = $.elem(
    this,
    'button', 'wdg-button', 'theme-elevation-2'
  );
  if ( typeof opts.href === 'string' && opts.href.length > 0 ) {
    $.att( elem, 'href', opts.href );
  }
  if ( typeof opts.target === 'string' && opts.target.length > 0 ) {
    $.att( elem, 'target', opts.target );
  }

  var icon = null;

  var refresh = function () {
    $.clear( elem );
    if ( icon ) {
      $.add( elem, icon.element, that.text );
      that._icon = icon;
    } else {
      elem.textContent = that.text;
      delete that._icon;
    }
  };

  DB.prop( this, 'value' );
  DB.propEnum( TYPES )( this, 'type' )( function ( v ) {
    TYPES.forEach( function ( type ) {
      $.removeClass( elem, type );
    } );
    $.addClass( elem, v );
  } );
  DB.prop( this, 'icon' )( function ( v ) {
    if ( !v || ( typeof v === 'string' && v.trim().length == 0 ) ) {
      icon = null;
    } else if ( v.element ) {
      icon = v.element;
    } else {
      icon = new Icon( {
        content: v,
        size: "1.2em"
      } );
    }
    refresh();
  } );
  DB.propBoolean( this, 'anim' )( function ( v ) {
    if ( icon ) icon.rotate = v;
  } );
  var waitBackup = {};
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
    refresh();
  } );
  var touchable = new Touchable( elem, {
    classToAdd: 'theme-elevation-8'
  } );
  DB.propBoolean( this, 'enabled' )( function ( v ) {
    touchable.enabled = touchable;
    if ( v ) {
      $.removeAtt( elem, 'disabled' );
    } else {
      $.att( elem, 'disabled', 'yes' );
    }
  } );
  DB.propBoolean( this, 'small' )( function ( v ) {
    if ( v ) {
      $.addClass( elem, 'small' );
    } else {
      $.removeClass( elem, 'small' );
    }
  } );
  DB.prop( this, 'action', 0 );
  DB.propAddClass( this, 'wide' );
  DB.propRemoveClass( this, 'visible', 'hide' );

  opts = DB.extend( {
    text: "OK",
    href: null,
    target: null,
    value: "action",
    action: 0,
    wait: false,
    anim: false,
    icon: "",
    small: false,
    enabled: true,
    wide: false,
    visible: true,
    type: "standard"
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

/**
 * Disable the button and start a wait animation.
 */
Button.prototype.waitOn = function ( text ) {
  if ( typeof this._backup === 'undefined' ) {
    this._backup = {
      text: this.text,
      icon: this.icon,
      enabled: this.enabled
    };
  }
  if ( typeof text === 'string' ) this.text = text;
  this.enabled = false;
  this.icon = "wait";
  if ( this._icon ) this._icon.rotate = true;
};

/**
 * Stop the wait animation and enable the button again.
 */
Button.prototype.waitOff = function () {
  this.text = this._backup.text;
  this.icon = this._backup.icon;
  this.enabled = this._backup.enabled;
  if ( this._icon ) this._icon.rotate = false;
  delete this._backup;
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
  return genericButton( 'no' );
};
Button.Ok = function ( type ) {
  return genericButton( 'ok', type || 'default' );
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
  type: "default"
};

module.exports = Button;