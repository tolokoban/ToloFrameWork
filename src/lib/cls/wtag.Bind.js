/**
 * @created 17/09/2014
 *
 */
window["TFW::wtag.Bind"] = {
    superclass: "WTag",
    init: function() {
        this.bindData(this._data);
        this.onDataChanged(this._data, this.data(this._data));
    },	
    
    functions: {
	/**
         * Update content when data has changed.
         */
        onDataChanged: function(name, value) {
            this._element.textContent = value;
        }
    }
};
