// https://secure.gravatar.com/site/implement/images/
var $ = require("dom");
var DB = require("tfw.data-binding");
var Md5 = require("md5");


/**
 * * `404` : Ne rien retourner. C'est la valeur par défaut.
 * * `mm` : Mystery Man, constant.
 * * `blank` : Blanc, constant.
 * * `identicon` : Dépend de l'e-mail.
 * * `monsterid` : Dépend de l'e-mail.
 * * `wavatar` : Dépend de l'e-mail.
 * * `retro` : Dépend de l'e-mail.
 * 
 */
var getURL = function(md5, size, unknown) {
    if (typeof size === 'undefined') size = 32;
    if (typeof unknown === 'undefined') unknown = "retro";

    return "https://secure.gravatar.com/avatar/"
        + md5 + "?s=" + size + "&r=pg&d=" + unknown;
};

/**
 * @class Gravatar
 * @param {string} opts.value - Email or MD5.
 * @param {number} opts.size - Side size in pixel of the image. Default = `32`.
 * @param {string} opts.theme - Que faut-il afficher s'il n'y a pas de Gravatar. Default = `retro`.
 * @param {boolean} opts.enabled
 * 
 */
var Gravatar = function(opts) {
    var that = this;

    var img = new Image();
    var elem = $.elem( this, 'wdg-gravatar', 'fade', [img] );

    DB.propInteger(this, 'size')(function(v) {
        $.css( elem, {width: v + "px", height: v + "px"} );
    });
    DB.propEnum(['retro','404', 'mm', 'blank', 'identicon', 'monsterid', 'wavatar'])(this, 'theme');
    DB.propString(this, 'value')(function(v) {
        $.addClass( elem, 'fade' );
        if( v.length < 1 ) return;
        if( v.indexOf('@') > -1 ) {
            v = Md5( v );
        }
        img.src = getURL( v, that.size, that.theme );
    });
    DB.propRemoveClass(this, 'visible', 'hide');
    
    img.onload = function() {
        $.removeClass( elem, "fade" );
    };
    img.onerror = function() {};

    DB.extend({
        theme: 'retro',
        size: 64,
        visible: true,
        value: ''
    }, opts, this);
};

/**
 * @return void
 */
Gravatar.prototype.refresh = function() {
    DB.fire( this, 'value' );
};

Gravatar.url = getURL;

module.exports = Gravatar;
