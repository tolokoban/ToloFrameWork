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
var Msg = require("tfw.message");

var CANCEL = 1;

module.exports = function(opts) {
    if( typeof opts === 'undefined' ) opts = {};

    return new Promise(function (resolve, reject) {
        var root = $.div( 'tfw-login' );
        var lastLogin = WS.config('usr');
        var inpLogin = new T({
            value: lastLogin || '',
            label: _('login'),
            placeholder: _('login'),
            validator: "admin|test|[^ \t@]+@[^ \t@]+",
            wide: true
        });
        //var lastPassword = WS.config('pwd');
        var inpPassword = new T({
            //value: lastPassword || '',
            type: "password",
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

        var box = $.div( 'theme-elevation-24', [inpLogin, inpPassword, row, hint] );
        root.appendChild( box );
        document.body.appendChild( root );
        inpLogin.focus = true;

        var onLogin = function() {
            if (!inpLogin.valid) {
                inpLogin.focus = true;
                return;
            }
            $.addClass( root, "fade-out" );
            if (inpPassword.value == '') {
                WS.get('tp4.NewAccount', {mail: inpLogin.value}).then(
                    function( user ) {
                        Msg.info( _('email') );
                        $.removeClass( root, 'fade-out' );
                    },
                    function( errCode ) {
                        Msg.error( _('error' + errCode.id) );
                        $.removeClass( root, 'fade-out' );
                    }
                );
            } else {
                WS.login(inpLogin.value, inpPassword.value).then(
                    function( user ) {
                        resolve( user );
                        $.detach( root );
                    },                    
                    function( errCode ) {
                        Msg.error( _('error' + errCode.id) );
                        $.removeClass( root, 'fade-out' );
                    }
                );
            }
        };
        DB.bind( btnOK, 'action', onLogin );
        DB.bind( inpPassword, 'action', onLogin );
        DB.bind( inpLogin, 'action', function() { inpPassword.focus = true; } );
    });
};
