"use strict";

exports.BAD_ROLE = -1;
exports.BAD_TYPE = -2;
exports.CONNECTION_FAILURE = -3;
exports.MISSING_AUTOLOGIN = -4;
exports.UNKNOWN_USER = -5;
exports.HTTP_ERROR = -6;

/**
 * Call a webservice.
 * @param {string} name - Service's name.
 * @param {object} args - Service's arguments.
 * @param {string=undefined} url - You can define your own URL to your `svc.php` file.
 */
exports.get = callWebService;
/**
 * @return {boolean}
 */
exports.isAdmin = isAdmin;
/**
 * @param {string} role - Role's name.
 * @return {boolean}
 */
exports.hasRole = hasRole;
/**
 * @return Current user.
 */
exports.user = user;
/*
 * Load a JSON file and return a Promise.
 * @param {string} path Local path relative to the current HTML page.
 */
exports.loadJSON = loadJSON;
/**
 * Event fired when login status has changed.
 * @type {tfw.listeners}
 */
exports.eventChange = new (require( "tfw.listeners" ))();
exports.changeEvent = exports.eventChange;
/**
 * @return If there is a user connected or not.
 */
exports.isLogged = isLogged;
/**
 * Disconnect current user.
 * @return {Promise} A _thenable_ object resolved as soon as the server answered.
 */
exports.logout = logout;
/**
 * Try to connect a user.
 * @param {string} usr Login name.
 * @param {string} pwd Password.
 * @return {Promise}
 *
 */
exports.login = login;
/**
 * @param {string} key
 * @param {any} val
 */
exports.config = configGetSet;


Object.defineProperty( exports, 'userData', {
  get: function () {
    if ( currentUser ) return currentUser.data || {};
    return {};
  },
  set: function () {},
  configurable: true,
  enumerable: true
} );






require( "polyfill.promise" );
var Cfg = require( "$" ).config;

var Storage = require( "tfw.storage" );

var currentUser = null;
var config = {
  // In `package.json`, you can override the services URL.
  // { "tfw": { "consts": { "debug": "tfw", "release": "http://tolokoban.org/tfw" } } }
  url: typeof Cfg.consts.tfw === 'string' ? Cfg.consts.tfw : "tfw"
};
var saved = Storage.local.get( "nigolotua" );
if ( Array.isArray( saved ) ) {
  config.usr = saved[ 0 ];
  config.pwd = saved[ 1 ];
}

function svc( name, args, url ) {
  console.info( "[tfw.web-service]", name, args );
  return new Promise(
    function ( resolve, reject ) {
      if ( typeof url === 'undefined' ) url = config.url;
      var that = this;
      var xhr = new XMLHttpRequest( {
        mozSystem: true
      } );
      if ( 'withCredentials' in xhr ) {
        xhr.open( "POST", url + "/svc.php", true );
        xhr.withCredentials = true; // Indispensable pour le CORS.
      } else {
        // IE
        xhr = new XDomainRequest();
        xhr.open( "POST", url + "/svc.php" );
      }
      xhr.onload = function () {
        if ( xhr.status != 200 ) {
          return reject( {
            id: exports.HTTP_ERROR,
            msg: "(" + xhr.status + ") " + xhr.statusText,
            status: xhr.status
          } );
        }
        var value = xhr.responseText;
        if ( typeof value === "string" ) {
          if ( value.substr( 0, 1 ) == "!" ) {
            reject( {
              id: exports.BAD_ROLE,
              err: Error( "Service \"" + name + "\" needs role \"" +
                          value.substr( 1 ) + "\"!" )
            } );
          }
          var valueObject;
          try {
            valueObject = JSON.parse( value );
          } catch ( ex ) {
            console.error( "[tfw.web-service:svc] Value = ", value );
            reject( {
              id: exports.BAD_TYPE,
              err: Error( "Service \"" + name +
                          "\" should return a valid JSON!\n" + ex )
            } );
          }
          resolve( valueObject );
        } else {
          reject( {
            id: exports.BAD_TYPE,
            err: Error( "Service \"" + name + "\" should return a string!" )
          } );
        }
      };
      xhr.onerror = function () {
        reject( {
          id: exports.HTTP_ERROR,
          err: "HTTP_ERROR (" + xhr.status + ") " + xhr.statusText,
          status: xhr.status
        } );
      };
      var params = "s=" + encodeURIComponent( name );
      if ( typeof args !== 'undefined' ) {
        params += "&i=" + encodeURIComponent( JSON.stringify( args ) );
      }
      xhr.setRequestHeader(
        "Content-type",
        "application/x-www-form-urlencoded" );
      xhr.withCredentials = true; // Indispensable pour le CORS.
      xhr.send( params );
    }
  );
}
/**
 * Load a JSON file and return a Promise.
 * @param {string} path Local path relative to the current HTML page.
 */
function loadJSON( path ) {
  return new Promise( function ( resolve, reject ) {
    var xhr = new XMLHttpRequest( {
      mozSystem: true
    } );
    xhr.onload = function () {
      var text = xhr.responseText;
      try {
        resolve( JSON.parse( text ) );
      } catch ( ex ) {
        reject( Error( "Bad JSON format for \"" + path + "\"!\n" + ex + "\n" + text ) );
      }
    };
    xhr.onerror = function () {
      reject( Error( "Unable to load file \"" + path + "\"!\n" + xhr.statusText ) );
    };
    xhr.open( "GET", path, true );
    xhr.withCredentials = true; // Indispensable pour le CORS.
    xhr.send();
  } );
};


