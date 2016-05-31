var $ = require("dom");
var DB = require("tfw.data-binding");

var TYPES = ['standard', 'simple', 'warning', 'shadow', 'special'];

/**
 * Liste des classes CSS applicables sur un bouton :
 * * __simple__ : Simple lien, sans l'aspect "bouton".
 * * __shadow__ : Bouton légèrement plus foncé.
 * * __warning__ : Bouton orangé pour indiquer une action potentiellement dangeureuse.
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

    $.elem( this, typeof opts.href === 'string' ? 'a' : 'button', 'tfw-view-button', 'custom' );

    DB.prop(this, 'value')(function(v) {
        that.element.textContent = v;
    });
    DB.prop(this, 'type')(function(v) {
        if (TYPES.indexOf( v ) == -1) {
            console.error("[tfw.view.button.type] Unknown type: \"" + v + "\"!");
            that.type = TYPES[0];
            return;
        }
        TYPES.forEach(function (type) {
            $.removeClass(that.element, type);
        });
        $.addClass(that.element, v);
    });
    DB.prop(this, 'enabled')(function(v) {
        if (v) {
            $.removeAtt(that.element, 'disabled');
        } else {
            $.att(that.element, 'disabled', 'yes');
        }
    });
    DB.prop(this, 'action', 0);

    opts = DB.extend({
        value: "OK",
        enabled: true,
        type: "standard"
    }, opts);

    this.enabled = opts.enabled;
    this.value = opts.value;
    this.type = opts.type;

    // Animate the pressing.
    $.on(this.element, {
        down: function() {
            if (that.enabled) {
                $.addClass(that.element, 'press');
            }
        },
        up: function() {
            $.removeClass(that.element, 'press');
        },
        tap: function() {
            that.action++;
        },
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
    if (this.enabled) this.action++;
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


function genericButton( id, classes, defaults ) {
    var btn = new Button({ caption: _(id) });
    if ( classes.length > 0 ) {
        var i, cls;
        for (i = 0 ; i < classes.length ; i++) {
            cls = classes[i];
            btn.addClass( cls );
        }
    } else {
        if (typeof defaults === 'undefined') return btn;
        if (!Array.isArray(defaults)) {
            defaults = [defaults];
        }
        defaults.forEach(function (cls) {
            btn.addClass( cls );
        });
    }
    return btn;
}

Button.Cancel = function() { return genericButton('cancel', arguments); };
Button.Close = function() { return genericButton('close', arguments, 'simple'); };
Button.Delete = function() { return genericButton('delete', arguments, 'warning'); };
Button.No = function() { return genericButton('no', arguments); };
Button.Ok = function() { return genericButton('ok', arguments); };
Button.Edit = function() { return genericButton('edit', arguments); };
Button.Save = function() { return genericButton('save', arguments, 'warning'); };
Button.Yes = function() { return genericButton('yes', arguments); };

Button.default = {
    caption: "OK",
    type: "default"
};

module.exports = Button;
