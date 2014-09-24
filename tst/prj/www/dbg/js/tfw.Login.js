/**
 * Cet  objet  devrait  être  instancié   une  seule  fois  dans  vote
 * application et stoqué dans la variable $$.App, par exemple.
 * @code
 * $$.App.login = $$("tfw.Login");
 * @code
 *
 * Pour se connecter, il faut utiliser la méthode connect().
 * @code
 * var login = $$("tfw.Login");
 * login.login( "tutu" );
 * login.password( "phsswdrd" );
 * login.connect();
 * @code
 *
 * @signal  Change(this)  Se  déclenche  dés  que  l'identification  a
 * changé. Ca peut être un login ou un logout.
 */
window["TFW::tfw.Login"] = {
    singleton: true,

    signals: [
        // Argument : this.
	"Change"
    ],

    init: function() {
        this._login = "";
        this._password = "";
        this._autologin = 0;
        this._user = null;
        this._error = 0;
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
            var v = $$.localLoad("nigolotua");
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
	 * Tente une connection. Le retour est asynchrone et se fait
	 * à travers l'événement Change.
	 */
	connect: function(login, password) {
            if (login !== undefined) {
                this.login(login);
            }
            if (password !== undefined) {
                this.password(password);
            }
            this._error = 0;
            $$.service("tfw.login.Challenge", this._login, this, "_onChallenge");
	},

        /**
         * Déconnecte l'uilisateur courant.
         */
        disconnect: function() {
            $$.service("tfw.login.Logout", null, this, "_onLogout");
            $$.localSave("nigolotua", ["",""]);
	    this._roles = null;
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

        _change: function() {
            this.fireChange(this);
        },

	/**
	 * @PRIVATE
	 */
	_onLogout: function() {
	    this._roles = [];
	    this._data = {};
            this._user = null;
	    this._change();
        },

        /**
         * @private
         */
        _onChallenge: function(code) {
            var response = this._hash(this._password, code);
            $$.service("tfw.login.Response", response, this, "_onResponse");
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
                    $$.localSave( "nigolotua", [this.login(), this.password()] );
                }
            } else {
                this._user = null;
                this._error = user;
            }
            this._ping();
            this._change();
        },

        /**
         * Tant qu'on  est connecté,  on envoie un  ping toutes  les 3
         * minutes pour empêcher la session d'expirer.
         */
        _ping: function() {
            $$.service("tfw.login.Ping", null, this, "_onPing");
        },

        _onPing: function(result) {
            if (this.isLogged()) {
                $$.invokeLater(200000, this, "_ping");
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