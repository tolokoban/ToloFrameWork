/************************************************************
 Button factory to create most commonly used buttons.
 ************************************************************/
"use strict";

exports.accept = makeButton.bind( null, "accept" );
exports.cancel = makeButton.bind( null, "cancel" );
exports.close = makeButton.bind( null, "close" );
exports.delete = makeButton.bind( null, "delete" );
exports.gotit = makeButton.bind( null, "gotit" );
exports.no = makeButton.bind( null, "no" );
exports.ok = makeButton.bind( null, "ok" );
exports.refuse = makeButton.bind( null, "refuse" );
exports.save = makeButton.bind( null, { text: _("save"), type: "primary", flat: false, icon: "import" } );
exports.skip = makeButton.bind( null, "skip" );
exports.yes = makeButton.bind( null, "yes" );


var Button = require("tfw.view.button");


function makeButton( name, argsBase, argsOverride ) {
  var base = { wide: false, type: "primary", flat: true };
  if( typeof name === 'string' ) {
    base.text = _(name);
  } else {
    base = extend( base, name );
  }
  return new Button(extend(base, argsBase, argsOverride));
}


function extend() {
  var result = {};
  Array.prototype.slice.call(arguments).forEach(function(overrider) {
    if( !overrider ) return;
    var key, val;
    for( key in overrider ) {
      val = overrider[key];
      result[key] = val;
    }
  });
  return result;
}
