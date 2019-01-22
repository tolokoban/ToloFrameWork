"use strict";

exports.TimeToLeave = CacheTTL;


function CacheTTL( expirationInMillisec ) {
  this._expiration = expirationInMillisec;
  this._dic = {};
}


/**
 * @member CacheTTL.set
 * @param 
 */
CacheTTL.prototype.set = function( key, value ) {
  this._dic[key] = { time: Date.now(), value: value };
  return this;
};


/**
 * @member CacheTTL.get
 * @param 
 */
CacheTTL.prototype.get = function( key ) {
  var item = this._dic[key];
  if( typeof item === 'undefined' ) return undefined;
  var now = Date.now();
  if( now - item.time > this._expiration ) {
    delete this._dic[key];
    return undefined;
  }
  return item.value;
};


/**
 * @member CacheTTL.clear
 * @param 
 */
CacheTTL.prototype.clear = function() {
  this._dic = {};
};
