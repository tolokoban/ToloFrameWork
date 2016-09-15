require("colors");
var FS = require("fs");
var Tpl = require("./template");
var Path = require("path");
var Input = require('readline-sync');
var ChildProcess = require('child_process');


exports.start = function( package ) {
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


function exec( cmd ) {
    try {
        console.log( "> " + cmd.yellow );
        return ChildProcess.execSync( cmd ).toString();
    }
    catch( ex ) {
        console.log( ("" + ex).red.bold );
    }
}
