"use strict";

const
    $ = require("$"),
    List = require("tfw.binding.list"),
    Color = require("tfw.color");

const CONVERTERS = {
    areMany: areManyConverter,
    areNotMany: areNotManyConverter,
    array: arrayConverter,
    boolean: booleanConverter,
    booleans: booleansConverter,
    color: colorConverter,
    date: dateConverter,
    deg2rad: deg2radConverter,
    enum: enumConverter,
    float: floatConverter,
    integer: integerConverter,
    intl: intlConverter,
    isEmpty: isEmptyConverter,
    isNotEmpty: isNotEmptyConverter,
    isNull: isNullConverter,
    isStrictlyPositive: isStrictlyPositiveConverter,
    isZero: isZeroConverter,
    keys: keysConverter,
    length: lengthConverter,
    list: listConverter,
    multilang: multilangConverter,
    not: notConverter,
    sortedKeys: sortedKeysConverter,
    string: stringConverter,
    strings: stringsConverter,
    time: timeConverter,
    unit: cssUnitConverter,
    units: cssUnitsConverter,
    validator: validatorConverter
};

exports.get = function(converterName) {
    const converter = CONVERTERS[converterName];
    if (typeof converter !== 'function') {
        throw Error(`Converter not found: "${converterName}"!\n` +
            `Registred converters are: ${Object.keys(CONVERTERS).sort().join(", ")}.`);
    }
    return converter;
};


exports.set = function(converterName, converter) {
    if (typeof converter === 'function') {
        CONVERTERS[converterName] = converter;
    } else {
        delete CONVERTERS[converterName];
    }
};



const RX_CSS_UNIT = /^(-?[.0-9]+)[ \n\r]*([a-z%]*)/;

function cssUnitConverter(v) {
    if (typeof v === 'number') return v + "px";
    if (typeof v !== 'string') return "0";
    v = ("" + v).trim().toLowerCase();
    if (v === 'auto' || v === 'inherit') return v;
    var m = RX_CSS_UNIT.exec(v);
    if (!m) return "0";
    var scalar = parseFloat(m[1]);
    if (isNaN(scalar) || scalar == 0) return "0";
    var unit = m[2];
    if (unit.length < 1) unit = "px";
    return scalar + unit;
}

var TRUE_FUNC = function() { return true; };

function validatorConverter(v) {
    switch (typeof v) {
        case 'string':
            if (v.trim().length === 0) return TRUE_FUNC;
            var rx = new RegExp(v);
            return function(text) {
                return rx.test(text);
            };
        case 'function':
            return function(value) {
                return booleansConverter(v(value));
            };
    }
    return TRUE_FUNC;
}

function cssUnitsConverter(v) {
    if (!Array.isArray(v)) return [];
    return v.map(cssUnitConverter);
}

function booleanConverter(v) {
    switch (typeof v) {
        case 'string':
            return v.trim().toLowerCase() === 'true';
        case 'number':
            return v !== 0;
        default:
            return v ? true : false;
    }
}

function keysConverter(v) {
    if (!v) return [];
    var keys = [];
    for (var key in v) keys.push(key);
    return keys;
}

function sortedKeysConverter(v) {
    var keys = keysConverter(v);
    return keys.sort();
}

function booleansConverter(v) {
    if (!Array.isArray(v)) return [];
    return v.map(booleanConverter);
}

function colorConverter(v) {
    if (typeof v !== 'string') return '#000';
    if (!Color.instance.parse(v)) return '#000';
    return Color.instance.stringify();
}

function notConverter(v) { return !booleanConverter(v); }


function arrayConverter(v) {
    if (List.isList(v)) return v.slice();
    return Array.isArray(v) ? v : [v];
}

function lengthConverter(v) {
    if (!v) return 0;
    if (typeof v.length === 'number') {
        return v.length;
    }
    return 0;
}

function isEmptyConverter(v) {
    if (!v) return true;
    if (typeof v === 'string') {
        return v.trim().length === 0;
    }
    if (typeof v.length === 'number') {
        return v.length === 0;
    }
    return false;
}

function isNotEmptyConverter(v) {
    return !isEmptyConverter(v);
}

/**
 * @param   {object} v - Object with a `length` attribute.
 * @returns {boolean}  true if v.length > 1. If there is no `length` attribute, return false.
 */
function areManyConverter(v) {
    if (!v || typeof v.length !== 'number') return false;
    return v.length > 1;
}

