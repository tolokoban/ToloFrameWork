"use strict";

module.exports = function( cls ) {
  /**
   * When  you need  a  variable  name, this  method  helps  you to  not
   * duplicate its name.
   * @param {string} name - Name to add to the list of already used names.
   * @return {boolean} `true` if the name did not exist until now.
   */
  cls.prototype.addName = addName;
  /**
   * @param {string} name - Prefix of the name you want to get.
   * @return {string} A name with a number appened to it.
   * @example
   * var p = new Parser();
   * p.getFreeName("foo");  // -> "foo1"
   * p.getFreeName("foo");  // -> "foo2"
   * p.getFreeName("bar");  // -> "bar1"
   * p.getFreeName("foo");  // -> "foo3"
   */
  cls.prototype.getFreeName = getFreeName;

  return cls;
};


function addName( name ) {
  if( !Array.isArray( this.names ) ) this.names = [];
  if( this.names.indexOf( name ) > -1 ) return false;
  this.names.push( name );
  return true;
};


function getFreeName( name ) {
  if( typeof this.namesCounters === 'undefined' ) this.namesCounters = {};
  if( typeof this.namesCounters[name] === 'undefined' ) this.namesCounters[name] = 0;
  var counter = this.namesCounters[name] + 1;
  this.namesCounters[name] = counter;
  return name + counter;
}
