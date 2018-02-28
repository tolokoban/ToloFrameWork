"use strict";

var CODE_BEHIND = {
  onTap: onTap,
  getClasses: getClasses
};


function onTap( evt ) {
  console.info("[tfw.view.floating-button] evt=", evt);
  evt.srcEvent.stopPropagation();
  this.action = this.tag;
}


function getClasses() {
  return ["thm-bg" + this.type];
}
