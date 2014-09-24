/**
 * @created 21/05/2014
 *
 */
window["TFW::tp.Application"] = {
    superclass: "wtag.Application",
    singleton: true,

    /**
     * Ceci est un constructeur de folie.
     * Ca en fait une sacré tripoté, hein ?
     * Surtout sur pluieurs lignes...
     */
    init: function() {
        $$.params.root = "http://trail-passion.net/tfw/";
        $$.params.root = "http://127.0.0.1/TP3/tfw/";
        this.addSlot("follow");
        this._cnx = $$("tfw.Login").Change(
            this, "onLoginChange"
        );
        this._server = $$(
            "tfw.Server",
            {
                id: "TPx",
                root: "http://trail-passion.net/tfw/",
                login: "test",
                password: "test"
            }
        );
        this._gps = $$("tfw.Gps").Update(this, "onGPS");
        this._gps.start();
        // Empêcher le locking screen.
        if (window.navigator.requestWakeLock) {
            var lock = window.navigator.requestWakeLock('screen');
        }
        screen.mozlockOrientation('portrait');
    },

    functions: {
        /**
         * L'état du GPS a changé ou un nouveau point a été acquis.
         */
        onGPS: function(gps) {
            var pos, status;
            status = parseInt(gps._status);
            $("#gps-status").textContent = "(" + status + "): "
                + gps._statusText[status];
            if (status >= 20) {
                pos = gps.getPosition().coords;
console.info("[cls/tp.Application] pos=...", pos);
                $removeClass(
                    $("#follow"),
                    "hidden"
                );
                $("#gps-latitude").textContent = pos.latitude;
                $("#gps-longitude").textContent = pos.longitude;
                $("#gps-altitude").textContent = Math.floor(.5 + pos.altitude);
                $("#gps-accuracy").textContent = pos.accuracy;
            } else {
                $addClass(
                    $("#follow"),
                    "hidden"
                );
            }
        },

        /**
         *
         */
        follow: function() {
            var self = this,
            i, pos = this._gps.getPosition().coords;
            $$("wtag.Popup").show("msg-sending-position");

            this._server.send(
                "tp3.Follow",
                 {lat: pos.latitude, lng: pos.longitude},
                function(data) {
                    console.info("[tp.Application] OK data=...", data);
                    $$("wtag.Popup").show("msg-position-sent-success");
                },
                function(xhr) {
                    console.info("[tp.Application] KO xhr=...", xhr);
                    $$("wtag.Popup").show("msg-position-sent-failure");
                }
            );
        },

        /**
         *
         */
        onLoginChange: function(cnx) {
            if (cnx.isLogged()) {
                alert("Bonjour " + cnx.user().name);
            } else {
                alert("Error: " + cnx.error());
            }
        }
    }
};
