/**
 * @module tfw.login
 *
 * @description
 * 
 *
 * @example
 * var mod = require('tfw.login');
 */
require("tfw.promise");
var $ = require("dom");
var T = require("wdg.text");
var B = require("wdg.button");
var WS = require("tfw.web-service");
var DB = require("tfw.data-binding");

var CANCEL = 1;

module.exports = function(opts) {
    if( typeof opts === 'undefined' ) opts = {};

    return new Promise(function (resolve, reject) {
        var root = $.div( 'tfw-login' );
console.info("[tfw.login] WS=...", WS);
        var inpLogin = new T({
            value: WS.config.usr || '',
            label: _('login'), 
            placeholder: _('login'),
            validator: "admin|test|[^ \t@]+@[^ \t@]+",
            wide: true
        });
        var inpPassword = new T({
            value: WS.config.pwd || '',
            label: _('password'), 
            placeholder: _('password'),
            wide: true
        });
        var btnCancel = new B({
            text: _('cancel'),
            icon: "cancel",
            type: "simple"
        });
        DB.bind( btnCancel, 'action', function() {
            $.detach( root );
            reject( CANCEL );
        });
        var btnOK = new B({
            text: _('ok'),
            icon: "ok"
        });
        var row = $.div( 'row', [btnCancel, btnOK]);
        var hint = $.tag('p', 'hint');
        hint.innerHTML = _('hint');

        var box = $.div( 'elevation-24', [inpLogin, inpPassword, row, hint] );
        root.appendChild( box );
        document.body.appendChild( root );
        inpLogin.focus();

        var onLogin = function() {
            if (!inpLogin.valid) {
                inpLogin.focus();
                return;
            }
            $.addClass( root, "fade-out" );
            WS.login(inpLogin.value, inpPassword.value).then(
                function( user ) {
                    resolve( user );
                    $.detach( root );
                },
                function( errCode ) {
                    reject( errCode );
                    $.detach( root );
                }
            );
        };
        DB.bind( btnOK, 'action', onLogin );
        DB.bind( inpPassword, 'action', onLogin );
        DB.bind( inpLogin, 'action', inpPassword.focus.bind( inpPassword ) );
    });
};
