require("colors");
var FS = require("fs");
var RL = require("readline");
var Tpl = require("./template");
var Path = require("path");
var Input = require('readline-sync');

var Fatal = require("./fatal");
var ChildProcess = require('child_process');


exports.start = function( package ) {
    if (!isGitInstalled()) return;
    if (!isInEmptyFolder()) return;
    menu([
        "Create an empty fresh new project.",
        "Create from  existing sources."
    ], onMenuProjectType);
};


function onMenuProjectType(choice) {
    console.log("Type: " + choice);
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
            nextStep( choice );
        }
    });
}

/**
 * Check if we are in an empty folder.
 */
function isInEmptyFolder() {
    var files = FS.readdirSync('.');
    if (files.length == 0) return true;
    console.log(Fatal.format(
        "You must be in an empty folder to create a new project!"
    ));
    console.log("\n> " + "mkdir my-project-folder".yellow.italic);
    console.log("> " + "cd my-project-folder".yellow.italic);
    console.log("> " + "tfw init".yellow.italic);
    return false;
}

/**
 * Check if `git` is installed on this system.
 */
function isGitInstalled() {
    var result = exec("git --version", true);
    if (!result || result.indexOf("git") < 0 || result.indexOf("version") < 0) {
        console.log(Fatal.format(
            "`git` is required by the ToloFrameWork!\n"
                + "Please install it:"));
        console.log("\n> " + "sudo apt-get install git".yellow.italic);
        return false;
    }
    return true;
}

exports.github_start = function( package ) {
    console.log("Make sure you are in an empty folder.\n".bold);
    var url = Input.question( "Please enter the URL of your Github project: " );
    console.log( "Cloning the project...".cyan );
    console.log( exec(
        "git clone " + url + " ."
    ).toString() );
    var pieces = url.split( '/' );
    var name = pieces.pop();
    name = name.substr( 0, name.length - 4 );
    var author = pieces.pop();
    var desc = Input.question( "Description of your project: " );

    FS.writeFileSync(
        "package.json",
        Tpl.file(
            "package.json", {
                url: url,
                bugs: "https://github.com/" + author + "/" + name + "/issues",
                name: name,
                desc: desc,
                version: package.version,
                author: author,
                homepage: "https://" + author + ".github.io/" + name
            }
        ).out
    );
    FS.writeFileSync(
        "karma.conf.js",
        Tpl.file( "karma.conf.js", {} ).out
    );

    var dependencies = [
        "jasmine-core", "karma", "karma-chrome-launcher", "karma-firefox-launcher",
        "karma-jasmine", "toloframework"
    ];
    dependencies.forEach(function ( dep ) {
        console.log( ("Installing " + dep + "...").cyan );
        console.log( exec(
            "npm install --save " + dep
        ).toString() );
    });
    FS.writeFileSync(
        ".gitignore",
        "*~\n"
            + "*#\n"
            + "tmp/\n"
            + "www/\n"
            + "node_modules/\n"
    );

    console.log( "Preparing branch gh-pages...".cyan );
    var branches = exec( "git branch" );
    if( branches.indexOf( " gh-pages" ) == -1 ) {
        exec( "git branch gh-pages" );
    }
    exec( "git add . -A" );
    exec( "git commit -am 'first commit.'" );
    exec( "git push" );
    exec( "git push origin gh-pages" );
    console.log( "Preparing output...".cyan );
    if( !FS.existsSync( "www" ) ) {
        FS.mkdirSync( "www" );
    }
    if( !FS.existsSync( "src" ) ) {
        FS.mkdirSync( "src" );
    }
    if( !FS.existsSync( "src/mod" ) ) {
        FS.mkdirSync( "src/mod" );
    }
    exec( "git clone " + url + " ./www" );
    exec( "cd www && git checkout gh-pages" );
    FS.writeFileSync(
        "src/index.html",
        "<x-html app='app' title='" + name + "'></x-html>"
    );
    FS.writeFileSync(
        "src/mod/app.js",
        "\n\nexports.start = function() {\n};\n"
    );
};


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
