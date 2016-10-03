require("colors");
var FS = require("fs");
var RL = require("readline");
var Tpl = require("./template");
var Path = require("path");
var Input = require('readline-sync');
var Fatal = require("./fatal");
var Package = require("./package");
var Template = require("./template");
var PathUtils = require("./pathutils");
var ChildProcess = require('child_process');


var OPTIONS = {};

exports.start = function( package ) {
    if (!isInEmptyFolder()) {
        console.log();
        yesno("Are you sure you still want to continue in this non empty folder?\n"
              + "This will DELETE all the files!".bgRed.bold.white + "  ", stepStart);
    } else {
        stepStart();
    };
};


function stepStart() {
    try {
        if (!isGitInstalled()) return;
        OPTIONS = {};
        menu([
            "Create an empty fresh new project.",
            "Create from  existing sources."
        ], function(choice) {
            if (choice == 1) onMenuProjectType();
            else onExistingSources();
        });
    }
    catch(ex) {
        fatal("Fatal error in function `stepStart`!\n" + JSON.stringify(ex, null, '  '));
    }
};


function onExistingSources() {
    try {
        input("Folder where your HTML files are: ", function(path) {
            path = Path.resolve( path );
            if (!FS.existsSync( path )) {
                fatal("I can't find this folder:\n" + path);
            } else {
                var stat = FS.statSync( path );
                if (!stat.isDirectory()) {
                    fatal("Sorry but this is not a folder:\n" + path);
                } else {
                    OPTIONS.sources = path;
                    onMenuProjectType();
                }
            }
        });
    }
    catch(ex) {
        fatal("Fatal error in function `onExistingSources`!\n" + JSON.stringify(ex, null, '  '));
    }
}


function onMenuProjectType() {
    try {
        var defaults = { name: '', desc: '', author: '' };
        var packageFilename = "./package.json";
        if (FS.existsSync( packageFilename )) {
            try {
                var pkg = JSON.parse(FS.readFileSync( packageFilename ));
                defaults.name = pkg.name;
                defaults.desc = pkg.description;
                defaults.author = pkg.author;
            }
            catch(ex) {
                console.log("For information, your current `package.json` file is parsable!".red.bold);
            }
        }

        inputs({
            name: ["Project's name: ", defaults.name],
            desc: ["Project's description: ", defaults.desc],
            author: ["Author (should be github username if you use github): ", defaults.author]
        }, function(values) {
            copyToOptions( values );
            OPTIONS.url = "https://github.com/" + OPTIONS.author + "/" + OPTIONS.name + ".git";
            OPTIONS.bugs = "https://github.com/" + OPTIONS.author + "/" + OPTIONS.name + "/issues";
            OPTIONS.homepage = "https://" + OPTIONS.author + ".github.io/" + OPTIONS.name;
            var versionParts = Package.version.split('.');
            while (versionParts.length > 2) {
                versionParts.pop();
            }
            OPTIONS.version = versionParts.join('.');
            stepSelectType(function() {
                yesno(
                    "Do you want to use GitHub? ",
                    stepGithub,
                    function() {
                        console.log();
                        console.log("Initializing git...");
                        exec("git init");
                        exec("git add .gitignore");
                        exec("git add . -A");
                        exec('git commit -m "First commit."');
                        stepEnd();
                    }
                );
            });
        });
    }
    catch(ex) {
        fatal("Fatal error in function `onMenuProjectType`!\n" + JSON.stringify(ex, null, '  '));
    }
}


function stepGithub() {
    try {
        console.log("Deleting all files in the current folder...");
        cleanDir(".");
        console.log("Cloning GitHub's repository...");
        exec("git clone " + OPTIONS.url + " .");
        if( !FS.existsSync( "www" ) ) {
            FS.mkdirSync( "www" );
        } else {
            PathUtils.rmdir("./www");
        }
        exec( "git clone " + OPTIONS.url + " ./www" );
        console.log( "Preparing branch gh-pages...".cyan );
        var branches = exec( "git branch" );
        if( branches.indexOf( " gh-pages" ) == -1 ) {
            exec( "git branch gh-pages" );
        }
        exec( "cd www && git checkout gh-pages" );
        stepEnd();
    }
    catch(ex) {
        fatal("Fatal error in function `stepGithub`!\n" + JSON.stringify(ex, null, '  '));
    }
}

function copyExistingSources() {
    try {
        console.log("Copying existing file...");
        copyFile(OPTIONS.sources, "./src");
    }
    catch(ex) {
        fatal("Fatal error in function `copyExistingSources`!\n" + JSON.stringify(ex, null, '  '));
    }
}

