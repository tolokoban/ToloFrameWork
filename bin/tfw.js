#! /usr/bin/env node
// -*- js -*-

"use strict";

/**
 *
 * @module tfw
 */
require("colors");
var Path = require("path");
var FS = require("fs");
var Util = require("../lib/util.js");
var Project = require("../lib/project");

// Read the version in the package file.
var packageFile = Path.join(__dirname, "../package.json");
var cfg = JSON.parse(FS.readFileSync(packageFile));
var txt = " ToloFrameWork " + cfg.version + " ";
var sep = "";
for (var i = 0 ; i < txt.length ; i++) {
    sep += "-";
}
sep = "+" + sep + "+";
txt = "|" + txt + "|";
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


try {
    var prj = Project.createProject('.');
    var options = {};
    var done = false;
    var args = process.argv;
    args.shift();
    args.shift();
    if (args.indexOf('clean') > -1) {
        console.log("Cleaning...".green);
        Util.cleanDir("./tmp");
        done = true;
    }
    if (args.indexOf('no-zip') > -1) {
        console.log("Do not minify JS nor CSS.".green);
        options.noZip = true;
    }
    if (args.indexOf('build') > -1) {
        prj.compile(options);            
        done = true;
    }
    if (!done) {
        console.log();
        console.log("Accepted arguments:");
        console.log("  clean".yellow + ":  remove all temporary files.");
        console.log("  build".yellow + ":  compile project in the www/ folder.");
        console.log("  no-zip".yellow + ": JS and CSS files won't be minified.");
        console.log();
        console.log("Example:");
        console.log("  tfw build clean");
        console.log();
    }
/*
    prj.link();
    //prj.spawnFirefox()
    prj.makeDoc();
*/
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
}
