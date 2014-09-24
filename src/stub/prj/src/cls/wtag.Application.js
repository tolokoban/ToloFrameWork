/**
 * @created 15/05/2014
 *
 */
window["TFW::wtag.Application"] = {
    singleton: true,

    classInit: function(vars) {
        /**
         * Remplace un élément par un autre dans le DOM.
         */
        $replace = function(oldElem, newElem) {
            if (typeof newElem == "string") {
                newElem = document.createTextNode(newElem);
            }
            var parent = oldElem.parentNode;
            parent.replaceChild(newElem, oldElem);
            return newElem;
        };

        /**
         * Créer  un  élément  du  DOM  avec le  nom  et  les  éventuels
         * attributs donnés.
         */
        $tag = function(name, attribs) {
            if (attribs === undefined) attribs = {};
            if (name === undefined) name = "div";
            var e = document.createElement(name),
            key, val;
            for (key in attribs) {
                val = attribs[key];
                e.setAttribute(key, val);
            }
            return e;
        };

        /**
         * Créer un élément DIV.
         */
        $div = function(attribs) {
           return $tag("div", attribs);
        };

        /**
         * Déplacer le contenu d'un élément vers un autre.
         */
        $moveContent = function(src, dst) {
            var i, child, children = [];
            if (!src) return null;
            for (i = 0 ; i < src.childNodes.length ; i++) {
                children.push(src.childNodes[i]);
            }
            children.forEach(
                function(child) {
                    src.removeChild(child);
                    dst.appendChild(child);
                }
            );
            return dst;
        };

        /**
         *  Copier tous les attributs "data-*"  ainsi que "id" et "lang"
         *  d'un élément vers un autre.
         */
        $copyAttribs = function(src, dst) {
            var i, att;
            for (i = 0 ; i < src.attributes.length ; i++) {
                att = src.attributes[i];
                dst.setAttribute(att.name, att.value);
            }
            return dst;
        },

        /**
         * Ajouter des slots pour les événements mouse/touch.
         */
        $events = function(element, slots) {
            var onTouchstart = function(evt) {
                if (slots.touchstart) {
                    slots.touchstart({target: element});
                }
            },
            onTouchend = function(evt) {
                evt.preventDefault();
                if (slots.touchend) {
                    slots.touchend({target: element});
                }
                if (slots.tap) {
                    slots.tap({target: element});
                }
            };
            element.addEventListener(
                "touchstart",
                function(evt) {
                    slots._touchstart = 1;
                    onTouchstart(evt);
                }
            );
            element.addEventListener(
                "mousedown",
                function(evt) {
                    if (slots._touchstart) {
                        evt.preventDefault();
                        delete slots._touchstart;
                    } else {
                        onTouchstart(evt);
                    }
                }
            );
            element.addEventListener(
                "touchend",
                function(evt) {
                    slots._touchend = 1;
                    onTouchend(evt);
                }
            );
            element.addEventListener(
                "mouseup",
                function(evt) {
                    if (slots._touchend) {
                        evt.preventDefault();
                        delete slots._touchend;
                    } else {
                        onTouchend(evt);
                    }
                }
            );
            return element;
        };

        /**
         * Si une classe existe, l'enlever, sinon l'ajouter.
         * On peut passer un nombre variable de noms de classes en arguments.
         */
        $toggleClass = function(e) {
            var i, classname;
            for (i = 0 ; i < arguments.length ; i++) {
                classname = arguments[i];
                if ($hasClass(classname)) {
                    $removeClass(classname);
                } else {
                    $addClass(classname);
                }
            }
        };

        /**
         * Détermine si l'élément sous-jacent possède la classe CSS passée en argument.
         */
        $hasClass = function(e, cls) {
            var cn, rx;
            if (!e) return false;
            cn = e.className;
            if (!cn) return false;
            rx = new RegExp('(\\s|^)' + cls + '(\\s|$)');
            if (!cn.match(rx)) return false;
            return true;
        };

        /**
         * Chaque élément du DOM peut possèder une liste de classes CSS.
         * Avec cette méthode, on peut en ajouter une.
         */
        $addClass = function(e) {
            var i, cls;
            if (!e) return;
            for (i = 1 ; i < arguments.length ; i++) {
                cls = arguments[i];
                if (!e.className) {
                    e.className = cls;
                } else {
                    if (!$hasClass(e, cls)) e.className += " "+cls;
                }
            }
        };

        /**
         * Retire la classe passée en argument de la liste des classes CSS de l'élément sous-jacent.
         */
        $removeClass = function(e, cls) {
            var reg;
            if (!e) return this;
            if ($hasClass(e, cls)) {
                reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
                e.className = e.className.replace(reg,' ');
            }
        };

        /**
         * Effectuer un document.querySelector().
         */
        $ = function(selector) {
            var elem = document.querySelector(selector);
            if (!elem) {
                throw new Error("Bad selector: \"" + selector + "\"!");
            }
            return elem;
        };
    },

    init: function() {
        var self = this,
        keys = [], key,
        first = true,
        tags = "", i, k,
        children, child,
        builder, name,
        wtags = {
            page: $$("wtag.Page"),
            button: $$("wtag.Button"),
            row: $$("wtag.Row"),
            err: $$("wtag.Popup"),
            msg: $$("wtag.Popup")
        },
        langStyle, languages = [], lang, found;
        self._slots = {};
        $$.App = this;
        // Gestion des langues.
        langStyle = document.createElement("style");
        document.head.appendChild(langStyle);
        self._langStyle = langStyle;
        children = document.querySelectorAll("[lang]");
        for (i = 0 ; i < children.length ; i++) {
            child = children[i];
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
        self._languages = languages;
        self.lang(self.lang());

        // Transformer les wtags.
        for (key in wtags) {
            if (first) {
                first = false;
            } else {
                tags += ",";
            }
            tags += "w-" + key;
        }
        children = document.querySelectorAll(tags);
        for (i = children.length - 1 ; i > -1 ; i--) {
            child = children[i];
            name = child.nodeName.substr(2).toLowerCase();
            builder = wtags[name];
            builder.build(child);
        }
    },

    functions: {
        /**
         * Retourner ou définir la langue actuelle.
         */
        lang: function(id) {
            var self = this, lang, k, languages = self._languages, found, first, txt;
            if (id === undefined) {
                lang = localStorage.getItem("wtag-language");
                if (!lang) {
                    lang = navigator.language || navigator.browserLanguage || "fr";
                    lang = lang.substr(0, 2);
                }
                localStorage.setItem("wtag-language", lang);
                return lang;
            } else {
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
                self._langStyle.textContent = txt + "{display: none}";
                localStorage.setItem("wtag-language", id);
            }
        },

        /**
         * Ajouter un slot.
         */
        addSlot: function(id, slot) {
            var self = this;
            if (slot === undefined) slot = id;
            if (typeof slot == 'string') {
                self._slots[id] = function(arg) {
                    return self[slot](arg);
                };
            }
            else if (typeof slot == 'function') {
                self._slots[id] = slot;
            }
            else {
                console.error("[wtag.Application.addSlot] Invalid slot for id \"" + id + "\":", slot);
            }
        },

        /**
         * Appeler un slot.
         */
        signal: function(slotId, evt) {
            var self = this,
            slot = self._slots[slotId];
            if (slot) {
                slot(evt);
            } else {
                console.error("Unknown slot '" + slotId + "'!", evt);
            }
        }
    }
};
