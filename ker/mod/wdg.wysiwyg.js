/**********************************************************************
 require( 'tp4.wysiwyg-editor' )
 -----------------------------------------------------------------------
 https://github.com/neilj/Squire
**********************************************************************/
"use strict";

require( "polyfill.promise" );

var $ = require( "dom" );
var Fx = require( "dom.fx" );
var DB = require( "tfw.data-binding" );
var Flex = require( "wdg.flex" );
var Icon = require( "wdg.icon" );
var Modal = require( "wdg.modal" );
var Combo = require( "wdg.combo" );
var Prompt = require( "wdg.modal.prompt" );
var InputColor = require( "tp4.input-color" );


var DEFAULT_MENU = [
  {
    id: 'undo',
    key: 'ctrl-Z'
  }, {
    id: 'redo',
    key: 'ctrl-Y'
  },
  '-', {
    id: 'format-bold',
    key: 'ctrl-B'
  }, {
    id: 'format-italic',
    key: 'ctrl-I'
  }, {
    id: 'format-underline',
    key: 'ctrl-U'
  },
  { id: 'font', key: 'ctrl-F' },
  { id: 'format-header', key: 'ctrl-H' },
  '-', {
    id: 'eraser',
    key: 'ctrl-E'
  }, {
    id: 'link',
    key: 'ctrl-K'
  }, {
    id: 'image',
    key: 'Ctrl-I'
  },
  '-', {
    id: 'format-align-left',
    key: 'ctrl-L'
  }, {
    id: 'format-align-center',
    key: 'ctrl-M'
  }, {
    id: 'format-align-right',
    key: 'ctrl-R'
  }, {
    id: 'format-align-justify',
    key: 'ctrl-J'
  },
  '-',
  { id: 'format-float-left' },
  { id: 'format-float-right' },
  { id: 'format-float-none' }
];
/*
  ['header', setHeader.bind( squire )],
  "|",
  ['list-ul', squire.makeUnorderedList.bind( squire )],
  ['list-ol', squire.makeOrderedList.bind( squire )],
*/

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
  var postponedHTML = null;
  var iframeHasChanged = false;

  var elem = $.elem( this, 'div', 'wdg-wysiwyg', 'thm-ele2' );
  var slider = $.div( 'slider' );
  var menu = $.div( 'menu', "thm-bgPL" );
  var iframe = $.tag('iframe', { src: 'squire2/squire.html' });
  var loaded = new Promise( function( resolve, reject ) {
    iframe.addEventListener( 'load', function( ) {
      // Storing a reference to the wysiwyg editor.
      var squire = iframe.contentWindow.editor;
      that.squire = squire;
      if ( postponedFocus ) {
        that.focus = true;
      }
      // Adding editor buttons.
      if ( postponedHTML !== null ) {
        squire.setHTML( postponedHTML );
        postponedHTML = null;
      }
      // Adding onChange event when focus is lost.
      squire.addEventListener( 'input', function( ) {
        // Prevent from update looping.
        iframeHasChanged = true;
        that.value = squire.getHTML( );
      });
      squire.addEventListener( "willPaste", function( event ) {
        console.info("[tp4.wysiwyg-editor] (willPaste) event=", event);
        var text = event.fragment.textContent;
        var normalized = text.trim().toLowerCase();
        if( normalized.substr(0, 8) !== '<iframe ' ) return;
        if( normalized.substr(normalized.length - 9) !== '</iframe>' ) return;
        var div = $.div();
        div.innerHTML = text;
        var iframe = div.firstChild;
        $.css( iframe, { maxWidth: "80vw" } );
        var src = iframe.getAttribute( "src" );
        var a = $.tag( "a", { target: "IFRAME", href: src } );
        a.innerHTML = '<svg width=32 height=32><g stroke="#000" fill="none" stroke-width=2><path d="M14,8h-6v6 M14,24h-6v-6 M18,8h6v6 M18,24h6v-6"/></g></svg>';
        a.setAttribute(
          "style",
          "border-radius:100%;position:absolute;right:4px;top:4px;display:inline-block;z-index:2;"
            + "background:#fff;width:32px;height:32px;line-height:32px;text-align:center;"
            + "font-size:16px;font-weight:bold;font-family:sans-serif;box-shadow:0 8px 16px rgba(0,0,0,.5);"
          + "text-decoration:none;color:#000;"
        );
        $.add( div, a );
        event.fragment.firstChild.textContent = "";
        event.fragment.firstChild.innerHTML = div.innerHTML;
        $.css( event.fragment.firstChild, { position: "relative", padding: 0 } );
      });
      Object.defineProperty(that, 'squire', {
        value: squire,
        writable: false,
        configurable: true,
        enumerable: true
      });
      resolve( squire );
    }, false);
  });
  var body = $.div('body', [ iframe ]);
  $.add( elem, menu, body, slider );

  DB.propBoolean( this, 'focus' )( function( v ) {
    loaded.then( function( ) {
      if ( v ) {
        that.squire.focus( );
      } else {
        that.squire.blur( );
      }
    });
  });
  DB.propUnit( this, 'height' )( function( v ) {
    if ( v.u === 'px' ) {
      // Show the slider only for heights in pixels.
      $.removeClass( elem, 'absolute' );
    } else {
      // Otherwise, put the widget in absolute position.
      $.addClass( elem, 'absolute' );
    }
    $.css(elem, {
      height: v.v + v.u
    });
  });
  DB.prop( this, 'menu' )( function( v ) {
    loaded.then( function( ) {
      $.clear( menu );
      v.forEach( function( itm ) {
        if ( itm === '-' ) {
          $.add(menu, $.div('sep', [ itm ]));
        } else {
          // Expand itm.
          if ( typeof itm === 'string' ) {
            itm = {
              id: itm
            };
          }
          if ( typeof itm.icon !== 'string' ) {
            itm.icon = itm.id;
          }
          if ( typeof itm.tip !== 'string' ) {
            itm.tip = _( 'tip-' + itm.id );
          }
          if ( typeof itm.key === 'string' ) {
            itm.tip = (itm.tip || '') + " [" + itm.key + "]";
            loaded.then( function( ) {
              that.squire.setKeyHandler( itm.key.toLowerCase(), function( self, event, range ) {
                event.preventDefault();
                onMenu.call( that, itm, range );
              });
            });
          }
          var icon = new Icon({ size: '2rem', content: itm.icon });
          var tip = itm.tip;
          if ( tip && tip != 'icon-' + itm.id ) {
            icon.$.setAttribute( 'title', tip );
          }
          $.addClass( icon, 'icon' );
          $.on(icon, {
            down: $.addClass.bind( $, icon, 'down' ),
            up: $.removeClass.bind( $, icon, 'down' ),
            tap: onMenu.bind( that, itm )
          });
          $.add( menu, icon );
        }
      });
    });
  });
  DB.propString( this, 'value' )( function( v ) {
    loaded.then( function( ) {
      if ( iframeHasChanged ) {
        iframeHasChanged = false;
      } else {
        that.squire.setHTML( v );
      }
    });
  });
  DB.propAddClass( this, 'wide' );
  DB.propRemoveClass( this, 'visible', 'hide' );

  DB.extend( {
    value: "",
    menu: DEFAULT_MENU,
    height: 240,
    visible: true
  }, opts, this );

  var initialHeight = this.height.v;

  $.on(slider, {
    down: function( ) {
      initialHeight = that.height.v;
    },
    drag: function( evt ) {
      if ( that.height.u === 'px' ) {
        // Drag only if height is in pixels.
        that.height = Math.max( 200, initialHeight + evt.dy );
      }
    }
  });

  // Managing fullscreen display.
  var fullscreen = new Fx.Fullscreen({
    target: elem,
    // When the component is put fullscreen, it is temporarly removed from the DOM. This causes the IFrame to be reloaded,
    // and the result is that we lost content. That's why we use `postponedHTML`.
    onBeforeReplace: function( ) {
      postponedHTML = that.squire.getHTML( );
    }
  });
};

