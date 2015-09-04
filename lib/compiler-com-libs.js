var FS = require("fs");
var Path = require("path");
var Source = require("./source");
var Tree = require("./htmltree");
var Util = require("./util");
var Template = require("./template");


module.exports = function(source, result) {
  var prj = source.prj();

  return {
    Tree: Tree,
    Template: Template
  };
};
