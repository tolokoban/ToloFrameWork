"use strict";

/**
 * @module tfw.login
 *
 * @description
 *
 *
 * @example
 * var mod = require('tfw.login');
 */
require( "polyfill.promise" );
const
    $ = require( "dom" ),
    B = require( "tfw.view.button" ),
    WS = require( "tfw.web-service" ),
    PM = require( "tfw.binding.property-manager" ),
    Modal = require( "wdg.modal" ),
    LoginView = require( "tfw.view.login" );

const CANCEL = 1;

module.exports = function ( opts ) {
    if ( typeof opts === 'undefined' ) opts = {};

    return new Promise( function ( resolve, reject ) {
        const
            lastLogin = WS.config( 'usr' ),
            view = new LoginView( { usr: lastLogin } ),
            btnCancel = new B( {
                text: _( 'cancel' ),
                icon: 'cancel',
                flat: true
            } ),
            btnOK = new B( { text: _( 'ok' ), icon: 'ok' } ),
            modal = new Modal( {
                header: _( 'title' ),
                content: $.div( 'tfw-login-content', [ view ] ),
                footer: [ btnCancel, btnOK ]
            } );

        btnCancel.on( function () {
            modal.detach();
            reject( CANCEL );
        } );

        const onLogin = function () {
            if ( !view.valid ) {
                view.focus = true;
                return;
            }
            modal.detach();
            if ( view.pwd === '' ) {
                WS.get( 'tp4.NewAccount', { mail: view.usr, from: window.location.href } ).then(
                    function ( user ) {
                        message( _( 'email' ) );
                    },
                    function ( errCode ) {
                        message( _( 'error' + errCode.id ) );
                    }
                );
            } else {
                WS.login( view.usr, view.pwd ).then(
                    function ( user ) {
                        resolve( user );
                    },
                    function ( errCode ) {
                        message( _( 'error' + errCode.id ) );
                    }
                );
            }
        };
        btnOK.on( onLogin );
        const sendMail = function () {
            if ( !view.valid ) {
                return message( _( "invalid-email" ) );
            }
            view.pwd = '';
            onLogin();
        };
        PM( view ).on( 'onConnection', onLogin );
        PM( view ).on( 'onNewAccount', sendMail );
        PM( view ).on( 'onLostPassword', sendMail );
        PM( view ).on( 'valid', function ( isValid ) {
            btnOK.enabled = isValid;
        } );

        modal.attach();
        view.usr = lastLogin || '';
        view.focus = true;
    } );
};


function message( text ) {
    var btnGotIt = new B( { text: _( 'gotit' ), flat: true } );
    var modal = new Modal( {
        header: _( 'title' ),
        content: $.div( 'tfw-login-content', [ text ] ),
        footer: [ btnGotIt ]
    } );
    modal.attach();
    btnGotIt.on( function () {
        modal.detach();
        location.reload();
    } );
}