WysiwygEditor.prototype.insertHTML = function( html ) {
  this.squire.insertHTML( html );
  this.squire.focus();
};

WysiwygEditor.prototype.insertImage = function( url ) {
  if ( typeof url === 'string' ) {
    this.squire.insertHTML( "<img src=" + JSON.stringify(url) + "/>" );
    this.squire.focus();
  }
  else {
    var that = this;
    Prompt( _( 'image-url' ), function( href ) {
      if ( href && href.trim( ).length > 0 ) {
        this.squire.insertHTML( "<img src=" + JSON.stringify(url) + "/>" );
        that.squire.focus();
      }
    });
  }
};

/**
 * @return void
 */
WysiwygEditor.prototype.processButton = function( id ) {
  console.error( "Button \"" + id + "\" has no code to process it!" );
};

function setHeader( ) {
  this.modifyBlocks( function( root ) {
    var e = root.firstChild;
    var name = e.nodeName;
    if ( name.charAt( 0 ).toUpperCase( ) == 'H' && name.length == 2 ) {
      var level = Math.min(3, parseInt(name.charAt( 1 )));
      level = ( level + 1 ) % 4;
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

function setFontFaceSizeColor( ) {
  var that = this;

  var optFontName = {};
  [ 'josefin-sans', 'serif', 'sans-serif', 'monospace' ].forEach( function( fontname ) {
    optFontName[fontname] = $.div({
      style: 'font-family:' + fontname
    }, [_( 'sentence' )]);
  });
  var selFontName = new Combo({ label: _( 'font-name' ), wide: true, content: optFontName });
  var selFontSize = new Combo({ label: _( 'font-size' ), content: {
    '70': '70 %',
    '80': '80 %',
    '90': '90 %',
    '100': '100 %',
    '110': '110 %',
    '130': '130 %',
    '160': '160 %',
    '200': '200 %'
  }});
  selFontSize.value = '100';
  var selFontColor = new InputColor(_( 'font-color' ));
  selFontColor.val( 'black' );

  Modal.confirm( $.div([
    selFontName,
    new Flex({ content: [selFontSize, selFontColor] })
  ]), function() {
    that.setFontFace(selFontName.value);
    that.setFontSize( selFontSize.value + "%" );
    that.setTextColour(selFontColor.val( ));
  });
}

function setFloat( float ) {
  var selection = this.getSelection( );
  if ( selection ) {
    var container = selection.commonAncestorContainer;
    var images = container.querySelectorAll( 'img' );
    Array.prototype.forEach.call( images, function( img ) {
      img.style.float = float;
    });
  }
}

function makeLink( ) {
  var that = this;
  if (this.hasFormat( 'a' )) {
    this.changeFormat( null, {
      tag: 'a'
    }, null, true );
  } else {
    Prompt( _( 'tip-link' ), function( href ) {
      if ( href && href.trim( ).length > 0 ) {
        that.makeLink(href, { target: '_blank' });
      }
    });
  }
}

/**
 * `this` is the squire object.
 */
function onMenu( item ) {
  var squire = this.squire;
  var id = item.id;

  switch ( id ) {
  case 'undo':
    squire.undo();
    break;
  case 'redo':
    squire.redo();
    break;
  case 'eraser':
    squire.removeAllFormatting( );
    break;
  case 'link':
    makeLink.call( squire );
    break;
  case 'image':
    this.insertImage();
    break;
  case 'format-bold':
    if (squire.hasFormat( 'b' )) {
      squire.removeBold( );
    } else {
      squire.bold( );
    }
    break;
  case 'format-italic':
    if (squire.hasFormat( 'i' ) || squire.hasFormat( 'em' )) {
      squire.removeItalic( );
    } else {
      squire.italic( );
    }
    break;
  case 'format-underline':
    if (squire.hasFormat( 'u' )) {
      squire.removeUnderline( );
    } else {
      squire.underline( );
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
  case 'font':
    setFontFaceSizeColor.call( squire );
    break;
  case 'format-float-left':
    setFloat.call( squire, 'left' );
    break;
  case 'format-float-center':
    setFloat.call( squire, 'center' );
    break;
  case 'format-float-right':
    setFloat.call( squire, 'right' );
    break;
  case 'format-float-none':
    setFloat.call( squire, 'none' );
    break;
  case 'format-header':
    setHeader.call( squire );
    break;
  default:
    this.processButton( id );
  }
  this.focus = true;
}

Object.defineProperty(WysiwygEditor, 'DEFAULT_MENU', {
  value: DEFAULT_MENU,
  writable: false,
  configurable: false,
  enumerable: true
});
module.exports = WysiwygEditor;
