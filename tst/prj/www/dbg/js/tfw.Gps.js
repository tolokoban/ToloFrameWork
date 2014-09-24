/**
 * @created 11/01/2014
 *
 * status :
 *   0 = Not started.
 *   1 = PERMISSION DENIED
 *   2 = UNAVAILABLE POSITION
 *   3 = TIME OUT
 *   9 = device without GPS antenna
 *  10 = waiting for first point
 *  20 = waiting for next point
 *  30 = ok
 */
window["TFW::tfw.Gps"] = {
    singleton: true,
    signals: [
        // @argument this
	"Update"
    ],

    init: function() {
        this._statusText = {
            0: "Not started.",
            1: "PERMISSION DENIED",
            2: "UNAVAILABLE POSITION",
            3: "TIME OUT",
            9: "device without GPS antenna",
            10: "waiting for first point",
            20: "waiting for next point",
            30: "ok"
        };
        this._status = 0;
        this._position = null;
        this._gpsOptions = {
            enableHighAccuracy: true,
            maximumAge: 0
        };
    },

    functions: {
        /**
         * Start GPS acquiring.
         */
        start: function() {
            var self = this;
            this._status = 9;
            if ("geolocation" in navigator) {
                this._status = 10;
                navigator.geolocation.getCurrentPosition(
                    function(p) {
                        console.info("[tfw.Gps] p=...", p);
                        self._position = p;
                        self._status = 20;
                        self.fireUpdate(self);
                        self.startWatch();
                    },
                    function(err) {
                        console.info("[tfw.Gps] err=...", err);
                        self.onError(err);
                    }
                );
            }
            this.fireUpdate(this);
        },

        /**
         * Starting position watching.
         */
        startWatch: function() {
            var self = this;
            navigator.geolocation.watchPosition(
                function(p) {
                    self._position = p;
                    self._status = 30;
                    self.fireUpdate(self);
                },
                function(err) {
                    self.onError(err);
                },
                this._gpsOptions
            );
        },

        /**
         * @return Current status.
         */
        getStatus: function() {
            return this._status;
        },

        /**
         * @return Last registred position.
         */
        getPosition: function() {
            return this._position;
        },

        onError: function(err) {
            this._status = err.code;
            this.fireUpdate(this);
            alert(err.code + ": \n" + err.message);
        }
    }
};
