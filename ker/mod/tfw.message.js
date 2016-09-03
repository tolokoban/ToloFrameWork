/**
 * @module tfw.message
 *
 * @description
 * Display a evanescing message at the top of the screen.
 * This messge will fade out after 5 seconds, or if tapped.
 *
 * @example
 * var Msg = require('tfw.message');
 * Msg.error( 'There is a problem!' );
 * Msg.info( 'Trace saved.' );
 * Msg.info( 'Visible for 3500 ms.', 3500 );
 */
var $ = require("dom");


var G = {
    lastMsg: null
};

function show( className, text, delay ) {
    if (G.lastMsg) {
        // Remove an already displayed message because a new one must take its place.
        $.detach( G.lastMsg );
        G.lastMsg = null;
    }
    
    if( typeof delay !== 'number' ) delay = 5000;
    var div = $.div( 'tfw-message', className, 'theme-elevation-24' );
    $.textOrHtml( div, text );
    G.lastMsg = div;
    document.body.appendChild( div );
    function hide() {
        $.removeClass( div, 'show' );
        window.setTimeout( $.detach.bind( $, div ), 300 );
        G.lastMsg = null;
    }
    var id = window.setTimeout(hide, delay);
    window.setTimeout(function() {
        $.addClass( div, 'show' );
        $.on( div, function() {
            hide();
            window.clearTimeout( id );
            G.lastMsg = null;
        });
    });
}


exports.info = show.bind( null, 'info' );
exports.error = show.bind( null, 'error' );
