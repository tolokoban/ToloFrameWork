"use strict";

var Finder = require("../lib/dependencies-finder");

jasmine.DEFAULT_TIMEOUT_INTERVAL = 3600000;


describe('Module "dependencies-finder"', function() {
  var check = function(file, requires) {
    it('should find requires in ' + file, function() {
      expect( Finder(FILES[file]).requires ).toEqual( requires );
    });
  };
  describe('should find requires', function() {
    check( "x-widget", ['dom', 'tfw.data-binding'] );
    //check( "strings", ["A", "C'est", "EF"] );
    check( "comments", ['YoMan'] );
    check( "tp4.wdg-event", [
      'dom', 'tfw.data-binding', 'wdg.text', 'wdg.flex', 
      'tp4.button.edit-intl'
    ]);
    check( "tfw.binding", ['tfw.binding.converters', 'tfw.binding.property-manager'] );
    check( "dom", ['$', 'polyfill.classList', 'tfw.pointer-events'] );
  });
});



var FILES = {
  "strings": `// Prout
require("A");
require('C\'est');
require("E\"F")`,
  "comments": `
/**
 * @example
 * var Toto = require("Alright");
 */
var Titi = require("YoMan");
`,
"tp4.wdg-event": `"use strict";

var $ = require("dom");
var DB = require("tfw.data-binding");
var Text = require( "wdg.text" );
var Flex = require( "wdg.flex" );
var Description = require( "tp4.button.edit-intl" );


/**
 * @class Event
 *
 * @param {boolean} opts.visible - Set the visiblity of the component.
 *
 * @example
 * var Tp.Wdg.Event = require("tp.wdg.event");
 * var instance = new Tp.Wdg.Event({visible: false});
 */
var Event = function(opts) {
    var inpName = new Text({
      label: _("name"),
      width: "320px"
    });
    var inpCode = new Text({
      label: _("code"),
      width: "120px"
    });
    var inpDesc = new Description({
      text: _("desc"), html: true
    });  
  var elem = $.elem( this, 'div', [
    new Flex({
      justify: "between",
      content: [inpName, inpCode]
    }),
    inpDesc
  ]);
  
  DB.propRemoveClass( this, 'visible', 'hide' );
  DB.propWidget( this, "focus", inpName );
  DB.propWidget( this, "name", inpName, "value" );
  DB.propWidget( this, "code", inpCode, "value" );
  DB.propWidget( this, "desc", inpDesc, "value" );
  
  opts = DB.extend({
    visible: true,
    name: "",
    code: "",
    desc: ""
  }, opts, this);
};


module.exports = Event;
`,
  "tfw.binding": `/** @module tfw.binding */require( 'tfw.binding', function(require, module, exports) { var _=function(){return ''};    "use strict";

var Converters = require("tfw.binding.converters");
var PropertyManager = require('tfw.binding.property-manager');


exports.defProps = function( obj, props ) {
  var propertyName;
  for( propertyName in props ) {
    exports.defProp( obj, propertyName, props[propertyName] );
  }
};


/**
 * @param {function(v)} opts.cast
 */
exports.defProp = function( obj, name, opts ) {
  if( typeof opts === 'undefined' ) opts = {};
  var pm = PropertyManager( obj );
  pm.converter( name, exports.createConverter( opts.cast ) );

  Object.defineProperty( obj, name, {
    set: pm.change.bind( pm, name ),
    get: pm.get.bind( pm, name ),
    configurable: false,
    enumerable: true
  });
};


exports.createConverter = function( arg ) {
  var type = typeof arg;
  switch( type ) {
  case 'function':
    return arg;
  case 'string':
    return Converters.get( arg );
  default:
    return undefined;
  }
};



module.exports._ = _;
});
`,
  "dom": `/** @module dom */require( 'dom', function(require, module, exports) { var _=function(){var D={"en":{}},X=require("$").intl;function _(){return X(D,arguments);}_.all=D;return _}();
   /**
 * @module dom
 *
 * @description
 * Functions which facilitate DOm manipulations.
 * Included __interact.js__. You can find documentation for it here:
 * [http://interactjs.io/docs/]
 *
 * @example
 * var mod = require('dom');
 */
require("polyfill.classList");
var PointerEvents = require("tfw.pointer-events");

var $ = function(dom) {
    if (typeof dom === 'string') {
        var elem = document.getElementById( dom );
        if (!elem) {
            console.error( "[dom] There is no DOM element with this ID: \`" + dom + "\`" );
        }
        return elem;
    }
    if (!dom) {
        debugger;
        throw Error("\`dom\` is not a valid element!", dom);
    }
    if (typeof dom.element === 'function') return dom.element();
    if (dom.element) return dom.element;
    return dom;
};

module.exports = $;


// Used to store data on the DOM element without colliding with existing attributes.
var SYMBOL = '@dom' + Date.now();

var RX_ENTITY = /^&(#[0-9]+|[a-zA-Z0-9]+);$/;

$.tagNS = tagNS;
$.svgRoot = tagNS.bind( undefined, "http://www.w3.org/2000/svg", "svg", {
    version: '1.1',
    'xmlns:svg': 'http://www.w3.org/2000/svg',
    xmlns: 'http://www.w3.org/2000/svg',
    'xmlns:xlink': 'http://www.w3.org/1999/xlink'
});
$.svg = tagNS.bind( undefined, "http://www.w3.org/2000/svg" );
$.tag = tagNS.bind( undefined, "http://www.w3.org/1999/xhtml" );
$.div = tagNS.bind( undefined, "http://www.w3.org/1999/xhtml", "div" );
$.txt = window.document.createTextNode.bind( window.document );
$.textOrHtml = textOrHtml;
$.get = get;
/**
 * Add a readonly \`element\` property to \`obj\` and return it.
 */
$.elem = elem;
/**
 * Apply css rules on \`element\`.
 *
 * @return \`element\`.
 *
 * @example
 * var $ = require('dom');
 * $.css( element, { width: '800px'. height: '600px' });
 */
$.css = css;
$.att = att;
$.removeAtt = removeAtt;
$.addClass = addClass;
$.hasClass = hasClass;
$.removeClass = removeClass;
$.toggleClass = toggleClass;
$.saveStyle = saveStyle;
$.restoreStyle = restoreStyle;
/**
 * @param newElem {Element} - Replacement element.
 * @param oldElem {Element} - Element to replace.
 */
$.replace = replace;
/**
 * Remove element from its parent.
 * @param element {Element} - Element to detach from its parent.
 * @return The parent element.
 */
$.detach = detach;
/**
 * Add event handlers to one or many elements.
 *
 * @param {object|array}  element -  list of  elements on  which apply
 * events handlers.
 *
 * @param  {object|function} slots  - If  a function  is given,  it is
 * considered as a slot for the event \`tap\`.  Otherwise, the object is
 * a map  between events' names (the  key) and function to  handle the
 * event (the value).
 * Events' names are:
 * * __tap__: When  the element is  pressed and released in  less than
 900 ms and without too much sliding.
 * * __doubletap__
 * * __dragmove__
 *
 * @param {boolean} capture - If \`true\` events are captured before they reach the children.
 *
 * @example
 *    DOM.on( [screen, button], function() {...} );
 *    DOM.on( body, null );   // Do nothing, but stop propagation.
 *    DOM.on( element, { tap: function() {...} } );
 */
$.on = on;
$.off = off;
/**
 * Append all the \`children\` to \`element\`.
 * @param element
 * @param ...children
 */
$.add = add;
/**
 * Add the attribute \`element\` and the following functions to \`obj\`:
 * * __css__
 * * __addClass__
 * * __removeClass__
 * * __toggleClass__
 */
$.wrap = wrap;
/**
 * Remove all children of the \`element\`.
 * @param element {Element} - Element from which remove all the children.
 */
$.clear = clear;

function wrap( obj, element, nomethods ) {
    Object.defineProperty( obj, 'element', {
        value: element, writable: false, configurable: false, enumerable: true
    });
    if( nomethods ) return obj;

    obj.on = on.bind( obj, element );
    obj.css = css.bind( obj, element );
    obj.add = add.bind( obj, element );
    obj.att = att.bind( obj, element );
    obj.addClass = addClass.bind( obj, element );
    obj.hasClass = hasClass.bind( obj, element );
    obj.removeClass = removeClass.bind( obj, element );
    obj.toggleClass = toggleClass.bind( obj, element );
    return obj;
}

function replace( newElem, oldElem ) {
    newElem = $(newElem);
    oldElem = $(oldElem);
    oldElem.parentNode.replaceChild( newElem, oldElem );
    return newElem;
}

function css( element, styles ) {
    element = $(element);
    var key, val;
    for( key in styles ) {
        val = styles[key];
        element.style[key] = val;
    }
    return element;
}

function att( element, attribs, value ) {
    element = $(element);
    var key, val;
    if (typeof attribs === 'string') {
        key = attribs;
        attribs = {};
        attribs[key] = value;
    }
    for( key in attribs ) {
        val = attribs[key];
        element.setAttribute( key, val );
    }
    return element;
}

function removeAtt( element, attrib ) {
    element = $(element);
    element.removeAttribute( attrib );
    return element;
}

function add( element ) {
    element = $(element);
    try {
        var i, child;
        for (i = 1 ; i < arguments.length ; i++) {
            child = arguments[i];
            if( typeof child === 'string' || typeof child === 'number' ) {
                child = '' + child;
                if( child.substr( 0, 6 ) == '<html>' ) {
                    var html = child.substr( 6 );
                    child = $.tag('span');
                    child.innerHTML = html;
                }
                else if( RX_ENTITY.test( child ) ) {
                  var text = child;
                  child = $.tag('span');
                  child.innerHTML = text;
                }
                else {
                    child = document.createTextNode( child );
                }
            }
            else if( typeof child.element === 'function' ) {
                // Backward compatibility with Widgets.
                child = child.element();
            }
            else if( typeof child.element !== 'undefined' ) {
                child = child.element;
            }
            element.appendChild( child );
        }
        return element;
    }
    catch( ex ) {
        console.error( "[DOM.add] arguments=", [].slice.call( arguments ) );
        throw Error( "[DOM.add] " + ex );
    }
}

function off( element ) {
    if( Array.isArray( element ) ) {
        element.forEach(function ( elem ) {
            off( elem );
        });
        return element;
    }

    if( typeof element[SYMBOL] === 'undefined' ) return element;
    var pe = element[SYMBOL].events;
    if( typeof pe  === 'undefined' ) return element;
    pe.off();
    delete element[SYMBOL].events;
}

function on( element, slots ) {
    // If only a function is passed, we consider this is a Tap event.
    if( typeof slots === 'function' || slots === null ) slots = { tap: slots };

    if( Array.isArray( element ) ) {
        element.forEach(function ( elem ) {
            on( elem, slots );
        });
        return element;
    }

    element = $(element);
    if( typeof element[SYMBOL] === 'undefined' ) element[SYMBOL] = {};
    if( typeof element[SYMBOL].events === 'undefined' ) {
        element[SYMBOL].events = new PointerEvents( element );
    }

    var key, val, preview;
    for( key in slots ) {
        val = slots[key];
        if (key.charAt(0) == '!') {
            key = key.substr(1);
            preview = true;
        } else {
            preview = false;
        }
        if (key == 'keydown' || key == 'keyup') {
            element.addEventListener( key, val, preview );
        } else {
            element[SYMBOL].events.on( key, val, preview );
        }
    }

    return element;
}

function tagNS( ns, name ) {
    try {
        var e = document.createElementNS( ns, name );
        var i, arg, key, val;
        for (i = 2 ; i < arguments.length ; i++) {
            arg = arguments[i];
            if( Array.isArray(arg) ) {
                // Arrays are for children.
                arg.forEach(function (child) {
                    switch( typeof child ) {
                    case 'string':
                    case 'number':
                    case 'boolean':
                        child = '' + child;
                        if( child.substr( 0, 6 ) == '<html>' ) {
                            var html = child.substr( 6 );
                            child = $.tag('span');
                            child.innerHTML = html;
                        } else {
                            child = document.createTextNode( child );
                        }
                        break;
                    }
                    add( e, child );
                });
            } else {
                switch( typeof arg ) {
                case "string":
                    arg.split( ' ' ).forEach(function ( item ) {
                        if( item.length > 0 ) {
                            addClass(e, item);
                        }
                    });
                    break;
                case "object":
                    for( key in arg ) {
                        val = arg[key];
                        e.setAttribute( key, val );
                    }
                    break;
                default:
                    throw Error("[dom.tag] Error creating <" + name + ">: Invalid argument #" + i + "!");
                }
            }
        }
        return e;
    }
    catch (ex) {
        console.error("[dom.tagNS] Error with \`ns\` = ", ns, " and \`name\` = ", name);
        console.error(ex);
    }
};


function addClass(elem) {
    var args = [].slice.call( arguments, 1 );
    if( Array.isArray( elem ) ) {
        // Loop on each element.
        args.unshift( null );
        elem.forEach(function ( child ) {
            args[0] = child;
            addClass.apply( undefined, args );
        });
        return elem;
    }
    elem = $( elem );
    args.forEach(function (className) {
        if (typeof className !== 'string') return;
        className = className.trim();
        if( className.length == 0 ) return;
        try {
            if( elem.classList )
                elem.classList.add( className );
        }
        catch( ex ) {
            console.error( "[dom.addClass] Invalid class name: ", className );
            console.error( ex );
        }
    });
    return elem;
}


function hasClass( elem, className ) {
    elem = $( elem );
    if( !elem.classList ) return false;
    return elem.classList.contains( className );
}


function removeClass(elem) {
    var args = [].slice.call( arguments, 1 );
    if( Array.isArray( elem ) ) {
        // Loop on each element.
        args.unshift( null );
        elem.forEach(function ( child ) {
            args[0] = child;
            removeClass.apply( undefined, args );
        });
        return elem;
    }
    elem = $( elem );
    args.forEach(function (className) {
        if (typeof className !== 'string') return;
        try {
            if( elem.classList )
                elem.classList.remove( className );
        }
        catch( ex ) {
            console.error( "[dom.removeClass] Invalid class name: ", className );
            console.error( ex );
        }
    });
    return elem;
}


function toggleClass(elem) {
    var args = [].slice.call( arguments, 1 );
    args.forEach(function( className ) {
        if( hasClass( elem, className ) ) {
            removeClass( elem, className );
        } else {
            addClass( elem, className );
        }
    });
    return elem;
}


function clear( element ) {
    // (!) On préfère retirer les éléments un par un du DOM plutôt que d'utiliser simplement
    // this.html("").
    // En effet, le code simplifié a des conséquences inattendues dans IE9 et IE10 au moins.
    // Le bug des markers qui disparaissaients sur les cartes de Trail-Passion 4 a été corrigé
    // avec cette modification.
    element = $(element);
    var e = element;
    while(e.firstChild){
        e.removeChild(e.firstChild);
    }
    var args = [].slice.call( arguments );
    if( args.length > 1 ) {
        add.apply( this, args );
    }
    return element;
}

function get( element, query ) {
    element = $(element);
    if( typeof query === 'undefined' ) {
        query = element;
        element = window.document;
    }
    return element.querySelector( query );
}

function detach( element ) {
    element = $(element);
    var parent = element.parentElement;
    if( !parent ) return parent;
    parent.removeChild( element );
    return parent;
}

function elem( target ) {
    var args = [].slice.call( arguments );
    args.shift();
    if (args.length == 0) args = ['div'];
    args.push('dom', 'custom');
    var e;
    if (typeof args[0].element !== 'undefined') {
        e = args[0].element;
        addClass( e, 'dom', 'custom' );
    } else if (typeof args[0].appendChild === 'function') {
        e = args[0];
        addClass( e, 'dom', 'custom' );
    } else {
        e = $.tag.apply( $, args );
    }
    Object.defineProperty( target, 'element', {
        value: e, writable: false, configurable: false, enumerable: true
    });
    return e;
}

function textOrHtml( element, content ) {
    if( typeof content === 'undefined' ) content = '';
    if (content === null) content = '';
    if (typeof content !== 'string') content = JSON.stringify( content );
    if (content.substr(0, 6) == '<html>') {
        element.innerHTML = content.substr(6);
    } else {
        element.textContent = content;
    }
    return element;
}

function saveStyle( elements ) {
    if( !Array.isArray( elements ) ) return saveStyle( Array.prototype.slice.call( arguments ) );
    elements.forEach(function (elem) {
        elem = $( elem );
        if( typeof elem[SYMBOL] === 'undefined' ) elem[SYMBOL] = {};
        if( !Array.isArray( elem[SYMBOL].style ) ) elem[SYMBOL].style = [];
        elem[SYMBOL].style.push( JSON.stringify( elem.style ) );
    });
}

function restoreStyle( elements ) {
    if( !Array.isArray( elements ) ) return restoreStyle( Array.prototype.slice.call( arguments ) );
    elements.forEach(function (elem) {
        elem = $( elem );
        if( typeof elem[SYMBOL] === 'undefined' || !Array.isArray( elem[SYMBOL].style ) ) throw Error(
            "[dom.restoreStyle] \`saveStyle()\` has never been used on this element!");
        if( elem[SYMBOL].style.length == 0 ) throw Error(
            "[dom.restoreStyle] more \`restore\` than \`save\`!");
        var styles = JSON.parse( elem[SYMBOL].style.pop() );
        var k, v;
        for( k in styles ) {
            v = styles[k];
            if( typeof v !== 'undefined' ) {
                elem.style[k] = v;
            }
        }
    });
}



module.exports._ = _;
/**
 * @module dom
 * @see module:$
 * @see module:tfw.pointer-events

 */
});`,
"x-widget": `/**
 * @example
 * 
 * var W = require("x-widget");
 * W({
 *   elem: "div",
 *   attr: {"class": "black"},
 *   prop: {"$key": "menu"},
 *   children: [
 *     "This is the ",
 *     W({
 *       elem: "b",
 *       children: ["menu"]
 *     }),
 *     "..."
 *   ]
 * });
 */
"use strict";

var $ = require("dom");
var DB = require("tfw.data-binding");

var widgets = {};
// Used for \`onWidgetCreation()\`.
var slots = {};


var Widget = function(id, modName, args, attribs) {
  if (typeof id === 'string') return Widget1.call( this, id, modName, args, attribs );
  else return Widget2.call( this, id );
};

function Widget1(id, modName, args, attribs ) {
  if( typeof attribs === 'undefined' ) attribs = {};

  try {
    var module = require( modName );
    var wdg = new module( args );
    var elem = typeof wdg.element === 'function' ? wdg.element() : wdg.element;
    var dst = document.getElementById( id );
    if (dst) {
      // This widget does exist in the current DOM.
      // We have to replace it.
      dst.parentNode.replaceChild( elem, dst );
    }
    elem.setAttribute( 'id', id );
    // Add classes defined in the containing element (\`dst\`).
    $.addClass( elem, attribs.class || "" );
    register( id, wdg );
    return wdg;
  }
  catch (ex) {
    console.error("[x-widget] Unable to create widget \`" + modName + "\`!");
    console.error("[x-widget] id = ", id, ", args = ", args);
    throw Error(ex);
  }
};

function Widget2(args) {
  var id;
  var elem = $.tag( args.elem );
  if (args.attr) {
    // Adding DOM element attributes.
    $.att( elem, args.attr );
    id = args.attr.id;
  }

  if (Array.isArray( args.children )) {
    // Adding DOM element children.
    args.children.forEach(function (child) {
      $.add( elem, child );
    });
  }
  // Converting into a widget.
  var key, val;
  var wdg = {};

  if (args.prop) {
    // Adding READ-ONLY properties to the widget.
    for( key in args.prop ) {
      val = args.prop[key];
      Object.defineProperty( wdg, key, {
        value: val, writable: false, configurable: false, enumerable: true
      });
    }
  }
  // Assigning the element to the widget.
  Object.defineProperty( wdg, 'element', {
    value: elem, writable: false, configurable: false, enumerable: true
  });

  if( typeof id !== 'undefined' ) {
    // Registering the widget only if it as got an id.
    register( id, wdg );
  }
  return wdg;
}

Widget.template = function( attribs ) {
  var key, val, id, name = '', args = {};
  for( key in attribs ) {
    val = attribs[key];
    if( key == 'name' ) {
      name = val;
    }
    else if( key == 'id' ) {
      id = val;
    }
    else if( key.charAt(0)=='$' ) {
      args[key.substr( 1 )] = val;
    }
  }
  var module = require( name );
  var wdg = new module( args );
  if( id ) {
    register( id, wdg );
  }

  return typeof wdg.element === 'function' ? wdg.element() : (wdg.element || wdg);
};

function register( id, wdg ) {
  widgets[id] = wdg;
  var mySlots = slots[id];
  if( typeof mySlots !== 'undefined' ) {
    window.setTimeout(function() {
      mySlots.forEach(function (slot) {
        slot( wdg );
      });
      delete slots[id];
    });
  }
  return typeof wdg.element === 'function' ? wdg.element : (wdg.element || wdg);
};

Widget.getById = function( id ) {
  if( !widgets[id] ) throw Error( "[x-widget.getById()] ID not found: " + id + "!" );
  return widgets[id];
};

Widget.onWidgetCreation = function( id, slot ) {
  if( typeof widgets[id] === 'undefined' ) {
    if( typeof slots[id] === 'undefined' ) slots[id] = [slot];
    else slots[id].push( slot );
  } else {
    // Asynchronous call to the slot
    window.setTimeout(
      function() {
        slot( widgets[id] );
      }
    );
  }
};

/**
 * @example
 * var W = require("x-widget");
 * W.bind('wdg.layout-stack0',{"value":{"B":[["btnNewTask","action"],["btnCancel","action"]]}});
 */
Widget.bind = function( id, attribs ) {
  // Destination object: the one on the attributes of which we want to bind.
  var dstObj = widgets[id];
  // Destination attribute name.
  var dstAtt;
  // Temporary variables to hold source object and attributes.
  var srcObj, srcAtt;
  // @example
  // ["btnNewTask","action","btnCancel","action"]
  var bindings;
  var slots;
  // Index used to parse multiple bindings.
  var idx;
  for( dstAtt in attribs ) {
    bindings = attribs[dstAtt].B;
    if (Array.isArray( bindings )) {
      // \`binding\` is an array of arrays.
      // Subarrays have 2 or 3 elements.
      // * ID if the source object
      // * attribute to bind on
      // * [optional] value  to use as  a constant. This  is the
      // * case where  we just want  to set a constant  value as
      // * soon as the source's attribute has changed.
      bindings.forEach(function (binding) {
        srcObj = widgets[binding[0]];
        if( typeof srcObj === 'undefined' ) {
          console.error( "[x-widget:bind(" + id + ")] Trying to bind attribute \""
                         + dstAtt
                         + "\" of widget \"" + id + "\" to the unexisting widget \""
                         + binding[0] + "\"!");
          return;
        }
        srcAtt = binding[1];
        try {
          if (binding.length == 2) {
            DB.bind( srcObj, srcAtt, dstObj, dstAtt );
          } else {
            var value = binding[2];
            DB.bind( srcObj, srcAtt, function() {
              dstObj[dstAtt] = value;
            });
          }
        } catch( ex ) {
          console.error("Binding error for widget \`" + id + "\`!", {
            ex: ex,
            binding: binding
          });
        }
      });
    }

    slots = attribs[dstAtt].S;
    if (Array.isArray( slots )) {
      // Each item is the name of a function to call when the value of this attribute changes.
      // If the item is a \`string\`, the function is from the global \`APP\` object.
      // Otherwise, the item must be an array with two children:
      // the first one  is the module's name and  the second one
      // id the name of the function.
      // The slots are called with two arguments:
      //  * the value and
      //  * the object the attribute belongs.
      slots.forEach(function (slot) {
        var mod = APP;
        var fct = slot;
        if (Array.isArray( slot )) {
          try {
            mod = require(slot[0]);
          } catch( ex ) {
            console.error("[x-widget:bind] Widget \`" + id + "\` can't require unexistent \`"
                          + slot[0] + "\`: ", ex);
            throw( ex );
          }
          fct = slot[1];
        }
        fct = mod[fct];
        if (typeof fct !== 'function') {
          if( Array.isArray(slot) ) {
            throw Error("[x-widget:bind]  Widget \`" + id + "\` use unexisting slot \`"
                        + slot[1] + "\` of module \`" + slot[0] + "\`!");
          } else {
            throw Error("[x-widget:bind]  Widget \`" + id + "\` use unexisting slot \`"
                        + slot + "\` of main module \`APP\`!");
          }
        } else {
          try {
            DB.bind( dstObj, dstAtt, fct );
          } catch( ex ) {
            console.error("Binding error for widget \`" + id + "\`!", {
              ex: ex,
              dstObj: dstObj,
              dstAtt: dstAtt,
              fct: fct,
              slot: slot
            });
          }
        }
      });

    }
  }
};

module.exports = Widget;
`};
