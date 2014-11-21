exports.get = function(name, args, url) {
    return new Promise(
        function(resolve, reject) {
            if (typeof url === 'undefined') url = '';
            var that = this;
            var xhr = new XMLHttpRequest({mozSystem: true});
            xhr.onload = function() {
                var value = xhr.responseText;
                if (typeof value === "string") {
                    try {
                        resolve(JSON.parse(value));
                    }
                    catch (ex) {
                        reject(Error("Service \"" + name + "\" should return a valid JSON!\n" + ex));
                    }
                } else {
                    reject(Error("Service \"" + name + "\" should return a string!"));
                }
            };
            xhr.onerror = function() {
                reject(Error("Connection to service \"" + name + "\" failed!\n" + xhr.statusText));
            };
            xhr.open("POST", url + "tfw/svc.php", true);
            var params = "s=" + encodeURIComponent(name)
                + "&i=" + encodeURIComponent(JSON.stringify(args));
            xhr.setRequestHeader(
                "Content-type",
                "application/x-www-form-urlencoded");
            xhr.withCredentials = true;  // Indispensable pour le CORS.
            xhr.send(params);
        }
    );
};


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