/**
 * @param   {object} v - Object with a `length` attribute.
 * @returns {boolean}  true if v.length < 2. If there is no `length` attribute, return true.
 */
function areNotManyConverter(v) {
    if (!v || typeof v.length !== 'number') return true;
    return v.length <= 1;
}


function stringsConverter(v) {
    if (!Array.isArray(v)) return [];
    return v.map(function(v) { return "" + v; });
}

function stringConverter(v) {
    if (v === null || v === undefined) return "";
    if (typeof v === 'object') {
        if (Array.isArray(v)) {
            return JSON.stringify(v);
        } else {
            return intlConverter(v);
        }
    }
    return "" + v;
}

function multilangConverter(v) {
    if (!Array.isArray(v) && typeof v !== 'object') {
        var def = {};
        def[$.lang()] = "" + v;
        return def;
    }
    return v;
}

function intlConverter(v) {
    if (typeof v === 'string') return v;
    if (typeof v === 'undefined') return "";
    if (v === null) return "";
    var result = v[$.lang()];
    if (!result) {
        for (var lang in v) {
            result = v[lang];
            break;
        }
    }
    if (typeof result !== 'string') return "";
    return result;
}

function listConverter(v) {
    if (List.isList(v)) return v;
    return new List(arrayConverter(v));
}

function integerConverter(valueForNaN) {
    if (typeof valueForNaN === 'number') {
        return function(v) {
            var n = parseInt(v);
            if (isNaN(n)) return valueForNaN;
            return n;
        };
    } else {
        return parseInt;
    }
}

function floatConverter(valueForNaN) {
    if (typeof valueForNaN === 'number') {
        return function(v) {
            var n = parseFloat(v);
            if (isNaN(n)) return valueForNaN;
            return n;
        };
    } else {
        return parseFloat;
    }
}

function deg2radConverter(value) {
    const toFloat = floatConverter(0);
    const deg = toFloat(value);
    // PI / 180 = 0.017453292519943295.
    return deg * 0.017453292519943295;
}

function enumConverter(list) {
    list = arrayConverter(list);
    var caseInsensitiveList = list.map(function(x) { return x.toLowerCase(); });
    return function(v) {
        var idx = Math.max(0, caseInsensitiveList.indexOf(("" + v).toLowerCase()));
        return list[idx];
    };
}

function timeConverter(v) {
    if (v instanceof Date) return v;
    if (typeof v === 'number') return number2time(v);
    if (typeof v === 'string') return string2time(v);
    return null;
}

function number2time(v) {
    return new Date(v);
}

const DIGITS = "0123456789";

function string2time(v) {
    var hours = 0;
    var minutes = 0;
    var seconds = 0;
    var digit = 0;
    var index = 0;
    var len = v.length;
    var count = 0;
    // 0: Wait for first hours digit.
    while (index < len && DIGITS.indexOf(v.charAt(index)) === -1) index++;
    // 1: Reading hours digits.
    count = 0;
    while (index < len && count < 2 && (digit = DIGITS.indexOf(v.charAt(index))) !== -1) {
        hours = 10 * hours + digit;
        index++;
        count++;
    }
    // 2: Wait for first minutes digit.
    while (index < len && DIGITS.indexOf(v.charAt(index)) === -1) index++;
    // 3: Reading minutes digits.
    count = 0;
    while (index < len && count < 2 && (digit = DIGITS.indexOf(v.charAt(index))) !== -1) {
        minutes = 10 * minutes + digit;
        count++;
        index++;
    }
    // 4: Wait for first seconds digit.
    while (index < len && DIGITS.indexOf(v.charAt(index)) === -1) index++;
    // 5: Reading seconds digits.
    count = 0;
    while (index < len && count < 2 && (digit = DIGITS.indexOf(v.charAt(index))) !== -1) {
        seconds = 10 * seconds + digit;
        index++;
        count++;
    }

    var d = new Date(0);
    d.setHours(hours);
    d.setMinutes(minutes);
    d.setSeconds(seconds);
    return d;
}

function dateConverter(v) {
    if (v instanceof Date) return v;
}

function isZeroConverter(v) {
    return v === 0;
}

function isNullConverter(v) {
    if (isNaN(v)) return true;
    return !v ? true : false;
}

function isStrictlyPositiveConverter(v_) {
    const v = typeof _v === "number" ? _v : parseFloat(v_);
    if (isNaN(v)) return false;
    return v > 0;
}