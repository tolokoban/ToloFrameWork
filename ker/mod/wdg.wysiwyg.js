/**********************************************************************
 require( 'tp4.wysiwyg-editor' )
 -----------------------------------------------------------------------
 https://github.com/neilj/Squire
 **********************************************************************/
"use strict";
var $ = require("dom");
var DB = require("tfw.data-binding");

/**
 * @example
 * var WysiwygEditor = require("tp4.wysiwyg-editor");
 * var instance = new WysiwygEditor( options );
 * @class WysiwygEditor
 */
var WysiwygEditor = function( opts ) {
    var that = this;

    // Real focus function will be set when iframe will be loaded.
    var postponedFocus = false;
    this.focus = function() { postponedFocus = true; };

    var elem = $.elem(this, 'button', 'wdg-wysiwyg', 'elevation-2');
    var header = $.tag('header');
    var menu = $.tag('menu');
    var iframe = $.tag( 'iframe', { src: 'squire/squire.html' } );
    iframe.addEventListener( 'load', function() {
        // Storing a reference to the wysiwyg editor.
        var squire = iframe.contentWindow.editor;
        that._squire = squire;
        that.focus = that._squire.focus.bind( squire );
        if( postponedFocus ) {
            that.focus();
        }
        // Adding edotir buttons.
        initHeader.call( that, header );
        if( that._postponedHTML ) {
            that._squire.setHTML( that._postponedHTML );
            delete that._postponedHTML;
        }
        // Adding onChange event when focus is lost.
        var lastContent = '';
        squire.addEventListener( 'focus', function() {
            lastContent = squire.getHTML();
        });
        squire.addEventListener( 'blur', function() {
            if( typeof that._Change === 'function' && lastContent !== squire.getHTML() ) {
                that._Change.call( that );
            }
        });
        squire.addEventListener( 'pathChange', function( path ) {
            console.info("[tp4.wysiwyg-editor] path=...", path);
            console.info("[tp4.wysiwyg-editor] squire.getSelection()=...", squire.getSelection());
        });
    }, false);
    var body = $.div([iframe]);
    $.add( elem, [header, menu, body]);

    this.append( header, $.div([ iframe ]) );
};


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

/**
 * Accessor for attribute Change.
 */
WysiwygEditor.prototype.Change = function(v) {
    if (typeof v === 'undefined') return this._Change;
    this._Change = v;
    return this;
};


function initHeader( header ) {
    var buttonName, slot;
    var squire = this._squire;
    var buttons = [
        ['undo', squire.undo.bind( squire )],
        ['repeat', squire.redo.bind( squire )],
        "|",
        ['ban', removeAllFormatting.bind( squire )],
        ['bold', squire.bold.bind( squire )],
        ['italic', squire.italic.bind( squire )],
        ['underline', squire.underline.bind( squire )],
        ['font', setFontFaceSizeColor.bind( squire )],
        ['header', setHeader.bind( squire )],
        "|",
        ['list-ul', squire.makeUnorderedList.bind( squire )],
        ['list-ol', squire.makeOrderedList.bind( squire )],
        "|",
        ['align-left', squire.setTextAlignment.bind( squire, 'left' )],
        ['align-center', squire.setTextAlignment.bind( squire, 'center' )],
        ['align-right', squire.setTextAlignment.bind( squire, 'right' )],
        ['align-justify', squire.setTextAlignment.bind( squire, 'justify' )],
        "|",
        ['link', makeLink.bind( squire )],
        ['arrow-circle-o-left', setFloat.bind( squire, 'left' )],
        ['dot-circle-o', setFloat.bind( squire, 'none' )],
        ['arrow-circle-o-right', setFloat.bind( squire, 'right' )],
    ];
    buttons.forEach(function ( item ) {
        if( item === '|' ) {
            $.add( header, $.div( 'sep' ));
        } else {
            var buttonName = item[0];
            var slot = item[1];
            addButton( header, buttonName, slot );
        }
    });

    $.add( header, $.div( 'wide' ) );
}

function setHeader() {
    this.modifyBlocks(function( root ) {
        var e = root.firstChild;
        var name = e.nodeName;
        if( name.charAt(0).toUpperCase() == 'H' && name.length == 2 ) {
            var level = Math.min( 3, parseInt( name.charAt(1) ) );
            level = (level + 1) % 4;
            var header = root.ownerDocument.createElement( level ? 'H' + level : 'DIV' );
            header.innerHTML = e.innerHTML;
            $.replace( header, e );
        } else {
            var h1 = root.ownerDocument.createElement( 'H1' );
            h1.innerHTML = e.outerHTML;
            $.replace( h1, e );
        }
        return root;
    });
}

function setFontFaceSizeColor() {
    var that = this;

    var optFontName = {};
    ['serif', 'sans-serif', 'monospace'].forEach(function (fontname) {
        optFontName[fontname] = $.div({ style: 'font-family:' + fontname }, [_('sentence')]);
    });
    var selFontName = S( _('font-name'), optFontName );    
    var selFontSize = S( _('font-name'), {
        '70': '70 %',
        '80': '80 %',
        '90': '90 %',
        '100': '100 %',
        '110': '110 %',
        '130': '130 %',
        '160': '160 %',
        '200': '200 %'
    });
    selFontSize.val( '100' );
    var selFontColor = C( _('font-color') );
    selFontColor.val( 'black' );
    
    Modal.confirm(
        $.div([
            selFontName.element(),
            selFontSize.element(),
            selFontColor.element()
        ]),
        function( confirm ) {
            confirm.hide();
            that.setFontFace( selFontName.val() );
            that.setFontSize( selFontSize.val() + "%" );
            that.setTextColour( selFontColor.val() );
        }
    );
}

function removeAllFormatting() {
    this.removeAllFormatting();
}

function setFloat( float ) {
    var selection = this.getSelection();
    if( selection ) {
        var container = selection.commonAncestorContainer;
        var images = container.querySelectorAll( 'img' );
        Array.prototype.forEach.call( images, function( img ) {
            img.style.float = float;
        });
    }
}

function makeLink() {
    if( this.hasFormat( 'a' ) ) {
        this.changeFormat( null, {tag: 'a'}, null, true );
    } else {
        var href = prompt(_('link'));
        if( href && href.trim().length > 0 ) {
            this.makeLink(href, { target: '_blank' });
        }
    }
}


/**
 * Add an editor button into the header.
 */
function addButton( header, name, slot ) {
    var button = $.div( 'button', { id: name, 'data-name': name, title: _('icon-' + name) }, [
        $.tag( 'i', 'fa', 'fa-' + name )
    ]);
    $.on( button, slot );
    $.add( header, button );
    return button;
}


WysiwygEditor.create = function( options ) {
    return new WysiwygEditor( options );
};

/**
 * Open a popup with `html` in the editor and `caption` as title.
 * Il the __Validate__  button is clicked, call `onValidate` with the resulting HTML as argument.
 */
WysiwygEditor.edit = function( caption, html, onValidate ) {
    var editor = new WysiwygEditor();
    editor.content = html || "";
    var footer = $.tag( 'footer' );
    var body = $.div( 'tp4-wysiwyg-editor-popup', [editor, footer] );
    var close = Popup( caption, body );
    var btnCancel = Button.Cancel().Tap( close );
    var btnOK = Button.Ok().Tap( function() {
        onValidate( editor.content );
        close();
    } );
    $.add( footer, $.div([ btnCancel.element() ]), $.div([ btnOK.element() ]) );
    editor.focus();
};

module.exports = WysiwygEditor;
