var $ = require("dom");
var DB = require("tfw.data-binding");
var Icon = require("wdg.icon");
var Button = require("wdg.button");

/**
 */
var Area = function(opts) {
    var that = this;

    var label = $.div( 'label' );
    var input = $.tag( 'pre' );
    var elem = $.elem( this, 'button', 'wdg-area', [label, input] );

    DB.propString(this, 'value')(function(v) {
        input.textContent = v;
    });
    DB.propBoolean(this, 'enabled')(function(v) {
        if (v) {
            $.removeClass(input, 'disabled');
        } else {
            $.addClass(input, 'disabled');
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

    $.on(this.element, {
        tap: that.fire.bind( that ),
        keydown: function(evt) {
            if (evt.keyCode == 13 || evt.keyCode == 32) {
                evt.preventDefault();
                evt.stopPropagation();
                that.fire();
            }
        }
    });    

    opts = DB.extend({
        value: '',
        enabled: true,
        label: null,
        wide: false,
        visible: true
    }, opts, this);
};

/**
 * @return void
 */
Area.prototype.fire = function() {
    var that = this;

    var label = $.div( 'label', [this.label || ""] );
    var textarea = $.tag( 'textarea', 'dom' );
    var container = $.div( 'container', 'dom', [textarea] );
    var btnOK = Button.Ok();
    var btnCancel = Button.Cancel();
    var buttons = $.div( 'buttons', [$.div( [btnCancel, btnOK] )] );
    var screen = $.div( 'wdg-area-screen', [label, container, buttons] );

    textarea.value = this.value;
    
    var validate = function() {
        $.detach( screen );
        that.value = textarea.value;
    };
    var cancel = function() {
        $.detach( screen );
    };
    DB.bind( btnOK, 'action', validate );
    DB.bind( btnCancel, 'action', cancel );

    $.on(textarea, {
        keydown: function(evt) {
            if (evt.keyCode == 27) {
                evt.preventDefault();
                evt.stopPropagation();
                cancel();
            }
            else if (evt.keyCode == 13) {
                if (evt.ctrlKey) {
                    evt.preventDefault();
                    evt.stopPropagation();
                    validate();
                }
            }
        }
    });    

    $.add( document.body, screen );
    textarea.focus();
};


module.exports = Area;
