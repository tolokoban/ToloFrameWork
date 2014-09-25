/**
 * @created 15/05/2014
 * @extends wtag.Fireable
 * @class wtag.Button
 */
window["TFW::wtag.Button"] = {
    superclass: "wtag.IFireable",

    init: function() {
        var that = this;
        $events(
            this._element,
            {
                tap: function() {
                    that.fireAll();
                }
            }
        );
    },

    functions: {
    }
};
