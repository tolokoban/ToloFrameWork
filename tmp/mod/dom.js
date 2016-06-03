{"intl":"","src":"/** @module dom */require( 'dom', function(exports, module) {  /**\n * @module dom\n *\n * @description\n * Functions which facilitate DOm manipulations.\n * Included __interact.js__. You can find documentation for it here:\n * [http://interactjs.io/docs/]\n *\n * @example\n * var mod = require('dom');\n */\nrequire(\"polyfill.classList\");\nvar DB = require(\"tfw.data-binding\");\n\n// Used to store data on the DOM element without colliding with existing attributes.\nvar SYMBOL = 'dom' + Date.now();\n\n\nexports.tagNS = tagNS;\nexports.svgRoot = tagNS.bind( undefined, \"http://www.w3.org/2000/svg\", \"svg\", {\n    version: '1.1',\n    'xmlns:svg': 'http://www.w3.org/2000/svg',\n    xmlns: 'http://www.w3.org/2000/svg',\n    'xmlns:xlink': 'http://www.w3.org/1999/xlink'\n});\nexports.svg = tagNS.bind( undefined, \"http://www.w3.org/2000/svg\" );\nexports.tag = tagNS.bind( undefined, \"http://www.w3.org/1999/xhtml\" );\nexports.div = tagNS.bind( undefined, \"http://www.w3.org/1999/xhtml\", \"div\" );\nexports.txt = window.document.createTextNode.bind( window.document );\nexports.textOrHtml = textOrHtml;\nexports.get = get;\n/**\n * Add a readonly `element` property to `obj` and return it.\n */\nexports.elem = elem;\n/**\n * Apply css rules on `element`.\n *\n * @return `element`.\n *\n * @example\n * var $ = require('dom');\n * $.css( element, { width: '800px'. height: '600px' });\n */\nexports.css = css;\nexports.att = att;\nexports.removeAtt = removeAtt;\nexports.addClass = addClass;\nexports.hasClass = hasClass;\nexports.removeClass = removeClass;\nexports.toggleClass = toggleClass;\n/**\n * @param newElem {Element} - Replacement element.\n * @param oldElem {Element} - Element to replace.\n */\nexports.replace = replace;\n/**\n * Remove element from its parent.\n * @param element {Element} - Element to detach from its parent.\n * @return The parent element.\n */\nexports.detach = detach;\n/**\n * Add event handlers to one or many elements.\n *\n * @param {object|array}  element -  list of  elements on  which apply\n * events handlers.\n *\n * @param  {object|function} slots  - If  a function  is given,  it is\n * considered as a slot for the event `tap`.  Otherwise, the object is\n * a map  between events' names (the  key) and function to  handle the\n * event (the value).\n * Events' names are:\n * * __tap__: When  the element is  pressed and released in  less than\n     900 ms and without too much sliding.\n * * __doubletap__\n * * __dragmove__\n *\n * @param {boolean} capture - If `true` events are captured before they reach the children.\n *\n * @example\n *    DOM.on( [screen, button], function() {...} );\n *    DOM.on( body, null );   // Do nothing, but stop propagation.\n *    DOM.on( element, { tap: function() {...} } );\n */\nexports.on = on;\n/**\n * Append all the `children` to `element`.\n * @param element\n * @param ...children\n */\nexports.add = add;\n/**\n * Add the attribute `element` and the following functions to `obj`:\n * * __css__\n * * __addClass__\n * * __removeClass__\n * * __toggleClass__\n */\nexports.wrap = wrap;\n/**\n * Remove all children of the `element`.\n * @param element {Element} - Element from which remove all the children.\n */\nexports.clear = clear;\n\nfunction wrap( obj, element, nomethods ) {\n    Object.defineProperty( obj, 'element', {\n        value: element, writable: false, configurable: false, enumerable: true\n    });\n    if( nomethods ) return obj;\n\n    obj.on = on.bind( obj, element );\n    obj.css = css.bind( obj, element );\n    obj.add = add.bind( obj, element );\n    obj.att = att.bind( obj, element );\n    obj.addClass = addClass.bind( obj, element );\n    obj.hasClass = hasClass.bind( obj, element );\n    obj.removeClass = removeClass.bind( obj, element );\n    obj.toggleClass = toggleClass.bind( obj, element );\n    return obj;\n}\n\nfunction replace( newElem, oldElem ) {\n    oldElem.parentNode.replaceChild( newElem, oldElem );\n    return newElem;\n}\n\nfunction css( element, styles ) {\n    var key, val;\n    for( key in styles ) {\n        val = styles[key];\n        element.style[key] = val;\n    }\n    return element;\n}\n\nfunction att( element, attribs, value ) {\n    var key, val;\n    if (typeof attribs === 'string') {\n        key = attribs;\n        attribs = {};\n        attribs[key] = value;\n    }\n    for( key in attribs ) {\n        val = attribs[key];\n        element.setAttribute( key, val );\n    }\n    return element;\n}\n\nfunction removeAtt( element, attrib ) {\n    element.removeAttribute( attrib );\n    return element;\n}\n\nfunction add( element ) {\n    try {\n        var i, child;\n        for (i = 1 ; i < arguments.length ; i++) {\n            child = arguments[i];\n            if( typeof child === 'string' || typeof child === 'number' ) {\n                child = document.createTextNode( child );\n            }\n            else if( typeof child.element === 'function' ) {\n                // Backward compatibility with Widgets.\n                child = child.element();\n            }\n            element.appendChild( child );\n        }\n        return element;\n    }\n    catch( ex ) {\n        console.error( \"[DOM.add] arguments=\", [].slice.call( arguments ) );\n        throw Error( \"[DOM.add] \" + ex );\n    }\n}\n\nfunction on( element, slots, capture ) {\n    // If only a function is passed, we consider this is a Tap event.\n    if( typeof slots === 'function' || slots === null ) slots = { tap: slots };\n\n    if( Array.isArray( element ) ) {\n        element.forEach(function ( elem ) {\n            on( elem, slots );\n        });\n        return element;\n    }\n\n    if( typeof element[SYMBOL] === 'undefined' ) {\n        element[SYMBOL] = interact(element);\n    }\n\n    var key, val;\n    for( key in slots ) {\n        val = slots[key];\n        if (key == 'keydown' || key == 'keyup') {\n            element.addEventListener( key, val );\n        } else {\n            element[SYMBOL].on( key, val );\n        }\n    }\n\n    return element;\n}\n\nfunction tagNS( ns, name ) {\n    var e = document.createElementNS( ns, name );\n    var i, arg, key, val;\n    for (i = 2 ; i < arguments.length ; i++) {\n        arg = arguments[i];\n        if( Array.isArray(arg) ) {\n            // Array are for children.\n            arg.forEach(function (child) {\n                switch( typeof child ) {\n                case 'string':\n                case 'number':\n                case 'boolean':\n                    child = document.createTextNode( \"\" + child );\n                    break;\n                }\n                add( e, child );\n            });\n        } else {\n            switch( typeof arg ) {\n            case \"string\":\n                arg.split( ' ' ).forEach(function ( item ) {\n                    if( item.length > 0 ) {\n                        addClass(e, item);\n                    }\n                });\n                break;\n            case \"object\":\n                for( key in arg ) {\n                    val = arg[key];\n                    e.setAttribute( key, val );\n                }\n                break;\n            default:\n                throw Error(\"[dom.tag] Error creating <\" + name + \">: Invalid argument #\" + i + \"!\");\n            }\n        }\n    }\n    return e;\n};\n\n\nfunction addClass(elem) {\n    var args = [].slice.call( arguments, 1 );\n    if( Array.isArray( elem ) ) {\n        // Loop on each element.\n        args.unshift( null );\n        elem.forEach(function ( child ) {\n            args[0] = child;\n            addClass.apply( undefined, args );\n        });\n        return elem;\n    }\n    args.forEach(function (className) {\n        if( typeof className === 'string' ) {\n            className = className.trim();\n            if( className.length == 0 ) return;\n            try {\n                elem.classList.add( className );\n            }\n            catch( ex ) {\n                console.error( \"[dom.addClass] Invalid class name: \", className );\n                console.error( ex );\n            }\n        }\n    });\n    return elem;\n}\n\n\nfunction hasClass( elem, className ) {\n    return elem.classList.contains( className );\n}\n\n\nfunction removeClass(elem) {\n    var args = [].slice.call( arguments, 1 );\n    if( Array.isArray( elem ) ) {\n        // Loop on each element.\n        args.unshift( null );\n        elem.forEach(function ( child ) {\n            args[0] = child;\n            removeClass.apply( undefined, args );\n        });\n        return elem;\n    }\n    args.forEach(function (className) {\n        try {\n            elem.classList.remove( className );\n        }\n        catch( ex ) {\n            console.error( \"[dom.removeClass] Invalid class name: \", className );\n            console.error( ex );\n        }\n    });\n    return elem;\n}\n\n\nfunction toggleClass(elem) {\n    var args = [].slice.call( arguments, 1 );\n    args.forEach(function( className ) {\n        if( hasClass( elem, className ) ) {\n            removeClass( elem, className );\n        } else {\n            addClass( elem, className );\n        }\n    });\n    return elem;\n}\n\n\nfunction clear( element ) {\n    // (!) On préfère retirer les éléments un par un du DOM plutôt que d'utiliser simplement\n    // this.html(\"\").\n    // En effet, le code simplifié a des conséquences inattendues dans IE9 et IE10 au moins.\n    // Le bug des markers qui disparaissaients sur les cartes de Trail-Passion 4 a été corrigé\n    // avec cette modification.\n    var e = element;\n    while(e.firstChild){\n        e.removeChild(e.firstChild);\n    }\n    var args = [].slice.call( arguments );\n    if( args.length > 1 ) {\n        add.apply( this, args );\n    }\n    return element;\n}\n\nfunction get( element, query ) {\n    if( typeof query === 'undefined' ) {\n        query = element;\n        element = window.document;\n    }\n    return element.querySelector( query );\n}\n\nfunction detach( element ) {\n    var parent = element.parentElement;\n    if( !parent ) return parent;\n    parent.removeChild( element );\n    return parent;\n}\n\nfunction elem( target ) {\n    var args = [].slice.call( arguments );\n    args.shift();\n    if (args.length == 0) args = ['div'];\n    args.push('dom', 'custom');\n    var e = exports.tag.apply( exports, args );\n    Object.defineProperty( target, 'element', {\n        value: e, writable: false, configurable: false, enumerable: true\n    });\n    DB.propBoolean(target, 'wide')(function(v) {\n        if (v) {\n            addClass(e, 'wide');\n        } else {\n            removeClass(e, 'wide');\n        }\n    });\n    DB.propBoolean(target, 'visible')(function(v) {\n        if (v) {\n            removeClass(e, 'hide');\n        } else {\n            addClass(e, 'hide');\n        }\n    });\n    return e;\n}\n\nfunction textOrHtml( element, content ) {\n    if (typeof content !== 'string') content = JSON.stringify( content );\n    if (content.substr(0, 6) == '<html>') {\n        element.innerHTML = content.substr(6);\n    } else {\n        element.textContent = content;\n    }\n    return element;\n}\n\n\n\n \n/**\n * @module dom\n * @see module:dom\n * @see module:polyfill.classList\n * @see module:tfw.data-binding\n\n */\n});","zip":"require(\"dom\",function(e,t){function r(e,t,r){return Object.defineProperty(e,\"element\",{value:t,writable:!1,configurable:!1,enumerable:!0}),r?e:(e.on=s.bind(e,t),e.css=o.bind(e,t),e.add=l.bind(e,t),e.att=i.bind(e,t),e.addClass=d.bind(e,t),e.hasClass=u.bind(e,t),e.removeClass=f.bind(e,t),e.toggleClass=h.bind(e,t),e)}function n(e,t){return t.parentNode.replaceChild(e,t),e}function o(e,t){var r,n;for(r in t)n=t[r],e.style[r]=n;return e}function i(e,t,r){var n,o;\"string\"==typeof t&&(n=t,t={},t[n]=r);for(n in t)o=t[n],e.setAttribute(n,o);return e}function a(e,t){return e.removeAttribute(t),e}function l(e){try{var t,r;for(t=1;t<arguments.length;t++)r=arguments[t],\"string\"==typeof r||\"number\"==typeof r?r=document.createTextNode(r):\"function\"==typeof r.element&&(r=r.element()),e.appendChild(r);return e}catch(n){throw console.error(\"[DOM.add] arguments=\",[].slice.call(arguments)),Error(\"[DOM.add] \"+n)}}function s(e,t,r){if(\"function\"!=typeof t&&null!==t||(t={tap:t}),Array.isArray(e))return e.forEach(function(e){s(e,t)}),e;\"undefined\"==typeof e[y]&&(e[y]=interact(e));var n,o;for(n in t)o=t[n],\"keydown\"==n||\"keyup\"==n?e.addEventListener(n,o):e[y].on(n,o);return e}function c(e,t){var r,n,o,i,a=document.createElementNS(e,t);for(r=2;r<arguments.length;r++)if(n=arguments[r],Array.isArray(n))n.forEach(function(e){switch(typeof e){case\"string\":case\"number\":case\"boolean\":e=document.createTextNode(\"\"+e)}l(a,e)});else switch(typeof n){case\"string\":n.split(\" \").forEach(function(e){e.length>0&&d(a,e)});break;case\"object\":for(o in n)i=n[o],a.setAttribute(o,i);break;default:throw Error(\"[dom.tag] Error creating <\"+t+\">: Invalid argument #\"+r+\"!\")}return a}function d(e){var t=[].slice.call(arguments,1);return Array.isArray(e)?(t.unshift(null),e.forEach(function(e){t[0]=e,d.apply(void 0,t)}),e):(t.forEach(function(t){if(\"string\"==typeof t){if(t=t.trim(),0==t.length)return;try{e.classList.add(t)}catch(r){console.error(\"[dom.addClass] Invalid class name: \",t),console.error(r)}}}),e)}function u(e,t){return e.classList.contains(t)}function f(e){var t=[].slice.call(arguments,1);return Array.isArray(e)?(t.unshift(null),e.forEach(function(e){t[0]=e,f.apply(void 0,t)}),e):(t.forEach(function(t){try{e.classList.remove(t)}catch(r){console.error(\"[dom.removeClass] Invalid class name: \",t),console.error(r)}}),e)}function h(e){var t=[].slice.call(arguments,1);return t.forEach(function(t){u(e,t)?f(e,t):d(e,t)}),e}function v(e){for(var t=e;t.firstChild;)t.removeChild(t.firstChild);var r=[].slice.call(arguments);return r.length>1&&l.apply(this,r),e}function w(e,t){return\"undefined\"==typeof t&&(t=e,e=window.document),e.querySelector(t)}function m(e){var t=e.parentElement;return t?(t.removeChild(e),t):t}function p(t){var r=[].slice.call(arguments);r.shift(),0==r.length&&(r=[\"div\"]),r.push(\"dom\",\"custom\");var n=e.tag.apply(e,r);return Object.defineProperty(t,\"element\",{value:n,writable:!1,configurable:!1,enumerable:!0}),b.propBoolean(t,\"wide\")(function(e){e?d(n,\"wide\"):f(n,\"wide\")}),b.propBoolean(t,\"visible\")(function(e){e?f(n,\"hide\"):d(n,\"hide\")}),n}function g(e,t){return\"string\"!=typeof t&&(t=JSON.stringify(t)),\"<html>\"==t.substr(0,6)?e.innerHTML=t.substr(6):e.textContent=t,e}require(\"polyfill.classList\");var b=require(\"tfw.data-binding\"),y=\"dom\"+Date.now();e.tagNS=c,e.svgRoot=c.bind(void 0,\"http://www.w3.org/2000/svg\",\"svg\",{version:\"1.1\",\"xmlns:svg\":\"http://www.w3.org/2000/svg\",xmlns:\"http://www.w3.org/2000/svg\",\"xmlns:xlink\":\"http://www.w3.org/1999/xlink\"}),e.svg=c.bind(void 0,\"http://www.w3.org/2000/svg\"),e.tag=c.bind(void 0,\"http://www.w3.org/1999/xhtml\"),e.div=c.bind(void 0,\"http://www.w3.org/1999/xhtml\",\"div\"),e.txt=window.document.createTextNode.bind(window.document),e.textOrHtml=g,e.get=w,e.elem=p,e.css=o,e.att=i,e.removeAtt=a,e.addClass=d,e.hasClass=u,e.removeClass=f,e.toggleClass=h,e.replace=n,e.detach=m,e.on=s,e.add=l,e.wrap=r,e.clear=v});\n//# sourceMappingURL=dom.js.map","map":{"version":3,"file":"dom.js.map","sources":["dom.js"],"sourcesContent":["/** @module dom */require( 'dom', function(exports, module) {  /**\n * @module dom\n *\n * @description\n * Functions which facilitate DOm manipulations.\n * Included __interact.js__. You can find documentation for it here:\n * [http://interactjs.io/docs/]\n *\n * @example\n * var mod = require('dom');\n */\nrequire(\"polyfill.classList\");\nvar DB = require(\"tfw.data-binding\");\n\n// Used to store data on the DOM element without colliding with existing attributes.\nvar SYMBOL = 'dom' + Date.now();\n\n\nexports.tagNS = tagNS;\nexports.svgRoot = tagNS.bind( undefined, \"http://www.w3.org/2000/svg\", \"svg\", {\n    version: '1.1',\n    'xmlns:svg': 'http://www.w3.org/2000/svg',\n    xmlns: 'http://www.w3.org/2000/svg',\n    'xmlns:xlink': 'http://www.w3.org/1999/xlink'\n});\nexports.svg = tagNS.bind( undefined, \"http://www.w3.org/2000/svg\" );\nexports.tag = tagNS.bind( undefined, \"http://www.w3.org/1999/xhtml\" );\nexports.div = tagNS.bind( undefined, \"http://www.w3.org/1999/xhtml\", \"div\" );\nexports.txt = window.document.createTextNode.bind( window.document );\nexports.textOrHtml = textOrHtml;\nexports.get = get;\n/**\n * Add a readonly `element` property to `obj` and return it.\n */\nexports.elem = elem;\n/**\n * Apply css rules on `element`.\n *\n * @return `element`.\n *\n * @example\n * var $ = require('dom');\n * $.css( element, { width: '800px'. height: '600px' });\n */\nexports.css = css;\nexports.att = att;\nexports.removeAtt = removeAtt;\nexports.addClass = addClass;\nexports.hasClass = hasClass;\nexports.removeClass = removeClass;\nexports.toggleClass = toggleClass;\n/**\n * @param newElem {Element} - Replacement element.\n * @param oldElem {Element} - Element to replace.\n */\nexports.replace = replace;\n/**\n * Remove element from its parent.\n * @param element {Element} - Element to detach from its parent.\n * @return The parent element.\n */\nexports.detach = detach;\n/**\n * Add event handlers to one or many elements.\n *\n * @param {object|array}  element -  list of  elements on  which apply\n * events handlers.\n *\n * @param  {object|function} slots  - If  a function  is given,  it is\n * considered as a slot for the event `tap`.  Otherwise, the object is\n * a map  between events' names (the  key) and function to  handle the\n * event (the value).\n * Events' names are:\n * * __tap__: When  the element is  pressed and released in  less than\n     900 ms and without too much sliding.\n * * __doubletap__\n * * __dragmove__\n *\n * @param {boolean} capture - If `true` events are captured before they reach the children.\n *\n * @example\n *    DOM.on( [screen, button], function() {...} );\n *    DOM.on( body, null );   // Do nothing, but stop propagation.\n *    DOM.on( element, { tap: function() {...} } );\n */\nexports.on = on;\n/**\n * Append all the `children` to `element`.\n * @param element\n * @param ...children\n */\nexports.add = add;\n/**\n * Add the attribute `element` and the following functions to `obj`:\n * * __css__\n * * __addClass__\n * * __removeClass__\n * * __toggleClass__\n */\nexports.wrap = wrap;\n/**\n * Remove all children of the `element`.\n * @param element {Element} - Element from which remove all the children.\n */\nexports.clear = clear;\n\nfunction wrap( obj, element, nomethods ) {\n    Object.defineProperty( obj, 'element', {\n        value: element, writable: false, configurable: false, enumerable: true\n    });\n    if( nomethods ) return obj;\n\n    obj.on = on.bind( obj, element );\n    obj.css = css.bind( obj, element );\n    obj.add = add.bind( obj, element );\n    obj.att = att.bind( obj, element );\n    obj.addClass = addClass.bind( obj, element );\n    obj.hasClass = hasClass.bind( obj, element );\n    obj.removeClass = removeClass.bind( obj, element );\n    obj.toggleClass = toggleClass.bind( obj, element );\n    return obj;\n}\n\nfunction replace( newElem, oldElem ) {\n    oldElem.parentNode.replaceChild( newElem, oldElem );\n    return newElem;\n}\n\nfunction css( element, styles ) {\n    var key, val;\n    for( key in styles ) {\n        val = styles[key];\n        element.style[key] = val;\n    }\n    return element;\n}\n\nfunction att( element, attribs, value ) {\n    var key, val;\n    if (typeof attribs === 'string') {\n        key = attribs;\n        attribs = {};\n        attribs[key] = value;\n    }\n    for( key in attribs ) {\n        val = attribs[key];\n        element.setAttribute( key, val );\n    }\n    return element;\n}\n\nfunction removeAtt( element, attrib ) {\n    element.removeAttribute( attrib );\n    return element;\n}\n\nfunction add( element ) {\n    try {\n        var i, child;\n        for (i = 1 ; i < arguments.length ; i++) {\n            child = arguments[i];\n            if( typeof child === 'string' || typeof child === 'number' ) {\n                child = document.createTextNode( child );\n            }\n            else if( typeof child.element === 'function' ) {\n                // Backward compatibility with Widgets.\n                child = child.element();\n            }\n            element.appendChild( child );\n        }\n        return element;\n    }\n    catch( ex ) {\n        console.error( \"[DOM.add] arguments=\", [].slice.call( arguments ) );\n        throw Error( \"[DOM.add] \" + ex );\n    }\n}\n\nfunction on( element, slots, capture ) {\n    // If only a function is passed, we consider this is a Tap event.\n    if( typeof slots === 'function' || slots === null ) slots = { tap: slots };\n\n    if( Array.isArray( element ) ) {\n        element.forEach(function ( elem ) {\n            on( elem, slots );\n        });\n        return element;\n    }\n\n    if( typeof element[SYMBOL] === 'undefined' ) {\n        element[SYMBOL] = interact(element);\n    }\n\n    var key, val;\n    for( key in slots ) {\n        val = slots[key];\n        if (key == 'keydown' || key == 'keyup') {\n            element.addEventListener( key, val );\n        } else {\n            element[SYMBOL].on( key, val );\n        }\n    }\n\n    return element;\n}\n\nfunction tagNS( ns, name ) {\n    var e = document.createElementNS( ns, name );\n    var i, arg, key, val;\n    for (i = 2 ; i < arguments.length ; i++) {\n        arg = arguments[i];\n        if( Array.isArray(arg) ) {\n            // Array are for children.\n            arg.forEach(function (child) {\n                switch( typeof child ) {\n                case 'string':\n                case 'number':\n                case 'boolean':\n                    child = document.createTextNode( \"\" + child );\n                    break;\n                }\n                add( e, child );\n            });\n        } else {\n            switch( typeof arg ) {\n            case \"string\":\n                arg.split( ' ' ).forEach(function ( item ) {\n                    if( item.length > 0 ) {\n                        addClass(e, item);\n                    }\n                });\n                break;\n            case \"object\":\n                for( key in arg ) {\n                    val = arg[key];\n                    e.setAttribute( key, val );\n                }\n                break;\n            default:\n                throw Error(\"[dom.tag] Error creating <\" + name + \">: Invalid argument #\" + i + \"!\");\n            }\n        }\n    }\n    return e;\n};\n\n\nfunction addClass(elem) {\n    var args = [].slice.call( arguments, 1 );\n    if( Array.isArray( elem ) ) {\n        // Loop on each element.\n        args.unshift( null );\n        elem.forEach(function ( child ) {\n            args[0] = child;\n            addClass.apply( undefined, args );\n        });\n        return elem;\n    }\n    args.forEach(function (className) {\n        if( typeof className === 'string' ) {\n            className = className.trim();\n            if( className.length == 0 ) return;\n            try {\n                elem.classList.add( className );\n            }\n            catch( ex ) {\n                console.error( \"[dom.addClass] Invalid class name: \", className );\n                console.error( ex );\n            }\n        }\n    });\n    return elem;\n}\n\n\nfunction hasClass( elem, className ) {\n    return elem.classList.contains( className );\n}\n\n\nfunction removeClass(elem) {\n    var args = [].slice.call( arguments, 1 );\n    if( Array.isArray( elem ) ) {\n        // Loop on each element.\n        args.unshift( null );\n        elem.forEach(function ( child ) {\n            args[0] = child;\n            removeClass.apply( undefined, args );\n        });\n        return elem;\n    }\n    args.forEach(function (className) {\n        try {\n            elem.classList.remove( className );\n        }\n        catch( ex ) {\n            console.error( \"[dom.removeClass] Invalid class name: \", className );\n            console.error( ex );\n        }\n    });\n    return elem;\n}\n\n\nfunction toggleClass(elem) {\n    var args = [].slice.call( arguments, 1 );\n    args.forEach(function( className ) {\n        if( hasClass( elem, className ) ) {\n            removeClass( elem, className );\n        } else {\n            addClass( elem, className );\n        }\n    });\n    return elem;\n}\n\n\nfunction clear( element ) {\n    // (!) On préfère retirer les éléments un par un du DOM plutôt que d'utiliser simplement\n    // this.html(\"\").\n    // En effet, le code simplifié a des conséquences inattendues dans IE9 et IE10 au moins.\n    // Le bug des markers qui disparaissaients sur les cartes de Trail-Passion 4 a été corrigé\n    // avec cette modification.\n    var e = element;\n    while(e.firstChild){\n        e.removeChild(e.firstChild);\n    }\n    var args = [].slice.call( arguments );\n    if( args.length > 1 ) {\n        add.apply( this, args );\n    }\n    return element;\n}\n\nfunction get( element, query ) {\n    if( typeof query === 'undefined' ) {\n        query = element;\n        element = window.document;\n    }\n    return element.querySelector( query );\n}\n\nfunction detach( element ) {\n    var parent = element.parentElement;\n    if( !parent ) return parent;\n    parent.removeChild( element );\n    return parent;\n}\n\nfunction elem( target ) {\n    var args = [].slice.call( arguments );\n    args.shift();\n    if (args.length == 0) args = ['div'];\n    args.push('dom', 'custom');\n    var e = exports.tag.apply( exports, args );\n    Object.defineProperty( target, 'element', {\n        value: e, writable: false, configurable: false, enumerable: true\n    });\n    DB.propBoolean(target, 'wide')(function(v) {\n        if (v) {\n            addClass(e, 'wide');\n        } else {\n            removeClass(e, 'wide');\n        }\n    });\n    DB.propBoolean(target, 'visible')(function(v) {\n        if (v) {\n            removeClass(e, 'hide');\n        } else {\n            addClass(e, 'hide');\n        }\n    });\n    return e;\n}\n\nfunction textOrHtml( element, content ) {\n    if (typeof content !== 'string') content = JSON.stringify( content );\n    if (content.substr(0, 6) == '<html>') {\n        element.innerHTML = content.substr(6);\n    } else {\n        element.textContent = content;\n    }\n    return element;\n}\n\n\n\n \n});"],"names":["require","exports","module","wrap","obj","element","nomethods","Object","defineProperty","value","writable","configurable","enumerable","on","bind","css","add","att","addClass","hasClass","removeClass","toggleClass","replace","newElem","oldElem","parentNode","replaceChild","styles","key","val","style","attribs","setAttribute","removeAtt","attrib","removeAttribute","i","child","arguments","length","document","createTextNode","appendChild","ex","console","error","slice","call","Error","slots","capture","tap","Array","isArray","forEach","elem","SYMBOL","interact","addEventListener","tagNS","ns","name","arg","e","createElementNS","split","item","args","unshift","apply","undefined","className","trim","classList","contains","remove","clear","firstChild","removeChild","this","get","query","window","querySelector","detach","parent","parentElement","target","shift","push","tag","DB","propBoolean","v","textOrHtml","content","JSON","stringify","substr","innerHTML","textContent","Date","now","svgRoot","version","xmlns:svg","xmlns","xmlns:xlink","svg","div","txt"],"mappings":"AAAkBA,QAAS,MAAO,SAASC,EAASC,GA0GpD,QAASC,GAAMC,EAAKC,EAASC,GAIzB,MAHAC,QAAOC,eAAgBJ,EAAK,WACxBK,MAAOJ,EAASK,UAAU,EAAOC,cAAc,EAAOC,YAAY,IAElEN,EAAmBF,GAEvBA,EAAIS,GAAKA,EAAGC,KAAMV,EAAKC,GACvBD,EAAIW,IAAMA,EAAID,KAAMV,EAAKC,GACzBD,EAAIY,IAAMA,EAAIF,KAAMV,EAAKC,GACzBD,EAAIa,IAAMA,EAAIH,KAAMV,EAAKC,GACzBD,EAAIc,SAAWA,EAASJ,KAAMV,EAAKC,GACnCD,EAAIe,SAAWA,EAASL,KAAMV,EAAKC,GACnCD,EAAIgB,YAAcA,EAAYN,KAAMV,EAAKC,GACzCD,EAAIiB,YAAcA,EAAYP,KAAMV,EAAKC,GAClCD,GAGX,QAASkB,GAASC,EAASC,GAEvB,MADAA,GAAQC,WAAWC,aAAcH,EAASC,GACnCD,EAGX,QAASR,GAAKV,EAASsB,GACnB,GAAIC,GAAKC,CACT,KAAKD,IAAOD,GACRE,EAAMF,EAAOC,GACbvB,EAAQyB,MAAMF,GAAOC,CAEzB,OAAOxB,GAGX,QAASY,GAAKZ,EAAS0B,EAAStB,GAC5B,GAAImB,GAAKC,CACc,iBAAZE,KACPH,EAAMG,EACNA,KACAA,EAAQH,GAAOnB,EAEnB,KAAKmB,IAAOG,GACRF,EAAME,EAAQH,GACdvB,EAAQ2B,aAAcJ,EAAKC,EAE/B,OAAOxB,GAGX,QAAS4B,GAAW5B,EAAS6B,GAEzB,MADA7B,GAAQ8B,gBAAiBD,GAClB7B,EAGX,QAASW,GAAKX,GACV,IACI,GAAI+B,GAAGC,CACP,KAAKD,EAAI,EAAIA,EAAIE,UAAUC,OAASH,IAChCC,EAAQC,UAAUF,GACG,gBAAVC,IAAuC,gBAAVA,GACpCA,EAAQG,SAASC,eAAgBJ,GAEH,kBAAlBA,GAAMhC,UAElBgC,EAAQA,EAAMhC,WAElBA,EAAQqC,YAAaL,EAEzB,OAAOhC,GAEX,MAAOsC,GAEH,KADAC,SAAQC,MAAO,0BAA2BC,MAAMC,KAAMT,YAChDU,MAAO,aAAeL,IAIpC,QAAS9B,GAAIR,EAAS4C,EAAOC,GAIzB,GAFqB,kBAAVD,IAAkC,OAAVA,IAAiBA,GAAUE,IAAKF,IAE/DG,MAAMC,QAAShD,GAIf,MAHAA,GAAQiD,QAAQ,SAAWC,GACvB1C,EAAI0C,EAAMN,KAEP5C,CAGoB,oBAApBA,GAAQmD,KACfnD,EAAQmD,GAAUC,SAASpD,GAG/B,IAAIuB,GAAKC,CACT,KAAKD,IAAOqB,GACRpB,EAAMoB,EAAMrB,GACD,WAAPA,GAA2B,SAAPA,EACpBvB,EAAQqD,iBAAkB9B,EAAKC,GAE/BxB,EAAQmD,GAAQ3C,GAAIe,EAAKC,EAIjC,OAAOxB,GAGX,QAASsD,GAAOC,EAAIC,GAChB,GACIzB,GAAG0B,EAAKlC,EAAKC,EADbkC,EAAIvB,SAASwB,gBAAiBJ,EAAIC,EAEtC,KAAKzB,EAAI,EAAIA,EAAIE,UAAUC,OAASH,IAEhC,GADA0B,EAAMxB,UAAUF,GACZgB,MAAMC,QAAQS,GAEdA,EAAIR,QAAQ,SAAUjB,GAClB,aAAeA,IACf,IAAK,SACL,IAAK,SACL,IAAK,UACDA,EAAQG,SAASC,eAAgB,GAAKJ,GAG1CrB,EAAK+C,EAAG1B,SAGZ,cAAeyB,IACf,IAAK,SACDA,EAAIG,MAAO,KAAMX,QAAQ,SAAWY,GAC5BA,EAAK3B,OAAS,GACdrB,EAAS6C,EAAGG,IAGpB,MACJ,KAAK,SACD,IAAKtC,IAAOkC,GACRjC,EAAMiC,EAAIlC,GACVmC,EAAE/B,aAAcJ,EAAKC,EAEzB,MACJ,SACI,KAAMmB,OAAM,6BAA+Ba,EAAO,wBAA0BzB,EAAI,KAI5F,MAAO2B,GAIX,QAAS7C,GAASqC,GACd,GAAIY,MAAUrB,MAAMC,KAAMT,UAAW,EACrC,OAAIc,OAAMC,QAASE,IAEfY,EAAKC,QAAS,MACdb,EAAKD,QAAQ,SAAWjB,GACpB8B,EAAK,GAAK9B,EACVnB,EAASmD,MAAOC,OAAWH,KAExBZ,IAEXY,EAAKb,QAAQ,SAAUiB,GACnB,GAAyB,gBAAdA,GAAyB,CAEhC,GADAA,EAAYA,EAAUC,OACE,GAApBD,EAAUhC,OAAc,MAC5B,KACIgB,EAAKkB,UAAUzD,IAAKuD,GAExB,MAAO5B,GACHC,QAAQC,MAAO,sCAAuC0B,GACtD3B,QAAQC,MAAOF,OAIpBY,GAIX,QAASpC,GAAUoC,EAAMgB,GACrB,MAAOhB,GAAKkB,UAAUC,SAAUH,GAIpC,QAASnD,GAAYmC,GACjB,GAAIY,MAAUrB,MAAMC,KAAMT,UAAW,EACrC,OAAIc,OAAMC,QAASE,IAEfY,EAAKC,QAAS,MACdb,EAAKD,QAAQ,SAAWjB,GACpB8B,EAAK,GAAK9B,EACVjB,EAAYiD,MAAOC,OAAWH,KAE3BZ,IAEXY,EAAKb,QAAQ,SAAUiB,GACnB,IACIhB,EAAKkB,UAAUE,OAAQJ,GAE3B,MAAO5B,GACHC,QAAQC,MAAO,yCAA0C0B,GACzD3B,QAAQC,MAAOF,MAGhBY,GAIX,QAASlC,GAAYkC,GACjB,GAAIY,MAAUrB,MAAMC,KAAMT,UAAW,EAQrC,OAPA6B,GAAKb,QAAQ,SAAUiB,GACfpD,EAAUoC,EAAMgB,GAChBnD,EAAamC,EAAMgB,GAEnBrD,EAAUqC,EAAMgB,KAGjBhB,EAIX,QAASqB,GAAOvE,GAOZ,IADA,GAAI0D,GAAI1D,EACF0D,EAAEc,YACJd,EAAEe,YAAYf,EAAEc,WAEpB,IAAIV,MAAUrB,MAAMC,KAAMT,UAI1B,OAHI6B,GAAK5B,OAAS,GACdvB,EAAIqD,MAAOU,KAAMZ,GAEd9D,EAGX,QAAS2E,GAAK3E,EAAS4E,GAKnB,MAJqB,mBAAVA,KACPA,EAAQ5E,EACRA,EAAU6E,OAAO1C,UAEdnC,EAAQ8E,cAAeF,GAGlC,QAASG,GAAQ/E,GACb,GAAIgF,GAAShF,EAAQiF,aACrB,OAAKD,IACLA,EAAOP,YAAazE,GACbgF,GAFcA,EAKzB,QAAS9B,GAAMgC,GACX,GAAIpB,MAAUrB,MAAMC,KAAMT,UAC1B6B,GAAKqB,QACc,GAAfrB,EAAK5B,SAAa4B,GAAQ,QAC9BA,EAAKsB,KAAK,MAAO,SACjB,IAAI1B,GAAI9D,EAAQyF,IAAIrB,MAAOpE,EAASkE,EAkBpC,OAjBA5D,QAAOC,eAAgB+E,EAAQ,WAC3B9E,MAAOsD,EAAGrD,UAAU,EAAOC,cAAc,EAAOC,YAAY,IAEhE+E,EAAGC,YAAYL,EAAQ,QAAQ,SAASM,GAChCA,EACA3E,EAAS6C,EAAG,QAEZ3C,EAAY2C,EAAG,UAGvB4B,EAAGC,YAAYL,EAAQ,WAAW,SAASM,GACnCA,EACAzE,EAAY2C,EAAG,QAEf7C,EAAS6C,EAAG,UAGbA,EAGX,QAAS+B,GAAYzF,EAAS0F,GAO1B,MANuB,gBAAZA,KAAsBA,EAAUC,KAAKC,UAAWF,IAC/B,UAAxBA,EAAQG,OAAO,EAAG,GAClB7F,EAAQ8F,UAAYJ,EAAQG,OAAO,GAEnC7F,EAAQ+F,YAAcL,EAEnB1F,EAnXXL,QAAQ,qBACR,IAAI2F,GAAK3F,QAAQ,oBAGbwD,EAAS,MAAQ6C,KAAKC,KAG1BrG,GAAQ0D,MAAQA,EAChB1D,EAAQsG,QAAU5C,EAAM7C,KAAMwD,OAAW,6BAA8B,OACnEkC,QAAS,MACTC,YAAa,6BACbC,MAAO,6BACPC,cAAe,iCAEnB1G,EAAQ2G,IAAMjD,EAAM7C,KAAMwD,OAAW,8BACrCrE,EAAQyF,IAAM/B,EAAM7C,KAAMwD,OAAW,gCACrCrE,EAAQ4G,IAAMlD,EAAM7C,KAAMwD,OAAW,+BAAgC,OACrErE,EAAQ6G,IAAM5B,OAAO1C,SAASC,eAAe3B,KAAMoE,OAAO1C,UAC1DvC,EAAQ6F,WAAaA,EACrB7F,EAAQ+E,IAAMA,EAId/E,EAAQsD,KAAOA,EAUftD,EAAQc,IAAMA,EACdd,EAAQgB,IAAMA,EACdhB,EAAQgC,UAAYA,EACpBhC,EAAQiB,SAAWA,EACnBjB,EAAQkB,SAAWA,EACnBlB,EAAQmB,YAAcA,EACtBnB,EAAQoB,YAAcA,EAKtBpB,EAAQqB,QAAUA,EAMlBrB,EAAQmF,OAASA,EAwBjBnF,EAAQY,GAAKA,EAMbZ,EAAQe,IAAMA,EAQdf,EAAQE,KAAOA,EAKfF,EAAQ2E,MAAQA"},"dependencies":["mod/dom","mod/polyfill.classList","mod/tfw.data-binding"]}