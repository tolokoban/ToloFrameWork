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

    var label = $.div( 'label' );
    var input = $.tag( 'input' );
    var datalist = $.div( 'datalist' );
    this._input = input;
    var elem = $.elem( this, 'div', 'wdg-text', [label, input, datalist] );

    DB.propString(this, 'value')(function(v) {
        input.value = v;
        that.validate();
    });
    DB.propEnum(['text', 'button', 'checkbox', 'color', 'date', 'datetime', 'email', 'file',
                 'hidden', 'image', 'month', 'password', 'radio', 'range', 'reset',
                 'search', 'submit', 'tel', 'time', 'url', 'week'])(this, 'type')
    (function(v) {
        $.att(input, {type: v});
    });
    DB.propStringArray(this, 'list')(function(v) {
        $.clear( datalist );
        $.removeClass( elem, "list" );
        if (!Array.isArray( v )) return;
        v.forEach(function ( item ) {
            $.add( datalist, $.div( [item] ) );
        });
        $.att( elem, "list" );
    });
    DB.propValidator(this, 'validator')(this.validate.bind( this ));
    DB.propBoolean(this, 'valid')(function(v) {
        if (v === null || !that.validator) {
            $.removeClass( elem, "valid", "no-valid" );
        } else {
            if (v) {
                $.addClass( elem, "valid" );
                $.removeClass( elem, "no-valid" );
            } else {
                $.removeClass( elem, "valid" );
                $.addClass( elem, "no-valid" );
            }
        }
    });
    DB.propBoolean(this, 'enabled')(function(v) {
        if (v) {
            $.removeAtt(input, 'disabled');
        } else {
            $.att(input, {disabled: v});
        }
    });
    DB.propInteger(this, 'size')(function(v) {
        if (v < 1) {
            $.removeAtt(input, 'size');
        } else {
            $.att(input, {size: v});
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
    DB.propString(this, 'placeholder')(function(v) {
        $.att(input, {placeholder: v});
    });
    DB.propString(this, 'width')(function(v) {
        elem.style.width = v;
    });
    DB.propInteger(this, 'action', '');

    opts = DB.extend({
        value: '',
        type: 'text',
        placeholder: '',
        enabled: true,
        validator: null,
        valid: true,
        list: null,
        label: null,
        placeholder: '',
        size: 10,
        width: 'auto',
        wide: false,
        visible: true
    }, opts, this);

    var complete = function() {
        $.removeClass( elem, "list" );
        if (!that.list || that.list.length == 0) return;

        $.clear( datalist );
        var list = that.list.slice();
        
        list.forEach(function (item) {
            var div = $.div();
            div.innerHTML = item;
            $.add( datalist, div );
            $.on( div, {
                'down': function() {
                    that.value = div.textContent.trim();
                }
            });
        });
        
        $.addClass( elem, "list" );
    };

    var actionUpdateValue = LaterAction(function() {
        that.value = input.value;
    }, 300);
    input.addEventListener('keyup', actionUpdateValue.fire.bind( actionUpdateValue ));
    input.addEventListener('blur', function() {
        that.value = input.value;
        $.removeClass( elem, "list" );
    });
    input.addEventListener('focus', that.selectAll.bind(that));
    input.addEventListener('keydown', function(evt) {
        complete();
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
