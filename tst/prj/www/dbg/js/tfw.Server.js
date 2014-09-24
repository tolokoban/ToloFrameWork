/**
 * Cet  objet  devrait  être  instancié   une  seule  fois  dans  vote
 * application et stoqué dans la variable $$.App, par exemple.
 * @code
 * $$.App.login = $$("tfw.Server");
 * @code
 *
 * Pour se connecter, il faut utiliser la méthode connect().
 * @code
 * var login = $$("tfw.Server");
 * login.login( "tutu" );
 * login.password( "phsswdrd" );
 * login.connect();
 * @code
 *
 * @signal  Change(this)  Se  déclenche  dés  que  l'identification  a
 * changé. Ca peut être un login ou un logout.
 *
 * Etats possibles des messages :
 *  0 : standard.
 *  1  : standard  ayant  déjà  reçu un  refus  du  serveur pour  rôle
 *  manquant.
 *  2 : requête de connexion.
 */
window["TFW::tfw.Server"] = {
    signals: [
        // Argument : this.
	"Login",
        // Argument : this.
        "Logout",
        // Argument : this.
        "LoginFailure"
    ],

    attributes: {
        root: "tfw/",
        autologin: 0,
        login: null,
        password: null,
        id: "tfw",
        key: "ç87&e_rb472.;156er86(%WSRERs"
    },

    init: function() {
        this.INVALID_JSON = 1;
        this.NOT_GRANTED = 2;
        this._user = null;
        this._error = 0;
        this._stack = [];
    },


    functions: {
        /**
         * Retourner l'utilisateur actuellement connecté ou null.
         * {
         *   id: identifiant unique de l'utilisateur
         *   login : ...
         *   name : nom usuel
         *   enabled : actif ou non
         *   creation : date de création.
         *   data : {}
         * }
         */
        user: function() {
            return this._user;
        },

        /**
         * Retourner la dernière erreur de connexion.
         * Par exemple, -5 signifie que le mot de passe est erroné.
         */
        error: function() {
            return this._error;
        },

        /**
	 * Accessor for login.
	 */
	login: function(v) {
	    if (v === undefined) return this._login;
	    this._login = v;
	    return this;
	},

	/**
	 * Accessor for password.
	 */
	password: function(v) {
	    if (v === undefined) return this._password;
	    this._password = v;
	    return this;
	},

        /**
         * Tente de se  connecter en allant chercher  le dernier login
         * ayant réussi dans le local storage.
         */
        autologin: function() {
            this._autologin = 1;
            var v = this.dec($$.localLoad(this._id + ".nigolotua"));
            if (!v) v = ["", ""];
            // Pas d'autologin si le login est vide.
            if (v[0] == "") {
                return false;
            }
            this.login(v[0]);
            this.password(v[1]);
            this.connect();
            return true;
        },

        /**
         * Encoder une chaîen de caractères selon les attributs key et root.
         */
        enc: function(login, password) {
            var size = plain.length,
            key1 = this._key,
            len1 = key1.length,
            key2 = this._root,
            len2 = key2.length,
            k = 0, i, c, c1, c2,
            out = [];
            for (i = 0 ; i < login.length ; i++) {
                c = login.charCodeAt(i);
                c1 = key1.charCodeAt(k & len1);
                c2 = key2.charCodeAt(k & len2);
                k++;
                out.push(c ^ c1 ^ c2);
            }
            c1 = key1.charCodeAt(k & len1);
            c2 = key2.charCodeAt(k & len2);
            k++;
            out.push(c1 ^ c2);
            for (i = 0 ; i < login.length ; i++) {
                c = password.charCodeAt(i);
                c1 = key1.charCodeAt(k & len1);
                c2 = key2.charCodeAt(k & len2);
                k++;
                out.push(c ^ c1 ^ c2);
            }
            return out;
        },

        /**
         * Décoder le couple login/password.
         */
        dec: function(arr) {
            var size = arr.length,
            key1 = this._key,
            len1 = key1.length,
            key2 = this._root,
            len2 = key2.length,
            k = 0, i, c, c1, c2,
            login = "",
            password = "";
            for (i = 0 ; i < size ; i++) {
                c = arr[i];
                c1 = key1.charCodeAt(k & len1);
                c2 = key2.charCodeAt(k & len2);
                k++;
                c ^= c1 ^ c2;
                if (c == 0) break;
                login += String.fromCharCode(c);
            }
            for (; i < size ; i++) {
                c = arr[i];
                c1 = key1.charCodeAt(k & len1);
                c2 = key2.charCodeAt(k & len2);
                k++;
                c ^= c1 ^ c2;
                if (c == 0) break;
                password += String.fromCharCode(c);
            }
            return [login, password];
        },

	/**
	 * Tente une connection. Le retour est asynchrone et se fait
	 * à travers l'événement Change.
	 */
	connect: function(login, password) {
            var self = this;

            if (login !== undefined) {
                self.login(login);
            }
            if (password !== undefined) {
                self.password(password);
            }
            self._error = 0;
            // Ajouter une requête de connexion en tête de pile.
            self._stack.splice(0, 0,
                {
                    service: "tfw.login.Challenge",
                    args: this.login(),
                    success: function(msgOK) {
                        self._stack.splice(1, 0,
                            {
                                service: "tfw.login.Response",
                                args: self._hash(
                                    self._password, 
                                    msgOK.out
                                ),
                                success: function(msg1) {
                                    self._onResponse(msg1.out);
                                },
                                failure: function(msg2) {
                                    console.error("challenge failed: ", msg2);
                                },
                                status: 2
                            }
                        );
                    },
                    failure: function(msgKO) {
                        console.error("challenge failed: ", msgKO);
                    },
                    status: 2                                
                }
            );
            self._next();
            return self;
	},

        /**
         * Déconnecte l'uilisateur courant.
         */
        disconnect: function() {
            var self = this;
            self.send(
                "tfw.login.Logout",
                null,
                function() {
                    self.fireLogout();
                }
            );
	    self._roles = [];
	    self._data = {};
            self._user = null;
            $$.localSave(self._id + ".nigolotua", null);
            return self;
	},

	/**
	 * @return True s'il y a un utilisateur actuellement connecté.
	 */
	isLogged: function() {
	    if (!this._user) return false;
	    if (this._user.roles.length > 0) return true;
	    return false;
	},

        /**
         * @return data
         */
        getData: function(key) {
            if (!this._user) return undefined;
            if (!this._user.data) return undefined;
            return this._user.data[key];
        },

        /**
         * @param data
         */
        setData: function(key, val) {
            if (!this._user) return undefined;
            if (!this._user.data) {
                this._user.data = {};
            }
            this._user.data[key] = val;
	    $$.service("tfw.login.SetData", {k:key, v:val});
        },

	getRoles: function() {
	    return this._roles;
	},

	hasRole: function(role) {
            if (!this._user) return false;
            if (!this._user.roles) return false;
	    for (var i in this._user.roles) {
		if (role.toUpperCase() == this._user.roles[i].toUpperCase()) return true;
	    }
	    return false;
	},

        /**
         * Mettre sur la pile d'envoi la prochaine requête.
         * Si elle est seule, elle s'exécute immédiatement.
         */
        send: function(service, args, success, failure) {
            this._stack.push(
                {
                    service: service,
                    args: args,
                    success: success,
                    failure: failure,
                    status: 0,
                    sent: 0
                }
            );
            this._next();
        },

        /**
         * Envoyer au serveur la prochaine requête disponible.
         * Etats possibles des messages :
         *  0 : standard.
         *  1 : standard ayant déjà reçu un refus du serveur pour rôle
         *  manquant.
         *  2 : requête de connexion.
         */
        _next: function(removeLastMsg) {
            if (this._stack.length < 1) return;
            if (removeLastMsg) {
                this._stack.splice(0, 1);
                if (this._stack.length < 1) return;
            }
            var i, m;
            console.log("----------------------------------------");
            for (i = 0 ; i < this._stack.length ; i++) {
                m = this._stack[i];
                console.log(m.service, m.sent);
            }

            var self = this,
            msg = this._stack[0];
            if (msg.sent) return;
            // Message disponible à l'envoi.
            msg.sent = 1;
            self._send(msg);
        },

        /**
         * Appeler un service de façon asynchrone.
         */
        _send: function(options) {
            var self = this,
            xhr = self._xhr,
            params = "";
            if (!xhr) {
                self._xhr = new XMLHttpRequest({mozSystem: true});
                xhr = self._xhr;
                xhr.onload = function() {
                    self._onXhrOK(xhr);
                };
                xhr.onerror = function() {
                    self._onXhrOK(xhr);
                };
            }
            xhr.open("POST", this._root + "svc.php", true);
            params = "s=" + encodeURIComponent(options.service)
                + "&i=" + encodeURIComponent(JSON.stringify(options.args));
            xhr.setRequestHeader(
                "Content-type",
                "application/x-www-form-urlencoded");
            //xhr.setRequestHeader("Content-length", params.length);
            //xhr.setRequestHeader("Connection", "close");
            xhr.withCredentials = true;  // Indispensable pour le CORS.
            xhr.send(params);
        },

        /**
         * Appeler le slot "failure" d'un message.
         */
        _failure: function(msg) {
            try {
                if (msg.failure) {
                    msg.failure(msg);
                } else {
                    console.error("[tfw.Server] No failure slot!", msg);
                }
            } catch (err) {
                console.error(
                    "[tfw.Server] Exception in failure's slot!", 
                    msg, 
                    err
                );
            }
        },
        
        /**
         * Appeler le slot "success" d'un message.
         */
        _success: function(msg) {
            try {
                if (msg.success) {
                    msg.success(msg);
                }
            } catch (err) {
                console.error(
                    "[tfw.Server] Exception in success's slot!", 
                    msg, 
                    err
                );
            }
        },
        
        /**
         * Callback pour AJAX quand ça fonctionne.
         */
        _onXhrOK: function(xhr) {
            var self = this,
            txt = xhr.responseText,
            data, roleFailure = false,
            msg = this._stack[0];
            try {
                data = JSON.parse(txt);
                msg.out = data;
            }
            catch (err) {
                msg.err = this.INVALID_JSON;
                msg.msg = txt;
                self._failure(msg);
                self._next(1);
                return;
            }
console.info("[tfw.Server] data=...", data);

            if (typeof data === 'string' && data.substr(0, 3) == '<<<') {
                // Problème de ROLE.
                // Le  serveur  attendait  que  l'utilisateur  courant
                // possède  ce rôle.  S'il n'est  pas connecté,  il ne
                // possède aucun rôle.
                roleFailure = true;
            }

            if (msg.status == 0) {
                if (roleFailure) {
                    msg.status = 1;
                    delete msg.sent;
                    self.connect();
                    return;
                }
                self._success(msg);
                self._next(1);
                return;
            }

            if (msg.status == 1) {
                if (roleFailure) {
                    msg.err = self.NOT_GRANTED;
                    msg.msg = data;
                    self._failure(msg);
                    self._next(1);
                    return;
                }
                self._success(msg);
                self._next(1);
                return;
            }

            self._success(msg);
            self._next(1);
        },

        /**
         * Callback pour AJAX en cas d'échec.
         */
        _onXhrKO: function(xhr) {
console.error("[tfw.Server] (KO) xhr=...", xhr);
            var msg = this._stack[0];
            self._failure(msg);
            self._next(1);
        },

        /**
         * @private
         */
        _onResponse: function(user) {
            if (typeof user == 'object') {
                // La connextion a réussi.
                this._user = user;
                this._error = 0;
                if (this._autologin) {
                    // L'auto-login a été demandé,
                    // alors on sauvegarde login/password.
                    $$.localSave(
                        this._id + ".nigolotua",
                        this.enc(this.login(), this.password())
                    );
                }
                this.fireLogin(this);
                return true;
            } else {
                this._user = null;
                this._error = user;
                this.fireLoginFailure(this);
                return false;
            }
        },

        /**
         * @private
         */
        _hash: function(password, code) {
            var output = [0, 0, 0, 0,
                          0, 0, 0, 0,
                          0, 0, 0, 0,
                          0, 0, 0, 0],
            i, j = 0,
            pass = [],
            k1, k2, k3;
            for (i=0 ; i<password.length ; i++) {
                pass.push(password.charCodeAt(i));
            }
            if (256 % pass.length == 0) {
                pass.push(0);
            }

            for (i=0 ; i<256 ; i++) {
                output[i % 16] ^= i + pass[i % pass.length];
                k1 = code[j++ % code.length]%16;
                k2 = code[j++ % code.length]%16;
                k3 = code[j++ % code.length]%16;
                output[k3] ^= (output[k3] + 16*k2 + k3)%256;
                output[k2] ^= (output[k1] + output[k3])%256;
            }

            return output;
        }
    }
}