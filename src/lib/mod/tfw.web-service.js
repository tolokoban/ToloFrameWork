var PENDING = 0;
var FULFILLED = 1;
var REJECTED = 2;

/**
 * @example
 * var WebService = require("tfw.web-service");
 * var instance = new WebService();
 * @class WebService
 */
var WebService = function(name, args) {
    this._status = PENDING;
    this._value = undefined;
    this._fulfilledCallback = undefined;
    this._rejectedCallback = undefined;
    var that = this;
    var xhr = new XMLHttpRequest({mozSystem: true});
    xhr.onload = function() {
    };
    xhr.onerror = function() {
        that._status = REJECTED;
    };
    xhr.open("POST", this._root + "svc.php", true);
    var params = "s=" + encodeURIComponent(name)
        + "&i=" + encodeURIComponent(JSON.stringify(args));
    xhr.setRequestHeader(
        "Content-type",
        "application/x-www-form-urlencoded");
    xhr.withCredentials = true;  // Indispensable pour le CORS.
    xhr.send(params);
};

/**
 * @return void
 */
WebService.prototype.then = function(fulfilled, rejected) {

};

/**
 * @return void
 */
WebService.prototype.success = function(value) {
    this._status = FULFILLED;
    
};

/**
 * @return void
 */
WebService.prototype.failure = function(value) {
    this._status = REJECTED;
    
};




exports.use = function(name, args) {
    return new WebService(name, args);
};