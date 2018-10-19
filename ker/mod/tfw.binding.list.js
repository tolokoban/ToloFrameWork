"use strict";

/*
  fire( functionName, arguments, wave )
  addListener( listener )
  removeListener( listener )

  link( list )
  unlink( list )

  get( index )
  put( index, elem )

  remove( elem )
  removeAt( index )

  mapInPlace( function(elem, index) )
*/
const
    PM = require("tfw.binding.property-manager"),
    Listeners = require("tfw.listeners");

const ID = "__tfw.binding.list__";
let COUNT = 1;

/**
 * A list is an observable array.
 *
 * Several lists can share the same internal array. In that case, when
 * one list modifies the array, all  lists will emit the same event as
 * it. Such lists are linked.
 */
var List = function(arg) {
    readOnly(this, ID, COUNT++);
    readOnly(this, "_listeners", new Listeners());
    readOnly(this, "_links", []);
    // An object  with the  attribute `isContentChangeAware  === true`
    // can fire a property value changed when its contant has change.
    readOnly(this, "isContentChangeAware", true);
    if (Array.isArray(arg)) {
        readOnly(this, "_array", arg);
    } else if (isList(arg)) {
        readOnly(this, "_array", arg._array);
        this.link(arg);
    } else {
        readOnly(this, "_array", [arg]);
    }
};

module.exports = List;
List.isList = isList;


List.prototype.fire = function(functionName, args, wave) {
    var id = this[ID];
    if (!Array.isArray(wave)) wave = [id];
    else if (wave.indexOf(id) === -1) wave.push(id);

    // Listeners for content change.
    this._listeners.fire(functionName, args, wave);

    // Two Lists are linked if and only if they share the same array.
    this._links.forEach(function(list) {
        if (wave.indexOf(list[ID]) > -1) return;
        list.fire(functionName, args, wave);
    });

    // The content  of the List  has changed.  We must fire  a 'changed'
    // event on the manager if this list is linkable.
    var properties = PM.getProperties(this);
    if (Array.isArray(properties)) {
        properties.forEach(function(prop) {
            prop.manager.fire(prop.name);
        });
    }
};

List.prototype.addListener = function(listener) {
    this._listeners.add(listener);
};

List.prototype.removeListener = function(listener) {
    this._listeners.remove(listener);
};


List.prototype.link = function(list) {
    if (!isList(list)) {
        console.error("Argument: ", list);
        throw Error("[tfw.binding.list.link] Argument must be a tfw.binding.list object!");
    }

    if (this._links.indexOf(list) === -1) {
        this._links.push(list);
        list.link(this);
    }
};

List.prototype.unlink = function(list) {
    var index = this._links.indexOf(list);
    if (index === -1) return;

    this._links.splice(index, 1);
    list.unlink(this);
};

/**
 * The braket notation doesn't work with list.
 * This function
 */
List.prototype.get = function(index) {
    return this._array[index];
};

List.prototype.put = function(index, newValue) {
    var oldValue = this._array[index];
    if (oldValue === newValue) return false;
    this._array[index] = newValue;
    this.fire("put", {
        index: index,
        oldValue: oldValue,
        newValue: newValue
    });
    return true;
};

List.prototype.remove = function(elem) {
    var index = this._array.indexOf(elem);
    if (index === -1) return false;
    this._array.splice(index, 1);
    this.fire("remove", { elem: elem, index: index });
    return true;
};

List.prototype.removeAt = function(index) {
    var elem = this._array[index];
    this._array.splice(index, 1);
    this.fire("remove", { elem: elem, index: index });
    return true;
};

List.prototype.mapInPlace = function(func) {
    var that = this;

    this._Array.forEach(function(itm, idx) {
        var newValue = func(itm);
        that.put(idx, newValue);
    });

    return this;
};

var DEFAULT_COMPARATOR = function(a, b) {
    if (a == b) return 0;
    return a < b ? -1 : 1;
};

/**
 * Sort and fire only if the array is not already in order.
 */
List.prototype.sort = function(comparator) {
    if (typeof comparator !== 'function') comparator = DEFAULT_COMPARATOR;
    if (isAlreadySorted(this._array, comparator)) return this;
    this._array.sort(comparator);
    this.fire("sort", comparator);
    return this;
};

function isAlreadySorted(array, comparator) {
    if (array.length < 2) return true;

    var previous = array[0];
    var current;

    for (var k = 1; k < array.length; k++) {
        current = array[k];
        if (comparator(previous, current) > 0) return false;
        previous = current;
    }
    return true;
}

[
    "push", "pop", "shift", "unshift", "splice", "reverse"
]
.forEach(function(funcName) {
    List.prototype[funcName] = function() {
        var args = Array.prototype.slice.call(arguments);
        var result = Array.prototype[funcName].apply(this._array, args);
        this.fire(funcName, args);
        return result;
    };
});

/**
 * Functions that don't change the array.
 */
[
    "slice", "forEach", "filter", "map", "reduce",
    "indexOf", "lastIndexOf"
].forEach((funcName) => {
    List.prototype[funcName] = function(...args) {
        // const args = Array.prototype.slice.call(arguments);
        return Array.prototype[funcName].apply(this._array, args);
    };
});

if (!Array.prototype.includes) {
    // Polyfill for IE11.
    Array.prototype.includes = function(item) {
        return this.indexOf(item) !== -1;
    }
}
List.prototype.includes = function(item) {
    return Array.prototype.includes.call(this._array, item);
};

/**
 * Define the `length` property.
 */
Object.defineProperty(List.prototype, "length", {
    get: function() {
        return this._array.length;
    },
    set: function(v) {
        this._array.length = v;
        this.fire("length", v);
    },
    configurable: false,
    enumerable: true
});


function isList(candidate) {
    if (!candidate) return false;
    return typeof candidate[ID] === 'number';
}

function readOnly(object, attrib, value) {
    Object.defineProperty(object, attrib, {
        value: value,
        writable: false,
        configurable: false,
        enumerable: true
    });
}