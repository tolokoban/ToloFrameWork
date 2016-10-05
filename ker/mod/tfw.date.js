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



exports.formatShortDate = function(d) {
    var weekday = _('day' + d.getDay() + 'short');
    var month = _('month' + d.getMonth() + 'short');
    return weekday + " " + d.getDate() + " " + month;
};

exports.formatLongTime = function(d) {
    var h = "" + d.getHours();
    var m = "" + d.getMinutes();
    var s = "" + d.getSeconds();
    if (m.length < 2) m = "0" + m;
    if (s.length < 2) s = "0" + s;
    return h + ":" + m + ":" + s;
};

exports.formatSmart = function(dat) {
    var today = new Date();
    var Y0 = today.getYear();
    var M0 = today.getMonth();
    var D0 = today.getDate();

    var Y = dat.getYear();
    var M = dat.getMonth();
    var D = dat.getDate();
    var mm = dat.getMinutes();
    var txt = dat.getHours() + ":" + (mm < 10 ? '0' : '') + mm;
    if (Y != Y0) {
        txt += ", " + D + " " + _("month" + M + "-short") + " " + Y;
    } else if (M != M0) {
        txt += ", " + D + " " + _("month" + M + "-short");
    } else if (D != D0) {
        if (D == D0 - 1) {
            txt += " " + _("yesterday");
        } else {
            txt += ", " + D + " " + _("month" + M + "-short");
        }
    }
    return txt;
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
