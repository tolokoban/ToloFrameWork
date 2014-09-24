/**
 * @created 15/05/2014
 *
 */
window["TFW::wtag.Popup"] = {
    superclass: "wtag.Tag",
    singleton: true,

    functions: {
        /**
         *
         */
        build: function(element) {
            var self = this;
            $addClass(element, "wtag-popup");
            if (element.nodeName.toUpperCase() == "W-ERR") {
                $addClass(element, "err");
            } else {
                $addClass(element, "msg");
            }
            $events(
                element,
                {
                    tap: function(evt) {
                        self.hide();
                    }
                }
            );
            document.body.appendChild(element);
        },

        /**
         * Afficher le popup dont on donne l'id.
         */
        show: function(id) {
            var self = this,
            popup = document.getElementById(id);
            self.hide();
            $addClass(popup, "show");
            self._current = popup;
            this._timeout = setTimeout(
                function() {
                    self.hide();
                },
                5000
            );
        },

        /**
         * Effacer le popup actuellement affiché.
         */
        hide: function() {
            var self = this;
            if (self._current) {
                $removeClass(self._current, "show");
                delete self._current;
            }
            if (self._timeout) {
                clearTimeout(self._timeout);
                delete self._timeout;
            }
        }
    }
};
