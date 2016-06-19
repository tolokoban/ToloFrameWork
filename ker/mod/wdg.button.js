var $ = require("dom");
var DB = require("tfw.data-binding");
var Icon = require("wdg.icon");

var TYPES = ['standard', 'simple', 'warning', 'shadow', 'special'];

/**
 * Liste des classes CSS applicables sur un bouton :
 * * __simple__ : Simple lien, sans l'aspect "bouton".
 * * __shadow__ : Bouton légèrement plus foncé.
 * * __warning__ : Bouton orangé pour indiquer une action potentiellement dangereuse.
 * * __small__ : Bouton de petite taille (environ 70%).
 *
 * @param {object} opts
 * * {string} `value`: Text à afficher dans le bouton.
 * * {string} `href`: Si défini, lien vers lequel dirigier la page en cas de click.
 * * {boolean} `enabled`: Mettre `false` pour désactiver le bouton.
 * * {object} `email`: Associe le _Tap_ à l'envoi d'un mail.
 *   * {string} `to`: destinataire.
 *   * {string} `subject`: sujet du mail.
 *   * {string} `body`: corps du mail.
 *
 * @example
 * var Button = require("tp4.button");
 * var instance = new Button();
 * @class Button
 */
var Button = function(opts) {
    var that = this;

    var elem = $.elem(
        this, 
        typeof opts.href === 'string' ? 'a' : 'button', 'wdg-button', 'elevation-2'
    );
    if (typeof opts.href === 'string' && opts.href.length > 0) {
        $.att( elem, 'href', opts.href );
    }

    var icon = null;

    var refresh = function() {
        $.clear( elem );
        if (icon) {
            $.add( elem, icon.element, that.text );
        } else {
            elem.textContent = that.text;
        }        
    };
    
    DB.prop(this, 'value');
    DB.propEnum( TYPES )(this, 'type')(function(v) {
        TYPES.forEach(function (type) {
            $.removeClass(elem, type);
        });
        $.addClass(elem, v);
    });
    DB.prop(this, 'icon')(function(v) {
        if (!v || (typeof v === 'string' && v.trim().length == 0)) {
            icon = null;
        } else if (v.element) {
            icon = v.element;
        } else {
            icon = new Icon({content: v, size: "1.2em"});
        }
        refresh();
    });
    DB.propString(this, 'text')(function(v) {
        refresh();
    });
    DB.propBoolean(this, 'enabled')(function(v) {
        if (v) {
            $.removeAtt(elem, 'disabled');
        } else {
            $.att(elem, 'disabled', 'yes');
        }
    });
    DB.propBoolean(this, 'small')(function(v) {
        if (v) {
            $.addClass(elem, 'small');
        } else {
            $.removeClass(elem, 'small');
        }
    });
    DB.prop(this, 'action', 0);

    opts = DB.extend({
        text: "OK",
        value: "action",
        action: 0,
        icon: "",
        small: false,
        enabled: true,
        wide: false,
        visible: true,
        type: "standard"
    }, opts, this);

    // Animate the pressing.
    $.on(this.element, {
        down: function() {
            if (that.enabled) {
                //$.removeClass(elem, 'elevation-2');
                $.addClass(elem, 'elevation-8');
            }
        },
        up: function() {
            //$.addClass(elem, 'elevation-2');
            $.removeClass(elem, 'elevation-8');
        },
        tap: that.fire.bind( that ),
        keydown: function(evt) {
            if (evt.keyCode == 13 || evt.keyCode == 32) {
                evt.preventDefault();
                evt.stopPropagation();
                that.fire();
            }
        }
    });
};

/**
 * Simulate a click on the button if it is enabled.
 */
Button.prototype.fire = function() {
    if (this.enabled) DB.fire( this, 'action', this.value );
};

/**
 * Disable the button and start a wait animation.
 */
Button.prototype.waitOn = function(text) {
    if (typeof text === 'undefined') text = this.caption();
    this.enabled(false);
    this.clear(W({size: '1em', caption: text}));
};

/**
 * Stop the wait animation and enable the button again.
 */
Button.prototype.waitOff = function() {
    this.caption(this.caption());
    this.enabled(true);
};


function genericButton( id, type ) {
    if( typeof type === 'undefined' ) type = 'standard';
    var iconName = id;
    var intl = id;
    if( intl == 'yes' ) intl = 'ok';
    if( intl == 'no' ) intl = 'cancel';
    var btn = new Button({ text: _(intl), icon: id, value: id, type: type });
    return btn;
}

Button.Cancel = function() { return genericButton('cancel', 'shadow'); };
Button.Close = function() { return genericButton('close', 'simple'); };
Button.Delete = function() { return genericButton('delete', 'warning'); };
Button.No = function() { return genericButton('no'); };
Button.Ok = function() { return genericButton('ok'); };
Button.Edit = function() { return genericButton('edit'); };
Button.Save = function() { return genericButton('save', 'special'); };
Button.Yes = function() { return genericButton('yes'); };

Button.default = {
    caption: "OK",
    type: "default"
};

module.exports = Button;
