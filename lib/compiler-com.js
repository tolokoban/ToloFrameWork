var FS = require("fs");
var Path = require("path");
var Tree = require("./htmltree");
var Utils = require("./pathutils");
var Source = require("./source");


var COMPONENTS = [];


/**
 * Loading and sorting all components.
 */
exports.loadComponents = function(prj) {
  var pathes = [prj.srcPath("com")];
  prj.getExtraModulesPath().forEach(
    function(extraModulePath) {
      pathes.push(Path.join(extraModulePath, "com"));
    }
  );
  pathes.push(prj.libPath("com"));

  COMPONENTS = [];
  pathes.forEach(
    function(path) {
      var components = [];
      Utils.findFilesByExtension(path, ".com.js").forEach(
        function(comPath) {
          console.log(comPath.yellow);
          var com = require(comPath);
          if (typeof com.tags === 'undefined') {
            prj.fatal("The following component missed the mandatory attribute \"tags\": " + path);
          }
          if (typeof com.priotity !== 'number') com.priotity = 0;
          if (typeof com.compile !== 'function') {
            prj.fatal(
              "The following component missed the mandatory function \"compile(root, libs)\": "
                + path
            );
          }
          components.push(com);
        }
      );
      components.sort(function(a, b) {
        return b.priotity - a.priotity;
      });
      components.forEach(function(item) {
        COMPONENTS.push(components);
      });
    }
  );
};


exports.compile = function(prj, filename) {
  var source = new Source(prj, filename);

  if (!isHtmlFileUptodate(source)) {
    console.log("Compiling " + filename.yellow);
    var root = Tree.parse(source.read());

  }
};



/**
 * To be uptodate, an HTML page must be more recent that all its dependencies.
 */
function isHtmlFileUptodate(source) {
  var dependencies = source.tag("dependencies") || [];
  var i, dep, file, prj = source.prj(),
  stat,
  mtime = source.modificationTime();
  for (i = 0 ; i < dependencies.length ; i++) {
    dep = dependencies[i];
    file = prj.srcOrLibPath(dep);
    if (file) {
      stat = FS.statSync(file);
      if (stat.mtime > mtime) return false;
    }
  }
  return source.isUptodate();
}