/**
 * @return If there is a user connected or not.
 */
function isLogged() {
  if ( !currentUser ) return false;
  return true;
};

/**
 * Disconnect current user.
 * @return {Promise} A _thenable_ object resolved as soon as the server answered.
 */
function logout() {
  currentUser = null;
  delete config.usr;
  delete config.pwd;
  Storage.local.set( "nigolotua", null );
  exports.eventChange.fire();
  return svc( "tfw.login.Logout" );
};

/**
 * Try to connect a user.
 * @param {string} usr Login name.
 * @param {string} pwd Password.
 * @return {Promise}
 *
 */
function login( usr, pwd ) {
  if ( typeof usr === 'undefined' ) usr = config.usr || '';
  if ( typeof pwd === 'undefined' ) pwd = config.pwd || '';

  return new Promise(
    function ( resolve, reject ) {
      if ( typeof usr === 'undefined' ) {
        var autologin = Storage.local.get( "nigolotua" );
        if ( !Array.isArray( autologin ) ) return reject( {
          id: exports.MISSING_AUTOLOGIN
        } );
        usr = autologin[ 0 ] || '';
        pwd = autologin[ 1 ] || '';
      }
      Storage.local.set( "nigolotua", null );
      svc( "tfw.login.Challenge", usr )
        .then(
          function ( code ) {
            // Hashage du mot de passe à l'aide du code.
            var output = [
              0, 0, 0, 0,
              0, 0, 0, 0,
              0, 0, 0, 0,
              0, 0, 0, 0
            ],
                i, j = 0,
                pass = [],
                k1, k2, k3;
            for ( i = 0; i < pwd.length; i++ ) {
              pass.push( pwd.charCodeAt( i ) );
            }
            if ( 256 % pass.length == 0 ) {
              pass.push( 0 );
            }

            for ( i = 0; i < 256; i++ ) {
              output[ i % 16 ] ^= i + pass[ i % pass.length ];
              k1 = code[ j++ % code.length ] % 16;
              k2 = code[ j++ % code.length ] % 16;
              k3 = code[ j++ % code.length ] % 16;
              output[ k3 ] ^= ( output[ k3 ] + 16 * k2 + k3 ) % 256;
              output[ k2 ] ^= ( output[ k1 ] + output[ k3 ] ) % 256;
            }
            return svc( "tfw.login.Response", output );
          },
          reject
        )
        .then(
          function ( user ) {
            console.info( "[tfw.web-service] user=...", user );
            if ( typeof user === 'object' ) {
              currentUser = {
                data: user,
                hasRole: function ( role ) {
                  for ( var i = 0; i < user.roles.length; i++ ) {
                    var item = user.roles[ i ];
                    if ( item == role ) return true;
                  }
                  return false;
                }
              };
              Storage.local.set( "nigolotua", [ usr, pwd ] );
              exports.eventChange.fire();
              resolve( user );
            } else {
              currentUser = null;
              reject( {
                id: exports.UNKNOWN_USER,
                err: "Unknown user '" + usr + "'!"
              } );
            }
          },
          reject
        );
    }
  );
};

/**
 * Call a webservice.
 */
function callWebService( name, args, url ) {
  return new Promise(
    function ( resolve, reject ) {
      svc( name, args, url ).then(
        resolve,
        function ( err ) {
          if ( typeof err === 'object' && err.id == exports.BAD_ROLE ) {
            // Echec de connexion, on retente de se connecter avant d'abandonner.
            login().then(
              function () {
                svc( name, args, url ).then( resolve, reject );
              },
              reject
            );
          } else {
            reject( err );
          }
        }
      );
    }
  );
};

function isAdmin() {
  return hasRole( 'ADMIN' );
};

function hasRole( role ) {
  if ( !currentUser ) return false;
  return currentUser.hasRole( role );
};

function user () { return currentUser; };

function configGetSet( key, val ) {
  if ( typeof val === 'undefined' ) {
    return config[ key ];
  }
  config[ key ] = val;
  return val;
};

// _Backward compatibility.
if ( window.$$ ) {
  window.$$.service = function ( name, args, caller, onSuccess, onError ) {
    var p = exports.get( name, args );
    p.then(
      function ( value ) {
        if ( onSuccess ) {
          return caller[ onSuccess ].call( caller, value );
        }
        return value;
      },
      function ( reason ) {
        if ( onError ) {
          return caller[ onError ].call( caller, reason );
        }
        return reason;
      }
    );
  };
}


var properties = {
  userID: function () {
    if ( !currentUser ) return 0;
    return currentUser.data.id;
  },
  userLogin: function () {
    if ( !currentUser ) return null;
    return currentUser.data.login;
  },
  userName: function () {
    if ( !currentUser ) return null;
    return currentUser.data.name;
  }
};

for ( var key in properties ) {
  Object.defineProperty( exports, key, {
    get: properties[ key ],
    set: function ( v ) {
      throw Error( "Property " + key + " is read-only!" );
    },
    configurable: true,
    enumerable: true
  } );
}
