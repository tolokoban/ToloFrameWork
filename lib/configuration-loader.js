"use strict";

module.exports = {

    /**
     * @param {object} project - Instance of a Project.
     * @returns {object} Parsing of the configuration.
     */
    parse
};


const
    ChildProcess = require( "child_process" ),
    FS = require( "fs" ),
    Input = require( 'readline-sync' ),
    Path = require( "path" );


/**
 * @param {sring} projectDir - Root path of the Project.
 * @returns {object} Parsing of the configuration.
 */
function parse( projectDir ) {
    const
        configFilename = Path.join( projectDir, "package.json" ),
        config = load( configFilename );

    enrichConfigWithGitParams( config );
    addMissingConfigAttributes( config, projectDir );
    checkCompilationType( config );
    overwriteIfDifferent( config, configFilename );

    return config;
}


/**
 * @param {string} configFilename - Full path of the JSOn config file.
 * @returns {object} Parsing of a JSON config.
 */
function load( configFilename ) {
    if ( !FS.existsSync( configFilename ) ) {
        throw Error( `Unable to find configuration file: ${configFilename}!` );
    }
    try {
        const content = FS.readFileSync( configFilename );
        return JSON.parse( content );
    } catch ( ex ) {
        throw Error( `Invalid JSON configuration file: ${configFilename}!\n${ex}` );
    }
}

/**
 * @param {object} config - Current configuration.
 * @param {string} configFilename - Full path of the configuration file.
 * @returns {boolean} `true` if the file hsa been overwritten.
 */
function overwriteIfDifferent( config, configFilename ) {
    const
        oldConfigAsString = FS.readFileSync( configFilename ),
        newConfigAsString = JSON.stringify( config, null, '    ' );
    if ( oldConfigAsString !== newConfigAsString ) {
        return false;
    }
    FS.writeFileSync( configFilename, newConfigAsString );
    return true;
}
/**
 * Check for attribute `repository` in config. if not exists, retrieve it from command
 * `git remote -v`, greping on `origin` then `(fetch)`.
 * @param  {object} config - Config object.
 * @returns {undefined}
 */
function enrichConfigWithGitParams( config ) {
    const
        ORIGIN = "origin",
        ORIGIN_LENGTH = ORIGIN.length,
        FETCH = " (fetch)",
        FETCH_LENGTH = FETCH.length;

    if ( !config.repository || !config.repository.url ) {
        const remotes = ChildProcess.execSync( "git remote -v" ).toString();
        let origin = '';
        remotes.split( "\n" ).forEach( function forEachRemote( remote ) {
            if ( remote.substr( 0, ORIGIN_LENGTH ) === ORIGIN ) {
                const restOfLine = remote.substr( ORIGIN_LENGTH );
                if ( restOfLine.substr( -FETCH_LENGTH ) === FETCH ) {
                    origin = restOfLine.substr( 0, restOfLine.length - FETCH_LENGTH ).trim();
                }
            }
        } );
        config.repository = {
            type: "git",
            url: origin
        };
    }
}


/**
 * @param  {object} config - Config object.
 * @param {string} projectPath - Root path of the Project.
 * @returns {undefined}
 */
function addMissingConfigAttributes( config, projectPath ) {
    const githubUrl = getGithubUrl( config );

    config.homepage = config.homepage || githubUrl;
    config.bugs = config.bugs || { url: `${githubUrl}/issues` };
    config.scripts = config.scripts || {
        test: "jasmine",
        "test:dbg": "node --debug-brk node_modules/jasmine/bin/jasmine.js"
    };
    if ( !config.name ) {
        const
            projectName = Path.basename( projectPath ),
            answer = Input.question( `Project's name [${projectName}]: ` );

        if ( answer.trim().length > 0 ) {
            config.name = answer;
        } else {
            config.name = projectName;
        }
    }
    config.version = config.version || "0.0.1";
    if ( !config.author ) {
        const answer = Input.question( "Author: " );
        config.author = answer.trim();
    }
    if ( !config.description ) {
        const answer = Input.question( "Description: " );
        config.description = answer.trim();
    }
    config.license = config.license || "GPL-3.0";
    config.tfw = config.tfw || {
        modules: [],
        compile: {
            type: "web",
            files: "\\.html$"
        }
    };
}

/**
 * Prior to version 0.46, compilation types were `firefoxos` and `nodewebkit`.
 * Now, we use `web` and `desktop`.
 * @param {object} config - Configuration as object.
 * @returns {undefined}
 */
function checkCompilationType( config ) {
    if ( config.tfw.compile.type === 'firefoxos' ) {
        config.tfw.compile.type = 'web';
    } else {
        config.tfw.compile.type = 'desktop';
    }
}


/**
 * @param {object} config - Configuration.
 * @param {string} config.repository.url - URL of the git repository on Github.
 * @return {string} The URL without the `.git` extension.
 */
function getGithubUrl( config ) {
    const
        GIT_EXTENSION = ".git",
        GIT_EXTENSION_LENGTH = GIT_EXTENSION.length,
        fullUrl = config.repository.url;

    return fullUrl.substr( 0, fullUrl.length - GIT_EXTENSION_LENGTH );
}