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
    var autocompleteProposals = [];
    var autocompleteShift = 0;

    var label = $.div( 'theme-label', 'theme-color-bg-1' );
    var input = $.tag( 'input' );
    var datalist = $.div( 'datalist', 'theme-elevation-12' );
    this._input = input;
    var elem = $.elem( this, 'div', 'wdg-text', 'theme-elevation-2', [label, input, datalist] );

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
        if( v.length > 0 ) {
            $.att( elem, "list" );
        }
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
    DB.propBoolean(this, 'focus')(function(v) {
        if (v) input.focus();
        else input.blur();
    });
    DB.propInteger(this, 'action', '');
    DB.propAddClass(this, 'wide');
    DB.propRemoveClass(this, 'visible', 'hide');

    opts = DB.extend({
        value: '',
        type: 'text',
        placeholder: '',
        enabled: true,
        validator: null,
        valid: true,
        list: null,
        label: '',
        placeholder: '',
        size: 10,
        width: 'auto',
        focus: false,
        wide: false,
        visible: true
    }, opts, this);

    var complete = function() {
        $.removeClass( elem, "list" );
        if (!that.list || that.list.length == 0) return;

        $.clear( datalist );
        var list = that.list.map(String.toLowerCase);
        var needle = input.value.trim().toLowerCase();

        if (needle.length > 0) {
            list = list.map(function(itm, idx) {
                return [idx, itm.indexOf( needle )];
            }).filter(function(itm) {
                return itm[1] > -1;
            }).sort(function(a, b) {
                var d = a[1] - b[1];
                if (d != 0) return d;
                var sa = that.list[a[0]];
                var sb = that.list[b[0]];
                if (sa < sb) return -1;
                if (sa > sb) return 1;
                return 0;
            }).map(function(itm) {
                var t = that.list[itm[0]];
                var i = itm[1];
                return t.substr(0, i)
                    + "<b>" + t.substr(i, needle.length) + "</b>"
                    + t.substr(i + needle.length);
            });
        } else {
            list = list.sort();
        }
        if (autocompleteShift > 0) {
            // Put the current item to the top of the list.
            // Use arrow keys to change `autocompleteShift`.
            list = list.slice( autocompleteShift ).concat( list.slice( 0, autocompleteShift ) );
        }
        autocompleteProposals = list;

        list.forEach(function (item, idx) {
            var div = $.div();
            div.innerHTML = item;
            list[idx] = div.textContent.trim();
            $.add( datalist, div );
            $.on( div, {
                down: function() {
                    dataListHasFocus = true;
                },
                up: function() {
                    dataListHasFocus = false;
                    that.focus = true;
                },
                tap: function() {
                    that.value = div.textContent.trim();
                    console.info("[wdg.text] div=...", div);
                    $.removeClass( elem, 'list' );
                }
            });
        });
        if (list.length > 0) {
            $.addClass( elem, "list" );
        } else {
            $.removeClass( elem, "list" );
        }
    };

    var actionUpdateValue = LaterAction(function() {
        that.value = input.value;
    }, 300);
    input.addEventListener('keyup', function(evt) {
        if (evt.keyCode == 13) {
            evt.preventDefault();
            evt.stopPropagation();
            if ($.hasClass( elem, 'list' )) {
                $.removeClass( elem, 'list' );
                that.value = autocompleteProposals[0];
            }
            else if (that.valid !== false) {
                DB.fire( that, 'value', input.value );
                DB.fire( that, 'action', input.value );
            }
        }
        else if (evt.keyCode == 27) {
            $.removeClass( elem, "list" );
            autocompleteShift = 0;
            evt.preventDefault();
            evt.stopPropagation();
        }
        else if (evt.keyCode == 40 && $.hasClass( elem, 'list' )) {
            autocompleteShift = (autocompleteShift + 1) % autocompleteProposals.length;
            complete();
            evt.preventDefault();
            evt.stopPropagation();
        }
        else if (evt.keyCode == 38 && $.hasClass( elem, 'list' )) {
            autocompleteShift = (autocompleteShift + autocompleteProposals.length - 1)
                % autocompleteProposals.length;
            complete();
            evt.preventDefault();
            evt.stopPropagation();
        }
        else {
            autocompleteShift = 0;
            complete();
            actionUpdateValue.fire();
        }
    });
    input.addEventListener('blur', function() {
        that.value = input.value;
        if (!dataListHasFocus) {
            $.removeClass( elem, "list" );
        }
        $.addClass( elem, "theme-elevation-2" );
        $.removeClass( elem, "theme-elevation-8" );
        $.removeClass(input, 'theme-color-bg-A1');
        that.focus = false;
    });
    input.addEventListener('focus', function() {
        that.selectAll();
        $.removeClass( elem, "theme-elevation-2" );
        $.addClass( elem, "theme-elevation-8" );
        $.addClass(input, 'theme-color-bg-A1');
        that.focus = true;
    });
    input.addEventListener('keydown', function(evt) {
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
