#!/usr/bin/env node
// -*- js -*-

"use strict";

/**
 *
 * @module tfw
 */
var Path = require("path");
var FS = require("fs");

// Read the version in the package file.
var packageFile = Path.join(__dirname, "package.json");
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


require("colors");
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

var Project = require("./project");


var i, 
consoleMode = false, 
prjPath = '.';
for (i = 2 ; i < process.argv.length ; i++) {
    var item = process.argv[i];
    if (item == '-c') {
        consoleMode = true;
    } else {
        prjPath = Path.resolve(".", item);
    }
}

consoleMode = true;

if (consoleMode) {
    console.log("project folder: ", prjPath);
    console.log();
    try {
        var prj = Project.createProject(prjPath);
        prj.compile();
        prj.link();
    } catch (x) {
        if (x.fatal) {
            console.error("\n" + ("\nError #" + x.id + " from " + x.src + "\n").err());
            console.error((x.fatal + "\n").err() + "\n");
        }
        throw x;
    }
}
