"use strict";

/**
 * @module tfw.date
 *
 * @description
 * Tools for date convertions.
 *
 * @example
 * var mod = require('tfw.date');
 */



exports.formatShortDate = function(d, sep) {
    if( typeof sep === 'undefined' ) sep = ' ';

    var weekday = _('day' + d.getDay() + '-short');
    var month = _('month' + d.getMonth() + '-short');
    return weekday + sep + d.getDate() + sep + month;
};

exports.formatLongTime = function(d) {
    var h = "" + d.getHours();
    var m = "" + d.getMinutes();
    var s = "" + d.getSeconds();
    if (m.length < 2) m = "0" + m;
    if (s.length < 2) s = "0" + s;
    return h + ":" + m + ":" + s;
};

exports.formatDateTime = function(d) {
    var Y = "" + d.getFullYear();
    var M = "" + (1 + d.getMonth());
    var D = "" + d.getDate();
    var h = "" + d.getHours();
    var m = "" + d.getMinutes();
    var s = "" + d.getSeconds();
    if (M.length < 2) M = "0" + M;
    if (D.length < 2) D = "0" + D;
    if (m.length < 2) m = "0" + m;
    if (s.length < 2) s = "0" + s;
    return Y + "-" + M + "-" + D + " " + h + ":" + m + ":" + s;
};

exports.formatSmart = function(dat) {
    var today = new Date();
    var Y0 = today.getFullYear();
    var M0 = today.getMonth();
    var D0 = today.getDate();

    var Y = dat.getFullYear();
    var M = dat.getMonth();
    var D = dat.getDate();
    var suffix = "";
    var mm = dat.getMinutes();
    var txt = dat.getHours() + ":" + (mm < 10 ? '0' : '') + mm;
    if (Y != Y0) {
        suffix = ", " + D + " " + _("month" + M + "-short") + " " + Y;
    } else if (M != M0) {
        suffix = ", " + D + " " + _("month" + M + "-short");
    } else if (D != D0) {
        if (D == D0 - 1) {
            suffix = " " + _("yesterday");
        } else {
            suffix = ", " + D + " " + _("month" + M + "-short");
        }
    }
    if( suffix == '' ) {
        var ss = dat.getSeconds();
        return txt + ":" + (ss < 10 ? '0' : '') + ss;
    }
    return txt + suffix;
};

/**
 * @return {number} Number of seconds between two dates.
 */
exports.diff = function(a, b) {
    if (typeof b === 'undefined') {
        b = a;
        a = new Date();
    }
    a = Math.floor(.5 + a.getTime() / 1000);
    b = Math.floor(.5 + b.getTime() / 1000);
    return a - b;
};


exports.parseYMD = function( input ) {
  var text = '';
  var c;
  for( var i = 0; i < input.length; i++ ) {
    c = input.charAt( i );
    if( c < '0' || c > '9' ) continue;
    text += c;
  }
  console.info("[tfw.date] input, text=", input, text);
  
  var YY = parseInt(text.substr(0, 4));
  var MM = text.length > 5 ? parseInt(text.substr(4, 2)) - 1 : 0;
  var DD = text.length > 7 ? parseInt(text.substr(6, 2)) : 0;
  var hh = text.length > 9 ? parseInt(text.substr(8, 2)) : 0;
  var mm = text.length > 11 ? parseInt(text.substr(10, 2)) : 0;
  var ss = text.length > 13 ? parseInt(text.substr(12, 2)) : 0;
  return new Date( YY, MM, DD, hh, mm, ss );
}
