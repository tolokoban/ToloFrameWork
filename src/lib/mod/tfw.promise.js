/**
 * Polyfill for Promise...
 */
if (!window.Promise) {
    var PENDING = 0;
    var FULFILLED = 1;
    var REJECTED = 2;

    /**
     */
    window.Promise = function(f) {
        this._status = PENDING;
        this._callbacks = [];
        var resolve = function(value) {
        };
        var reject = function(reason) {
        };
        try {
            f(resolve, reject);
        }
        catch (ex) {
            reject(ex);
        }
    };

    /**
     * @return void
     */
    Promise.prototype.then = function(onFullfiled, onRejected) {
        switch (this._status) {
            case PENDING:
                this._callbacks.push([onFullfiled, onRejected]);
                return this;
            case FULFILLED:

            case REJECTED:
        }
    };

    /**
     * @return void
     */
    Promise.prototype.catch = function(onRejected) {
        return this.then(undefined, onRejected);
    };

    Promise.resolve = function(value) {
        var p = new Promise();
        p._value = value;
        p._status = FULFILLED;
        return p;
    };

    Promise.reject = function(reason) {
        var p = new Promise();
        p._value = reason;
        p._status = REJECTED;
        return p;
    };

    Promise.all = function(arrayOfPromises) {
        var count = arrayOfPromises.length;
        var p = new Promise(
            function(resolve, reject) {
                var values = [];
                for (var i = 0 ; i < arrayOfPromises.length ; i++) {
                    var child = arrayOfPromises[i];
                    child.then(
                        function(value) {
                            values[i] = value;
                            count--;
                            if (count <= 0) {
                                resolve(values);
                            }
                        },
                        reject
                    );
                }

            }
        );
        return p;
    };
}


module.exports = window.Promise;
