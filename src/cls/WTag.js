/**
 * Tous les générateurs  de wtags héritent de cette  classe qui contient
 * des fonctions utiles communes.
 *
 * @class WTag
 * @namespace WTag
 */
window["TFW::WTag"] = {
    classInit: function(vars) {
        $$("dom.Util");
        vars.globalSlots = {};
    },

    /**
     * @constructs WTag
     */
    init: function() {
        // Store here all the stuff needed to make a cleanup when method `destroy` is called.
        this._widgetCleanUp = {
            signals: [],
            globalSignals: [],
            dataBindings: []
        };

        var element;
        if (typeof this._id === 'object') {
            element = this._id;
        } else {
            element = document.getElementById(this._id);
        }
        if (!element) {
            throw new Error("There is no element with id \"" + this._id + "\"!");
        }
        element.$widget = this;
        this._element = element;
        this._slots = {};
    },

    
    functions: {
        /**
         * Fire a "signal" up to the parents widgets.
         * If a slot returns false, the event is fired up to the parents.
         *
         * @param signal Name of the signal to trigger.
         * @param arg Optional argument to sent with this signal.
         * @param emitter Optional reference to the signal's emitter.
         * @memberof WTag
         */
        fire: function(signal, arg, emitter) {
            var widget = this,
            slot;
            if (typeof emitter === 'undefined') emitter = this;
            console.log("fire(" + signal + ")", arg);
            if (signal.charAt(0) == '@') {
                // This is a global signal.
                slot = $$.statics("WTag");
                if (slot) {
                    slot = slot.globalSlots[signal];
                    if (slot) {
                        slot[1].call(slot[0], arg, signal, emitter);
                    } else {
                        console.error(
                            "[WTag.fire] Nothing is binded on global signal \"" 
                                + signal + "\"!"
                        );
                    }
                }
            }
            if (signal.charAt(0) == '$') {
                // Assign a value to a data.
                this.data(signal.substr(1).trim(), arg);
            } 
            else {
                while (widget) {
                    slot = widget._slots[signal];
                    if (typeof slot === 'function') {
                        if (false !== slot.call(widget, arg, signal, emitter)) {
                            return;
                        }
                    }
                    widget = widget.parentWidget();
                }
                console.warning("Signal lost: " + signal + "!");
            }
        },

        /**
         * Register a  listener (the  function "slot") for  the signal
         * "signal". If  this slot  returns true, the  signal continue
         * its ascension towards parent widgets.
         *
         * @param signal Name of the signal to catch.
         * @param slot Function to call to process this signal
         * @memberof WTag
         * @inner
         * @memberof WTag
         */
        registerSignal: function(signal, slot) {
            if (signal.charAt(0) == '@') {
                // Registering a global signal.
                $$.statics("WTag").globalSlots[signal] = [this, slot];
            } else {
                this._slots[signal] = slot;
            }
        },

        /**
         * Stop listening for the "signal".
         * @memberof WTag
         */
        unregisterSignal: function(signal) {
            delete this._slots[signal];
        },

        /**
         * Call the slot mapped to the "signal".
         * @param signal : name of the signal on which this object may be registred.
         * @param arg : argument to pass to the registred slot.
         * @memberof WTag
         */
        slot: function(signal, arg) {
            var slot = this._slots[signal];
            if (slot) {
                slot.call(this, arg, signal);
                return true;
            }
            return false;
        },

        /**
         * Get the parent element.
         * @memberof WTag
         */
        parentElement: function() {
            return this._element.parentNode;
        },

        /**
         * Get the parent widget.
         * @memberof WTag
         */
        parentWidget: function() {
            var element = this._element;
            while (element.parentNode) {
                element = element.parentNode;
                if (element.$widget) {
                    return element.$widget;
                }
            }
            return null;
        },

        /**
         * Return or set the current language.
         * @memberof WTag
         */
        lang: function(id) {
            if (!$$.App) $$.App = this;
            if (!$$.App._languages) {
                // Initialise localization.
                var languages = [],
                langStyle = document.createElement("style"),
                children = document.querySelectorAll("[lang]");
                document.head.appendChild(langStyle);
                $$.App._langStyle = langStyle;
                for (var i = 0 ; i < children.length ; i++) {
                    var child = children[i];
                    lang = child.getAttribute("lang");
                    found = false;
                    for (k = 0 ; k < languages.length ; k++) {
                        if (languages[k] == lang) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        languages.push(lang);
                    }
                }
                $$.App._languages = languages;
            }

            var that = this, lang, k, found, first, txt;
            languages = $$.App._languages;
            if (id === undefined) {
                // Return current language.
                lang = $$.lang();  // localStorage.getItem("wtag-language");
                if (!lang) {
                    lang = navigator.language || navigator.browserLanguage || "fr";
                    lang = lang.substr(0, 2);
                }
                $$.lang(lang);
                // localStorage.setItem("wtag-language", lang);
                return lang;
            } else {
                // Set current language and display localized elements.
                found = false;
                for (k = 0 ; k < languages.length ; k++) {
                    if (languages[k] == id) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    id = languages[0];
                }
                txt = "";
                first = true;
                for (k = 0 ; k < languages.length ; k++) {
                    lang = languages[k];
                    if (lang != id) {
                        if (first) {
                            first = false;
                        } else {
                            txt += ",";
                        }
                        txt += "[lang=" + lang + "]";
                    }
                }
                $$.App._langStyle.textContent = txt + "{display: none}";
                $$.lang(id);
                //localStorage.setItem("wtag-language", id);
            }
        },

        /**
         * Get  an  element  with   this  `name`  among  this  element's
         * children.
         * @memberof WTag
         */
        findElement: function(name) {
            if (typeof name === 'undefined') return this._element;
            var e = this._element.querySelector("[name='" + name + "']");
            if (!e) {
                throw new Error(
                    "[WTag.get] Can't find child [name=\""
                        + name + "\"] in element \"" + this._id + "\"!"
                );
            }
            return e;
        },

        /**
         * Get the widget  mapped to the element with  this `name` among
         * this element's children.
         * @memberof WTag
         */
        findWidget: function(name) {
            if (typeof name === 'undefined') return this;
            var element = this.findElement(name);
            if (element) {
                return element.$widget;
            }
            return null;
        },

        /**
         * @description
         * Databindings are scoped and stored in the `$data` property of a DOM element.
         * We always take data from the nearest parent element.
         *
         * @param {string} name name of the data binding.
         * @return  object representing  data bindings.  The key  is the
         * name of  the data and the  value is a two-items  array. First
         * item is the current value for this data, and second item is a
         * list of all listeners.
         * @memberof WTag
         */
        findDataBinding: function(name) {
            var data, dataOwner, parent = this.findElement();
            while (parent) {
                dataOwner = parent;
                if (dataOwner.$data && name in dataOwner.$data) {
                    break;
                }
                if (dataOwner.nodeName.toLowerCase() == 'html') {
                    break;
                }
                parent = dataOwner.parentNode;
            }
            data = dataOwner.$data[name];
            if (typeof data === 'undefined') {
                data = ["", []];
                dataOwner.$data[name] = data;
            }
            return data;
        },

        /**
         * Set/Get bindable data.
         * @memberof WTag
         */
        data: function(name, value) {
            var data = this.findDataBinding(name);
            if (typeof value === 'undefined') {
                return data[0];
            }
            if (value !== data[0]) {
                data[0] = value;
                this.fireData(data);
            }
        },

        /**
         * @description
         * Simulate a data change.
         * @param {string|object} name name of the data, or the data binding object itself.
         * @memberof WTag
         */
        fireData: function(name) {
            var data = name;
            if (typeof name === 'string') {
                data = this.findDataBinding(name);
            }
            data[1].forEach(
                function(target) {
                    if (target !== this) {
                        target.onDataChanged(name, data[0]);
                    }
                }
            );            
        },

        /**
         * @description
         * Define a local data binding.
         * @param {string} name Name of this data.
         * @param value Initial value.
         * @memberof WTag
         */
        defineLocalData: function(name, value) {
            var e = this.findElement();
            if (!this._dataBinding) {
                e.$data = {};
            }
            e.$data[name] = [value, []];
        },

        /**
         * Bind to data updates.
         * When the data changed, 
         * @memberof WTag
         */
        bindData: function(name) {
            var data = this.findDataBinding(name);
            data[1].push(this);
        },

        /**
         * Detach this object from data binding.
         * 
         * @param {string} name Name of the data to unbind.
         * @memberof WTag
         */
        unbindData: function(name) {
            var data = this.findDataBinding(name),
            i, target;
            for (i = 0 ; i < data[1].length ; i++) {
                target = data[1][i];
                if (this === target) {
                    data[1].splice(i, 1);
                    return true;
                }
            }
            return false;
        },

        /**
         * Internal method called when a data's value changes.
         * @param {string} name Name of the data.
         * @param value Value of the data.
         * @memberof WTag
         */
        onDataChanged: function(name, value) {
            console.log("[WTag.onDataChanged] " + name + " := " + value);
        },

        /**
         * @description
         * Remove all bindings.
         * @memberof WTag
         */
        destroy: function() {
            
        }
    }
};
