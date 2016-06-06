{"intl":"var _intl_={\"en\":{\"cancel\":\"Cancel\",\"close\":\"Close\",\"delete\":\"Delete\",\"edit\":\"Edit\",\"no\":\"No\",\"ok\":\"OK\",\"save\":\"Save\",\"yes\":\"Yes\"},\"fr\":{\"cancel\":\"Annuler\",\"close\":\"Fermer\",\"delete\":\"Supprimer\",\"edit\":\"Editer\",\"no\":\"Non\",\"ok\":\"Valider\",\"save\":\"Sauver\",\"yes\":\"Oui\"}},_$=require(\"$\").intl;function _(){return _$(_intl_, arguments);}\r\n","src":"/** @module wdg.button */require( 'wdg.button', function(exports, module) { var _intl_={\"en\":{\"cancel\":\"Cancel\",\"close\":\"Close\",\"delete\":\"Delete\",\"edit\":\"Edit\",\"no\":\"No\",\"ok\":\"OK\",\"save\":\"Save\",\"yes\":\"Yes\"},\"fr\":{\"cancel\":\"Annuler\",\"close\":\"Fermer\",\"delete\":\"Supprimer\",\"edit\":\"Editer\",\"no\":\"Non\",\"ok\":\"Valider\",\"save\":\"Sauver\",\"yes\":\"Oui\"}},_$=require(\"$\").intl;function _(){return _$(_intl_, arguments);}\r\n var $ = require(\"dom\");\r\nvar DB = require(\"tfw.data-binding\");\r\nvar Icon = require(\"wdg.icon\");\r\n\r\nvar TYPES = ['standard', 'simple', 'warning', 'shadow', 'special'];\r\n\r\n/**\r\n * Liste des classes CSS applicables sur un bouton :\r\n * * __simple__ : Simple lien, sans l'aspect \"bouton\".\r\n * * __shadow__ : Bouton légèrement plus foncé.\r\n * * __warning__ : Bouton orangé pour indiquer une action potentiellement dangereuse.\r\n * * __small__ : Bouton de petite taille (environ 70%).\r\n *\r\n * @param {object} opts\r\n * * {string} `value`: Text à afficher dans le bouton.\r\n * * {string} `href`: Si défini, lien vers lequel dirigier la page en cas de click.\r\n * * {boolean} `enabled`: Mettre `false` pour désactiver le bouton.\r\n * * {object} `email`: Associe le _Tap_ à l'envoi d'un mail.\r\n *   * {string} `to`: destinataire.\r\n *   * {string} `subject`: sujet du mail.\r\n *   * {string} `body`: corps du mail.\r\n *\r\n * @example\r\n * var Button = require(\"tp4.button\");\r\n * var instance = new Button();\r\n * @class Button\r\n */\r\nvar Button = function(opts) {\r\n    var that = this;\r\n\r\n    var elem = $.elem(this, typeof opts.href === 'string' ? 'a' : 'button', 'wdg-button');\r\n    var icon = null;\r\n\r\n    var refresh = function() {\r\n        $.clear( elem );\r\n        if (icon) {\r\n            $.add( elem, icon.element, that.text );\r\n        } else {\r\n            elem.textContent = that.text;\r\n        }        \r\n    };\r\n    \r\n    DB.prop(this, 'value');\r\n    DB.propEnum( TYPES )(this, 'type')(function(v) {\r\n        TYPES.forEach(function (type) {\r\n            $.removeClass(elem, type);\r\n        });\r\n        $.addClass(elem, v);\r\n    });\r\n    DB.prop(this, 'icon')(function(v) {\r\n        if (!v || (typeof v === 'string' && v.trim().length == 0)) {\r\n            icon = null;\r\n        } else if (v.element) {\r\n            icon = v.element;\r\n        } else {\r\n            icon = new Icon({content: v, size: \"1.2em\"});\r\n        }\r\n        refresh();\r\n    });\r\n    DB.propString(this, 'text')(function(v) {\r\n        refresh();\r\n    });\r\n    DB.propBoolean(this, 'enabled')(function(v) {\r\n        if (v) {\r\n            $.removeAtt(elem, 'disabled');\r\n        } else {\r\n            $.att(elem, 'disabled', 'yes');\r\n        }\r\n    });\r\n    DB.propBoolean(this, 'small')(function(v) {\r\n        if (v) {\r\n            $.addClass(elem, 'small');\r\n        } else {\r\n            $.removeClass(elem, 'small');\r\n        }\r\n    });\r\n    DB.prop(this, 'action', 0);\r\n\r\n    opts = DB.extend({\r\n        text: \"OK\",\r\n        value: \"action\",\r\n        icon: \"\",\r\n        small: false,\r\n        enabled: true,\r\n        wide: false,\r\n        visible: true,\r\n        type: \"standard\"\r\n    }, opts, this);\r\n\r\n    // Animate the pressing.\r\n    $.on(this.element, {\r\n        down: function() {\r\n            if (that.enabled) {\r\n                $.addClass(elem, 'press');\r\n            }\r\n        },\r\n        up: function() {\r\n            $.removeClass(elem, 'press');\r\n        },\r\n        tap: that.fire.bind( that ),\r\n        keydown: function(evt) {\r\n            if (evt.keyCode == 13 || evt.keyCode == 32) {\r\n                evt.preventDefault();\r\n                evt.stopPropagation();\r\n                that.fire();\r\n            }\r\n        }\r\n    });\r\n};\r\n\r\n/**\r\n * Simulate a click on the button if it is enabled.\r\n */\r\nButton.prototype.fire = function() {\r\n    if (this.enabled) DB.fire( this, 'action', this.value );\r\n};\r\n\r\n/**\r\n * Disable the button and start a wait animation.\r\n */\r\nButton.prototype.waitOn = function(text) {\r\n    if (typeof text === 'undefined') text = this.caption();\r\n    this.enabled(false);\r\n    this.clear(W({size: '1em', caption: text}));\r\n};\r\n\r\n/**\r\n * Stop the wait animation and enable the button again.\r\n */\r\nButton.prototype.waitOff = function() {\r\n    this.caption(this.caption());\r\n    this.enabled(true);\r\n};\r\n\r\n\r\nfunction genericButton( id, type ) {\r\n    if( typeof type === 'undefined' ) type = 'standard';\r\n    var iconName = id;\r\n    var intl = id;\r\n    if( intl == 'yes' ) intl = 'ok';\r\n    if( intl == 'no' ) intl = 'cancel';\r\n    var btn = new Button({ text: _(intl), icon: id, value: id, type: type });\r\n    return btn;\r\n}\r\n\r\nButton.Cancel = function() { return genericButton('cancel', 'shadow'); };\r\nButton.Close = function() { return genericButton('close', 'simple'); };\r\nButton.Delete = function() { return genericButton('delete', 'warning'); };\r\nButton.No = function() { return genericButton('no'); };\r\nButton.Ok = function() { return genericButton('ok'); };\r\nButton.Edit = function() { return genericButton('edit'); };\r\nButton.Save = function() { return genericButton('save', 'special'); };\r\nButton.Yes = function() { return genericButton('yes'); };\r\n\r\nButton.default = {\r\n    caption: \"OK\",\r\n    type: \"default\"\r\n};\r\n\r\nmodule.exports = Button;\r\n\r\n\r\n\r\n \r\n/**\n * @module wdg.button\n * @see module:$\n * @see module:dom\n * @see module:tfw.data-binding\n * @see module:wdg.button\n * @see module:wdg.icon\n\n */\n});","zip":"require(\"wdg.button\",function(e,t){function n(){return a(o,arguments)}function i(e,t){\"undefined\"==typeof t&&(t=\"standard\");var i=e;\"yes\"==i&&(i=\"ok\"),\"no\"==i&&(i=\"cancel\");var o=new c({text:n(i),icon:e,value:e,type:t});return o}var o={en:{cancel:\"Cancel\",close:\"Close\",\"delete\":\"Delete\",edit:\"Edit\",no:\"No\",ok:\"OK\",save:\"Save\",yes:\"Yes\"},fr:{cancel:\"Annuler\",close:\"Fermer\",\"delete\":\"Supprimer\",edit:\"Editer\",no:\"Non\",ok:\"Valider\",save:\"Sauver\",yes:\"Oui\"}},a=require(\"$\").intl,r=require(\"dom\"),s=require(\"tfw.data-binding\"),l=require(\"wdg.icon\"),u=[\"standard\",\"simple\",\"warning\",\"shadow\",\"special\"],c=function(e){var t=this,n=r.elem(this,\"string\"==typeof e.href?\"a\":\"button\",\"wdg-button\"),i=null,o=function(){r.clear(n),i?r.add(n,i.element,t.text):n.textContent=t.text};s.prop(this,\"value\"),s.propEnum(u)(this,\"type\")(function(e){u.forEach(function(e){r.removeClass(n,e)}),r.addClass(n,e)}),s.prop(this,\"icon\")(function(e){i=!e||\"string\"==typeof e&&0==e.trim().length?null:e.element?e.element:new l({content:e,size:\"1.2em\"}),o()}),s.propString(this,\"text\")(function(e){o()}),s.propBoolean(this,\"enabled\")(function(e){e?r.removeAtt(n,\"disabled\"):r.att(n,\"disabled\",\"yes\")}),s.propBoolean(this,\"small\")(function(e){e?r.addClass(n,\"small\"):r.removeClass(n,\"small\")}),s.prop(this,\"action\",0),e=s.extend({text:\"OK\",value:\"action\",icon:\"\",small:!1,enabled:!0,wide:!1,visible:!0,type:\"standard\"},e,this),r.on(this.element,{down:function(){t.enabled&&r.addClass(n,\"press\")},up:function(){r.removeClass(n,\"press\")},tap:t.fire.bind(t),keydown:function(e){13!=e.keyCode&&32!=e.keyCode||(e.preventDefault(),e.stopPropagation(),t.fire())}})};c.prototype.fire=function(){this.enabled&&s.fire(this,\"action\",this.value)},c.prototype.waitOn=function(e){\"undefined\"==typeof e&&(e=this.caption()),this.enabled(!1),this.clear(W({size:\"1em\",caption:e}))},c.prototype.waitOff=function(){this.caption(this.caption()),this.enabled(!0)},c.Cancel=function(){return i(\"cancel\",\"shadow\")},c.Close=function(){return i(\"close\",\"simple\")},c.Delete=function(){return i(\"delete\",\"warning\")},c.No=function(){return i(\"no\")},c.Ok=function(){return i(\"ok\")},c.Edit=function(){return i(\"edit\")},c.Save=function(){return i(\"save\",\"special\")},c.Yes=function(){return i(\"yes\")},c[\"default\"]={caption:\"OK\",type:\"default\"},t.exports=c});\n//# sourceMappingURL=wdg.button.js.map","map":{"version":3,"file":"wdg.button.js.map","sources":["wdg.button.js"],"sourcesContent":["/** @module wdg.button */require( 'wdg.button', function(exports, module) { var _intl_={\"en\":{\"cancel\":\"Cancel\",\"close\":\"Close\",\"delete\":\"Delete\",\"edit\":\"Edit\",\"no\":\"No\",\"ok\":\"OK\",\"save\":\"Save\",\"yes\":\"Yes\"},\"fr\":{\"cancel\":\"Annuler\",\"close\":\"Fermer\",\"delete\":\"Supprimer\",\"edit\":\"Editer\",\"no\":\"Non\",\"ok\":\"Valider\",\"save\":\"Sauver\",\"yes\":\"Oui\"}},_$=require(\"$\").intl;function _(){return _$(_intl_, arguments);}\r\n var $ = require(\"dom\");\r\nvar DB = require(\"tfw.data-binding\");\r\nvar Icon = require(\"wdg.icon\");\r\n\r\nvar TYPES = ['standard', 'simple', 'warning', 'shadow', 'special'];\r\n\r\n/**\r\n * Liste des classes CSS applicables sur un bouton :\r\n * * __simple__ : Simple lien, sans l'aspect \"bouton\".\r\n * * __shadow__ : Bouton légèrement plus foncé.\r\n * * __warning__ : Bouton orangé pour indiquer une action potentiellement dangereuse.\r\n * * __small__ : Bouton de petite taille (environ 70%).\r\n *\r\n * @param {object} opts\r\n * * {string} `value`: Text à afficher dans le bouton.\r\n * * {string} `href`: Si défini, lien vers lequel dirigier la page en cas de click.\r\n * * {boolean} `enabled`: Mettre `false` pour désactiver le bouton.\r\n * * {object} `email`: Associe le _Tap_ à l'envoi d'un mail.\r\n *   * {string} `to`: destinataire.\r\n *   * {string} `subject`: sujet du mail.\r\n *   * {string} `body`: corps du mail.\r\n *\r\n * @example\r\n * var Button = require(\"tp4.button\");\r\n * var instance = new Button();\r\n * @class Button\r\n */\r\nvar Button = function(opts) {\r\n    var that = this;\r\n\r\n    var elem = $.elem(this, typeof opts.href === 'string' ? 'a' : 'button', 'wdg-button');\r\n    var icon = null;\r\n\r\n    var refresh = function() {\r\n        $.clear( elem );\r\n        if (icon) {\r\n            $.add( elem, icon.element, that.text );\r\n        } else {\r\n            elem.textContent = that.text;\r\n        }        \r\n    };\r\n    \r\n    DB.prop(this, 'value');\r\n    DB.propEnum( TYPES )(this, 'type')(function(v) {\r\n        TYPES.forEach(function (type) {\r\n            $.removeClass(elem, type);\r\n        });\r\n        $.addClass(elem, v);\r\n    });\r\n    DB.prop(this, 'icon')(function(v) {\r\n        if (!v || (typeof v === 'string' && v.trim().length == 0)) {\r\n            icon = null;\r\n        } else if (v.element) {\r\n            icon = v.element;\r\n        } else {\r\n            icon = new Icon({content: v, size: \"1.2em\"});\r\n        }\r\n        refresh();\r\n    });\r\n    DB.propString(this, 'text')(function(v) {\r\n        refresh();\r\n    });\r\n    DB.propBoolean(this, 'enabled')(function(v) {\r\n        if (v) {\r\n            $.removeAtt(elem, 'disabled');\r\n        } else {\r\n            $.att(elem, 'disabled', 'yes');\r\n        }\r\n    });\r\n    DB.propBoolean(this, 'small')(function(v) {\r\n        if (v) {\r\n            $.addClass(elem, 'small');\r\n        } else {\r\n            $.removeClass(elem, 'small');\r\n        }\r\n    });\r\n    DB.prop(this, 'action', 0);\r\n\r\n    opts = DB.extend({\r\n        text: \"OK\",\r\n        value: \"action\",\r\n        icon: \"\",\r\n        small: false,\r\n        enabled: true,\r\n        wide: false,\r\n        visible: true,\r\n        type: \"standard\"\r\n    }, opts, this);\r\n\r\n    // Animate the pressing.\r\n    $.on(this.element, {\r\n        down: function() {\r\n            if (that.enabled) {\r\n                $.addClass(elem, 'press');\r\n            }\r\n        },\r\n        up: function() {\r\n            $.removeClass(elem, 'press');\r\n        },\r\n        tap: that.fire.bind( that ),\r\n        keydown: function(evt) {\r\n            if (evt.keyCode == 13 || evt.keyCode == 32) {\r\n                evt.preventDefault();\r\n                evt.stopPropagation();\r\n                that.fire();\r\n            }\r\n        }\r\n    });\r\n};\r\n\r\n/**\r\n * Simulate a click on the button if it is enabled.\r\n */\r\nButton.prototype.fire = function() {\r\n    if (this.enabled) DB.fire( this, 'action', this.value );\r\n};\r\n\r\n/**\r\n * Disable the button and start a wait animation.\r\n */\r\nButton.prototype.waitOn = function(text) {\r\n    if (typeof text === 'undefined') text = this.caption();\r\n    this.enabled(false);\r\n    this.clear(W({size: '1em', caption: text}));\r\n};\r\n\r\n/**\r\n * Stop the wait animation and enable the button again.\r\n */\r\nButton.prototype.waitOff = function() {\r\n    this.caption(this.caption());\r\n    this.enabled(true);\r\n};\r\n\r\n\r\nfunction genericButton( id, type ) {\r\n    if( typeof type === 'undefined' ) type = 'standard';\r\n    var iconName = id;\r\n    var intl = id;\r\n    if( intl == 'yes' ) intl = 'ok';\r\n    if( intl == 'no' ) intl = 'cancel';\r\n    var btn = new Button({ text: _(intl), icon: id, value: id, type: type });\r\n    return btn;\r\n}\r\n\r\nButton.Cancel = function() { return genericButton('cancel', 'shadow'); };\r\nButton.Close = function() { return genericButton('close', 'simple'); };\r\nButton.Delete = function() { return genericButton('delete', 'warning'); };\r\nButton.No = function() { return genericButton('no'); };\r\nButton.Ok = function() { return genericButton('ok'); };\r\nButton.Edit = function() { return genericButton('edit'); };\r\nButton.Save = function() { return genericButton('save', 'special'); };\r\nButton.Yes = function() { return genericButton('yes'); };\r\n\r\nButton.default = {\r\n    caption: \"OK\",\r\n    type: \"default\"\r\n};\r\n\r\nmodule.exports = Button;\r\n\r\n\r\n\r\n \r\n});"],"names":["require","exports","module","_","_$","_intl_","arguments","genericButton","id","type","intl","btn","Button","text","icon","value","en","cancel","close","delete","edit","no","ok","save","yes","fr","$","DB","Icon","TYPES","opts","that","this","elem","href","refresh","clear","add","element","textContent","prop","propEnum","v","forEach","removeClass","addClass","trim","length","content","size","propString","propBoolean","removeAtt","att","extend","small","enabled","wide","visible","on","down","up","tap","fire","bind","keydown","evt","keyCode","preventDefault","stopPropagation","prototype","waitOn","caption","W","waitOff","Cancel","Close","Delete","No","Ok","Edit","Save","Yes"],"mappings":"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"},"dependencies":["mod/$","mod/dom","mod/tfw.data-binding","mod/wdg.button","mod/wdg.icon"]}