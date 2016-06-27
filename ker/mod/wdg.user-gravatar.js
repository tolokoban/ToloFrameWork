/**
 * @module wdg.user-gravatar
 *
 * @description
 *
 *
 * @example
 * var UserGravatar = require('wdg.user-gravatar');
 * var g = new UserGravatar({ size: 32, md5: '...' });
 */


var $ = require("dom");
var DB = require("tfw.data-binding");
var MD5 = require("md5");
var Icon = require("wdg.icon");

function UserGravatar(opts) {
    var that = this;

    if( typeof opts === 'undefined' ) opts = {};
    if( typeof opts.size === 'undefined' ) opts.size = 32;

    var icon = new Icon({content: 'user'});
    var img = $.tag('img', {
        src: ""
    });
    var elem = $.elem( this, 'wdg-user-gravatar', [icon, img] );
    img.onload = function() {
        if (typeof that.md5 === 'string' && MD5.isValid( that.md5 ) ) {
            // Show only if the md5 is valid.
            $.addClass( elem, 'show' );
        }
    };

    DB.propInteger( this, 'size' )(function(v) {
        $.att( elem, {width: v + "px", height: v + "px"} );
        icon.size = v + "px";
    });
    DB.propString( this, 'md5' )(function(v) {
        $.removeClass( elem, 'show' );
        $.att(img, {
            src: "https://secure.gravatar.com/avatar/"
                + v + "?s=" + that.size + "&r=pg&d=retro"
        });
    });

    opts = DB.extend({
        size: 32,
        md5: "",
        enabled: true,
        wide: false,
        visible: true
    }, opts, this);    
}


module.exports = UserGravatar;
