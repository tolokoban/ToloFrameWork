"use strict";

require("font.roboto");
var $ = require( "dom" );
var DB = require( "tfw.data-binding" );
var Icon = require( "wdg.icon" );
var Touchable = require( "tfw.touchable" );

var TYPES = [ 'undef', 'default', 'standard', 'primary', 'secondary' ];

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
  var elem = $.elem( this, 'button', 'wdg-button', [icon, text] );

  var refresh = setStyle.bind( this, {
    icon: icon, text: text
  });

  DB.prop( this, 'value' );
  DB.propEnum( TYPES )( this, 'type' );
  DB.prop( this, 'icon' )( function ( v ) {
    touchable.enabled = v;
    refresh();
  } );
  DB.propBoolean( this, 'responsive' );
  DB.propBoolean( this, 'anim' );
  DB.propBoolean( this, 'wait' );
  DB.propString( this, 'text' );
  var touchable = new Touchable( elem, {
    classToAdd: 'thm-ele8'
  } );
  DB.propBoolean( this, 'enabled' )( function ( v ) {
    touchable.enabled = v;
    refresh();
  } );
  DB.propBoolean( this, 'inverted' );
  DB.propBoolean( this, 'flat' );
  DB.prop( this, 'action', 0 );
  DB.propBoolean( this, 'wide' );
  DB.propBoolean( this, 'visible' );

  opts = DB.extend( {
    inverted: false,
    type: "undef",
    text: "",
    href: null,
    target: null,
    value: "action",
    action: 0,
    responsive: false,
    anim: false,
    flat: false,
    small: false,
    enabled: true,
    wait: false,
    icon: null,
    wide: false,
    visible: true
  }, opts, this, refresh );

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

function genericButton( base, opts ) {
  if( typeof opts === 'undefined' ) opts = {};
  return new Button( DB.extend( base, opts ) );
}

Button.Cancel = function ( opts ) {
  return genericButton({ text: _('cancel'), icon: 'cancel', flat: true }, opts);
};
Button.Close = function ( opts ) {
  return genericButton({ text: _('close'), icon: 'close', flat: true }, opts);
};
Button.GotIt = function ( opts ) {
  return genericButton({ text: _('gotit'), flat: true }, opts);
};
Button.Delete = function ( opts ) {
  return genericButton({ text: _('delete'), type: 'secondary', icon: 'delete' }, opts);
};
Button.No = function ( opts ) {
  return genericButton({ text: _('no'), icon: "cancel", flat: true }, opts);
};
Button.Ok = function ( opts ) {
  return genericButton({ text: _('ok'), flat: true }, opts);
};
Button.Edit = function ( opts ) {
  return genericButton({ text: _('edit'), type: 'primary', icon: 'edit' }, opts);
};
Button.Save = function ( opts ) {
  return genericButton({ text: _('save'), type: 'primary', icon: 'save' }, opts);
};
Button.Yes = function ( opts ) {
  return genericButton({ text: _('yes'), flat: true }, opts);
};

Button.default = {
  caption: "OK",
  type: null
};

module.exports = Button;


function setStyle( children ) {
  this.element.className = 'wdg-button';

  if( !this.visible ) {
    $.addClass( this, 'hide' );
  }
  if( this.flat ) {
    $.addClass( this, 'flat' );
    
    switch( this.type ) {
    case 'primary':
    case 'undef':
      $.addClass( this, 'thm-fgP' );
      break;
    case 'secondary':
      $.addClass( this, 'thm-fgS' );
      break;
    }
  } else {
    $.addClass( this, 'thm-ele2' );

    switch( this.type ) {
    case 'primary':
      $.addClass( this, 'thm-bgP' );
      break;
    case 'secondary':
      $.addClass( this, 'thm-bgS' );
      break;
    default:
      $.addClass( this, 'thm-bg3' );
    }
  }

  var txt = (this.text || "").trim();
  if( txt.length > 0 ) {
    children.text.textContent = this.text;
    $.removeClass( this, "no-text" );
  } else {
    $.addClass( this, "no-text" );
  }

  if ( this.wait ) {
    children.icon.visible = true;
    children.icon.content = "wait";
    children.icon.rotate = true;
  }
  else if ( !this.icon || ( typeof this.icon === 'string' && this.icon.trim().length === 0 ) ) {
    children.icon.visible = false;
    $.removeClass( this, 'responsive' );
  } else {
    children.icon.visible = true;
    children.icon.content = this.icon;
    children.icon.rotate = this.anim;
    if( this.responsive ) {
      $.addClass( this, 'responsive' );
    }
  }

  if( !this.enabled || this.wait ) $.addClass( this, 'disabled' );
  if( this.wide ) $.addClass( this, 'wide' );
  if( !this.inverted ) $.addClass( this, 'iconToLeft' );
}
