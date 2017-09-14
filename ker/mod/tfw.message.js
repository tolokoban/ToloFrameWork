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
var $ = require( "dom" );

// Le DIV qui contient le message à afficher.
var g_message = null;
// Identifiant du Timeout qui sert à retirer la classe "show" du message.
var g_timeout;


function show( className, text, delay ) {
  if( !g_message ) {
    // Première création du message.
    g_message = $.div( 'tfw-message', "thm-ele24" );
    document.body.appendChild( g_message );
  }
  if ( typeof delay !== 'number' ) delay = 5000;
  // Mettre à jour la class CSS.
  $.removeClass( g_message, "info", "error" );
  $.addClass( g_message, className );
  
  $.clear( g_message, text );

  window.setTimeout(function() {
    $.addClass( g_message, "show" );
  });

  if( g_timeout ) window.clearTimeout( g_timeout );
  g_timeout = window.setTimeout(function() {
    $.removeClass( g_message, "show" );
  }, delay);
}

exports.info = show.bind( null, 'info' );
exports.error = show.bind( null, 'error' );
exports.clear = function() {
  if( g_timeout ) window.clearTimeout( g_timeout );
  $.addRemove( g_message, "show" );  
};
