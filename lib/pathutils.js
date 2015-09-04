var FS = require("fs");
var Path = require("path");


/**
 * @param {string} root Root folder in which we will search.
 * @param {string|array} filters If it is  a string, it is considered as
 * an array with only one element. In the array, the last element is the
 * regexp  of  a file  to  match,  the  other  elements are  regexp  for
 * containing folders.
 * If filter is missing, return all files in `root`.
 * @param {number} index Used internally for recursion purpose.
 *
 * @return {array} Array of full pathes of found files.
 */
function findFiles(root, filters, index) {
  if (!FS.existsSync(root)) return [];
  if (typeof index === 'undefined') index = 0;
  if (!Array.isArray(filters)) filters = [filters];
  if (index >= filters.length) return [];
  var files = [];
  var filter;
  if (filters.length > index + 1) {
    // Looking for directories.
    filter = filters[index];
    FS.readdirSync(root).forEach(
      function(filename) {
        if (!filters || filter.test(filename)) {
          files = files.concat(findFiles(Path.join(root, filename), filters, index + 1));
        }
      }
    );
  }
  else {
    // Looking for files.
    filter = filters[index];
    FS.readdirSync(root).forEach(
      function(filename) {
        if (!filters || filter.test(filename)) {
          files.push(
            Path.join(root, filename)
          );
        }
      }
    );
  }
  return files;
}


function findFilesByExtension(root, ext) {
  var path;
  var files = [];
  var fringe = [root];
  while (fringe.length > 0) {
    path = fringe.pop();
    if (FS.existsSync(path)) {
      FS.readdirSync(path).forEach(function(filename) {
        var file = Path.join(path, filename);
        var stat = FS.statSync(file);
        if (stat.isFile()) {
          if (filename.substr(-ext.length) == ext) {
            files.push(file);
          }
        } else {
          fringe.push(file);
        }
      });      
    }
  }
  return files;
}


function addPrefix(path, prefix) {
  return Path.join(
    Path.dirname(path),
    prefix + Path.basename(path)
  ).split(Path.sep).join("/");
}


function mkdir() {
  var key, arg, items = [];
  for (key in arguments) {
    arg = arguments[key].trim();
    items.push(arg);
  }
  var path = Path.resolve(Path.normalize(items.join("/"))),
  item, i,
  curPath = "";
  items = path.replace(/\\/g, '/').split("/");
  for (i = 0 ; i < items.length ; i++) {
    item = items[i];
    curPath += item + "/";
    if (FS.existsSync(curPath)) {
      var stat = FS.statSync(curPath);
      if (!stat.isDirectory()) {
        break;
      }
    } else {
      try {
        FS.mkdirSync(curPath);
      }
      catch (ex) {
        throw {fatal: "Unable to create directory \"" + curPath + "\"!\n" + ex};
      }
    }
  }
  return path;
}


function rmdir(path) {
  if (!FS.existsSync(path)) return false;
  var stat = FS.statSync(path);
  if (stat.isDirectory()) {
    FS.readdirSync(path).forEach(
      function(filename) {
        rmdir(Path.join(path, filename));
      }
    );
    try {
      FS.rmdirSync(path);
    } catch (err) {
      throw {fatal: "Unable to remove directory '" + path + "'!\n" + err};
    }
  } else {
    try {
      FS.unlinkSync(path);
    } catch (err) {
      throw {fatal: "Unable to delete file '" + path + "'!\n" + err};
    }
  }
  return true;
}

function file(path, content) {
  if (typeof content === 'undefined') {
    if (!FS.existsSync(path)) return null;
    return FS.readFileSync(path);
  } else {
    var dir = Path.dirname(path);
    mkdir(dir);
    FS.writeFileSync(path, content);
    return content.length;
  }
}

exports.findFilesByExtension = findFilesByExtension;
exports.findFiles = findFiles;
exports.addPrefix = addPrefix;
exports.mkdir = mkdir;
exports.rmdir = rmdir;
exports.file = file;
