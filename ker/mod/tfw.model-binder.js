"use strict";

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
const DB = require("tfw.data-binding");

class Model {
    constructor(_opts) {
        const opts = typeof _opts !== 'undefined' ? _opts : {};
        this._links = opts;
        this._value = null;

        for( const key of Object.keys(opts) ) {
            const wdg = opts[key];
            DB.bind( wdg, 'value', v => {
                const obj = this._value;
                if (obj) obj[key] = v;
            });
        }
    }

    get value() {
        return this._value;
    }

    set value(v) {
        this._value = v;
    }

    updateWidgets() {
        const obj = this._value;
        if (!obj) return this;
        const opts = this._links;

        for( const key of Object.keys(opts) ) {
            const wdg = opts[key];
            wdg.value = obj[key];
        }
        return this;
    }
}


module.exports = Model;
