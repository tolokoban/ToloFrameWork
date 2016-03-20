"use strict";
var Widget = require("wdg");

/**
 * @example
 * var WysiwygEditor = require("tp4.wysiwyg-editor");
 * var instance = new WysiwygEditor( options );
 * @class WysiwygEditor
 */
var WysiwygEditor = function( options ) {
    var that = this;

    Widget.call(this);
    this.addClass("tp4-wysiwyg-editor");

    var header = Widget.div( 'header' );
    var iframe = Widget.tag( 'iframe' );    
    iframe.attr( 'src', 'squire/squire.html' );
    iframe.addEvent( 'load', function() {
        // Storing a reference to the wysiwyg editor.
        that._squire = iframe.contentWindow.editor;
        if( that._postponedHTML ) {
            that._squire.setHTML( that._postponedHTML );
            delete that._postponedHTML;
            initHeader.call( that, header );
        }
    });

    this.append( header, iframe );
};

// Extension of Widget.
WysiwygEditor.prototype = Object.create(Widget.prototype);
WysiwygEditor.prototype.constructor = WysiwygEditor;


/**
 * Get/Set the HTML content of the editor.
 */
Object.defineProperty( WysiwygEditor.prototype, 'content', {
    get: function() {
        if( typeof this._squire === 'undefined' ) {
            // IFrame is not ready.
            return this._postponedHTML || "";
        }
        return this._squire.getHTML();
    },
    set: function( html ) {
        if( typeof this._squire === 'undefined' ) {
            // IFrame is  not ready.  We store  the `html`  and it
            // will  be inserted  as soon  as the  iframe will  be
            // loaded.
            this._postponedHTML = html;
            return;
        }
        this._squire.setHTML( html );
    },
    configurable: false,
    enumarable: true
});


function initHeader( header ) {
    
}


WysiwygEditor.create = function( options ) {
    return new WysiwygEditor( options );
};
module.exports = WysiwygEditor;
