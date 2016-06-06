{"intl":"","src":"/** @module dom */require( 'dom', function(exports, module) {  /**\r\n * @module dom\r\n *\r\n * @description\r\n * Functions which facilitate DOm manipulations.\r\n * Included __interact.js__. You can find documentation for it here:\r\n * [http://interactjs.io/docs/]\r\n *\r\n * @example\r\n * var mod = require('dom');\r\n */\r\nrequire(\"polyfill.classList\");\r\nvar DB = require(\"tfw.data-binding\");\r\n\r\n// Used to store data on the DOM element without colliding with existing attributes.\r\nvar SYMBOL = 'dom' + Date.now();\r\n\r\n\r\nexports.tagNS = tagNS;\r\nexports.svgRoot = tagNS.bind( undefined, \"http://www.w3.org/2000/svg\", \"svg\", {\r\n    version: '1.1',\r\n    'xmlns:svg': 'http://www.w3.org/2000/svg',\r\n    xmlns: 'http://www.w3.org/2000/svg',\r\n    'xmlns:xlink': 'http://www.w3.org/1999/xlink'\r\n});\r\nexports.svg = tagNS.bind( undefined, \"http://www.w3.org/2000/svg\" );\r\nexports.tag = tagNS.bind( undefined, \"http://www.w3.org/1999/xhtml\" );\r\nexports.div = tagNS.bind( undefined, \"http://www.w3.org/1999/xhtml\", \"div\" );\r\nexports.txt = window.document.createTextNode.bind( window.document );\r\nexports.textOrHtml = textOrHtml;\r\nexports.get = get;\r\n/**\r\n * Add a readonly `element` property to `obj` and return it.\r\n */\r\nexports.elem = elem;\r\n/**\r\n * Apply css rules on `element`.\r\n *\r\n * @return `element`.\r\n *\r\n * @example\r\n * var $ = require('dom');\r\n * $.css( element, { width: '800px'. height: '600px' });\r\n */\r\nexports.css = css;\r\nexports.att = att;\r\nexports.removeAtt = removeAtt;\r\nexports.addClass = addClass;\r\nexports.hasClass = hasClass;\r\nexports.removeClass = removeClass;\r\nexports.toggleClass = toggleClass;\r\n/**\r\n * @param newElem {Element} - Replacement element.\r\n * @param oldElem {Element} - Element to replace.\r\n */\r\nexports.replace = replace;\r\n/**\r\n * Remove element from its parent.\r\n * @param element {Element} - Element to detach from its parent.\r\n * @return The parent element.\r\n */\r\nexports.detach = detach;\r\n/**\r\n * Add event handlers to one or many elements.\r\n *\r\n * @param {object|array}  element -  list of  elements on  which apply\r\n * events handlers.\r\n *\r\n * @param  {object|function} slots  - If  a function  is given,  it is\r\n * considered as a slot for the event `tap`.  Otherwise, the object is\r\n * a map  between events' names (the  key) and function to  handle the\r\n * event (the value).\r\n * Events' names are:\r\n * * __tap__: When  the element is  pressed and released in  less than\r\n 900 ms and without too much sliding.\r\n * * __doubletap__\r\n * * __dragmove__\r\n *\r\n * @param {boolean} capture - If `true` events are captured before they reach the children.\r\n *\r\n * @example\r\n *    DOM.on( [screen, button], function() {...} );\r\n *    DOM.on( body, null );   // Do nothing, but stop propagation.\r\n *    DOM.on( element, { tap: function() {...} } );\r\n */\r\nexports.on = on;\r\n/**\r\n * Append all the `children` to `element`.\r\n * @param element\r\n * @param ...children\r\n */\r\nexports.add = add;\r\n/**\r\n * Add the attribute `element` and the following functions to `obj`:\r\n * * __css__\r\n * * __addClass__\r\n * * __removeClass__\r\n * * __toggleClass__\r\n */\r\nexports.wrap = wrap;\r\n/**\r\n * Remove all children of the `element`.\r\n * @param element {Element} - Element from which remove all the children.\r\n */\r\nexports.clear = clear;\r\n\r\nfunction wrap( obj, element, nomethods ) {\r\n    Object.defineProperty( obj, 'element', {\r\n        value: element, writable: false, configurable: false, enumerable: true\r\n    });\r\n    if( nomethods ) return obj;\r\n\r\n    obj.on = on.bind( obj, element );\r\n    obj.css = css.bind( obj, element );\r\n    obj.add = add.bind( obj, element );\r\n    obj.att = att.bind( obj, element );\r\n    obj.addClass = addClass.bind( obj, element );\r\n    obj.hasClass = hasClass.bind( obj, element );\r\n    obj.removeClass = removeClass.bind( obj, element );\r\n    obj.toggleClass = toggleClass.bind( obj, element );\r\n    return obj;\r\n}\r\n\r\nfunction replace( newElem, oldElem ) {\r\n    oldElem.parentNode.replaceChild( newElem, oldElem );\r\n    return newElem;\r\n}\r\n\r\nfunction css( element, styles ) {\r\n    var key, val;\r\n    for( key in styles ) {\r\n        val = styles[key];\r\n        element.style[key] = val;\r\n    }\r\n    return element;\r\n}\r\n\r\nfunction att( element, attribs, value ) {\r\n    var key, val;\r\n    if (typeof attribs === 'string') {\r\n        key = attribs;\r\n        attribs = {};\r\n        attribs[key] = value;\r\n    }\r\n    for( key in attribs ) {\r\n        val = attribs[key];\r\n        element.setAttribute( key, val );\r\n    }\r\n    return element;\r\n}\r\n\r\nfunction removeAtt( element, attrib ) {\r\n    element.removeAttribute( attrib );\r\n    return element;\r\n}\r\n\r\nfunction add( element ) {\r\n    try {\r\n        var i, child;\r\n        for (i = 1 ; i < arguments.length ; i++) {\r\n            child = arguments[i];\r\n            if( typeof child === 'string' || typeof child === 'number' ) {\r\n                child = document.createTextNode( child );\r\n            }\r\n            else if( typeof child.element === 'function' ) {\r\n                // Backward compatibility with Widgets.\r\n                child = child.element();\r\n            }\r\n            else if( typeof child.element !== 'undefined' ) {\r\n                child = child.element;\r\n            }\r\n            element.appendChild( child );\r\n        }\r\n        return element;\r\n    }\r\n    catch( ex ) {\r\n        console.error( \"[DOM.add] arguments=\", [].slice.call( arguments ) );\r\n        throw Error( \"[DOM.add] \" + ex );\r\n    }\r\n}\r\n\r\nfunction on( element, slots, capture ) {\r\n    // If only a function is passed, we consider this is a Tap event.\r\n    if( typeof slots === 'function' || slots === null ) slots = { tap: slots };\r\n\r\n    if( Array.isArray( element ) ) {\r\n        element.forEach(function ( elem ) {\r\n            on( elem, slots );\r\n        });\r\n        return element;\r\n    }\r\n\r\n    if( typeof element[SYMBOL] === 'undefined' ) {\r\n        element[SYMBOL] = interact(element);\r\n    }\r\n\r\n    var key, val;\r\n    for( key in slots ) {\r\n        val = slots[key];\r\n        if (key == 'keydown' || key == 'keyup') {\r\n            element.addEventListener( key, val );\r\n        } else {\r\n            element[SYMBOL].on( key, val );\r\n        }\r\n    }\r\n\r\n    return element;\r\n}\r\n\r\nfunction tagNS( ns, name ) {\r\n    try {\r\n        var e = document.createElementNS( ns, name );\r\n        var i, arg, key, val;\r\n        for (i = 2 ; i < arguments.length ; i++) {\r\n            arg = arguments[i];\r\n            if( Array.isArray(arg) ) {\r\n                // Array are for children.\r\n                arg.forEach(function (child) {\r\n                    switch( typeof child ) {\r\n                    case 'string':\r\n                    case 'number':\r\n                    case 'boolean':\r\n                        child = document.createTextNode( \"\" + child );\r\n                        break;\r\n                    }\r\n                    add( e, child );\r\n                });\r\n            } else {\r\n                switch( typeof arg ) {\r\n                case \"string\":\r\n                    arg.split( ' ' ).forEach(function ( item ) {\r\n                        if( item.length > 0 ) {\r\n                            addClass(e, item);\r\n                        }\r\n                    });\r\n                    break;\r\n                case \"object\":\r\n                    for( key in arg ) {\r\n                        val = arg[key];\r\n                        e.setAttribute( key, val );\r\n                    }\r\n                    break;\r\n                default:\r\n                    throw Error(\"[dom.tag] Error creating <\" + name + \">: Invalid argument #\" + i + \"!\");\r\n                }\r\n            }\r\n        }\r\n        return e;\r\n    }\r\n    catch (ex) {\r\n        console.error(\"[dom.tagNS] Error with `ns` = \", ns, \" and `name` = \", name);\r\n        console.error(ex);\r\n    }\r\n};\r\n\r\n\r\nfunction addClass(elem) {\r\n    var args = [].slice.call( arguments, 1 );\r\n    if( Array.isArray( elem ) ) {\r\n        // Loop on each element.\r\n        args.unshift( null );\r\n        elem.forEach(function ( child ) {\r\n            args[0] = child;\r\n            addClass.apply( undefined, args );\r\n        });\r\n        return elem;\r\n    }\r\n    args.forEach(function (className) {\r\n        if( typeof className === 'string' ) {\r\n            className = className.trim();\r\n            if( className.length == 0 ) return;\r\n            try {\r\n                elem.classList.add( className );\r\n            }\r\n            catch( ex ) {\r\n                console.error( \"[dom.addClass] Invalid class name: \", className );\r\n                console.error( ex );\r\n            }\r\n        }\r\n    });\r\n    return elem;\r\n}\r\n\r\n\r\nfunction hasClass( elem, className ) {\r\n    return elem.classList.contains( className );\r\n}\r\n\r\n\r\nfunction removeClass(elem) {\r\n    var args = [].slice.call( arguments, 1 );\r\n    if( Array.isArray( elem ) ) {\r\n        // Loop on each element.\r\n        args.unshift( null );\r\n        elem.forEach(function ( child ) {\r\n            args[0] = child;\r\n            removeClass.apply( undefined, args );\r\n        });\r\n        return elem;\r\n    }\r\n    args.forEach(function (className) {\r\n        try {\r\n            elem.classList.remove( className );\r\n        }\r\n        catch( ex ) {\r\n            console.error( \"[dom.removeClass] Invalid class name: \", className );\r\n            console.error( ex );\r\n        }\r\n    });\r\n    return elem;\r\n}\r\n\r\n\r\nfunction toggleClass(elem) {\r\n    var args = [].slice.call( arguments, 1 );\r\n    args.forEach(function( className ) {\r\n        if( hasClass( elem, className ) ) {\r\n            removeClass( elem, className );\r\n        } else {\r\n            addClass( elem, className );\r\n        }\r\n    });\r\n    return elem;\r\n}\r\n\r\n\r\nfunction clear( element ) {\r\n    // (!) On préfère retirer les éléments un par un du DOM plutôt que d'utiliser simplement\r\n    // this.html(\"\").\r\n    // En effet, le code simplifié a des conséquences inattendues dans IE9 et IE10 au moins.\r\n    // Le bug des markers qui disparaissaients sur les cartes de Trail-Passion 4 a été corrigé\r\n    // avec cette modification.\r\n    var e = element;\r\n    while(e.firstChild){\r\n        e.removeChild(e.firstChild);\r\n    }\r\n    var args = [].slice.call( arguments );\r\n    if( args.length > 1 ) {\r\n        add.apply( this, args );\r\n    }\r\n    return element;\r\n}\r\n\r\nfunction get( element, query ) {\r\n    if( typeof query === 'undefined' ) {\r\n        query = element;\r\n        element = window.document;\r\n    }\r\n    return element.querySelector( query );\r\n}\r\n\r\nfunction detach( element ) {\r\n    var parent = element.parentElement;\r\n    if( !parent ) return parent;\r\n    parent.removeChild( element );\r\n    return parent;\r\n}\r\n\r\nfunction elem( target ) {\r\n    var args = [].slice.call( arguments );\r\n    args.shift();\r\n    if (args.length == 0) args = ['div'];\r\n    args.push('dom', 'custom');\r\n    var e;\r\n    if (typeof args[0].element !== 'undefined') {\r\n        e = args[0].element;\r\n        addClass( e, 'dom', 'custom' );\r\n    } else if (typeof args[0].appendChild === 'function') {\r\n        e = args[0];\r\n        addClass( e, 'dom', 'custom' );\r\n    } else {\r\n        e = exports.tag.apply( exports, args );\r\n    }\r\n    Object.defineProperty( target, 'element', {\r\n        value: e, writable: false, configurable: false, enumerable: true\r\n    });\r\n    DB.propBoolean(target, 'wide')(function(v) {\r\n        if (v) {\r\n            addClass(e, 'wide');\r\n        } else {\r\n            removeClass(e, 'wide');\r\n        }\r\n    });\r\n    DB.propBoolean(target, 'visible')(function(v) {\r\n        if (v) {\r\n            removeClass(e, 'hide');\r\n        } else {\r\n            addClass(e, 'hide');\r\n        }\r\n    });\r\n    return e;\r\n}\r\n\r\nfunction textOrHtml( element, content ) {\r\n    if (typeof content !== 'string') content = JSON.stringify( content );\r\n    if (content.substr(0, 6) == '<html>') {\r\n        element.innerHTML = content.substr(6);\r\n    } else {\r\n        element.textContent = content;\r\n    }\r\n    return element;\r\n}\r\n\r\n\r\n\r\n \r\n/**\n * @module dom\n * @see module:dom\n * @see module:polyfill.classList\n * @see module:tfw.data-binding\n\n */\n});","zip":"require(\"dom\",function(e,t){function n(e,t,n){return Object.defineProperty(e,\"element\",{value:t,writable:!1,configurable:!1,enumerable:!0}),n?e:(e.on=s.bind(e,t),e.css=o.bind(e,t),e.add=l.bind(e,t),e.att=i.bind(e,t),e.addClass=d.bind(e,t),e.hasClass=u.bind(e,t),e.removeClass=f.bind(e,t),e.toggleClass=m.bind(e,t),e)}function r(e,t){return t.parentNode.replaceChild(e,t),e}function o(e,t){var n,r;for(n in t)r=t[n],e.style[n]=r;return e}function i(e,t,n){var r,o;\"string\"==typeof t&&(r=t,t={},t[r]=n);for(r in t)o=t[r],e.setAttribute(r,o);return e}function a(e,t){return e.removeAttribute(t),e}function l(e){try{var t,n;for(t=1;t<arguments.length;t++)n=arguments[t],\"string\"==typeof n||\"number\"==typeof n?n=document.createTextNode(n):\"function\"==typeof n.element?n=n.element():\"undefined\"!=typeof n.element&&(n=n.element),e.appendChild(n);return e}catch(r){throw console.error(\"[DOM.add] arguments=\",[].slice.call(arguments)),Error(\"[DOM.add] \"+r)}}function s(e,t,n){if(\"function\"!=typeof t&&null!==t||(t={tap:t}),Array.isArray(e))return e.forEach(function(e){s(e,t)}),e;\"undefined\"==typeof e[b]&&(e[b]=interact(e));var r,o;for(r in t)o=t[r],\"keydown\"==r||\"keyup\"==r?e.addEventListener(r,o):e[b].on(r,o);return e}function c(e,t){try{var n,r,o,i,a=document.createElementNS(e,t);for(n=2;n<arguments.length;n++)if(r=arguments[n],Array.isArray(r))r.forEach(function(e){switch(typeof e){case\"string\":case\"number\":case\"boolean\":e=document.createTextNode(\"\"+e)}l(a,e)});else switch(typeof r){case\"string\":r.split(\" \").forEach(function(e){e.length>0&&d(a,e)});break;case\"object\":for(o in r)i=r[o],a.setAttribute(o,i);break;default:throw Error(\"[dom.tag] Error creating <\"+t+\">: Invalid argument #\"+n+\"!\")}return a}catch(s){console.error(\"[dom.tagNS] Error with `ns` = \",e,\" and `name` = \",t),console.error(s)}}function d(e){var t=[].slice.call(arguments,1);return Array.isArray(e)?(t.unshift(null),e.forEach(function(e){t[0]=e,d.apply(void 0,t)}),e):(t.forEach(function(t){if(\"string\"==typeof t){if(t=t.trim(),0==t.length)return;try{e.classList.add(t)}catch(n){console.error(\"[dom.addClass] Invalid class name: \",t),console.error(n)}}}),e)}function u(e,t){return e.classList.contains(t)}function f(e){var t=[].slice.call(arguments,1);return Array.isArray(e)?(t.unshift(null),e.forEach(function(e){t[0]=e,f.apply(void 0,t)}),e):(t.forEach(function(t){try{e.classList.remove(t)}catch(n){console.error(\"[dom.removeClass] Invalid class name: \",t),console.error(n)}}),e)}function m(e){var t=[].slice.call(arguments,1);return t.forEach(function(t){u(e,t)?f(e,t):d(e,t)}),e}function h(e){for(var t=e;t.firstChild;)t.removeChild(t.firstChild);var n=[].slice.call(arguments);return n.length>1&&l.apply(this,n),e}function p(e,t){return\"undefined\"==typeof t&&(t=e,e=window.document),e.querySelector(t)}function w(e){var t=e.parentElement;return t?(t.removeChild(e),t):t}function v(t){var n=[].slice.call(arguments);n.shift(),0==n.length&&(n=[\"div\"]),n.push(\"dom\",\"custom\");var r;return\"undefined\"!=typeof n[0].element?(r=n[0].element,d(r,\"dom\",\"custom\")):\"function\"==typeof n[0].appendChild?(r=n[0],d(r,\"dom\",\"custom\")):r=e.tag.apply(e,n),Object.defineProperty(t,\"element\",{value:r,writable:!1,configurable:!1,enumerable:!0}),y.propBoolean(t,\"wide\")(function(e){e?d(r,\"wide\"):f(r,\"wide\")}),y.propBoolean(t,\"visible\")(function(e){e?f(r,\"hide\"):d(r,\"hide\")}),r}function g(e,t){return\"string\"!=typeof t&&(t=JSON.stringify(t)),\"<html>\"==t.substr(0,6)?e.innerHTML=t.substr(6):e.textContent=t,e}require(\"polyfill.classList\");var y=require(\"tfw.data-binding\"),b=\"dom\"+Date.now();e.tagNS=c,e.svgRoot=c.bind(void 0,\"http://www.w3.org/2000/svg\",\"svg\",{version:\"1.1\",\"xmlns:svg\":\"http://www.w3.org/2000/svg\",xmlns:\"http://www.w3.org/2000/svg\",\"xmlns:xlink\":\"http://www.w3.org/1999/xlink\"}),e.svg=c.bind(void 0,\"http://www.w3.org/2000/svg\"),e.tag=c.bind(void 0,\"http://www.w3.org/1999/xhtml\"),e.div=c.bind(void 0,\"http://www.w3.org/1999/xhtml\",\"div\"),e.txt=window.document.createTextNode.bind(window.document),e.textOrHtml=g,e.get=p,e.elem=v,e.css=o,e.att=i,e.removeAtt=a,e.addClass=d,e.hasClass=u,e.removeClass=f,e.toggleClass=m,e.replace=r,e.detach=w,e.on=s,e.add=l,e.wrap=n,e.clear=h});\n//# sourceMappingURL=dom.js.map","map":{"version":3,"file":"dom.js.map","sources":["dom.js"],"sourcesContent":["/** @module dom */require( 'dom', function(exports, module) {  /**\r\n * @module dom\r\n *\r\n * @description\r\n * Functions which facilitate DOm manipulations.\r\n * Included __interact.js__. You can find documentation for it here:\r\n * [http://interactjs.io/docs/]\r\n *\r\n * @example\r\n * var mod = require('dom');\r\n */\r\nrequire(\"polyfill.classList\");\r\nvar DB = require(\"tfw.data-binding\");\r\n\r\n// Used to store data on the DOM element without colliding with existing attributes.\r\nvar SYMBOL = 'dom' + Date.now();\r\n\r\n\r\nexports.tagNS = tagNS;\r\nexports.svgRoot = tagNS.bind( undefined, \"http://www.w3.org/2000/svg\", \"svg\", {\r\n    version: '1.1',\r\n    'xmlns:svg': 'http://www.w3.org/2000/svg',\r\n    xmlns: 'http://www.w3.org/2000/svg',\r\n    'xmlns:xlink': 'http://www.w3.org/1999/xlink'\r\n});\r\nexports.svg = tagNS.bind( undefined, \"http://www.w3.org/2000/svg\" );\r\nexports.tag = tagNS.bind( undefined, \"http://www.w3.org/1999/xhtml\" );\r\nexports.div = tagNS.bind( undefined, \"http://www.w3.org/1999/xhtml\", \"div\" );\r\nexports.txt = window.document.createTextNode.bind( window.document );\r\nexports.textOrHtml = textOrHtml;\r\nexports.get = get;\r\n/**\r\n * Add a readonly `element` property to `obj` and return it.\r\n */\r\nexports.elem = elem;\r\n/**\r\n * Apply css rules on `element`.\r\n *\r\n * @return `element`.\r\n *\r\n * @example\r\n * var $ = require('dom');\r\n * $.css( element, { width: '800px'. height: '600px' });\r\n */\r\nexports.css = css;\r\nexports.att = att;\r\nexports.removeAtt = removeAtt;\r\nexports.addClass = addClass;\r\nexports.hasClass = hasClass;\r\nexports.removeClass = removeClass;\r\nexports.toggleClass = toggleClass;\r\n/**\r\n * @param newElem {Element} - Replacement element.\r\n * @param oldElem {Element} - Element to replace.\r\n */\r\nexports.replace = replace;\r\n/**\r\n * Remove element from its parent.\r\n * @param element {Element} - Element to detach from its parent.\r\n * @return The parent element.\r\n */\r\nexports.detach = detach;\r\n/**\r\n * Add event handlers to one or many elements.\r\n *\r\n * @param {object|array}  element -  list of  elements on  which apply\r\n * events handlers.\r\n *\r\n * @param  {object|function} slots  - If  a function  is given,  it is\r\n * considered as a slot for the event `tap`.  Otherwise, the object is\r\n * a map  between events' names (the  key) and function to  handle the\r\n * event (the value).\r\n * Events' names are:\r\n * * __tap__: When  the element is  pressed and released in  less than\r\n 900 ms and without too much sliding.\r\n * * __doubletap__\r\n * * __dragmove__\r\n *\r\n * @param {boolean} capture - If `true` events are captured before they reach the children.\r\n *\r\n * @example\r\n *    DOM.on( [screen, button], function() {...} );\r\n *    DOM.on( body, null );   // Do nothing, but stop propagation.\r\n *    DOM.on( element, { tap: function() {...} } );\r\n */\r\nexports.on = on;\r\n/**\r\n * Append all the `children` to `element`.\r\n * @param element\r\n * @param ...children\r\n */\r\nexports.add = add;\r\n/**\r\n * Add the attribute `element` and the following functions to `obj`:\r\n * * __css__\r\n * * __addClass__\r\n * * __removeClass__\r\n * * __toggleClass__\r\n */\r\nexports.wrap = wrap;\r\n/**\r\n * Remove all children of the `element`.\r\n * @param element {Element} - Element from which remove all the children.\r\n */\r\nexports.clear = clear;\r\n\r\nfunction wrap( obj, element, nomethods ) {\r\n    Object.defineProperty( obj, 'element', {\r\n        value: element, writable: false, configurable: false, enumerable: true\r\n    });\r\n    if( nomethods ) return obj;\r\n\r\n    obj.on = on.bind( obj, element );\r\n    obj.css = css.bind( obj, element );\r\n    obj.add = add.bind( obj, element );\r\n    obj.att = att.bind( obj, element );\r\n    obj.addClass = addClass.bind( obj, element );\r\n    obj.hasClass = hasClass.bind( obj, element );\r\n    obj.removeClass = removeClass.bind( obj, element );\r\n    obj.toggleClass = toggleClass.bind( obj, element );\r\n    return obj;\r\n}\r\n\r\nfunction replace( newElem, oldElem ) {\r\n    oldElem.parentNode.replaceChild( newElem, oldElem );\r\n    return newElem;\r\n}\r\n\r\nfunction css( element, styles ) {\r\n    var key, val;\r\n    for( key in styles ) {\r\n        val = styles[key];\r\n        element.style[key] = val;\r\n    }\r\n    return element;\r\n}\r\n\r\nfunction att( element, attribs, value ) {\r\n    var key, val;\r\n    if (typeof attribs === 'string') {\r\n        key = attribs;\r\n        attribs = {};\r\n        attribs[key] = value;\r\n    }\r\n    for( key in attribs ) {\r\n        val = attribs[key];\r\n        element.setAttribute( key, val );\r\n    }\r\n    return element;\r\n}\r\n\r\nfunction removeAtt( element, attrib ) {\r\n    element.removeAttribute( attrib );\r\n    return element;\r\n}\r\n\r\nfunction add( element ) {\r\n    try {\r\n        var i, child;\r\n        for (i = 1 ; i < arguments.length ; i++) {\r\n            child = arguments[i];\r\n            if( typeof child === 'string' || typeof child === 'number' ) {\r\n                child = document.createTextNode( child );\r\n            }\r\n            else if( typeof child.element === 'function' ) {\r\n                // Backward compatibility with Widgets.\r\n                child = child.element();\r\n            }\r\n            else if( typeof child.element !== 'undefined' ) {\r\n                child = child.element;\r\n            }\r\n            element.appendChild( child );\r\n        }\r\n        return element;\r\n    }\r\n    catch( ex ) {\r\n        console.error( \"[DOM.add] arguments=\", [].slice.call( arguments ) );\r\n        throw Error( \"[DOM.add] \" + ex );\r\n    }\r\n}\r\n\r\nfunction on( element, slots, capture ) {\r\n    // If only a function is passed, we consider this is a Tap event.\r\n    if( typeof slots === 'function' || slots === null ) slots = { tap: slots };\r\n\r\n    if( Array.isArray( element ) ) {\r\n        element.forEach(function ( elem ) {\r\n            on( elem, slots );\r\n        });\r\n        return element;\r\n    }\r\n\r\n    if( typeof element[SYMBOL] === 'undefined' ) {\r\n        element[SYMBOL] = interact(element);\r\n    }\r\n\r\n    var key, val;\r\n    for( key in slots ) {\r\n        val = slots[key];\r\n        if (key == 'keydown' || key == 'keyup') {\r\n            element.addEventListener( key, val );\r\n        } else {\r\n            element[SYMBOL].on( key, val );\r\n        }\r\n    }\r\n\r\n    return element;\r\n}\r\n\r\nfunction tagNS( ns, name ) {\r\n    try {\r\n        var e = document.createElementNS( ns, name );\r\n        var i, arg, key, val;\r\n        for (i = 2 ; i < arguments.length ; i++) {\r\n            arg = arguments[i];\r\n            if( Array.isArray(arg) ) {\r\n                // Array are for children.\r\n                arg.forEach(function (child) {\r\n                    switch( typeof child ) {\r\n                    case 'string':\r\n                    case 'number':\r\n                    case 'boolean':\r\n                        child = document.createTextNode( \"\" + child );\r\n                        break;\r\n                    }\r\n                    add( e, child );\r\n                });\r\n            } else {\r\n                switch( typeof arg ) {\r\n                case \"string\":\r\n                    arg.split( ' ' ).forEach(function ( item ) {\r\n                        if( item.length > 0 ) {\r\n                            addClass(e, item);\r\n                        }\r\n                    });\r\n                    break;\r\n                case \"object\":\r\n                    for( key in arg ) {\r\n                        val = arg[key];\r\n                        e.setAttribute( key, val );\r\n                    }\r\n                    break;\r\n                default:\r\n                    throw Error(\"[dom.tag] Error creating <\" + name + \">: Invalid argument #\" + i + \"!\");\r\n                }\r\n            }\r\n        }\r\n        return e;\r\n    }\r\n    catch (ex) {\r\n        console.error(\"[dom.tagNS] Error with `ns` = \", ns, \" and `name` = \", name);\r\n        console.error(ex);\r\n    }\r\n};\r\n\r\n\r\nfunction addClass(elem) {\r\n    var args = [].slice.call( arguments, 1 );\r\n    if( Array.isArray( elem ) ) {\r\n        // Loop on each element.\r\n        args.unshift( null );\r\n        elem.forEach(function ( child ) {\r\n            args[0] = child;\r\n            addClass.apply( undefined, args );\r\n        });\r\n        return elem;\r\n    }\r\n    args.forEach(function (className) {\r\n        if( typeof className === 'string' ) {\r\n            className = className.trim();\r\n            if( className.length == 0 ) return;\r\n            try {\r\n                elem.classList.add( className );\r\n            }\r\n            catch( ex ) {\r\n                console.error( \"[dom.addClass] Invalid class name: \", className );\r\n                console.error( ex );\r\n            }\r\n        }\r\n    });\r\n    return elem;\r\n}\r\n\r\n\r\nfunction hasClass( elem, className ) {\r\n    return elem.classList.contains( className );\r\n}\r\n\r\n\r\nfunction removeClass(elem) {\r\n    var args = [].slice.call( arguments, 1 );\r\n    if( Array.isArray( elem ) ) {\r\n        // Loop on each element.\r\n        args.unshift( null );\r\n        elem.forEach(function ( child ) {\r\n            args[0] = child;\r\n            removeClass.apply( undefined, args );\r\n        });\r\n        return elem;\r\n    }\r\n    args.forEach(function (className) {\r\n        try {\r\n            elem.classList.remove( className );\r\n        }\r\n        catch( ex ) {\r\n            console.error( \"[dom.removeClass] Invalid class name: \", className );\r\n            console.error( ex );\r\n        }\r\n    });\r\n    return elem;\r\n}\r\n\r\n\r\nfunction toggleClass(elem) {\r\n    var args = [].slice.call( arguments, 1 );\r\n    args.forEach(function( className ) {\r\n        if( hasClass( elem, className ) ) {\r\n            removeClass( elem, className );\r\n        } else {\r\n            addClass( elem, className );\r\n        }\r\n    });\r\n    return elem;\r\n}\r\n\r\n\r\nfunction clear( element ) {\r\n    // (!) On préfère retirer les éléments un par un du DOM plutôt que d'utiliser simplement\r\n    // this.html(\"\").\r\n    // En effet, le code simplifié a des conséquences inattendues dans IE9 et IE10 au moins.\r\n    // Le bug des markers qui disparaissaients sur les cartes de Trail-Passion 4 a été corrigé\r\n    // avec cette modification.\r\n    var e = element;\r\n    while(e.firstChild){\r\n        e.removeChild(e.firstChild);\r\n    }\r\n    var args = [].slice.call( arguments );\r\n    if( args.length > 1 ) {\r\n        add.apply( this, args );\r\n    }\r\n    return element;\r\n}\r\n\r\nfunction get( element, query ) {\r\n    if( typeof query === 'undefined' ) {\r\n        query = element;\r\n        element = window.document;\r\n    }\r\n    return element.querySelector( query );\r\n}\r\n\r\nfunction detach( element ) {\r\n    var parent = element.parentElement;\r\n    if( !parent ) return parent;\r\n    parent.removeChild( element );\r\n    return parent;\r\n}\r\n\r\nfunction elem( target ) {\r\n    var args = [].slice.call( arguments );\r\n    args.shift();\r\n    if (args.length == 0) args = ['div'];\r\n    args.push('dom', 'custom');\r\n    var e;\r\n    if (typeof args[0].element !== 'undefined') {\r\n        e = args[0].element;\r\n        addClass( e, 'dom', 'custom' );\r\n    } else if (typeof args[0].appendChild === 'function') {\r\n        e = args[0];\r\n        addClass( e, 'dom', 'custom' );\r\n    } else {\r\n        e = exports.tag.apply( exports, args );\r\n    }\r\n    Object.defineProperty( target, 'element', {\r\n        value: e, writable: false, configurable: false, enumerable: true\r\n    });\r\n    DB.propBoolean(target, 'wide')(function(v) {\r\n        if (v) {\r\n            addClass(e, 'wide');\r\n        } else {\r\n            removeClass(e, 'wide');\r\n        }\r\n    });\r\n    DB.propBoolean(target, 'visible')(function(v) {\r\n        if (v) {\r\n            removeClass(e, 'hide');\r\n        } else {\r\n            addClass(e, 'hide');\r\n        }\r\n    });\r\n    return e;\r\n}\r\n\r\nfunction textOrHtml( element, content ) {\r\n    if (typeof content !== 'string') content = JSON.stringify( content );\r\n    if (content.substr(0, 6) == '<html>') {\r\n        element.innerHTML = content.substr(6);\r\n    } else {\r\n        element.textContent = content;\r\n    }\r\n    return element;\r\n}\r\n\r\n\r\n\r\n \r\n});"],"names":["require","exports","module","wrap","obj","element","nomethods","Object","defineProperty","value","writable","configurable","enumerable","on","bind","css","add","att","addClass","hasClass","removeClass","toggleClass","replace","newElem","oldElem","parentNode","replaceChild","styles","key","val","style","attribs","setAttribute","removeAtt","attrib","removeAttribute","i","child","arguments","length","document","createTextNode","appendChild","ex","console","error","slice","call","Error","slots","capture","tap","Array","isArray","forEach","elem","SYMBOL","interact","addEventListener","tagNS","ns","name","arg","e","createElementNS","split","item","args","unshift","apply","undefined","className","trim","classList","contains","remove","clear","firstChild","removeChild","this","get","query","window","querySelector","detach","parent","parentElement","target","shift","push","tag","DB","propBoolean","v","textOrHtml","content","JSON","stringify","substr","innerHTML","textContent","Date","now","svgRoot","version","xmlns:svg","xmlns","xmlns:xlink","svg","div","txt"],"mappings":"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"},"dependencies":["mod/dom","mod/polyfill.classList","mod/tfw.data-binding"]}