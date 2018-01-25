#! /usr/bin/env node
// -*- js -*-

var DEF = {
  init: {
    desc: "start a fresh new project."
  },
  clean: {
    desc: "remove all temporary files."
  },
  build: {
    desc: "compile project in the www/ folder."
  },
  debug: {
    desc: "JS and CSS files won't be minified."
  },
  php: {
    desc: "add PHP services."
  },
  test: {
    desc: "prepare Karma tests.",
    opts: {
      dir: {
        desc: "Karma spec folder. Default is '-dir spec'.",
        args: ["spec"]
      }
    }
  },
  doc: {
    desc: "create documentation."
  },
  jsdoc: {
    desc: "create JSDoc documentation."
  },
  watch: {
    desc: "watch for files change."
  },
  version: {
    desc: "increment version number."
  }
};


/**
 *
 * @module tfw
 */
require("colors");
var FS = require("fs");
var Path = require("path");
var Util = require("../lib/util.js");
var Init = require("../lib/init.js");
var Project = require("../lib/project");
var Package = require("../lib/package");
var PathUtils = require("../lib/pathutils");
var OptionsParse = require("../lib/options-parser");

// Read the version in the package file.
var cfg = Package;
var txt = " ToloFrameWork " + cfg.version + " ";
var sep = "";
for (var i = 0 ; i < txt.length ; i++) {
  sep += "-";
}
sep = "+" + sep + "+";
txt = "| ToloFrameWork " + cfg.version.bold + " |";
console.log(sep);
console.log(txt);
console.log(sep);
console.log();

String.prototype.err = function() {
  var sep = "+------------------------------------------------------------------------------------------------------------------------+";
  var txt = '';
  this.split("\n").forEach(function (line) {
    var buff = '| ', i, c, mode = 0;
    for (i = 0; i < line.length; i++) {
      c = line.charCodeAt(i);
      if (mode == 0) {
        if (c > 31) {
          buff += line.charAt(i);
        }
        else if (c == 7) {
          buff += "    ";
        }
        else if (c == 27) {
          // Remove all color information.
          mode = 1;
        }
      } else {
        if (c == 109) {
          mode = 0;
        }
      }
    }
    while(buff.length < 120) {
      buff += ' ';
    }
    txt += (buff + " |").redBG.white.bold + "\n";
  });
  return sep.redBG.white.bold + "\n" + txt + sep.redBG.white.bold + "\n";
};

var firstProcess = true;
var tasks = [];
var options = {};
var args = process.argv;
var parsedCommandLine = OptionsParse.parse( args, DEF );
if( parsedCommandLine.init ) {
  Init.start( cfg );
  return;
}
if( parsedCommandLine.clean ) {
  tasks.push(function(prj) {
    console.log("Cleaning...".green);
    Util.cleanDir("./tmp");
    var cfgFile = prj.srcPath('$.js');
    if (FS.existsSync(cfgFile)) {
      FS.unlinkSync(filepath);
    }
  });
}
if( parsedCommandLine.version ) {
  tasks.push(function(prj) {
    if (firstProcess) {
      console.log("Incrementing version...".green);
      prj.makeVersion();
    }
  });
}
if( parsedCommandLine.debug ) {
  tasks.push(function(prj) {
    console.log("Build for DEVELOPMENT. Don't minify, don't combine.".green);
    options.dev = true;
    options.debug = true;
    console.log("options: ", options);
  });
}
if( parsedCommandLine.build ) {
  tasks.push(function(prj) {
    prj.compile(options);
  });
}
if( parsedCommandLine.php ) {
  tasks.push(function(prj) {
    prj.services(options);
  });
}
if( parsedCommandLine.doc ) {
  tasks.push(function(prj) {
    prj.makeDoc(options);
  });
}
if( parsedCommandLine.jsdoc ) {
  tasks.push(function(prj) {
    prj.makeJSDoc(options);
  });
}
if( parsedCommandLine.test ) {
  tasks.push(function(prj) {
    var modules = prj.getCompiledFiles();
    if (modules.length == 0) {
      modules = prj.compile(options);
    }
    prj.makeTest( modules, parsedCommandLine.test.dir[0] );
  });
}
if (tasks.length == 0) {  
  console.log();
  console.log( OptionsParse.usage( DEF ) );
  console.log("Examples:");
  console.log("  tfw build clean");
  console.log("  tfw test -dir \"./spec-jasmine\"");
  console.log();
} else {
  function start() {
    try {
      console.log();
      console.log(("" + (new Date())).green);
      console.log();
      var time = Date.now();
      var prj = Project.createProject('.');
      tasks.forEach(function(task) {
        task(prj);
      });
      var now = Date.now();
      console.log('----------------------------------------');
      console.log(
        "Time: "
          + ((now - time) / 1000).toFixed(3).bold
          + " seconds.");
      return prj;
    } catch (x) {
      x.fatal = x.fatal || "" + x;
      x.src = x.src || [""];
      x.id = x.id || "Internal javascript error";
      console.error("\n");
      console.error("+-------------+".redBG.white.bold);
      console.error("| FATAL ERROR |".redBG.white.bold + " "
                    + (typeof x.id === 'string' ? x.id.red.bold : ''));
      console.error((x.fatal).err());
      x.src.forEach(function (src, idx) {
        src = src || "";
        console.error(src.red.bold);
      });
      console.error("\n");
      if (x.stack) {
        console.error(x.stack.trim().red);
        console.error("\n");
      }
      return false;
    }
  }

  var timer = 0;
  var watchedDirectories = [];

  function watch(path) {
    if (watchedDirectories.indexOf(path) == -1) {
      //console.log("Watching ".cyan + path);
      watchedDirectories.push(path);
      var watcher = FS.watch(path);
      watcher.path = path;
      watcher.on('change', processLater);
    }
  }

  var prj = start();
  firstProcess = false;

  function processLater(eventName, filename) {
    if (filename) {
      // Don't compile if only `manifest.webapp` changed.
      if (filename == 'manifest.webapp') return;
      if (filename.charAt(0) == '#') return;
      if (filename.substr(0, 2) == '.#') return;
      if (filename.charAt(filename.length - 1) == '~') return;
      var path = Path.join(this.path, filename);
      if (PathUtils.isDirectory(path)) {
        if (!FS.existsSync(path)) return;
        if (watchedDirectories.indexOf(filename) == -1) {
          watch(path);
        }
        return;
      }
      console.log("File change: " + path.bold.yellow);
      // If a resource file changes, we have to touch the corresponding module's JS file.
      prj.cascadingTouch(path);
    }
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(start, 50);
  }

  // Watch files?
  if( parsedCommandLine.watch ) {
    if (!prj) return;
    console.log();
    var fringe = [Path.join(__dirname, "../ker"), prj.srcPath(), prj.srcPath("../package.json")];
    fringe.push.apply( fringe, prj.getExtraModulesPath() );
    var path;
    while (fringe.length > 0) {
      path = fringe.pop();
      watch(path);
      if (PathUtils.isDirectory(path)) {
        FS.readdirSync(path).forEach(
          function(filename) {
            var subpath = Path.join(path, filename);
            if (PathUtils.isDirectory(subpath)) {
              fringe.push(subpath);
            }
          }
        );
      }
    }
    console.log();
  }
}
