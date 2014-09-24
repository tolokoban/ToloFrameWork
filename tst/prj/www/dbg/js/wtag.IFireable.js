/**
 * @namespace wtag.IFireable
 * @created 17/09/2014
 *
 * @class wtag.IFireable
 * @extends WTag
 */
window["TFW::wtag.IFireable"] = {
    superclass: "WTag",
    init: function() {},

    //=====================
    functions: {
	/**
         * @description
         * Trigger signals according to attributes _fire_ and _fire-arg_.
         * 
         * @memberof wtag.IFireable
         */
        fireAll: function() {
            var i, sig, arg;
            for (i = 0 ; i < this._fire.length ; i++) {
                sig = this._fire[i];
                arg = this._fireArg[i];
                this.fire(sig, arg);
            }
        }
    }
};
