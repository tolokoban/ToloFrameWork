var Path = require("path");
var FS = require("fs");
var Kernel = require("./kernel");

var Project = function() {};

/**
 * Check  if the  project folders  are  initialised. If  not, propose  to
 * create them.
 */
Project.prototype.checkContextThenBuild = function() {
    var prjFolder = Kernel.prjPath();
    var prjFilename = Path.join(prjFolder, "project.tfw.js");
    var that = this;

    if (!FS.existsSync(prjFilename)) {
        console.log("I can't find any project's file here!".red);
        if (!Kernel.ask("Do you want me to create a new project?", true)) {
            process.exit(0);
        }
        var containedFiles = FS.readdirSync(prjFolder);
        if (containedFiles.length > 0) {
            // This folder is not empty.
            console.log();
            console.log("This folder is not empty!");
            if (!Kernel.ask("Do you want to continue?")) {
                process.exit(0);
            }
        }
        that.createNewProject();
    }
    this.build();
};

/**
 * At this point, there is a project file : "project.tfw.js".
 * We can execute it to build the project.
 */
Project.prototype.build = function() {
    var prjFilename = Kernel.prjPath("project.tfw.js");
    var builder = require(prjFilename);
    var actions = Kernel.actions();
    var i, actionName, action, command,
        processor = require("./processor");
    if (actions.length == 0) {
        // No action specified: show menu.
        console.log("\n Please specify at least one action on the command line!\n".err());
        console.log();
        for (actionName in builder) {
            action = builder[actionName];
            console.log("[" + actionName.yellow + "]  " + action.caption);
        }
        console.log();
    } else {
        for (i = 0 ; i < actions.length ; i++) {
            actionName = actions[i];
            action = builder[actionName];
            if (!action) {
                return console.error(
                    (
                        "This action is not supported by your project: \""
                            + actionName + "\"!"
                    ).err()
                );
            }
            command = action.command;
            if (!command || typeof command !== 'function') {
                return console.error(
                    (
                        "This action has no \"command\" property of type function: \""
                            + actionName + "\"!"
                    ).err()
                );
            }
            console.log("------------------------------------------------------------".yellow);
            console.log(actionName.yellow + ": " + action.caption.cyan);
            command.call(processor);
        }
    }
};

Project.prototype.createNewProject = function() {
    console.log();
    console.log("Creating new project...");
    Kernel.copy(
        Path.join(Kernel.tfwPath(), "stub/prj"),
        Kernel.prjPath()
    );
    console.log("Done.");
    console.log();
};


exports.build = function() {
    var prj = new Project();
    prj.checkContextThenBuild();
};
