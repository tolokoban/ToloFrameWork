/**!
 * @module tfw.login
 *
 * @description
 *
 *
 * @example
 * var mod = require('tfw.login');
 */
require("polyfill.promise");
var $ = require("dom");
var T = require("wdg.text");
var B = require("wdg.button");
var WS = require("tfw.web-service");
var DB = require("tfw.data-binding");
var Msg = require("tfw.message");
var Modal = require("wdg.modal");

var CANCEL = 1;

module.exports = function(opts) {
  if( typeof opts === 'undefined' ) opts = {};

  return new Promise(function (resolve, reject) {
    var lastLogin = WS.config('usr');
    var inpLogin = new T({
      value: lastLogin || '',
      label: _('login'),
      type: 'email',
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
      flat: true
    });
    var btnOK = new B({
      text: _('ok'),
      flat: true
    });
    var row = $.div( 'row', [btnCancel, btnOK]);
    var hint = $.tag('p', 'tfw-login-hint');
    hint.innerHTML = _('hint');

    var modal = new Modal({
      header: _('title'),
      content: $.div( 'tfw-login-content', [inpLogin, inpPassword, row, hint] ),
      footer: [btnCancel, btnOK]
    });
    modal.attach();
    inpLogin.focus = true;

    DB.bind( btnCancel, 'action', function() {
      modal.detach();
      reject( CANCEL );
    });

    var onLogin = function() {
      if (!inpLogin.valid) {
        inpLogin.focus = true;
        return;
      }
      modal.detach();
      if (inpPassword.value == '') {
        WS.get('tp4.NewAccount', {mail: inpLogin.value}).then(
          function( user ) {
            Msg.info( _('email') );
          },
          function( errCode ) {
            Msg.error( _('error' + errCode.id) );
          }
        );
      } else {
        WS.login(inpLogin.value, inpPassword.value).then(
          function( user ) {
            resolve( user );
          },
          function( errCode ) {
            Msg.error( _('error' + errCode.id) );
          }
        );
      }
    };
    DB.bind( btnOK, 'action', onLogin );
    DB.bind( inpPassword, 'action', onLogin );
    DB.bind( inpLogin, 'action', function() { inpPassword.focus = true; } );
  });
};
