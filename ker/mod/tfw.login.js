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
var T = require("tfw.view.textbox");
var B = require("tfw.view.button");
var WS = require("tfw.web-service");
var PM = require("tfw.binding.property-manager");
var Msg = require("tfw.message");
var Modal = require("wdg.modal");

var CANCEL = 1;

module.exports = function(opts) {
  if( typeof opts === 'undefined' ) opts = {};

  return new Promise(function (resolve, reject) {
    var lastLogin = WS.config('usr');
    var inpLogin = new T({
      label: _('login'),
      type: 'email',
      placeholder: _('login'),
      validator: "admin|test|[^ \t@]+@[^ \t@]+",
      wide: true
    });
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

    btnCancel.on(function() {
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
    btnOK.on( onLogin );
    PM( inpPassword ).on( 'action', onLogin );
    PM( inpLogin ).on( 'action', function() { inpPassword.focus = true; } );
    PM( inpLogin ).on( 'valid', function( isValid ) {
      btnOK.enabled = isValid;
    });

    //------------------------------------------------
    modal.attach();
    inpLogin.value = lastLogin || '',
    inpLogin.focus = true;
  });
};
