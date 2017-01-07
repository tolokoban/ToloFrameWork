"use strict";
var $ = require("dom");
var DB = require("tfw.data-binding");
var LaterAction = require("tfw.timer").laterAction;

/**
 * @example
 * var InputDate = require("tp4.input-date");
 * var instance = new InputDate(opt);
 * @class InputDate
 */
var WdgDate = function(opts) {
    var inputs = {
        D: newInput.call(this, 2, 'D'),
        M: newInput.call(this, 2, 'M'),
        Y: newInput.call(this, 4, 'Y'),
        h: newInput.call(this, 2, 'h'),
        m: newInput.call(this, 2, 'm'),
        s: newInput.call(this, 2, 's')
    };
    this._inputs = inputs;

    var elem = $.elem( this, 'div', 'wdg-date', 'theme-elevation-2', 'theme-color-bg-B1' );

    DB.propDate(this, 'action');
    DB.propDate(this, 'value')(function(v) {
        inputs.D.value = v.getDate();
        inputs.M.value = v.getMonth() + 1;
        inputs.Y.value = v.getFullYear();
        inputs.h.value = v.getHours();
        inputs.m.value = v.getMinutes();
        inputs.s.value = v.getSeconds();
    });
    DB.propString(this, 'format')(function(v) {
        $.clear( elem );
        var c, input;
        for( var i=0; i<v.length; i++ ) {
            c = v.charAt(i);
            input = inputs[c];
            if( input ) {
                $.add( elem, input );
            } else {
                $.add( elem, $.tag( 'span', [c] ) );
            }
        }
    });
    DB.propAddClass(this, 'focus', 'theme-elevation-8');
    DB.propRemoveClass(this, 'visible', 'hide');
    DB.propRemoveClass(this, 'valid', 'invalid');
    DB.extend({
        value: new Date(),
        format: "D/M/Y - h:m:s",
        focus: false,
        valid: true,
        visible: true
    }, opts, this);
};

var ALLOWED_KEYS = [
    48, 49, 50, 51, 52, 53, 54, 55, 56, 57,
    96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 
    9, 8, 46, 13,
    37, 38, 39, 40];

function newInput(size, id) {
    var that = this;

    var input = $.tag( 'input', { type: 'text', maxlength: size } );
    input.$id = id;
    input.style.width = (0 + size) + "em";
    input.addEventListener( 'keydown', function(evt) {
        if( ALLOWED_KEYS.indexOf( evt.keyCode ) == -1 ) {
            evt.preventDefault();
            console.info("[wdg.date] DOWN=", evt);
        }
    });
    input.addEventListener( 'keyup', function(evt) {
        update.call( that );
        if( evt.keyCode == 13 && that.valid ) {
            that.action = that.value;
        }
    });
    input.addEventListener( 'blur', function() {
        that.focus = false;
        update.call( that );
    } );
    input.addEventListener( 'focus', function() {
        that.focus = true;
        input.select();
    });
    return input;
}

function update() {
    var i = this._inputs;
    var Y = parseInt(i.Y.value);
    var M = parseInt(i.M.value) - 1;
    var D = parseInt(i.D.value);
    var h = parseInt(i.h.value);
    var m = parseInt(i.m.value);
    var s = parseInt(i.s.value);
    var d = new Date(Y, M, D, h, m, s);
    var valid = Y == d.getFullYear()
            && M == d.getMonth()
            && D == d.getDate()
            && h == d.getHours()
            && m == d.getMinutes()
            && s == d.getSeconds();
    if( valid ) {
        this.value = d;
    }
    this.valid = valid;
}

module.exports = WdgDate;
