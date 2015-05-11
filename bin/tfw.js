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
    var txt = '';
    var lines = this.split("\n");
    var line;
    var i;
    for (i = 0 ; i < lines.length ; i++) {
        line = lines[i];
        while(line.length < 80) {
            line += ' ';
        }
        if (txt.length > 0) {
            txt += "\n";
        }
        txt += line;
    }

    return txt.redBG.white;
};


try {
    var prj = Project.createProject('.');
    for (var i = 2 ; i < process.argv.length ; i++) {
        var arg = process.argv[i];
        if (arg == '-c' || arg=='--clean') {
            console.log("Cleaning...".green);
            Util.cleanDir("./tmp");
        }
    }
    prj.compile();
    prj.link();
    prj.makeDoc();
} catch (x) {
    if (x.fatal) {
        console.error("\n" + ("\nError #" + x.id + " from " + x.src + "\n").err());
        console.error((x.fatal + "\n").err() + "\n");
    }
    throw x;
}
