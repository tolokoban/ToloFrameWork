/**
 * @created 15/05/2014
 *
 */
window["TFW::wtag.Button"] = {
    superclass: "wtag.Tag",
    singleton: true,
    functions: {
	/**
         * Construire de vrais éléments du DOM à partir de ce wtag.
         */
        build: function(element) {
            var self = this,
            page, slot,
            btn = $tag("a");
            $copyAttribs(element, btn);
            $addClass(btn, "wtag-button");
            $moveContent(element, btn);
            $replace(element, btn);
            page = element.getAttribute("data-page");
            slot = element.getAttribute("data-slot");
            if (page) {
                $events(
                    btn,
                    {
                        tap: function(evt) {
                            $$("wtag.Page").go(page);
                        }
                    }
                );
            } else if (slot) {
                $events(
                    btn,
                    {
                        tap: function(evt) {
                            if (btn.hasAttribute("data-checked")) {
                                if (parseInt(btn.getAttribute("data-checked")) == 0) {
                                    btn.setAttribute("data-checked", "1");
                                } else {
                                    btn.setAttribute("data-checked", "0");
                                }
                            }
                            $$.App.signal(slot, evt);
                        }
                    }
                );
            } else {
                $events(
                    btn,
                    {
                        tap: function(evt) {
                            if (btn.hasAttribute("data-checked")) {
                                if (parseInt(btn.getAttribute("data-checked")) == 0) {
                                    btn.setAttribute("data-checked", "1");
                                } else {
                                    btn.setAttribute("data-checked", "0");
                                }
                            }
                        }
                    }
                );
            }
        }
    }
};
