/**
 * @module tfw.model
 *
 * @description
 * Le model permet de faire un  lien entre les attributs d'un objet et
 * les widgets qui le représentent.
 *
 * @example
 * var Model = require('tfw.model');
 * var model = new Model({
 *   name: txtName,
 *   expired: blnExpired
 * });
 *
 * model.value = item;
 * model.updateWidgets();
 */
var DB = require("tfw.data-binding");

function Model(opts) {
    if( typeof opts === 'undefined' ) opts = {};
    this._links = opts;
    this._value = null;

    var key, wdg;
    for( key in opts ) {
        wdg = opts[key];
        bind.call( this, key, wdg );
    }
}

/**
 * Définir l'objet qui sera lié aux widgets.
 */
Object.defineProperty( Model.prototype, 'value', {
    get: function() { return this._value; },
    set: function(v) { this._value = v; },
    configurable: true,
    enumerable: true
});


function bind(key, wdg) {
    var that = this;

    DB.bind( wdg, 'value', function(v) {
        var obj = that._value;
        if (obj) {
            obj[key] = v;
        }
    });
};


/**
 * Update widgets values from `value`.
 */
Model.prototype.updateWidgets = function() {
    var obj = this._value;
    if (!obj) return this;
    var opts = this._links;
    var key, wdg;
    for( key in opts ) {
        wdg = opts[key];
        wdg.value = obj[key];
    }
    return this;
};


module.exports = Model;
