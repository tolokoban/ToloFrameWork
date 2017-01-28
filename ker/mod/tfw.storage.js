function load(storage) {
    return function(key, def) {
        var v = storage.getItem(key);
        if (v === null) {
            return def;
        }
        try {
            v = JSON.parse(v);
        }
        catch(ex) {}
        return v;
    };
}

function save(storage) {
    return function(key, val) {
        storage.setItem(key, JSON.stringify(val));
    };
}


if( !window.localStorage ) {
    window.localStorage = new DBStorage();
    window.sessionStorage = new DBStorage();
}
else if( !window.sessionStorage ) {
    window.sessionStorage = window.localStorage;
}

exports.local = {
    get: load(window.localStorage),
    set: save(window.localStorage)
};

exports.session = {
    get: load(window.sessionStorage),
    set: save(window.sessionStorage)
};


function DBStorage() {
    this._data = {};
}


/**
 * @member DBStorage.getItem
 * @param key
 */
DBStorage.prototype.getItem = function(key, def) {
    var val = this._data[key];
    return typeof val === 'undefined' ? def : val;
};

DBStorage.prototype.setItem = function(key, val) {
    this._data[key] = val;
};
