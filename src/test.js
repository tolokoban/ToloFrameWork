var Util = require("./lib/wdg/util.js");

var code = "( code == 'l\\'été') && (width<  200  )";
console.log(Util.parseBindingExpression(code));

