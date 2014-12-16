require("tfw.promise");
var Listeners = require("tfw.listeners");

var currentUser = null;
var defaultUrl = "tfw";
var changeEvent = new Listeners();

exports.BAD_ROLE = -1;
exports.BAD_TYPE = -2;
exports.CONNECTION_FAILURE = -3;

exports.changeEvent = changeEvent;

exports.logout = function() {
    currentUser = null;
    changeEvent.fire();
};

exports.login = function(usr, pwd) {
    
};

function svc(name, args, url) {
    return new Promise(
        function(resolve, reject) {
            if (typeof url === 'undefined') url = defaultUrl;
            var that = this;
            var xhr = new XMLHttpRequest({mozSystem: true});
            xhr.onload = function() {
                var value = xhr.responseText;
                if (typeof value === "string") {
                    if (value.substr(0, 3) == "<<<") {
                        reject(
                            {
                                id: exports.BAD_ROLE,
                                err: Error("Service \"" + name + "\" need role \""
                                          + value.substr(3, value.length - 6) + "\"!")
                            }
                        );
                    }
                    try {
                        resolve(JSON.parse(value));
                    }
                    catch (ex) {
                        reject(
                            {
                                id: exports.BAD_TYPE,
                                err: Error("Service \"" + name 
                                           + "\" should return a valid JSON!\n" + ex)
                            }
                        );
                    }
                } else {
                    reject(
                        {
                            id: exports.BAD_TYPE,
                            err: Error("Service \"" + name + "\" should return a string!")
                        }
                    );
                }
            };
            xhr.onerror = function() {
                reject(Error("Connection to service \"" + name + "\" failed!\n" + xhr.statusText));
            };
            xhr.open("POST", url + "/svc.php", true);
            var params = "s=" + encodeURIComponent(name)
                + "&i=" + encodeURIComponent(JSON.stringify(args));
            xhr.setRequestHeader(
                "Content-type",
                "application/x-www-form-urlencoded");
            xhr.withCredentials = true;  // Indispensable pour le CORS.
            xhr.send(params);
        }
    );    
}

/**
 * Call a webservice.
 */
exports.get = function(name, args, url) {
    return new Promise(
        function(resolve, reject) {
            svc(name, args, url).then(resolve, reject);
        }
    );
};

// _Backward compatibility.
if (window.$$) {
    window.$$.service = function (name, args, caller, onSuccess, onError) {
        var p = exports.get(name, args);
        p.then(
            function(value) {
                if (onSuccess) {
                    return caller[onSuccess].call(caller, value);
                }
                return value;
            },
            function(reason) {
                if (onError) {
                    return caller[onError].call(caller, reason);
                }
                return reason;
            }
        );
    };
}