function stepEnd() {
    try {
        FS.writeFileSync("./package.json", Template.file( "package.json", OPTIONS ).out);
        FS.writeFileSync("./karma.conf.js", Template.file( "karma.conf.js", OPTIONS ).out);
        FS.writeFileSync("./.gitignore", Template.file( ".gitignore", OPTIONS ).out);
        Template.files( "src", "./src" );
        console.log("Downloading external modules...");
        exec("npm update");
        if (OPTIONS.sources) copyExistingSources();
        exec('git add . -A');
        exec('git commit -m "tfw init"');

        console.log();
        console.log("------------------------------------------------------------");
        console.log();
        console.log("The initialization is done.");
        console.log("Your compiled project will be build in your `www` folder.");
        console.log();
        console.log("To start automated tests, please type:");
        console.log("> " + "npm test".yellow);
        console.log();
        console.log("To build in DEBUG mode, please type:");
        console.log("> " + "npm run debug".yellow);
        console.log();
        console.log("To build in RELEASE mode, please type:");
        console.log("> " + "npm run release".yellow);
        console.log();
    }
    catch(ex) {
        fatal("Fatal error in function `stepEnd`!\n" + JSON.stringify(ex, null, '  '));
    }
}


function stepSelectType( nextStep ) {
    try {
        menu(["Browser's application", "Node-webkit's application"], function(v) {
            if (v == 1) {
                OPTIONS.type = "firefoxos";
            } else {
                OPTIONS.type = "nodewekit";
            }
            nextStep();
        });
    }
    catch(ex) {
        fatal("Fatal error in function `stepSelectType`!\n" + JSON.stringify(ex, null, '  '));
    }
}

/**
 * Display a list of items and ask the user to select one.
 * Each item is  numbered and the menu is displayed  again if the user
 * enter a non-existing value.
 * The function `nextStep` is called with the choice as a number.
 */
function menu(items, nextStep) {
    const rl = RL.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    console.log();
    items.forEach(function (item, idx) {
        var out = idx < 10 ? ' ' : '';
        out += ("" + (1 + idx) + ") ").yellow.bold;
        out += item;
        console.log(out);
    });
    console.log();
    rl.question("Your choice: ", (ans) => {
        rl.close();
        var choice = parseInt( ans );
        if (isNaN(ans) || ans < 1 || ans > items.length) {
            menu( items, nextStep );
        } else {
            console.log();
            nextStep( choice );
        }
    });
}

function yesno(caption, yesStep, noStep, defaultValue) {
    if( typeof defaultValue === 'undefined' ) defaultValue = 'N';
    defaultValue = defaultValue.trim().toUpperCase();

    if (Array.isArray(caption)) caption = caption[0];
    input([caption, defaultValue], function(ans) {
        ans = ans.trim().toUpperCase();
        if (ans == "") ans = defaultValue;
        if (ans == 'Y') yesStep();
        else if (ans == 'N') {
            if (typeof noStep === 'function') {
                noStep();
            }
        }
        else {
            console.log("Please answer Y or N!".red.bold);
            yesno(caption, yesStep, noStep, defaultValue);
        }
    });
}

function input(caption, nextStep) {
    if (typeof caption !== 'string' && !Array.isArray(caption)) {
        inputs(caption, nextStep);
    } else {
        const rl = RL.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        var text, defaultValue = '';
        if (Array.isArray(caption)) {
            if (caption.length > 1) {
                defaultValue = caption[1];
            }
            if (typeof defaultValue !== 'string') defaultValue = '';
            text = caption[0].bold;
            if (defaultValue != ''){
                text += ("[" + defaultValue + "] ").bold.gray;
            }
        } else {
            text = caption.bold;
        }
        rl.question(text, (ans) => {
            rl.close();
            if (ans.trim() == '') ans = defaultValue;
            nextStep( ans );
        });
    }
}

function inputs(captions, nextStep) {
    var items = [];
    var k, v;
    for( k in captions ) {
        v = captions[k];
        items.push([k, v]);
    }
    // The resuls of the inputs are stored here.
    var values = {};

    var callback = function() {
        if (items.length == 0) {
            nextStep( values );
        } else {
            var item = items.shift();
            input( item[1], function(value) {
                values[item[0]] = value;
                callback();
            });
        }
    };

    callback();
}

/**
 * Check if we are in an empty folder.
 */
