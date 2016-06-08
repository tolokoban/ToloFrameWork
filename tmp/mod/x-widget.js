{"intl":"","src":"/** @module x-widget */require( 'x-widget', function(exports, module) {  \"use strict\";\n\nvar DB = require(\"tfw.data-binding\");\n\nvar widgets = {};\n// Used for `onWidgetCreation()`.\nvar slots = {};\n\n\nvar Widget = function(id, modName, args) {\n    var dst = document.getElementById( id );\n    if (!dst) {\n        // This widget does not exist!\n        return;\n    }\n    var module = require( modName );\n    var wdg = new module( args );\n    var elem = typeof wdg.element === 'function' ? wdg.element() : wdg.element;\n    elem.setAttribute( 'id', id );\n    dst.parentNode.replaceChild( elem, dst );\n    register( id, wdg );\n};\n\nWidget.template = function( attribs ) {\n    var key, val, id, name = '', args = {};\n    for( key in attribs ) {\n        val = attribs[key];\n        if( key == 'name' ) {\n            name = val;\n        }\n        else if( key == 'id' ) {\n            id = val;\n        }\n        else if( key.charAt(0)=='$' ) {\n            args[key.substr( 1 )] = val;\n        }\n    }\n    var module = require( name );\n    var wdg = new module( args );\n    if( id ) {\n        register( id, wdg );\n    }\n\n    return typeof wdg.element === 'function' ? wdg.element() : (wdg.element || wdg);\n};\n\nfunction register( id, wdg ) {\n    widgets[id] = wdg;\n    var mySlots = slots[id];\n    console.info(\"[x-widget] widget creation=...\", id);\n    if( typeof mySlots !== 'undefined' ) {\n        window.setTimeout(function() {\n            mySlots.forEach(function (slot) {\n                slot( wdg );\n            });\n            delete slots[id];\n        });\n    }\n    return typeof wdg.element === 'function' ? wdg.element : (wdg.element || wdg);\n};\n\nWidget.getById = function( id ) {\n    if( !widgets[id] ) throw Error( \"[x-widget.getById()] ID not found: \" + id + \"!\" );\n    return widgets[id];\n};\n\nWidget.onWidgetCreation = function( id, slot ) {\n    if( typeof widgets[id] === 'undefined' ) {\n        if( typeof slots[id] === 'undefined' ) slots[id] = [slot];\n        else slots[id].push( slot );\n    } else {\n        // Asynchronous call to the slot\n        window.setTimeout(\n            function() {\n                slot( widgets[id] );\n            }\n        );\n    }\n};\n\nWidget.bind = function( id, attribs ) {\n    var dstObj = widgets[id];\n    var dstAtt, binding;\n    var srcObj, srcAtt;\n    for( dstAtt in attribs ) {\n        binding = attribs[dstAtt].B;\n        srcObj = widgets[binding[0]];\n        if( typeof srcObj === 'undefined' ) {\n            console.error( \"[x-widget:bind] Trying to bind attribute \\\"\" + dstAtt\n                         + \"\\\" of widget \\\"\" + id + \"\\\" to the unexisting widget \\\"\"\n                         + binding[0] + \"\\\"!\");\n            return;\n        }\n        srcAtt = binding[1];\n        DB.bind( srcObj, srcAtt, dstObj, dstAtt );\n    }\n};\n\nmodule.exports = Widget;\n\n\n\n \n/**\n * @module x-widget\n * @see module:tfw.data-binding\n * @see module:x-widget\n\n */\n});","zip":"require(\"x-widget\",function(e,t){\"use strict\";function n(e,t){o[e]=t;var n=r[e];return console.info(\"[x-widget] widget creation=...\",e),\"undefined\"!=typeof n&&window.setTimeout(function(){n.forEach(function(e){e(t)}),delete r[e]}),\"function\"==typeof t.element?t.element:t.element||t}var i=require(\"tfw.data-binding\"),o={},r={},d=function(e,t,i){var o=document.getElementById(e);if(o){var r=require(t),d=new r(i),u=\"function\"==typeof d.element?d.element():d.element;u.setAttribute(\"id\",e),o.parentNode.replaceChild(u,o),n(e,d)}};d.template=function(e){var t,i,o,r=\"\",d={};for(t in e)i=e[t],\"name\"==t?r=i:\"id\"==t?o=i:\"$\"==t.charAt(0)&&(d[t.substr(1)]=i);var u=require(r),f=new u(d);return o&&n(o,f),\"function\"==typeof f.element?f.element():f.element||f},d.getById=function(e){if(!o[e])throw Error(\"[x-widget.getById()] ID not found: \"+e+\"!\");return o[e]},d.onWidgetCreation=function(e,t){\"undefined\"==typeof o[e]?\"undefined\"==typeof r[e]?r[e]=[t]:r[e].push(t):window.setTimeout(function(){t(o[e])})},d.bind=function(e,t){var n,r,d,u,f=o[e];for(n in t){if(r=t[n].B,d=o[r[0]],\"undefined\"==typeof d)return void console.error('[x-widget:bind] Trying to bind attribute \"'+n+'\" of widget \"'+e+'\" to the unexisting widget \"'+r[0]+'\"!');u=r[1],i.bind(d,u,f,n)}},t.exports=d});\n//# sourceMappingURL=x-widget.js.map","map":{"version":3,"file":"x-widget.js.map","sources":["x-widget.js"],"sourcesContent":["/** @module x-widget */require( 'x-widget', function(exports, module) {  \"use strict\";\n\nvar DB = require(\"tfw.data-binding\");\n\nvar widgets = {};\n// Used for `onWidgetCreation()`.\nvar slots = {};\n\n\nvar Widget = function(id, modName, args) {\n    var dst = document.getElementById( id );\n    if (!dst) {\n        // This widget does not exist!\n        return;\n    }\n    var module = require( modName );\n    var wdg = new module( args );\n    var elem = typeof wdg.element === 'function' ? wdg.element() : wdg.element;\n    elem.setAttribute( 'id', id );\n    dst.parentNode.replaceChild( elem, dst );\n    register( id, wdg );\n};\n\nWidget.template = function( attribs ) {\n    var key, val, id, name = '', args = {};\n    for( key in attribs ) {\n        val = attribs[key];\n        if( key == 'name' ) {\n            name = val;\n        }\n        else if( key == 'id' ) {\n            id = val;\n        }\n        else if( key.charAt(0)=='$' ) {\n            args[key.substr( 1 )] = val;\n        }\n    }\n    var module = require( name );\n    var wdg = new module( args );\n    if( id ) {\n        register( id, wdg );\n    }\n\n    return typeof wdg.element === 'function' ? wdg.element() : (wdg.element || wdg);\n};\n\nfunction register( id, wdg ) {\n    widgets[id] = wdg;\n    var mySlots = slots[id];\n    console.info(\"[x-widget] widget creation=...\", id);\n    if( typeof mySlots !== 'undefined' ) {\n        window.setTimeout(function() {\n            mySlots.forEach(function (slot) {\n                slot( wdg );\n            });\n            delete slots[id];\n        });\n    }\n    return typeof wdg.element === 'function' ? wdg.element : (wdg.element || wdg);\n};\n\nWidget.getById = function( id ) {\n    if( !widgets[id] ) throw Error( \"[x-widget.getById()] ID not found: \" + id + \"!\" );\n    return widgets[id];\n};\n\nWidget.onWidgetCreation = function( id, slot ) {\n    if( typeof widgets[id] === 'undefined' ) {\n        if( typeof slots[id] === 'undefined' ) slots[id] = [slot];\n        else slots[id].push( slot );\n    } else {\n        // Asynchronous call to the slot\n        window.setTimeout(\n            function() {\n                slot( widgets[id] );\n            }\n        );\n    }\n};\n\nWidget.bind = function( id, attribs ) {\n    var dstObj = widgets[id];\n    var dstAtt, binding;\n    var srcObj, srcAtt;\n    for( dstAtt in attribs ) {\n        binding = attribs[dstAtt].B;\n        srcObj = widgets[binding[0]];\n        if( typeof srcObj === 'undefined' ) {\n            console.error( \"[x-widget:bind] Trying to bind attribute \\\"\" + dstAtt\n                         + \"\\\" of widget \\\"\" + id + \"\\\" to the unexisting widget \\\"\"\n                         + binding[0] + \"\\\"!\");\n            return;\n        }\n        srcAtt = binding[1];\n        DB.bind( srcObj, srcAtt, dstObj, dstAtt );\n    }\n};\n\nmodule.exports = Widget;\n\n\n\n \n});"],"names":["require","exports","module","register","id","wdg","widgets","mySlots","slots","console","info","window","setTimeout","forEach","slot","element","DB","Widget","modName","args","dst","document","getElementById","elem","setAttribute","parentNode","replaceChild","template","attribs","key","val","name","charAt","substr","getById","Error","onWidgetCreation","push","bind","dstAtt","binding","srcObj","srcAtt","dstObj","B","error"],"mappings":"AAAuBA,QAAS,WAAY,SAASC,EAASC,GAAW,YA8CzE,SAASC,GAAUC,EAAIC,GACnBC,EAAQF,GAAMC,CACd,IAAIE,GAAUC,EAAMJ,EAUpB,OATAK,SAAQC,KAAK,iCAAkCN,GACxB,mBAAZG,IACPI,OAAOC,WAAW,WACdL,EAAQM,QAAQ,SAAUC,GACtBA,EAAMT,WAEHG,GAAMJ,KAGS,kBAAhBC,GAAIU,QAAyBV,EAAIU,QAAWV,EAAIU,SAAWV,EAxD7E,GAAIW,GAAKhB,QAAQ,oBAEbM,KAEAE,KAGAS,EAAS,SAASb,EAAIc,EAASC,GAC/B,GAAIC,GAAMC,SAASC,eAAgBlB,EACnC,IAAKgB,EAAL,CAIA,GAAIlB,GAASF,QAASkB,GAClBb,EAAM,GAAIH,GAAQiB,GAClBI,EAA8B,kBAAhBlB,GAAIU,QAAyBV,EAAIU,UAAYV,EAAIU,OACnEQ,GAAKC,aAAc,KAAMpB,GACzBgB,EAAIK,WAAWC,aAAcH,EAAMH,GACnCjB,EAAUC,EAAIC,IAGlBY,GAAOU,SAAW,SAAUC,GACxB,GAAIC,GAAKC,EAAK1B,EAAI2B,EAAO,GAAIZ,IAC7B,KAAKU,IAAOD,GACRE,EAAMF,EAAQC,GACH,QAAPA,EACAE,EAAOD,EAEK,MAAPD,EACLzB,EAAK0B,EAEe,KAAfD,EAAIG,OAAO,KAChBb,EAAKU,EAAII,OAAQ,IAAOH,EAGhC,IAAI5B,GAASF,QAAS+B,GAClB1B,EAAM,GAAIH,GAAQiB,EAKtB,OAJIf,IACAD,EAAUC,EAAIC,GAGY,kBAAhBA,GAAIU,QAAyBV,EAAIU,UAAaV,EAAIU,SAAWV,GAkB/EY,EAAOiB,QAAU,SAAU9B,GACvB,IAAKE,EAAQF,GAAM,KAAM+B,OAAO,sCAAwC/B,EAAK,IAC7E,OAAOE,GAAQF,IAGnBa,EAAOmB,iBAAmB,SAAUhC,EAAIU,GACT,mBAAhBR,GAAQF,GACU,mBAAdI,GAAMJ,GAAsBI,EAAMJ,IAAOU,GAC/CN,EAAMJ,GAAIiC,KAAMvB,GAGrBH,OAAOC,WACH,WACIE,EAAMR,EAAQF,OAM9Ba,EAAOqB,KAAO,SAAUlC,EAAIwB,GACxB,GACIW,GAAQC,EACRC,EAAQC,EAFRC,EAASrC,EAAQF,EAGrB,KAAKmC,IAAUX,GAAU,CAGrB,GAFAY,EAAUZ,EAAQW,GAAQK,EAC1BH,EAASnC,EAAQkC,EAAQ,IACH,mBAAXC,GAIP,WAHAhC,SAAQoC,MAAO,6CAAgDN,EAChD,gBAAoBnC,EAAK,+BACzBoC,EAAQ,GAAK,KAGhCE,GAASF,EAAQ,GACjBxB,EAAGsB,KAAMG,EAAQC,EAAQC,EAAQJ,KAIzCrC,EAAOD,QAAUgB"},"dependencies":["mod/tfw.data-binding","mod/x-widget"]}