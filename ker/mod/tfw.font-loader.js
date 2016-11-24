"use strict";

require("polyfill.promise");

module.exports = function() {
    var args = [].slice.call( arguments );
    if( document.fonts && typeof document.fonts.load === 'function') {
        return fontAPI( args );
    } else {
        return fallback( args );
    }
};


/**
 * Use the modern Font API.
 */
function fontAPI( fonts ) {
    var promises = [];
    fonts.forEach(function (font) {
        var pro = document.fonts.load( '64px "' + font + '"' );
        promises.push( pro );
    });
    return Promise.all( promises );
}


/**
 * For old browsers, use a not-always-working trick.
 */
function fallback( fonts ) {
    return new Promise(function (resolve, reject) {
        var divs = [];
        var body = document.body;
        fonts.forEach(function (font) {
            var div = document.createElement( 'div' );
            div.className = 'tfw-font-loader';
            div.style.fontFamily = font;
            body.appendChild( div );
        });
        // Ugly trick: juste wait 1.5 second.
        window.setTimeout(function () {
            divs.forEach(function (d) {
                body.removeChild( d );
            });
            resolve( fonts );
        }, 1500);
    });
}
