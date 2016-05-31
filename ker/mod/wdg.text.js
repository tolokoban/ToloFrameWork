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
    var input = $.tag( "input" );
    this._input = input;
    var elem = $.elem( this, 'div', 'tfw-edit-text', 'custom', [label, input] );

    opts = DB.extend({
        value: '',
        type: 'text',
        enabled: true,
        label: null,
        placeholder: '',
        width: '140px'
    }, opts);

    DB.prop(this, 'value')(function(v) {
        input.value = v;
    });
    DB.prop(this, 'type')(function(v) {
        $.att(input, {type: v});
    });
    DB.prop(this, 'enabled')(function(v) {
        if (v) {
            $.removeAtt(input, 'disabled');
        } else {
            $.att(input, {disabled: v});
        }
    });
    DB.prop(this, 'label')(function(v) {
        if (v === null) {
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
    DB.prop(this, 'placeholder')(function(v) {
        $.att(input, {placeholder: v});
    });
    DB.prop(this, 'width')(function(v) {
        elem.style.width = v;
    });
    DB.prop(this, 'action', 0);

    var key;
    for( key in opts ) {
        this[key] = opts[key];
    }

    var actionUpdateValue = LaterAction(function() {
        that.value = input.value;
    }, 300);
    input.addEventListener('keydown', function(evt) {
        if (evt.keyCode == 13) {
            evt.preventDefault();
            evt.stopPropagation();
            that.action++;
        }
    });
    input.addEventListener('keyup', actionUpdateValue.fire.bind( actionUpdateValue ));
    input.addEventListener('focus', that.selectAll.bind(that));
};


/**
 * Force value validation.
 */
Text.prototype.validate = function() {
    var opts = this._opts;
    if (typeof opts.validator !== 'function') return this;
    var onValid = opts.onValid;
    try {
        if (opts.validator(this.val())) {
            this._valid = 1;
            this._input.removeClass("not-valid").addClass("valid");
            if (onValid) onValid(true, this);
        } else {
            this._valid = -1;
            this._input.removeClass("valid").addClass("not-valid");
            if (onValid) onValid(false, this);
        }
    }
    catch (ex) {
        console.error("[tp4.input] Validation error: ", ex);
    }
    return this;
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
