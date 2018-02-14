"use strict";

var CODE_BEHIND = {
  onTap: onTap,
  getClasses: getClasses
};


function onTap() {
  this.action = this.tag;
}


function getClasses() {
  return ["thm-bg" + this.type];
}
