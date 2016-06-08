var $ = require("dom");
var DB = require("tfw.data-binding");
var LaterAction = require("tfw.timer").laterAction;

/**
 * @class tfw.edit.text
 * @description  HTML5 text input with many options.
 *
 * __Attributes__:
 * * {string} `value`:
 * * {string} `value`:
 * * {string} `value`:
 * * {string} `value`:
 * * {string} `value`:
 * * {string} `value`:
 * * {string} `value`:
 */
var Text = function(opts) {
    var that = this;

    var dataListHasFocus = false;

    var label = $.div( 'label' );
    var button = $.tag( 'button' );
    var datalist = $.div( 'datalist' );
    this._button = button;
    var elem = $.elem( this, 'div', 'wdg-combo', [label, button, datalist] );

    DB.propString(this, 'value')(function(v) {
    });
    DB.propBoolean(this, 'enabled')(function(v) {
        if (v) {
            $.removeClass(elem, 'disabled');
        } else {
            $.addClass(elem, 'disabled');
        }
    });
    DB.propString(this, 'label')(function(v) {
        if (v === null || (typeof v === 'string' && v.trim() == '')) {
            $.addClass(elem, 'no-label');
        } else {
            $.removeClass(elem, 'no-label');
            $.textOrHtml(label, v);
            if (v.substr(0, 6) == '<html>') {
                $.att(label, {title: ''});
            } else {
                $.att(label, {title: v});
            }
        }
    });

    opts = DB.extend({
        value: '',
        enabled: true,
        content: {},
        label: null,
        wide: false,
        visible: true
    }, opts, this);

    var tap = function(evt) {
        var key = evt.target.getAttribute("data-key");
        $.removeClass( elem, 'list' );
    };
    var complete = function() {
        $.removeClass( elem, "list" );
        if (!that.list || that.list.length == 0) return;

        $.clear( datalist );
        var key, val, item;
        for( key in that.content ) {
            if (key == that.value) continue;
            val = that.content[key];
            item = $.div({"data-key": key}, [ val ]);
            $.add( datalist, item );
            $.on( item, {
                down: function() {
                    dataListHasFocus = true;
                },
                up: function() {
                    dataListHasFocus = false;
                    button.focus();
                },
                tap: tap
            });
        }
        
        $.addClass( elem, "list" );
    };

    input.addEventListener('keydown', function(evt) {
        if (evt.keyCode == 13) {
            evt.preventDefault();
            evt.stopPropagation();
            if (that.valid !== false) {
                DB.fire( that, 'value', input.value );
                DB.fire( that, 'action', input.value );
            }
        }
    });

    this.validate();
};

/**
 * Force value validation.
 */
Text.prototype.validate = function() {
    var validator = this.validator;
    if (!validator) return;
    try {
        this.valid = validator( this.value );
    }
    catch (ex) {
        console.error("[wdg.text:validate] Exception = ", ex);
        console.error("[wdg.text:validate] Validator = ", validator);
    }
};

/**
 * Select whole text.
 * @return {this}
 */
Text.prototype.selectAll = function() {
    var e = this._input;
    e.setSelectionRange(0, e.value.length);
    return true;
};

module.exports = Text;