function isInEmptyFolder() {
    var files = FS.readdirSync('.');
    try {
        if (files.length == 0) return true;
        console.log(Fatal.format(
            "You should be in an empty folder to create a new project!\n"
                + "If you continue, all the files in this folder will be DELETED!"
        ));
        console.log("\nWe suggest that you create an fresh new directory, like this:");
        console.log("\n> " + "mkdir my-project-folder".yellow.italic);
        console.log("> " + "cd my-project-folder".yellow.italic);
        console.log("> " + "tfw init".yellow.italic);
        return false;
    }
    catch(ex) {
        fatal("Fatal error in function `files`!\n" + JSON.stringify(ex, null, '  '));
    }
}

/**
 * Check if `git` is installed on this system.
 */
function isGitInstalled() {
    var result = exec("git --version", true);
    try {
        if (!result || result.indexOf("git") < 0 || result.indexOf("version") < 0) {
            console.log(Fatal.format(
                "`git` is required by the ToloFrameWork!\n"
                    + "Please install it:"));
            console.log("\n> " + "sudo apt-get install git".yellow.italic);
            return false;
        }
        return true;
    }
    catch(ex) {
        fatal("Fatal error in function `result`!\n" + JSON.stringify(ex, null, '  '));
    }
}

function copyToOptions( values ) {
    var k, v;
    try {
        for( k in values ) {
            v = values[k];
            OPTIONS[k] = v;
        }
        return OPTIONS;
    }
    catch(ex) {
        fatal("Fatal error in function `k`!\n" + JSON.stringify(ex, null, '  '));
    }
}

function exec( cmd, silent ) {
    try {
        if (!silent) {
            console.log( "> " + cmd.yellow );
        }
        return ChildProcess.execSync( cmd ).toString();
    }
    catch( ex ) {
        console.log( ("" + ex).red.bold );
    }
}


/**
 * Remove all the files and folder in `path`, but not `path` itself.
 */
function cleanDir(path) {
    var files = FS.readdirSync( path );
    try {
        files.forEach(function (file) {
            var fullpath = Path.join( path, file );
            if (!FS.existsSync( fullpath )) return;
            var stat = FS.statSync( fullpath );
            try {
                if (stat.isDirectory()) PathUtils.rmdir( fullpath );
                else FS.unlinkSync( fullpath );
            }
            catch (ex) {
                console.error("Unable to delete `" + fullpath + "`!");
                console.error(ex);
            }
        });
    }
    catch(ex) {
        fatal("Fatal error in function `files`!\n" + JSON.stringify(ex, null, '  '));
    }
}


/**
 * Show a nice error message.
 */
function fatal(msg) {
    console.log(Fatal.format( msg ));
}



var BUFFER = new Buffer(64 * 1024);

function copyFile(src, dst) {
    try {
        if (!FS.existsSync(src)) {
            fatal("Unable to copy missing file: " + src + "\ninto: " + dst);
        }
        var stat = FS.statSync(src);
        if (stat.isDirectory()) {
            // We need to copy a whole directory.
            if (FS.existsSync(dst)) {
                // Check if the destination is a directory.
                stat = FS.statSync(dst);
                if (!stat.isDirectory()) {
                    fatal("Destination is not a directory: \"" + dst
                          + "\"!\nSource is \"" + src + "\".");
                }
            } else {
                // Make destination directory.
                PathUtils.mkdir(dst);
            }
            var files = FS.readdirSync(src);
            files.forEach(
                function(filename) {
                    copyFile(
                        Path.join(src, filename),
                        Path.join(dst, filename)
                    );
                }
            );
            return;
        }

        var bytesRead, pos, rfd, wfd;
        PathUtils.mkdir(Path.dirname(dst));
        try {
            rfd = FS.openSync(src, "r");
        }
        catch(ex) {
            fatal("Unable to open file \"" + src + "\" for reading!\n" + JSON.stringify(ex, null, '  '));
        }
        try {
            wfd = FS.openSync(dst, "w");
        }
        catch(ex) {
            fatal("Unable to open file \"" + dst + "\" for writing!\n" + JSON.stringify(ex, null, '  '));
        }
        bytesRead = 1;
        pos = 0;
        while (bytesRead > 0) {
            try {
                bytesRead = FS.readSync(rfd, BUFFER, 0, 64 * 1024, pos);
            }
            catch (ex) {
                fatal("Unable to read file \"" + src + "\"!\n" + JSON.stringify(ex, null, '  '));
            }
            FS.writeSync(wfd, BUFFER, 0, bytesRead);
            pos += bytesRead;
        }
        FS.closeSync(rfd);
        FS.closeSync(wfd);
    }
    catch(ex) {
        fatal("Fatal error in function `copyFile`!\n" + JSON.stringify(ex, null, '  '));
    }
};
