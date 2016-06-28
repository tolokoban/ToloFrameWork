/**********************************************************************
 require( 'tp4.wysiwyg-editor' )
 -----------------------------------------------------------------------
 https://github.com/neilj/Squire
 **********************************************************************/
"use strict";
var $ = require("dom");
var DB = require("tfw.data-binding");
var Icon = require("wdg.icon");


var DEFAULT_MENU = [
    'format-bold',
    'format-italic',
    'format-underline',
    '-',
    'format-align-left',
    'format-align-center',
    'format-align-right',
    'format-align-justify',
    '-'
];


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
    var postponedHTML = null;
    var iframeIsLoaded = false;

    var elem = $.elem(this, 'div', 'wdg-wysiwyg', 'theme-elevation-2');
    var iconFullscreen = new Icon({ content: Icon.Icons.fullscreen });
    var label = $.tag('span', 'label');
    var header = $.div('header', [iconFullscreen, label]);
    var slider = $.div('slider');
    var menu = $.div('menu');
    var iframe = $.tag( 'iframe', { src: 'squire2/squire.html' } );
    iframe.addEventListener( 'load', function() {
        iframeIsLoaded = true;
        // Storing a reference to the wysiwyg editor.
        var squire = iframe.contentWindow.editor;
        that.focus = squire.focus.bind( squire );
        if( postponedFocus ) {
            that.focus();
        }
        // Adding editor buttons.
        //initHeader.call( that, header );
        if( postponedHTML !== null ) {
            squire.setHTML( postponedHTML );
            postponedHTML = null;
        }
        // Adding onChange event when focus is lost.
        var lastContent = '';
        squire.addEventListener( 'focus', function() {
            lastContent = squire.getHTML();
        });
        squire.addEventListener( 'blur', function() {
            if( lastContent !== squire.getHTML() ) {
                that.value = squire.getHTML();
            }
        });
/*
        squire.addEventListener( 'pathChange', function( path ) {
            console.info("[tp4.wysiwyg-editor] path=...", path);
            console.info("[tp4.wysiwyg-editor] squire.getSelection()=...", squire.getSelection());
        });
*/
        Object.defineProperty( that, 'squire', {
            value: squire, writable: false, configurable: true, enumerable: true
        });
    }, false);
    var body = $.div('body', [iframe]);
    $.add( elem, header, menu, body, slider);

    DB.propString(this, 'label')(function(v) {
        if (typeof v === 'number') v = '' + v;
        if (typeof v !== 'string') v = '';
        label.textContent = v;
    });
    DB.propInteger(this, 'height')(function(v) {
        $.css(elem, {height: v + "px"});
    });
    DB.prop(this, 'menu')(function(v) {
        $.clear( menu );
        v.forEach(function (itm) {
            if (itm == '-') {
                $.add( menu, $.div( 'sep', [itm] ));
            } else {
                var icon = new Icon({size: '2em', content: itm});
                $.addClass( icon.element, 'icon' );
                $.on( icon.element, {
                    down: $.addClass.bind( $, icon.element, 'down' ),
                    up: $.removeClass.bind( $, icon.element, 'down' ),
                    tap: onMenu.bind( that, itm )
                });
                $.add( menu, icon );
            }
        });

    });
    DB.propString(this, 'value', function() {
        return iframeIsLoaded ? that.squire.getHTML() : '';
    })(function(v) {
        if (iframeIsLoaded) that.squire.setHTML( v );
        else postponedHTML = v;
    });

    DB.extend({
        label: "",
        value: "",
        menu: DEFAULT_MENU,
        height: 180,
        visible: true
    }, opts, this);

    var initialHeight = this.height;

    $.on( slider, {
        down: function() {
            initialHeight = that.height;
console.info("[wdg.wysiwyg] initialHeight=...", initialHeight);
        },
        drag: function(evt) {
            that.height = Math.max( 180, initialHeight + evt.dy );
        }
    });
/*
    interact( slider ).draggable({
        axis: 'y'
    }).on('dragend', function (event) {
        that.height += event.pageY - event.y0;
    }).on('dragmove', function (event) {
        $.css( elem, {height: (that.height + event.pageY - event.y0) + "px"});
    });
*/
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
 * `this` is the squire object.
 */
function onMenu( id ) {
    var squire = this.squire;

    switch( id ) {
    case 'format-bold':
        if (squire.hasFormat( 'b' )) {
            squire.removeBold();
        } else {
            squire.bold();
        }
        break;
    case 'format-italic':
        if (squire.hasFormat( 'i' ) || squire.hasFormat( 'em' )) {
            squire.removeItalic();
        } else {
            squire.italic();
        }
        break;
    case 'format-underline':
        if (squire.hasFormat( 'u' )) {
            squire.removeUnderline();
        } else {
            squire.underline();
        }
        break;
    case 'format-align-left':
        squire.setTextAlignment( 'left' );
        break;
    case 'format-align-center':
        squire.setTextAlignment( 'center' );
        break;
    case 'format-align-right':
        squire.setTextAlignment( 'right' );
        break;
    case 'format-align-justify':
        squire.setTextAlignment( 'justify' );
        break;
    default:
        alert( id );
    }

    this.focus();
}


module.exports = WysiwygEditor;
