/**
 * ToloFrameWork v3.0.1
 *-------------------------------------------------------------------------------
 *  ### To define a class (let's call it MyClass), use this syntax:
 *
 *  window["TFW::MyClass"] = {
 *  singleton: false,
 *  superclass: "...",
 *  signals: [...],
 *  attributes: {...},
 *  classInit: function(staticVars) {...},
 *  lang: {
 *  en: {...},
 *  fr: {...},
 *  ...
 *  },
 *  init: function() {},
 *  functions: {
 *  foo: function(...) {...},
 *  bar: function(...) {...},
 *  ...
 *  }
 *  }
 *
 *
 *  ### To create an instance of MyClass:
 *
 *  var obj = $$("MyClass");
 *  var obj = $$("MyClass", {caption: "Hello world!"});
 *
 *
 *  ### Here are special functions that every class shares:
 *
 *  $id         [string]  : unique id referencing this object.
 *  $classname  [string]  : name of the current class.
 *  $parent     [object]  : prototype of the parent class if exist.
 *  $superclass [string]  : name of the superclass.
 *  $singleton  [boolean] : is this object a boolean?
 *  $statics    [object]  : map of the static variables shared by all instances of this class.
 */
window.$$ = function() {
    var TFW3,
    _id = 0,
    _singletons = {},
    _statics = {},
    _classes = {},
    _lang = null;

    var lang = function(lang) {
        if (lang === undefined) {
            if (!_lang) {
                _lang = TFW3.localLoad("tfw3.Language", null)
                    || navigator.language || navigator.browserLanguage || "en";
            }
            return _lang;
        }
        _lang = lang;
        TFW3.localSave("tfw3.Language", lang);
    };

    var declareSignal = function(cls, sn) {
        cls.prototype["fire" + sn] = function(a) {
            this["$_" + sn].emit(a);
        };
        cls.prototype[sn] = function(a,b,c) {
            this["$_" + sn].connect(a,b,c);
            return this;
        };
        cls.prototype["unbind" + sn] = function(a,b,c) {
            this["$_" + sn].disconnect(a,b,c);
            return this;
        };
    };

    var TFW3Object = function() {};
    TFW3Object.prototype.$ = function(k) {
        var dic = this.$lang[lang()],
        txt, newTxt, i, c, lastIdx, pos;
        if (!dic) {
            dic = this.$lang[this.$defLang];
        }
        if (!dic) {
            return "[[" + k + "]]";
        }
        txt = dic[k];
        if (!txt) {
            return "[[" + k + "]]";
        }
        if (arguments.length > 1) {
            newTxt = "";
            lastIdx = 0;
            for (i = 0 ; i < txt.length ; i++) {
                c = txt.charAt(i);
                if (c === '$') {
                    newTxt += txt.substring(lastIdx, i);
                    i++;
                    pos = txt.charCodeAt(i) - 48;
                    if (pos < 1 || pos >= arguments.length) {
                        newTxt += "$" + txt.charAt(i);
                    } else {
                        newTxt += arguments[pos];
                    }
                    lastIdx = i + 1;
                } else if (c === '\\') {
                    newTxt += txt.substring(lastIdx, i);
                    i++;
                    newTxt += txt.charAt(i);
                    lastIdx = i + 1;
                }
            }
            newTxt += txt.substr(lastIdx);
            txt = newTxt;
        }
        return txt;
    };

    /**
     * Cette méthod sert à récupérer le prototype d'un ancètre particulier.
     * Vous pouvez ainsi appeler une méthode d'un parent.
     * Il est aussi possible d'utiliser cette méthode pour savoir si un objet
     * appartient à une classe donnée. En effet, la méthode retourne null si
     * la classe n'existe pas dansla chaîne d'héritage.
     * @code
     *   var a = $$("B");
     *   a.foo(3.14);
     *   a.$super("A").foo.call(a, 3.14);
     * @code
     */
    TFW3Object.prototype.$super = function(classname) {
        var p = window[this.$classname];
        while (p) {
            if (p.prototype.$classname == classname) {
                return p.prototype;
            }
            p = p.prototype.$parent;
            if (!p) break;
            p = window[p.$classname];
        }
        return null;
    };
    TFW3Object.prototype.$classname = null;
    TFW3Object.prototype.$parent = null;

    var TFW3Signal = function(sender, name) {
        this._name = name;
        this._sender = sender;
        this._slots = {};
    };
    /**
     * Two way of using connect :
     * $$("toto").Signal(this, "onSignal", 27);
     * $$("toto").Signal(function(data){...}, 27);
     */
    TFW3Signal.prototype.connect = function(obj, slot, data) {
        var k, s;
        if (typeof obj === 'function') {
            k = this._key(obj);
            s = this._slots[k];
            if (s === undefined) {
                s = [obj, {}];
                this._slots[k] = s;
            }
            s[1] = {
                data: slot,
                emitter: this._sender,
                signal: this._name
            };
        } else {
            k = this._key(obj, slot);
            s = this._slots[k];
            if (s === undefined) {
                s = [obj[slot], {}, obj];
                this._slots[k] = s;
            }
            s[1] = {
                data: data,
                emitter: this._sender,
                slot: slot,
                signal: this._name
            };
        }
        return k;
    };
    TFW3Signal.prototype.disconnect = function(obj, slot) {
        var k;
        if (typeof obj === 'function') {
            k = this._key(obj);
        } else {
            k = (slot ? this._key(obj, slot) : obj);
        }
        delete this._slots[k];
    };
    /**
     * A "data" has these attributes : {slot:..., signal:..., emitter:..., data:...}
     */
    TFW3Signal.prototype.emit = function(arg) {
        var key, slot, func, data, that, result;
        for (key in this._slots) {
            slot = this._slots[key];
            if (slot) {
                func = slot[0];
                data = slot[1];
                if (typeof data.emitter === 'undefined') data.emitter = {};
                that = slot[2];
                if (that) {
                    try {
                        result = func.call(that, arg, data);
                    } catch (e) {
                        console.log("data:", data);
                        console.error("arg:", arg);
                        throw new Error(
                            "[" + data.emitter.$classname + ".fire"
                                + data.signal + "] Exception occured in slot "
                                + that.$classname + "." + data.slot + "()\n" + e
                        );
                    }
                } else {
                    try {
                        result = func(arg, data);
                    } catch (e) {
                        console.log("data:", data);
                        console.error("arg:", arg);
                        throw new Error(
                            "[" + data.emitter.$classname + ".fire"
                                + data.signal + "] Exception occured in anonymous slot\n"
                                + e
                        );
                    }
                }
            }
            if (result === 0) {
                // If a slot returns 0, we must skip all other slots.
                break;
            }
        }
    };
    TFW3Signal.prototype._key = function(obj, slot) {
        if (typeof obj.$id === 'undefined') obj.$id = newID();
        var id = "" + obj.$id;
        if (slot) {
            id += slot;
        }
        return id;
    };

    /**
     * Return next free ID.
     */
    var newID = function() {
        _id++;
        if (_id > 2000000000) {
            _id = 0;
        }
        return _id;
    };


    /**
     * Load class definition.
     */
    var loadClass = function(className) {
        var cls = _classes[className];
        if (!cls) {
            var k, name,
            def = window["TFW::" + className];
            if (!def) {
                throw new Error(
                    "[TFW3] This class has not been defined: \"" + className + "\"!\n"
                        + "Did you forget to include it?"
                );
            }
            // Création de la classe à partir de sa définition.
            cls = function () {};
            var superclass = TFW3Object;
            if (def.superclass) {
                superclass = loadClass(def.superclass);
            }
            // Héritage
            cls.prototype = new superclass();
            // Eviter que le constructeur de cette classe soit celui de la super classe.
            cls.prototype.constructor = cls;
            // Définition de l'attribut $parent pour accéder aux méthodes parentes.
            cls.prototype.$parent = superclass.prototype;
            // Multilangues.
            if (typeof def.lang === "object") {
                cls.prototype.$lang = def.lang;
                for (k in def.lang) {
                    cls.prototype.$defLang = k;
                    break;
                }
            } else {
                cls.prototype.$lang = superclass.prototype.$lang || {};
                cls.prototype.$defLang = superclass.prototype.$defLang || "en";
            }
            // Conserver le nom de la super classe.
            cls.prototype.$superclass = superclass.prototype.$classname;
            // Conserver le nom de la classe.
            cls.prototype.$classname = className;
            // Les noms des signals.
            cls.prototype.$signals = def.signals;
            // Est-ce un singleton ?
            cls.prototype.$singleton = def.singleton;
            // Espace réservé aux membres statiques de la classe.
            var staticVars = {className: className};
            _statics[className] = staticVars;
            cls.prototype.$statics = staticVars;
            // Valeurs par défaut des attributs.
            if (def.attributes) {
                for (k in def.attributes) {
                    cls.prototype["_" + k] = def.attributes[k];
                }
            }
            // Déclaration du constructeur.
            cls.prototype.$init = def.init;
            // Définition des méthodes liées aux signaux.
            if (def.signals) {
                for (i in def.signals) {
                    declareSignal(
                        cls,
                        def.signals[i]
                    );
                }
            }
            // Assigner toutes les méthodes.
            for (name in def.functions) {
                if (def.superclass && cls.prototype[name]) {
                    // This is an ovveride.
                    cls.prototype[def.superclass + "$" + name] = cls.prototype[name];
                }
                cls.prototype[name] = def.functions[name];
            }

            // Mise en cache de la classe.
            _classes[className] = cls;
            // Appel d'un éventuel constructeur de classe.
            if (typeof def.classInit === "function") {
                def.classInit(staticVars);
            }
        }
        return cls;
    };

    TFW3 = function(className, attribs) {
        var single,
        cls,
        obj,
        k,
        path,
        names,
        signals,
        cur,
        i,
        f,
        sn,
        n,
        s;
        // In case of singleton, just return the last created instance.
        single = _singletons[className];
        if (single && typeof single === "object") {
            return single;
        }

        cls = loadClass(className);
        obj = new cls();
        obj.$id = newID();

        // Mise à jour des attributs.
        if (typeof attribs === "object") {
            for (k in attribs) {
                if (!k) continue;
                obj["_" + k] = attribs[k];
            }
        }

        // La mécanique  suivante sert  à récupérer la  hiérarchie des
        // classes afin d'appeler les  constructeurs les uns après les
        // autres.  Sans  cette astuce, les attributs  de construction
        // ne sont  pas renseignés quand  la super classe  exécute son
        // constructeur.
        path = [];
        names = [];
        signals = {};
        cur = cls.prototype;
        while (cur) {
            if (cur.$signals) {
                for (i in cur.$signals) {
                    signals[cur.$signals[i]] = 1;
                }
            }
            f = cur.$init;
            /**
             * Attention !
             * Quand on ne  définit pas de méthode init()  et que l'on
             * hérite d'une classe en  définissant une, f pointera non
             * pas sur null, mais sur la méthode init() du parent.
             */
            if (f) {
                if (f != path[path.length - 1]) {
                    path.push(f);
                    names.push(cur.$classname);
                }
            }
            cur = cur.$parent;
        }

        // Création des signals.
        for(sn in signals) {
            // Signal Name.
            if (sn) {
                s = new TFW3Signal(obj, sn);
                obj["$_" + sn] = s;
            }
        }

        while (path.length > 0) {
            f = path.pop();
            n = names.pop();
            if (f) {
                f.call(obj);
            }
        }

        if (obj.$singleton) {
            // C'est un singleton, alors on stoque son unique instance
            // en mémoire pour réutilisation.
            _singletons[className] = obj;
        }

        return obj;
    };

    TFW3.App = {};
    TFW3.lang = lang;
    TFW3.statics = function(className) {
        if (className in _statics) {
            return _statics[className];
        }
    };

    //#####################
    //#                   #
    //#     POLYFILLS     #
    //#                   #
    //#####################

    /**
     * Ajoute à l'objet original tous les attributs de l'objet overrider.
     * S'il y a des attributs en communs, les valeurs seront écrasées par
     * overrider.
     *
     * @param original Objet initial.
     * @param overrider Objet qui va surcharger l'original.
     * @param onlyNewValues Si true, on ajoute uniquement les clefs inexistantes.
     *                      Par défaut, il est à false.
     * @return Objet original étendu par overrider.
     */
    TFW3.extend = function(original, overrider, onlyNewValues) {
        var k;
        if (original === undefined) original = {};
        if (overrider) {
            for (k in overrider) {
                if (k === undefined) continue;
                if (onlyNewValues && original[k] === undefined) continue;
                original[k] = overrider[k];
            }
        }
        return original;
    };

    /**
     * Copie un objet de type JSON, c'est-à-dire
     * qui ne contient pas de fonctions ni d'objets natifs.
     */
    TFW3.clone = function(obj) {
        var r, k, i;
        if ($$.isArray(obj)) {
            r = [];
            for (i in obj) {
                r.push($$.clone(obj[i]));
            }
            return r;
        }
        if (typeof obj == "object") {
            r = {};
            for (k in obj) {
                r[k] = $$.clone(obj[k]);
            }
            return r;
        }
        return obj;
    };

    if (String.prototype.trim === undefined) {
        $$._trimLeft = new RegExp("^\\s+");
        $$._trimRight = new RegExp("\\s+$");
        String.prototype.trim = function() {
            return this.toString()
                .replace( $$._trimLeft, "" )
                .replace( $$._trimRight, "" );
        };
    }

    if (typeof window.JSON === 'undefined') window.JSON = {};
    if (typeof window.JSON.parse === 'undefined') {
        window.JSON.parse = function(json) {
            try {
                if ( typeof json !== "string" || !json ) {
                    return null;
                }
                json = json.trim();
                return (new Function("return " + json))();
            } catch (x) {
                throw new Error("Invalid JSON!\n" + x + "\n" + json);
            }
        };
    }
    if (typeof window.JSON.stringify === 'undefined') {
        /**
         * Cette fonction provient du site http://code.google.com/p/jquery-json/
         * ---------------------------------------------------------------------
         * Returns a string-repr of a string, escaping quotes intelligently.
         * Mostly a support function for toJSON.
         *
         * Examples:
         * ### $$.quoteString("apple")
         * "apple"
         *
         * ### $$.quoteString('"Where are we going?", she asked.')
         * "\"Where are we going?\", she asked."
         */
        var quoteString = function(string)
        {
            var _escapeable = /["\\\x00-\x1f\x7f-\x9f]/g,
            _meta = {
                '\b': '\\b',
                '\t': '\\t',
                '\n': '\\n',
                '\f': '\\f',
                '\r': '\\r',
                '"' : '\\"',
                '\\': '\\\\'
            };
            if (string.match(_escapeable))
            {
                return '"' + string.replace(
                    _escapeable, function (a)
                    {
                        var c = _meta[a];
                        if (typeof c === 'string') return c;
                        c = a.charCodeAt();
                        return '\\u00' + Math.floor(c / 16).toString(16) + (c % 16).toString(16);
                    }) + '"';
            }
            return '"' + string + '"';
        };
        window.JSON.stringify = function(o) {
            /**
             * Cette fonction provient du site http://code.google.com/p/jquery-json/
             * ---------------------------------------------------------------------
             * Convertit un objet en chaîne de caractères au format JSON.
             */
            var type = typeof(o),
            month, day, year, hours, minutes, seconds, milli,
            ret, i,
            pairs, k, name,
            val;

            if (o === null || type == "undefined") return "null";
            if (type == "number" || type == "boolean")  return o + "";
            if (type == "string") return quoteString(o);

            if (type == 'object') {
                if (typeof o.toJSON == "function") return JSON.stringify( o.toJSON() );

                if (o.constructor === Date) {
                    month = o.getUTCMonth() + 1;
                    if (month < 10) month = '0' + month;

                    day = o.getUTCDate();
                    if (day < 10) day = '0' + day;

                    year = o.getUTCFullYear();

                    hours = o.getUTCHours();
                    if (hours < 10) hours = '0' + hours;

                    minutes = o.getUTCMinutes();
                    if (minutes < 10) minutes = '0' + minutes;

                    seconds = o.getUTCSeconds();
                    if (seconds < 10) seconds = '0' + seconds;

                    milli = o.getUTCMilliseconds();
                    if (milli < 100) milli = '0' + milli;
                    if (milli < 10) milli = '0' + milli;

                    return '"' + year + '-' + month + '-' + day + 'T' +
                        hours + ':' + minutes + ':' + seconds +
                        '.' + milli + 'Z"';
                }

                if (o.constructor === Array) {
                    ret = [];
                    for (i = 0; i < o.length; i++) ret.push( JSON.stringify(o[i]) || "null" );

                    return "[" + ret.join(",") + "]";
                }

                pairs = [];
                for (k in o) {
                    type = typeof k;
                    if (type == "number") {
                        name = '"' + k + '"';
                    }
                    else if (type == "string") {
                        name = quoteString(k);
                    }
                    else {
                        continue;  //skip non-string or number keys
                    }
                    if (typeof o[k] == "function") {
                        continue;  //skip pairs where the value is a function.
                    }
                    val = JSON.stringify(o[k]);
                    pairs.push(name + ":" + val);
                }
                return "{" + pairs.join(", ") + "}";
            }
            return "null";
        };
    }

    // Local storage
    if (window["localStorage"]) {
        /**
         * Ce navigateur supporte le localStorage.
         */
        TFW3.localLoad = function(key, defVal) {
            var val = window.localStorage.getItem( key );
            if (val === null) {
                return defVal;
            }
            try {
                val = JSON.parse(val);
            }
            catch(e) {
                val = defVal;
            }
            return val;
        };
        TFW3.localSave = function(key, val) {
            window.localStorage.setItem(key, JSON.stringify(val));
        };
        TFW3.sessionLoad = function(key, defVal) {
            var val = window.sessionStorage.getItem( key );
            if (val === null) {
                return defVal;
            }
            return JSON.parse( val );
        };
        TFW3.sessionSave = function(key, val) {
            window.sessionStorage.setItem( key, JSON.stringify( val ) );
        };
    } else {
        /**
         * Ce navigateur n supporte pas le localStorage,
         * alors nous allons l'émuler avec des cookies.
         */
        TFW3.localLoad = function(key) {
            var theCookie = "" + document.cookie,
            ind = theCookie.indexOf(key),
            ind1;
            if (ind == -1 || key == "") return null;
            ind1 = theCookie.indexOf(';', ind);
            if (ind1 == -1) ind1 = theCookie.length;
            return JSON.parse(decodeURIComponent(theCookie.substring(ind + key.length + 1, ind1)));
        };
        TFW3.localSave = function(key, val) {
            var nDays = 365,
            today = new Date(),
            expire = new Date();
            expire.setTime(today.getTime() + 3600000*24*nDays);
            document.cookie = key + "=" + encodeURIComponent(JSON.stringify(val))
                + ";expires=" + expire.toGMTString();
        };
    }

    // Prévenir les erreurs sur les browsers qui ne supportent pas l'objet "console".
    if (window.console === undefined) {
        window.console = {
            log: function() {},
            info: function() {},
            warn: function() {},
            error: function() {}
        };
    }
    var consoleMethods = ["log", "info", "warn", "error"],
    i;
    for (i = 0 ; i < consoleMethods.length ; i++) {
        if (window.console[consoleMethods[i]] === undefined) {
            window.console[consoleMethods[i]] = function(){};
        }
    }

    ///////////////////////
    // JSON Web Services //
    ///////////////////////
    TFW3.service = function(p_service, p_input, p_obj, p_slot) {
        var callback = null,
        obj, slot, f, arg;
        if (!p_obj) {
            throw new Error("[$$.service] Missing argument #3: object!");
        }
        if (!p_slot) {
            callback = p_obj;
        }
        obj = p_obj;
        slot = p_slot;
        f = slot ? $$.slot(obj, slot): null;
        arg = {
            s: p_service,
            i: $$.toJSON(p_input)
        };
        $$.ajax(
            {
                url: $$.params.root + "/server.php",
                data: arg,
                type: "POST",
                cache: false,
                dataType: "json",
                success: function(data) {
                    // Si tout va bien, on appelle la callback.
                    try {
                        if (callback) {
                            callback(data);
                        } else {
                            f.call(obj, data);
                        }
                    } catch (e) {
                        throw new Error("[$$.service] Unexpected error in callback function "
                                        + obj.$classname + "." + slot + "()\n" + e);
                    }
                }
            }
        );
    };


    return TFW3;
}();
