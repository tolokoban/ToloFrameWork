{"intl":"","src":"/** @module wdg.text */require( 'wdg.text', function(exports, module) {  var $ = require(\"dom\");\r\nvar DB = require(\"tfw.data-binding\");\r\nvar LaterAction = require(\"tfw.timer\").laterAction;\r\n\r\n/**\r\n * @class tfw.edit.text\r\n * @description  HTML5 text input with many options.\r\n *\r\n * __Attributes__:\r\n * * {string} `value`:\r\n * * {string} `value`:\r\n * * {string} `value`:\r\n * * {string} `value`:\r\n * * {string} `value`:\r\n * * {string} `value`:\r\n * * {string} `value`:\r\n */\r\nvar Text = function(opts) {\r\n    var that = this;\r\n\r\n    var dataListHasFocus = false;\r\n\r\n    var label = $.div( 'label' );\r\n    var input = $.tag( 'input' );\r\n    var datalist = $.div( 'datalist' );\r\n    this._input = input;\r\n    var elem = $.elem( this, 'div', 'wdg-text', [label, input, datalist] );\r\n\r\n    DB.propString(this, 'value')(function(v) {\r\n        input.value = v;\r\n        that.validate();\r\n    });\r\n    DB.propEnum(['text', 'button', 'checkbox', 'color', 'date', 'datetime', 'email', 'file',\r\n                 'hidden', 'image', 'month', 'password', 'radio', 'range', 'reset',\r\n                 'search', 'submit', 'tel', 'time', 'url', 'week'])(this, 'type')\r\n    (function(v) {\r\n        $.att(input, {type: v});\r\n    });\r\n    DB.propStringArray(this, 'list')(function(v) {\r\n        $.clear( datalist );\r\n        $.removeClass( elem, \"list\" );\r\n        if (!Array.isArray( v )) return;\r\n        v.forEach(function ( item ) {\r\n            $.add( datalist, $.div( [item] ) );\r\n        });\r\n        $.att( elem, \"list\" );\r\n    });\r\n    DB.propValidator(this, 'validator')(this.validate.bind( this ));\r\n    DB.propBoolean(this, 'valid')(function(v) {\r\n        if (v === null || !that.validator) {\r\n            $.removeClass( elem, \"valid\", \"no-valid\" );\r\n        } else {\r\n            if (v) {\r\n                $.addClass( elem, \"valid\" );\r\n                $.removeClass( elem, \"no-valid\" );\r\n            } else {\r\n                $.removeClass( elem, \"valid\" );\r\n                $.addClass( elem, \"no-valid\" );\r\n            }\r\n        }\r\n    });\r\n    DB.propBoolean(this, 'enabled')(function(v) {\r\n        if (v) {\r\n            $.removeAtt(input, 'disabled');\r\n        } else {\r\n            $.att(input, {disabled: v});\r\n        }\r\n    });\r\n    DB.propInteger(this, 'size')(function(v) {\r\n        if (v < 1) {\r\n            $.removeAtt(input, 'size');\r\n        } else {\r\n            $.att(input, {size: v});\r\n        }\r\n    });\r\n    DB.propString(this, 'label')(function(v) {\r\n        if (v === null || (typeof v === 'string' && v.trim() == '')) {\r\n            $.addClass(elem, 'no-label');\r\n        } else {\r\n            $.removeClass(elem, 'no-label');\r\n            $.textOrHtml(label, v);\r\n            if (v.substr(0, 6) == '<html>') {\r\n                $.att(label, {title: ''});\r\n            } else {\r\n                $.att(label, {title: v});\r\n            }\r\n        }\r\n    });\r\n    DB.propString(this, 'placeholder')(function(v) {\r\n        $.att(input, {placeholder: v});\r\n    });\r\n    DB.propString(this, 'width')(function(v) {\r\n        elem.style.width = v;\r\n    });\r\n    DB.propInteger(this, 'action', '');\r\n\r\n    opts = DB.extend({\r\n        value: '',\r\n        type: 'text',\r\n        placeholder: '',\r\n        enabled: true,\r\n        validator: null,\r\n        valid: true,\r\n        list: null,\r\n        label: '',\r\n        placeholder: '',\r\n        size: 10,\r\n        width: 'auto',\r\n        wide: false,\r\n        visible: true\r\n    }, opts, this);\r\n\r\n    var complete = function() {\r\n        $.removeClass( elem, \"list\" );\r\n        if (!that.list || that.list.length == 0) return;\r\n\r\n        $.clear( datalist );\r\n        var list = that.list.map(String.toLowerCase);\r\n        var needle = input.value.trim().toLowerCase();\r\n\r\n        if (needle.length > 0) {\r\n            list = list.map(function(itm, idx) {\r\n                return [idx, itm.indexOf( needle )];\r\n            }).filter(function(itm) {\r\n                return itm[1] > -1;\r\n            }).sort(function(a, b) {\r\n                var d = a[1] - b[1];\r\n                if (d != 0) return d;\r\n                var sa = that.list[a[0]];\r\n                var sb = that.list[b[0]];\r\n                if (sa < sb) return -1;\r\n                if (sa > sb) return 1;\r\n                return 0;\r\n            }).map(function(itm) {\r\n                var t = that.list[itm[0]];\r\n                var i = itm[1];\r\n                return t.substr(0, i) \r\n                    + \"<b>\" + t.substr(i, needle.length) + \"</b>\" \r\n                    + t.substr(i + needle.length);\r\n            });\r\n        } else {\r\n            list = list.sort();\r\n        }\r\n\r\n        list.forEach(function (item) {\r\n            var div = $.div();\r\n            div.innerHTML = item;\r\n            $.add( datalist, div );\r\n            $.on( div, {\r\n                down: function() {\r\n                    dataListHasFocus = true;\r\n                },\r\n                up: function() {\r\n                    dataListHasFocus = false;\r\n                    input.focus();\r\n                },\r\n                tap: function() {\r\n                    that.value = div.textContent.trim();\r\n                    $.removeClass( elem, 'list' );\r\n                }\r\n            });\r\n        });\r\n        \r\n        $.addClass( elem, \"list\" );\r\n    };\r\n\r\n    var actionUpdateValue = LaterAction(function() {\r\n        that.value = input.value;\r\n    }, 300);\r\n    input.addEventListener('keyup', function() {\r\n        complete();\r\n        actionUpdateValue.fire();\r\n    });\r\n    input.addEventListener('blur', function() {\r\n        that.value = input.value;\r\n        if (!dataListHasFocus) {\r\n            $.removeClass( elem, \"list\" );\r\n        }\r\n    });\r\n    input.addEventListener('focus', that.selectAll.bind(that));\r\n    input.addEventListener('keydown', function(evt) {\r\n        if (evt.keyCode == 13) {\r\n            evt.preventDefault();\r\n            evt.stopPropagation();\r\n            if (that.valid !== false) {\r\n                DB.fire( that, 'value', input.value );\r\n                DB.fire( that, 'action', input.value );\r\n            }\r\n        }\r\n    });\r\n\r\n    this.validate();\r\n};\r\n\r\n\r\n/**\r\n * Force value validation.\r\n */\r\nText.prototype.validate = function() {\r\n    var validator = this.validator;\r\n    if (!validator) return;\r\n    try {\r\n        this.valid = validator( this.value );\r\n    }\r\n    catch (ex) {\r\n        console.error(\"[wdg.text:validate] Exception = \", ex);\r\n        console.error(\"[wdg.text:validate] Validator = \", validator);\r\n    }\r\n};\r\n\r\n/**\r\n * Select whole text.\r\n * @return {this}\r\n */\r\nText.prototype.selectAll = function() {\r\n    var e = this._input;\r\n    e.setSelectionRange(0, e.value.length);\r\n    return true;\r\n};\r\n\r\nmodule.exports = Text;\r\n\r\n\r\n\r\n \r\n/**\n * @module wdg.text\n * @see module:dom\n * @see module:tfw.data-binding\n * @see module:tfw.timer\n * @see module:wdg.text\n\n */\n});","zip":"require(\"wdg.text\",function(t,e){var i=require(\"dom\"),a=require(\"tfw.data-binding\"),l=require(\"tfw.timer\").laterAction,n=function(t){var e=this,n=!1,r=i.div(\"label\"),o=i.tag(\"input\"),s=i.div(\"datalist\");this._input=o;var d=i.elem(this,\"div\",\"wdg-text\",[r,o,s]);a.propString(this,\"value\")(function(t){o.value=t,e.validate()}),a.propEnum([\"text\",\"button\",\"checkbox\",\"color\",\"date\",\"datetime\",\"email\",\"file\",\"hidden\",\"image\",\"month\",\"password\",\"radio\",\"range\",\"reset\",\"search\",\"submit\",\"tel\",\"time\",\"url\",\"week\"])(this,\"type\")(function(t){i.att(o,{type:t})}),a.propStringArray(this,\"list\")(function(t){i.clear(s),i.removeClass(d,\"list\"),Array.isArray(t)&&(t.forEach(function(t){i.add(s,i.div([t]))}),i.att(d,\"list\"))}),a.propValidator(this,\"validator\")(this.validate.bind(this)),a.propBoolean(this,\"valid\")(function(t){null!==t&&e.validator?t?(i.addClass(d,\"valid\"),i.removeClass(d,\"no-valid\")):(i.removeClass(d,\"valid\"),i.addClass(d,\"no-valid\")):i.removeClass(d,\"valid\",\"no-valid\")}),a.propBoolean(this,\"enabled\")(function(t){t?i.removeAtt(o,\"disabled\"):i.att(o,{disabled:t})}),a.propInteger(this,\"size\")(function(t){1>t?i.removeAtt(o,\"size\"):i.att(o,{size:t})}),a.propString(this,\"label\")(function(t){null===t||\"string\"==typeof t&&\"\"==t.trim()?i.addClass(d,\"no-label\"):(i.removeClass(d,\"no-label\"),i.textOrHtml(r,t),\"<html>\"==t.substr(0,6)?i.att(r,{title:\"\"}):i.att(r,{title:t}))}),a.propString(this,\"placeholder\")(function(t){i.att(o,{placeholder:t})}),a.propString(this,\"width\")(function(t){d.style.width=t}),a.propInteger(this,\"action\",\"\"),t=a.extend({value:\"\",type:\"text\",placeholder:\"\",enabled:!0,validator:null,valid:!0,list:null,label:\"\",placeholder:\"\",size:10,width:\"auto\",wide:!1,visible:!0},t,this);var u=function(){if(i.removeClass(d,\"list\"),e.list&&0!=e.list.length){i.clear(s);var t=e.list.map(String.toLowerCase),a=o.value.trim().toLowerCase();t=a.length>0?t.map(function(t,e){return[e,t.indexOf(a)]}).filter(function(t){return t[1]>-1}).sort(function(t,i){var a=t[1]-i[1];if(0!=a)return a;var l=e.list[t[0]],n=e.list[i[0]];return n>l?-1:l>n?1:0}).map(function(t){var i=e.list[t[0]],l=t[1];return i.substr(0,l)+\"<b>\"+i.substr(l,a.length)+\"</b>\"+i.substr(l+a.length)}):t.sort(),t.forEach(function(t){var a=i.div();a.innerHTML=t,i.add(s,a),i.on(a,{down:function(){n=!0},up:function(){n=!1,o.focus()},tap:function(){e.value=a.textContent.trim(),i.removeClass(d,\"list\")}})}),i.addClass(d,\"list\")}},v=l(function(){e.value=o.value},300);o.addEventListener(\"keyup\",function(){u(),v.fire()}),o.addEventListener(\"blur\",function(){e.value=o.value,n||i.removeClass(d,\"list\")}),o.addEventListener(\"focus\",e.selectAll.bind(e)),o.addEventListener(\"keydown\",function(t){13==t.keyCode&&(t.preventDefault(),t.stopPropagation(),e.valid!==!1&&(a.fire(e,\"value\",o.value),a.fire(e,\"action\",o.value)))}),this.validate()};n.prototype.validate=function(){var t=this.validator;if(t)try{this.valid=t(this.value)}catch(e){console.error(\"[wdg.text:validate] Exception = \",e),console.error(\"[wdg.text:validate] Validator = \",t)}},n.prototype.selectAll=function(){var t=this._input;return t.setSelectionRange(0,t.value.length),!0},e.exports=n});\n//# sourceMappingURL=wdg.text.js.map","map":{"version":3,"file":"wdg.text.js.map","sources":["wdg.text.js"],"sourcesContent":["/** @module wdg.text */require( 'wdg.text', function(exports, module) {  var $ = require(\"dom\");\r\nvar DB = require(\"tfw.data-binding\");\r\nvar LaterAction = require(\"tfw.timer\").laterAction;\r\n\r\n/**\r\n * @class tfw.edit.text\r\n * @description  HTML5 text input with many options.\r\n *\r\n * __Attributes__:\r\n * * {string} `value`:\r\n * * {string} `value`:\r\n * * {string} `value`:\r\n * * {string} `value`:\r\n * * {string} `value`:\r\n * * {string} `value`:\r\n * * {string} `value`:\r\n */\r\nvar Text = function(opts) {\r\n    var that = this;\r\n\r\n    var dataListHasFocus = false;\r\n\r\n    var label = $.div( 'label' );\r\n    var input = $.tag( 'input' );\r\n    var datalist = $.div( 'datalist' );\r\n    this._input = input;\r\n    var elem = $.elem( this, 'div', 'wdg-text', [label, input, datalist] );\r\n\r\n    DB.propString(this, 'value')(function(v) {\r\n        input.value = v;\r\n        that.validate();\r\n    });\r\n    DB.propEnum(['text', 'button', 'checkbox', 'color', 'date', 'datetime', 'email', 'file',\r\n                 'hidden', 'image', 'month', 'password', 'radio', 'range', 'reset',\r\n                 'search', 'submit', 'tel', 'time', 'url', 'week'])(this, 'type')\r\n    (function(v) {\r\n        $.att(input, {type: v});\r\n    });\r\n    DB.propStringArray(this, 'list')(function(v) {\r\n        $.clear( datalist );\r\n        $.removeClass( elem, \"list\" );\r\n        if (!Array.isArray( v )) return;\r\n        v.forEach(function ( item ) {\r\n            $.add( datalist, $.div( [item] ) );\r\n        });\r\n        $.att( elem, \"list\" );\r\n    });\r\n    DB.propValidator(this, 'validator')(this.validate.bind( this ));\r\n    DB.propBoolean(this, 'valid')(function(v) {\r\n        if (v === null || !that.validator) {\r\n            $.removeClass( elem, \"valid\", \"no-valid\" );\r\n        } else {\r\n            if (v) {\r\n                $.addClass( elem, \"valid\" );\r\n                $.removeClass( elem, \"no-valid\" );\r\n            } else {\r\n                $.removeClass( elem, \"valid\" );\r\n                $.addClass( elem, \"no-valid\" );\r\n            }\r\n        }\r\n    });\r\n    DB.propBoolean(this, 'enabled')(function(v) {\r\n        if (v) {\r\n            $.removeAtt(input, 'disabled');\r\n        } else {\r\n            $.att(input, {disabled: v});\r\n        }\r\n    });\r\n    DB.propInteger(this, 'size')(function(v) {\r\n        if (v < 1) {\r\n            $.removeAtt(input, 'size');\r\n        } else {\r\n            $.att(input, {size: v});\r\n        }\r\n    });\r\n    DB.propString(this, 'label')(function(v) {\r\n        if (v === null || (typeof v === 'string' && v.trim() == '')) {\r\n            $.addClass(elem, 'no-label');\r\n        } else {\r\n            $.removeClass(elem, 'no-label');\r\n            $.textOrHtml(label, v);\r\n            if (v.substr(0, 6) == '<html>') {\r\n                $.att(label, {title: ''});\r\n            } else {\r\n                $.att(label, {title: v});\r\n            }\r\n        }\r\n    });\r\n    DB.propString(this, 'placeholder')(function(v) {\r\n        $.att(input, {placeholder: v});\r\n    });\r\n    DB.propString(this, 'width')(function(v) {\r\n        elem.style.width = v;\r\n    });\r\n    DB.propInteger(this, 'action', '');\r\n\r\n    opts = DB.extend({\r\n        value: '',\r\n        type: 'text',\r\n        placeholder: '',\r\n        enabled: true,\r\n        validator: null,\r\n        valid: true,\r\n        list: null,\r\n        label: '',\r\n        placeholder: '',\r\n        size: 10,\r\n        width: 'auto',\r\n        wide: false,\r\n        visible: true\r\n    }, opts, this);\r\n\r\n    var complete = function() {\r\n        $.removeClass( elem, \"list\" );\r\n        if (!that.list || that.list.length == 0) return;\r\n\r\n        $.clear( datalist );\r\n        var list = that.list.map(String.toLowerCase);\r\n        var needle = input.value.trim().toLowerCase();\r\n\r\n        if (needle.length > 0) {\r\n            list = list.map(function(itm, idx) {\r\n                return [idx, itm.indexOf( needle )];\r\n            }).filter(function(itm) {\r\n                return itm[1] > -1;\r\n            }).sort(function(a, b) {\r\n                var d = a[1] - b[1];\r\n                if (d != 0) return d;\r\n                var sa = that.list[a[0]];\r\n                var sb = that.list[b[0]];\r\n                if (sa < sb) return -1;\r\n                if (sa > sb) return 1;\r\n                return 0;\r\n            }).map(function(itm) {\r\n                var t = that.list[itm[0]];\r\n                var i = itm[1];\r\n                return t.substr(0, i) \r\n                    + \"<b>\" + t.substr(i, needle.length) + \"</b>\" \r\n                    + t.substr(i + needle.length);\r\n            });\r\n        } else {\r\n            list = list.sort();\r\n        }\r\n\r\n        list.forEach(function (item) {\r\n            var div = $.div();\r\n            div.innerHTML = item;\r\n            $.add( datalist, div );\r\n            $.on( div, {\r\n                down: function() {\r\n                    dataListHasFocus = true;\r\n                },\r\n                up: function() {\r\n                    dataListHasFocus = false;\r\n                    input.focus();\r\n                },\r\n                tap: function() {\r\n                    that.value = div.textContent.trim();\r\n                    $.removeClass( elem, 'list' );\r\n                }\r\n            });\r\n        });\r\n        \r\n        $.addClass( elem, \"list\" );\r\n    };\r\n\r\n    var actionUpdateValue = LaterAction(function() {\r\n        that.value = input.value;\r\n    }, 300);\r\n    input.addEventListener('keyup', function() {\r\n        complete();\r\n        actionUpdateValue.fire();\r\n    });\r\n    input.addEventListener('blur', function() {\r\n        that.value = input.value;\r\n        if (!dataListHasFocus) {\r\n            $.removeClass( elem, \"list\" );\r\n        }\r\n    });\r\n    input.addEventListener('focus', that.selectAll.bind(that));\r\n    input.addEventListener('keydown', function(evt) {\r\n        if (evt.keyCode == 13) {\r\n            evt.preventDefault();\r\n            evt.stopPropagation();\r\n            if (that.valid !== false) {\r\n                DB.fire( that, 'value', input.value );\r\n                DB.fire( that, 'action', input.value );\r\n            }\r\n        }\r\n    });\r\n\r\n    this.validate();\r\n};\r\n\r\n\r\n/**\r\n * Force value validation.\r\n */\r\nText.prototype.validate = function() {\r\n    var validator = this.validator;\r\n    if (!validator) return;\r\n    try {\r\n        this.valid = validator( this.value );\r\n    }\r\n    catch (ex) {\r\n        console.error(\"[wdg.text:validate] Exception = \", ex);\r\n        console.error(\"[wdg.text:validate] Validator = \", validator);\r\n    }\r\n};\r\n\r\n/**\r\n * Select whole text.\r\n * @return {this}\r\n */\r\nText.prototype.selectAll = function() {\r\n    var e = this._input;\r\n    e.setSelectionRange(0, e.value.length);\r\n    return true;\r\n};\r\n\r\nmodule.exports = Text;\r\n\r\n\r\n\r\n \r\n});"],"names":["require","exports","module","$","DB","LaterAction","laterAction","Text","opts","that","this","dataListHasFocus","label","div","input","tag","datalist","_input","elem","propString","v","value","validate","propEnum","att","type","propStringArray","clear","removeClass","Array","isArray","forEach","item","add","propValidator","bind","propBoolean","validator","addClass","removeAtt","disabled","propInteger","size","trim","textOrHtml","substr","title","placeholder","style","width","extend","enabled","valid","list","wide","visible","complete","length","map","String","toLowerCase","needle","itm","idx","indexOf","filter","sort","a","b","d","sa","sb","t","i","innerHTML","on","down","up","focus","tap","textContent","actionUpdateValue","addEventListener","fire","selectAll","evt","keyCode","preventDefault","stopPropagation","prototype","ex","console","error","e","setSelectionRange"],"mappings":"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"},"dependencies":["mod/dom","mod/tfw.data-binding","mod/tfw.timer","mod/wdg.text"]}