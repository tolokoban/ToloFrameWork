{"intl":"","src":"/** @module wdg.button */require( 'wdg.button', function(exports, module) {  var $ = require(\"dom\");\nvar DB = require(\"tfw.data-binding\");\n\nvar TYPES = ['standard', 'simple', 'warning', 'shadow', 'special'];\n\n/**\n * Liste des classes CSS applicables sur un bouton :\n * * __simple__ : Simple lien, sans l'aspect \"bouton\".\n * * __shadow__ : Bouton légèrement plus foncé.\n * * __warning__ : Bouton orangé pour indiquer une action potentiellement dangereuse.\n * * __small__ : Bouton de petite taille (environ 70%).\n *\n * @param {object} opts\n * * {string} `value`: Text à afficher dans le bouton.\n * * {string} `href`: Si défini, lien vers lequel dirigier la page en cas de click.\n * * {boolean} `enabled`: Mettre `false` pour désactiver le bouton.\n * * {object} `email`: Associe le _Tap_ à l'envoi d'un mail.\n *   * {string} `to`: destinataire.\n *   * {string} `subject`: sujet du mail.\n *   * {string} `body`: corps du mail.\n *\n * @example\n * var Button = require(\"tp4.button\");\n * var instance = new Button();\n * @class Button\n */\nvar Button = function(opts) {\n    var that = this;\n\n    var elem = $.elem(this, typeof opts.href === 'string' ? 'a' : 'button', 'wdg-button');\n\n    DB.propString(this, 'text')(function(v) {\n        elem.textContent = v;\n    });\n    DB.prop(this, 'value');\n    DB.propEnum( TYPES )(this, 'type')(function(v) {\n        TYPES.forEach(function (type) {\n            $.removeClass(elem, type);\n        });\n        $.addClass(elem, v);\n    });\n    DB.propBoolean(this, 'enabled')(function(v) {\n        if (v) {\n            $.removeAtt(elem, 'disabled');\n        } else {\n            $.att(elem, 'disabled', 'yes');\n        }\n    });\n    DB.propBoolean(this, 'small')(function(v) {\n        if (v) {\n            $.addClass(elem, 'small');\n        } else {\n            $.removeClass(elem, 'small');\n        }\n    });\n    DB.prop(this, 'action', 0);\n\n    opts = DB.extend({\n        text: \"OK\",\n        value: \"action\",\n        small: false,\n        enabled: true,\n        wide: false,\n        visible: true,\n        type: \"standard\"\n    }, opts, this);\n\n    // Animate the pressing.\n    $.on(this.element, {\n        down: function() {\n            if (that.enabled) {\n                $.addClass(elem, 'press');\n            }\n        },\n        up: function() {\n            $.removeClass(elem, 'press');\n        },\n        tap: that.fire.bind( that ),\n        keydown: function(evt) {\n            if (evt.keyCode == 13 || evt.keyCode == 32) {\n                evt.preventDefault();\n                evt.stopPropagation();\n                that.fire();\n            }\n        }\n    });\n};\n\n/**\n * Simulate a click on the button if it is enabled.\n */\nButton.prototype.fire = function() {\n    if (this.enabled) DB.fire( this, 'action', this.value );\n};\n\n/**\n * Disable the button and start a wait animation.\n */\nButton.prototype.waitOn = function(text) {\n    if (typeof text === 'undefined') text = this.caption();\n    this.enabled(false);\n    this.clear(W({size: '1em', caption: text}));\n};\n\n/**\n * Stop the wait animation and enable the button again.\n */\nButton.prototype.waitOff = function() {\n    this.caption(this.caption());\n    this.enabled(true);\n};\n\n\nfunction genericButton( id, classes, defaults ) {\n    var btn = new Button({ caption: _(id) });\n    if ( classes.length > 0 ) {\n        var i, cls;\n        for (i = 0 ; i < classes.length ; i++) {\n            cls = classes[i];\n            btn.addClass( cls );\n        }\n    } else {\n        if (typeof defaults === 'undefined') return btn;\n        if (!Array.isArray(defaults)) {\n            defaults = [defaults];\n        }\n        defaults.forEach(function (cls) {\n            btn.addClass( cls );\n        });\n    }\n    return btn;\n}\n\nButton.Cancel = function() { return genericButton('cancel', arguments); };\nButton.Close = function() { return genericButton('close', arguments, 'simple'); };\nButton.Delete = function() { return genericButton('delete', arguments, 'warning'); };\nButton.No = function() { return genericButton('no', arguments); };\nButton.Ok = function() { return genericButton('ok', arguments); };\nButton.Edit = function() { return genericButton('edit', arguments); };\nButton.Save = function() { return genericButton('save', arguments, 'warning'); };\nButton.Yes = function() { return genericButton('yes', arguments); };\n\nButton.default = {\n    caption: \"OK\",\n    type: \"default\"\n};\n\nmodule.exports = Button;\n\n\n\n \n/**\n * @module wdg.button\n * @see module:dom\n * @see module:tfw.data-binding\n * @see module:wdg.button\n\n */\n});","zip":"require(\"wdg.button\",function(t,e){function n(t,e,n){var i=new r({caption:_(t)});if(e.length>0){var o,a;for(o=0;o<e.length;o++)a=e[o],i.addClass(a)}else{if(\"undefined\"==typeof n)return i;Array.isArray(n)||(n=[n]),n.forEach(function(t){i.addClass(t)})}return i}var i=require(\"dom\"),o=require(\"tfw.data-binding\"),a=[\"standard\",\"simple\",\"warning\",\"shadow\",\"special\"],r=function(t){var e=this,n=i.elem(this,\"string\"==typeof t.href?\"a\":\"button\",\"wdg-button\");o.propString(this,\"text\")(function(t){n.textContent=t}),o.prop(this,\"value\"),o.propEnum(a)(this,\"type\")(function(t){a.forEach(function(t){i.removeClass(n,t)}),i.addClass(n,t)}),o.propBoolean(this,\"enabled\")(function(t){t?i.removeAtt(n,\"disabled\"):i.att(n,\"disabled\",\"yes\")}),o.propBoolean(this,\"small\")(function(t){t?i.addClass(n,\"small\"):i.removeClass(n,\"small\")}),o.prop(this,\"action\",0),t=o.extend({text:\"OK\",value:\"action\",small:!1,enabled:!0,wide:!1,visible:!0,type:\"standard\"},t,this),i.on(this.element,{down:function(){e.enabled&&i.addClass(n,\"press\")},up:function(){i.removeClass(n,\"press\")},tap:e.fire.bind(e),keydown:function(t){13!=t.keyCode&&32!=t.keyCode||(t.preventDefault(),t.stopPropagation(),e.fire())}})};r.prototype.fire=function(){this.enabled&&o.fire(this,\"action\",this.value)},r.prototype.waitOn=function(t){\"undefined\"==typeof t&&(t=this.caption()),this.enabled(!1),this.clear(W({size:\"1em\",caption:t}))},r.prototype.waitOff=function(){this.caption(this.caption()),this.enabled(!0)},r.Cancel=function(){return n(\"cancel\",arguments)},r.Close=function(){return n(\"close\",arguments,\"simple\")},r.Delete=function(){return n(\"delete\",arguments,\"warning\")},r.No=function(){return n(\"no\",arguments)},r.Ok=function(){return n(\"ok\",arguments)},r.Edit=function(){return n(\"edit\",arguments)},r.Save=function(){return n(\"save\",arguments,\"warning\")},r.Yes=function(){return n(\"yes\",arguments)},r[\"default\"]={caption:\"OK\",type:\"default\"},e.exports=r});\n//# sourceMappingURL=wdg.button.js.map","map":{"version":3,"file":"wdg.button.js.map","sources":["wdg.button.js"],"sourcesContent":["/** @module wdg.button */require( 'wdg.button', function(exports, module) {  var $ = require(\"dom\");\nvar DB = require(\"tfw.data-binding\");\n\nvar TYPES = ['standard', 'simple', 'warning', 'shadow', 'special'];\n\n/**\n * Liste des classes CSS applicables sur un bouton :\n * * __simple__ : Simple lien, sans l'aspect \"bouton\".\n * * __shadow__ : Bouton légèrement plus foncé.\n * * __warning__ : Bouton orangé pour indiquer une action potentiellement dangereuse.\n * * __small__ : Bouton de petite taille (environ 70%).\n *\n * @param {object} opts\n * * {string} `value`: Text à afficher dans le bouton.\n * * {string} `href`: Si défini, lien vers lequel dirigier la page en cas de click.\n * * {boolean} `enabled`: Mettre `false` pour désactiver le bouton.\n * * {object} `email`: Associe le _Tap_ à l'envoi d'un mail.\n *   * {string} `to`: destinataire.\n *   * {string} `subject`: sujet du mail.\n *   * {string} `body`: corps du mail.\n *\n * @example\n * var Button = require(\"tp4.button\");\n * var instance = new Button();\n * @class Button\n */\nvar Button = function(opts) {\n    var that = this;\n\n    var elem = $.elem(this, typeof opts.href === 'string' ? 'a' : 'button', 'wdg-button');\n\n    DB.propString(this, 'text')(function(v) {\n        elem.textContent = v;\n    });\n    DB.prop(this, 'value');\n    DB.propEnum( TYPES )(this, 'type')(function(v) {\n        TYPES.forEach(function (type) {\n            $.removeClass(elem, type);\n        });\n        $.addClass(elem, v);\n    });\n    DB.propBoolean(this, 'enabled')(function(v) {\n        if (v) {\n            $.removeAtt(elem, 'disabled');\n        } else {\n            $.att(elem, 'disabled', 'yes');\n        }\n    });\n    DB.propBoolean(this, 'small')(function(v) {\n        if (v) {\n            $.addClass(elem, 'small');\n        } else {\n            $.removeClass(elem, 'small');\n        }\n    });\n    DB.prop(this, 'action', 0);\n\n    opts = DB.extend({\n        text: \"OK\",\n        value: \"action\",\n        small: false,\n        enabled: true,\n        wide: false,\n        visible: true,\n        type: \"standard\"\n    }, opts, this);\n\n    // Animate the pressing.\n    $.on(this.element, {\n        down: function() {\n            if (that.enabled) {\n                $.addClass(elem, 'press');\n            }\n        },\n        up: function() {\n            $.removeClass(elem, 'press');\n        },\n        tap: that.fire.bind( that ),\n        keydown: function(evt) {\n            if (evt.keyCode == 13 || evt.keyCode == 32) {\n                evt.preventDefault();\n                evt.stopPropagation();\n                that.fire();\n            }\n        }\n    });\n};\n\n/**\n * Simulate a click on the button if it is enabled.\n */\nButton.prototype.fire = function() {\n    if (this.enabled) DB.fire( this, 'action', this.value );\n};\n\n/**\n * Disable the button and start a wait animation.\n */\nButton.prototype.waitOn = function(text) {\n    if (typeof text === 'undefined') text = this.caption();\n    this.enabled(false);\n    this.clear(W({size: '1em', caption: text}));\n};\n\n/**\n * Stop the wait animation and enable the button again.\n */\nButton.prototype.waitOff = function() {\n    this.caption(this.caption());\n    this.enabled(true);\n};\n\n\nfunction genericButton( id, classes, defaults ) {\n    var btn = new Button({ caption: _(id) });\n    if ( classes.length > 0 ) {\n        var i, cls;\n        for (i = 0 ; i < classes.length ; i++) {\n            cls = classes[i];\n            btn.addClass( cls );\n        }\n    } else {\n        if (typeof defaults === 'undefined') return btn;\n        if (!Array.isArray(defaults)) {\n            defaults = [defaults];\n        }\n        defaults.forEach(function (cls) {\n            btn.addClass( cls );\n        });\n    }\n    return btn;\n}\n\nButton.Cancel = function() { return genericButton('cancel', arguments); };\nButton.Close = function() { return genericButton('close', arguments, 'simple'); };\nButton.Delete = function() { return genericButton('delete', arguments, 'warning'); };\nButton.No = function() { return genericButton('no', arguments); };\nButton.Ok = function() { return genericButton('ok', arguments); };\nButton.Edit = function() { return genericButton('edit', arguments); };\nButton.Save = function() { return genericButton('save', arguments, 'warning'); };\nButton.Yes = function() { return genericButton('yes', arguments); };\n\nButton.default = {\n    caption: \"OK\",\n    type: \"default\"\n};\n\nmodule.exports = Button;\n\n\n\n \n});"],"names":["require","exports","module","genericButton","id","classes","defaults","btn","Button","caption","_","length","i","cls","addClass","Array","isArray","forEach","$","DB","TYPES","opts","that","this","elem","href","propString","v","textContent","prop","propEnum","type","removeClass","propBoolean","removeAtt","att","extend","text","value","small","enabled","wide","visible","on","element","down","up","tap","fire","bind","keydown","evt","keyCode","preventDefault","stopPropagation","prototype","waitOn","clear","W","size","waitOff","Cancel","arguments","Close","Delete","No","Ok","Edit","Save","Yes"],"mappings":"AAAyBA,QAAS,aAAc,SAASC,EAASC,GAiHlE,QAASC,GAAeC,EAAIC,EAASC,GACjC,GAAIC,GAAM,GAAIC,IAASC,QAASC,EAAEN,IAClC,IAAKC,EAAQM,OAAS,EAAI,CACtB,GAAIC,GAAGC,CACP,KAAKD,EAAI,EAAIA,EAAIP,EAAQM,OAASC,IAC9BC,EAAMR,EAAQO,GACdL,EAAIO,SAAUD,OAEf,CACH,GAAwB,mBAAbP,GAA0B,MAAOC,EACvCQ,OAAMC,QAAQV,KACfA,GAAYA,IAEhBA,EAASW,QAAQ,SAAUJ,GACvBN,EAAIO,SAAUD,KAGtB,MAAON,GAlIkE,GAAIW,GAAIlB,QAAQ,OACzFmB,EAAKnB,QAAQ,oBAEboB,GAAS,WAAY,SAAU,UAAW,SAAU,WAuBpDZ,EAAS,SAASa,GAClB,GAAIC,GAAOC,KAEPC,EAAON,EAAEM,KAAKD,KAA2B,gBAAdF,GAAKI,KAAoB,IAAM,SAAU,aAExEN,GAAGO,WAAWH,KAAM,QAAQ,SAASI,GACjCH,EAAKI,YAAcD,IAEvBR,EAAGU,KAAKN,KAAM,SACdJ,EAAGW,SAAUV,GAAQG,KAAM,QAAQ,SAASI,GACxCP,EAAMH,QAAQ,SAAUc,GACpBb,EAAEc,YAAYR,EAAMO,KAExBb,EAAEJ,SAASU,EAAMG,KAErBR,EAAGc,YAAYV,KAAM,WAAW,SAASI,GACjCA,EACAT,EAAEgB,UAAUV,EAAM,YAElBN,EAAEiB,IAAIX,EAAM,WAAY,SAGhCL,EAAGc,YAAYV,KAAM,SAAS,SAASI,GAC/BA,EACAT,EAAEJ,SAASU,EAAM,SAEjBN,EAAEc,YAAYR,EAAM,WAG5BL,EAAGU,KAAKN,KAAM,SAAU,GAExBF,EAAOF,EAAGiB,QACNC,KAAM,KACNC,MAAO,SACPC,OAAO,EACPC,SAAS,EACTC,MAAM,EACNC,SAAS,EACTX,KAAM,YACPV,EAAME,MAGTL,EAAEyB,GAAGpB,KAAKqB,SACNC,KAAM,WACEvB,EAAKkB,SACLtB,EAAEJ,SAASU,EAAM,UAGzBsB,GAAI,WACA5B,EAAEc,YAAYR,EAAM,UAExBuB,IAAKzB,EAAK0B,KAAKC,KAAM3B,GACrB4B,QAAS,SAASC,GACK,IAAfA,EAAIC,SAAgC,IAAfD,EAAIC,UACzBD,EAAIE,iBACJF,EAAIG,kBACJhC,EAAK0B,WASrBxC,GAAO+C,UAAUP,KAAO,WAChBzB,KAAKiB,SAASrB,EAAG6B,KAAMzB,KAAM,SAAUA,KAAKe,QAMpD9B,EAAO+C,UAAUC,OAAS,SAASnB,GACX,mBAATA,KAAsBA,EAAOd,KAAKd,WAC7Cc,KAAKiB,SAAQ,GACbjB,KAAKkC,MAAMC,GAAGC,KAAM,MAAOlD,QAAS4B,MAMxC7B,EAAO+C,UAAUK,QAAU,WACvBrC,KAAKd,QAAQc,KAAKd,WAClBc,KAAKiB,SAAQ,IAwBjBhC,EAAOqD,OAAS,WAAa,MAAO1D,GAAc,SAAU2D,YAC5DtD,EAAOuD,MAAQ,WAAa,MAAO5D,GAAc,QAAS2D,UAAW,WACrEtD,EAAOwD,OAAS,WAAa,MAAO7D,GAAc,SAAU2D,UAAW,YACvEtD,EAAOyD,GAAK,WAAa,MAAO9D,GAAc,KAAM2D,YACpDtD,EAAO0D,GAAK,WAAa,MAAO/D,GAAc,KAAM2D,YACpDtD,EAAO2D,KAAO,WAAa,MAAOhE,GAAc,OAAQ2D,YACxDtD,EAAO4D,KAAO,WAAa,MAAOjE,GAAc,OAAQ2D,UAAW,YACnEtD,EAAO6D,IAAM,WAAa,MAAOlE,GAAc,MAAO2D,YAEtDtD,EAAAA,YACIC,QAAS,KACTsB,KAAM,WAGV7B,EAAOD,QAAUO"},"dependencies":["mod/dom","mod/tfw.data-binding","mod/wdg.button"]}