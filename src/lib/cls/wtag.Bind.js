/**
 * @created 17/09/2014
 *
 */
window["TFW::wtag.Bind"] = {
    superclass: "WTag",
    init: function() {
        this.bindData(this._data, "val");
        this.val(this.data(this._data));
    },	
    
    functions: {
	/**
         * Update content when data has changed.
         */
        val: function(value) {
            this._element.textContent = value;
        }
    }
};
