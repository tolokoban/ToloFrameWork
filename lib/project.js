"use strict";

module.exports = {

  /**
   * @param prjDir root directory of the project. It is where we can find `project.tfw.json`.
   * @return instance of the class `Project`.
   */
  createProject,
  ERR_WIDGET_TRANSFORMER: 1,
  ERR_WIDGET_NOT_FOUND: 2,
  ERR_WIDGET_TOO_DEEP: 3,
  ERR_FILE_NOT_FOUND: 4
};

/**
 * @see Project.compile
 */
const CompilerHTML2 = require( "./compiler-html2" ),
      CompilerPHP = require( "./compiler-php" ),
      ConfigurationLoader = require( "./configuration-loader" ),
      Fatal = require( "./fatal" ),
      FS = require( "fs" ),
      Path = require( "path" ),
      PathUtils = require( "./pathutils" ),
      Source = require( "./source" ),
      Template = require( "./template" ),
      Tree = require( "./htmltree" ),
      Util = require( "./util" ),
      WebWorkers = require( "./web-workers" ),
      WidgetUtil = require( "../ker/wdg/util.js" );

const ONE_KILOBYTES = 1024,
      TWO_KILOBYTES = 2048,
      NOT_FOUND_IN_ARRAY = -1;

/**
 * @class project
 * @param {string} prjDir root directory of the project. It is where we can find `project.tfw.json`.
 */
function Project( prjDir ) {

  initializeProjectDirectories( this, prjDir );
  initializedPrivateVariables( this );

  this.Util = WidgetUtil;

  const cfg = ConfigurationLoader.parse( prjDir );
  this._config = cfg;

  this.checkProjectOutputFolder();
  this.findExtraModules();

  this.mkdir( this.srcPath( "mod" ) );
  this.mkdir( this.srcPath( "wdg" ) );

  this._type = cfg.tfw.compile.type;

  if ( this._type === 'web' ) {
    this._config.reservedModules = [];
  } else {
    this._config.reservedModules = [
      "fs", "path", "process", "child_process", "cluster", "http", "os",
      "crypto", "dns", "domain", "events", "https", "net", "readline",
      "stream", "string_decoder", "tls", "dgram", "util", "vm", "zlib"
    ];
  }
  this._modulesPath.forEach( function forEachModulePath( path ) {
    console.log( `External lib: ${path}` );
  } );
}


/**
 * Modules can be foind in the `./src/mod` folder, in the toloFrameWork standard library
 * and in all folders defined in the config attribute `tfw.modules` which is an array.
 * @member Project.findExtraModules
 * @private
 * @return {undefined}
 */
Project.prototype.findExtraModules = function findExtraModules() {
  const
  that = this,
  cfg = this._config;
  cfg.tfw.modules.forEach( function forEachModule( _item ) {
    const item = Path.resolve( that._prjDir, _item );
    if ( FS.existsSync( item ) ) {
      that._modulesPath.push( item );
      console.log( `Extra modules from: ${item}!` );
    } else {
      that.fatal( `Unable to find module directory:\n${item}` );
    }
  } );
};


/**
 * @member Project.checkProjectOutputFolder
 * @private
 * @return {undefined}
 */
Project.prototype.checkProjectOutputFolder = function checkProjectOutputFolder() {
  const cfg = this._config;
  // Is there an output specified in config file?
  if ( cfg.tfw && cfg.tfw.output ) {
    this._wwwDir = this.prjPath( cfg.tfw.output );
    if ( !FS.existsSync( this._wwwDir ) ) {
      this.fatal( `Output folder does not exist: "${this._wwwDir}"!` );
    }
  }
  console.log( `Output folder: ${this._wwwDir.yellow}` );
};


/**
 * @param   {object} project - Reference to the current Project object.
 * @param   {string} prjDir - Root directory of this project.
 * @returns {undefined}
 */
function initializeProjectDirectories( project, prjDir ) {
  project._prjDir = Path.resolve( prjDir );
  project._libDir = Path.resolve( Path.join( __dirname, "../ker" ) );
  project._tplDir = Path.resolve( Path.join( __dirname, "../tpl" ) );
  project._srcDir = project.mkdir( prjDir, "src" );
  project._docDir = project.mkdir( prjDir, "doc" );
  project._tmpDir = project.mkdir( prjDir, "tmp" );
  project._wwwDir = project.mkdir( prjDir, "www" );
  Util.cleanDir( project.wwwPath( 'js' ), true );
  Util.cleanDir( project.wwwPath( 'css' ), true );
}

/**
 * Create the file `mod/$.js` only if `package.json` is newer.
 * This special module must never be wrapped in a module.
 * Otherwise, it will require itself and lead to an infinite loop.
 * @param {object} project - Project instance.
 * @param {object} cfg - Config parsed from `package.json`.
 * @param {object} options - Building options.
 * @returns {undefined}
 */
function createModule$IfNeeded( project, cfg, options ) {
  const file = project.srcPath( "mod/$.js" );
  if ( !PathUtils.isNewer( project.prjPath( 'package.json' ), file ) ) {
    // There is nothing to do until `$.js` is not older than `package.json`.
    return;
  }
  const moduleContent = getModuleContentFor$( cfg );

  if ( cfg.tfw.consts ) {
    if ( cfg.tfw.consts.all ) {
      Object.keys( cfg.tfw.consts.all ).forEach( key => {
        const val = cfg.tfw.consts.all[ key ];
        moduleContent.consts[ key ] = val;
      } );
    }
    if ( options.dev ) {
      if ( cfg.tfw.consts.debug ) {
        Object.keys( cfg.tfw.consts.debug ).forEach( key => {
          const val = cfg.tfw.consts.debug[ key ];
          moduleContent.consts[ key ] = val;
        } );
      }
    } else if ( cfg.tfw.consts.release ) {
      Object.keys( cfg.tfw.consts.debug ).forEach( key => {
        const val = cfg.tfw.consts.release[ key ];
        moduleContent.consts[ key ] = val;
      } );
    }
    console.log( "Constants: ".yellow + JSON.stringify( moduleContent.consts, null, '  ' ) );
  }
  const contentOfModule$ = FS.readFileSync( Path.join( project._tplDir, "$.js" ) );
  PathUtils.file(
    file,
    `exports.config=${JSON.stringify( moduleContent )};\n${contentOfModule$}`
  );
}

/**
 * @param {string} filename - ...
 * @param {string} content - ...
 * @param {string} _path - ...
 *
 * @return {boolean} `true` if the file needed to be flushed.
 */
Project.prototype.flushContent = function flushContent( filename, content, _path ) {
  const
  path = typeof _path !== "undefined" ? _path : '.',
  filepath = Path.join( path, filename );

  if ( this.hasAlreadyBeenFlushed( filepath ) ) {
    return false;
  }

  if ( filepath.indexOf( '@' ) !== NOT_FOUND_IN_ARRAY ) {
    const
    DECIMALS_FOR_SMALL_NUMBER = 3,
    decimals = content.length < TWO_KILOBYTES ? DECIMALS_FOR_SMALL_NUMBER : 0,
    fileSize = ( content.length / ONE_KILOBYTES ).toFixed( decimals );
    console.log( `>>> ${filepath.cyan} (${fileSize.yellow} kb)  ${this.wwwPath(filepath).grey}` );
  }

  const wwwFilePath = this.wwwPath( filepath );

  this.mkdir( Path.dirname( wwwFilePath ) );
  FS.writeFile( wwwFilePath, content, err => {
    if ( err ) {
      console.info( "[project] content=...", content );
      Fatal.fire(
        `Unable to write the file: "${wwwFilePath}"\n\n!${err}`,
        Fatal.UNDEFINED,
        "project.flushContent"
      );
    }
  } );
  return true;
};

/**
 * @param {string} fileFullPath . Full path of the file we want to know if it has already been flushed.
 * @returns {boolean} Wether this file has already been flushed.
 */
Project.prototype.hasAlreadyBeenFlushed = function hasAlreadyBeenFlushed( fileFullPath ) {
  return this._flushedContent.indexOf( fileFullPath ) !== NOT_FOUND_IN_ARRAY;
};

/**
 * Compile every `*.html` file found in _srcDir_.
 * @param {object} _options - Options for debug, release, ...
 * @returns {array} CompiledFiles.
 */
Project.prototype.compile = function ( _options ) {
  const
  options = typeof _options !== 'undefined' ? _options : {},
  that = this,
  cfg = this._config;

  options.config = this._config;
  this.options = options;

  createModule$IfNeeded( this, cfg, options );

  CompilerHTML2.initialize( this );

  // List of modules for doc.
  this._modulesList = [];
  const compiledFiles = compileHtmlFiles( this.findHtmlFiles(), options );

  // Copying resources.
  copyResources( this, compiledFiles, cfg );
  // WebWorkers
  WebWorkers.compile( this, compiledFiles );

  // Look at `manifest.webapp` (FxOS) or `package.json` (NWJS).
  if ( this._type === 'nodewebkit' ) {
    ( function () {
      // For NWJS, we have to copy `package.json`.
      const content = PathUtils.file( that.srcPath( "../package.json" ) );
      const data = JSON.parse( content );
      if ( typeof data.main !== 'string' ) {
        data.main = "index.html";
      }
      PathUtils.file( that.wwwPath( "package.json" ), JSON.stringify( data, null, 2 ) );
    }());
  } else {
    ( function () {
      const manifest = that.srcPath( "manifest.webapp" );
      const content = PathUtils.file( manifest );
      let data = null;
      try {
        data = JSON.parse( content );
      } catch ( ex ) {
        // If content is not a valid JSON, data = null
      }
      if ( !data || typeof data !== 'object' ) {
        data = {
          launch_path: '/index.html',
          developer: {
            name: cfg.author,
            url: cfg.homepage
          },
          icons: {
            "128": "/icon-128.png",
            "512": "/icon-512.png"
          }
        };
      }
      data.name = cfg.name;
      data.version = cfg.version;
      data.description = cfg.description;
      PathUtils.file( manifest, JSON.stringify( data, null, 2 ) );
      PathUtils.file( that.wwwPath( "manifest.webapp" ), JSON.stringify( data, null, 2 ) );
      // Copy the icons.
      if ( typeof data.icons === 'object' ) {
        for ( const key of Object.keys(data.icons) ) {
          const icon = data.icons[ key ];
          const val = that.srcOrLibPath( icon );
          if ( !val ) {
            console.log( `${' Warning! '.yellowBG}Missing icon: ${icon}` );
          } else {
            that.copyFile( val, that.wwwPath( icon ) );
          }
        }
      }
    }());
  }

  this._compiledFiles = compiledFiles;
  return compiledFiles;
};

/**
 * @return void
 */
Project.prototype.getCompiledFiles = function () {
  return this._compiledFiles;
};


/**
 * @return void
 */
Project.prototype.services = function () {
  console.log( "Adding services...".cyan );
  const tfwPath = this.srcPath( "tfw" );
  if ( !FS.existsSync( tfwPath ) ) {
    Template.files( "tfw", tfwPath );
  }
  this.copyFile( tfwPath, this.wwwPath( 'tfw' ), false );
};


/**
 * Copy resources in `css/`.
 * @param {object} project - Current project.
 * @param {array} sources - Array of compiled Html Files.
 * @param {object} config - Current configuration from `package.json`.
 * Array of objects of class `Source` representing each compiled HTML.
 * @returns {undefined}
 */
function copyResources( project, sources, config ) {
  const dependenciesForAllFiles = [];
  if ( !Util.isEmpty( sources ) ) {
    sources.forEach( function forEachSource( sourceHTML ) {
      const output = sourceHTML.tag( "output" ) || {};
      if ( !Array.isArray( output.modules ) ) {
        return;
      }
      output.modules.forEach( function forEachModule( module ) {
        if ( dependenciesForAllFiles.indexOf( module ) < 0 ) {
          dependenciesForAllFiles.push( module );
        }
      } );
    } );
  }
  if ( dependenciesForAllFiles.length > 0 ) {
    console.log( "Copying resources...".cyan );
    dependenciesForAllFiles.forEach( function forEachDependencyFile( module ) {
      const src = project.srcOrLibPath( module );
      if ( src ) {
        const dst = project.wwwPath( Util.replaceFirstSubFolder( module, 'css/' ) );
        project.copyFile( src, dst );
      }
    } );
  }

  // Extra resources defined in `package.json`.
  const extraResources = config.tfw.resources || [];
  extraResources.forEach( function forEachExtraResource( res ) {
    console.log( `Extra resource: ${res.cyan}` );
    project.copyFile(
      project.srcPath( res ),
      project.wwwPath( res )
    );
  } );
}


/**
 * @return void
 */
Project.prototype.isReservedModules = function ( filename ) {
  const reservedModules = this._config.reservedModules;
  if ( !Array.isArray( reservedModules ) ) return false;
  filename = filename.split( "/" ).pop();
  if ( filename.substr( filename.length - 3 ) === '.js' ) {
    // Remove extension.
    filename = filename.substr( 0, filename.length - 3 );
  }
  if ( reservedModules.indexOf( filename ) > -1 ) return true;
  return false;
};

/**
 * @return module `Template`.
 */
Project.prototype.Template = Template;

/**
 * @return Tree module.
 */
Project.prototype.Tree = Tree;

/**
 * @param {string} path path relative to `lib/` in ToloFrameWork folder.
 * @return an absolute path.
 */
Project.prototype.libPath = function ( path ) {
  if ( typeof path === 'undefined' ) return this._libDir;
  if ( path.substr( 0, this._srcDir.length ) === this._srcDir ) {
    path = path.substr( this._srcDir.length );
  }
  return Path.resolve( Path.join( this._libDir, path ) );
};

/**
 * @param {string} path path relative to `tpl/` in ToloFrameWork folder.
 * @return an absolute path.
 */
Project.prototype.tplPath = function ( path ) {
  if ( path.substr( 0, this._srcDir.length ) === this._srcDir ) {
    path = path.substr( this._srcDir.length );
  }
  return Path.resolve( Path.join( this._tplDir, path ) );
};

/**
 * @param {string} path - path relative to `src/`.
 * @return {string} an absolute path.
 */
Project.prototype.srcPath = function ( path ) {
  if ( typeof path === 'undefined' ) return this._srcDir;
  if ( path.substr( 0, this._srcDir.length ) === this._srcDir ) {
    path = path.substr( this._srcDir.length );
  }
  return Path.resolve( Path.join( this._srcDir, path ) );
};

/**
 * @param {string} path path relative to `doc/`.
 * @return an absolute path.
 */
Project.prototype.docPath = function ( path ) {
  if ( typeof path === 'undefined' ) return this._docDir;
  if ( path.substr( 0, this._srcDir.length ) === this._srcDir ) {
    path = path.substr( this._srcDir.length );
  }
  return Path.resolve( Path.join( this._docDir, path ) );
};

/**
 * @param {string} path path relative to the current page folder.
 * @return an absolute path.
 */
Project.prototype.htmPath = function ( path ) {
  if ( typeof path === 'undefined' ) return this._htmDir;
  if ( path.substr( 0, this._srcDir.length ) === this._srcDir ) {
    path = path.substr( this._srcDir.length );
  }
  return Path.resolve( Path.join( this._htmDir, path ) );
};

/**
 * @param {string} path path relative to `prj/`.
 * @return an absolute path.
 */
Project.prototype.prjPath = function ( path ) {
  if ( typeof path === 'undefined' ) return this._prjDir;
  if ( path.substr( 0, this._srcDir.length ) === this._srcDir ) {
    path = path.substr( this._srcDir.length );
  }
  return Path.resolve( Path.join( this._prjDir, path ) );
};

/**
 * @param {string} path path relative to `src/` or extenal modules or `lib/`.
 * @return an absolute path or null if the file does not exist.
 */
Project.prototype.srcOrLibPath = function ( filename ) {
  if ( typeof filename !== 'string' ) return filename;

  const pathes = [this.srcPath()];
  pathes.push( ...this._modulesPath );
  pathes.push( this.libPath() );

  for ( const path of pathes ) {
    const file = findHomonyme( path, filename );
    if ( file ) return file;
  }
  return null;
};

/**
 * @return void
 */
Project.prototype.getExtraModulesPath = function () {
  return this._modulesPath.slice();
};


/**
 * @param {string} path path relative to `tmp/`.
 * @return an absolute path.
 */
Project.prototype.tmpPath = function ( path ) {
  if ( typeof path === 'undefined' ) return this._tmpDir;
  if ( path.substr( 0, this._srcDir.length ) === this._srcDir ) {
    path = path.substr( this._srcDir.length );
  }
  return Path.resolve( Path.join( this._tmpDir, path ) );
};

/**
 * @param {string} path path relative to `www/`.
 * @return an absolute path.
 */
Project.prototype.wwwPath = function ( path ) {
  if ( typeof path === 'undefined' ) return this._wwwDir;
  if ( path.substr( 0, this._srcDir.length ) === this._srcDir ) {
    path = path.substr( this._srcDir.length );
  }
  return Path.resolve( Path.join( this._wwwDir, path ) );
};

/**
 * @return Dictionary  of available widget  compilers. The key  is the
 * widget name, the value is an object:
 * * __path__: absolute path of the compiler's' directory.
 * * __name__: widget's name.
 * * __compiler__: compiler's module owning functions such as `compile`, `precompile`, ...
 * * __precompilation__: is this widget in mode _precompilation_? In this case, it must be called in the Top-Down walking.
 */
Project.prototype.getAvailableWidgetCompilers = function () {
  if ( !this._availableWidgetsCompilers ) {
    const map = {};
    const dirs = [ this._srcDir, this._libDir ];
    console.log( "Available widgets:" );
    // Resolve paths for "wdg/" directories.
    dirs.forEach(( itm, idx, arr ) => {
      let path = Path.resolve( Path.join( itm, "wdg" ) );
      if ( !FS.existsSync( path ) ) {
        path = null;
      }
      arr[ idx ] = path;
    });
    dirs.forEach(dir => {
      if ( typeof dir !== 'string' ) return;
      const files = FS.readdirSync( dir );
      files.forEach(function ( filename ) {
        const file = Path.join( dir, filename );
        const stat = FS.statSync( file );
        if ( stat.isFile() ) return;
        if ( !map[ filename ] ) {
          map[ filename ] = {
            path: file,
            name: filename
          };
          const modulePath = Path.join( file, `compile-${filename}.js` );
          if ( FS.existsSync( modulePath ) ) {
            const compiler = require( modulePath );
            if ( typeof compiler.precompile === 'function' ) {
              map[ filename ].precompilation = true;
              map[ filename ].compiler = compiler;
            } else if ( typeof compiler.compile === 'function' ) {
              map[ filename ].compiler = compiler;
            }
          }
        }
      });
    });
    this._availableWidgetsCompilers = map;
  }
  return this._availableWidgetsCompilers;
};

/**
 * Throw a fatal exception.
 */
Project.prototype.fatal = function ( msg, id, src ) {
  Fatal.fire( msg, id, src );
};

/**
 * Incrément version.
 */
Project.prototype.makeVersion = function () {
  const cfg = this._config;
  const version = cfg.version.split( "." );
  if ( version.length < 3 ) {
    while ( version.length < 3 ) version.push( "0" );
  } else {
    version[ version.length - 1 ] = ( parseInt( version[ version.length - 1 ], 10 ) || 0 ) + 1;
  }
  cfg.version = version.join( "." );
  PathUtils.file( this.prjPath( 'package.json' ), JSON.stringify( cfg, null, '    ' ) );
  console.log( `New version: ${cfg.version.cyan}` );
};


/**
 * Tests use __Karma__ and __Jasmine__ and the root folder is `spec`.
 * All the __tfw__ modules are put in `spec/mod` folder.
 */
Project.prototype.makeTest = function ( compiledFiles, specDir ) {
  console.log( `${"Prepare Karma/Jasmine tests... ".cyan}(${specDir})` );

  // Create missing folders.
  const specPath = this.prjPath( specDir );
  if ( !FS.existsSync( specPath ) ) {
    FS.mkdirSync( specPath );
  }
  if ( !FS.existsSync( Path.join( specPath, "mod" ) ) ) {
    FS.mkdirSync( Path.join( specPath, "mod" ) );
  }

  // List of needed modules.
  const allModules = [];
  compiledFiles.forEach( function ( compiledFile ) {
    const output = compiledFile.tag( 'output' );
    const modules = output.modules;
    modules.forEach( function ( module ) {
      if ( allModules.indexOf( allModules ) < 0 ) {
        allModules.push( module );
      }
    } );
  } );

  // Copy modules in `spec/mod`.
  allModules.forEach( function ( module ) {
    const js = new Source( this, `${module}.js` );
    PathUtils.file( this.prjPath( `${specDir}/${Util.replaceSlashesWithDots( module )}.js` ), js.tag( 'zip' ) );
  }, this );

  PathUtils.file( this.prjPath( `${specDir}/mod/@require.js` ), Template.file( 'require.js' ).out );
};


/**
 * Writing documentation.
 * @return void
 */
Project.prototype.makeDoc = function () {
  console.log( "Writing documentation...".cyan );
  CompilerPHP.compile( this );
  const that = this;
  let modules = "window.M={";
  this._modulesList.sort();
  this._modulesList.forEach(function ( moduleName, index ) {
    const src = new Source( that, `mod/${moduleName}` );
    if ( index > 0 ) modules += ",\n";
    modules += `${JSON.stringify( moduleName.substr( 0, moduleName.length - 3 ) )}:${
                JSON.stringify( src.tag( "doc" ) )}`;
  });
  modules += "}";
  const cfg = this._config;
  const docPath = this.prjPath( "doc" );
  Template.files( "doc", docPath, {
    project: cfg.name
  } );
  this.mkdir( docPath );
  PathUtils.file(
    Path.join( docPath, "modules.js" ),
    modules
  );
};

Project.prototype.makeJSDoc = function () {
  console.error( "Not implemented yet!" );
};

/**
 * @return {this}
 */
Project.prototype.addModuleToList = function ( moduleName ) {
  if ( moduleName.substr( 0, 4 ) !== 'mod/' ) return this;
  moduleName = moduleName.substr( 4 );
  if ( moduleName.charAt( 0 ) === '$' ) return this;
  if ( this._modulesList.indexOf( moduleName ) < 0 ) {
    this._modulesList.push( moduleName );
  }
  return this;
};

/**
 * Link every `*.html` file found in _srcDir_.
 */
Project.prototype.link = function () {
  console.log( `Cleaning output: ${this.wwwPath( 'js' )}` );
  Util.cleanDir( this.wwwPath( 'js' ) );
  console.log( `Cleaning output: ${this.wwwPath( 'css' )}` );
  Util.cleanDir( this.wwwPath( 'css' ) );
  this.mkdir( this.wwwPath( "DEBUG" ) );
  this.mkdir( this.wwwPath( "RELEASE" ) );
  this._htmlFiles.forEach(
    function ( filename ) {
      filename = filename.split( Path.sep ).join( "/" );
      console.log( `Linking ${filename.yellow}` );
      let shiftPath = "";
      const subdirCount = filename.split( "/" ).length - 1;
      for ( let i = 0; i < subdirCount; i++ ) {
        shiftPath += "../";
      }
      this.linkForDebug( filename, shiftPath );
      this.linkForRelease( filename, shiftPath );
    },
    this
  );
};

/**
 * @return void
 */
Project.prototype.sortCSS = function ( linkJS, linkCSS ) {
  const input = [];
  linkCSS.forEach(function ( nameCSS, indexCSS ) {
    const nameJS = `${nameCSS.substr( 0, nameCSS.length - 3 )}js`;
    let pos = linkJS.indexOf( nameJS );
    if ( pos < 0 ) pos = 1000000 + indexCSS;
    input.push( [ nameCSS, pos ] );
  });
  input.sort(function ( a, b ) {
    let x = a[ 0 ];
    let y = b[ 0 ];
    if ( x < y ) return -1;
    if ( x > y ) return 1;
    x = a[ 1 ];
    y = b[ 1 ];
    if ( x < y ) return -1;
    if ( x > y ) return 1;
    return 0;
  });
  return input.map( function ( x ) {
    return x[ 0 ];
  } );
};

Project.prototype.sortJS = function ( srcHTML, linkJS ) {
  const input = [];
  linkJS.forEach(function ( nameJS ) {
    const srcJS = srcHTML.create( nameJS );
    const item = {
      key: nameJS,
      dep: []
    };
    srcJS.tag( "needs" ).forEach(function ( name ) {
      if ( name !== nameJS && linkJS.indexOf( name ) > -1 ) {
        item.dep.push( name );
      }
    });
    input.push( item );
  });
  return this.topologicalSort( input );
};

Project.prototype.topologicalSort = function ( input ) {
  const output = [];
  let candidate = null;
  const forEachInput = item => {
    if ( !item.key ) return;
    if ( !candidate ) {
      candidate = item;
    } else if ( item.dep.length < candidate.dep.length ) {
      candidate = item;
    }
  };
  const removeFromDep = item => {
    if ( !item.key ) return;
    item.dep = item.dep.filter(function ( x ) {
      return x !== candidate.key;
    });
  };
  while ( output.length < input.length ) {
    // Looking for the less depending item.
    candidate = null;
    input.forEach( forEachInput );
    // Remove this item in all the dependency lists.
    input.forEach(removeFromDep);
    // This candidate is the next item of the output list.
    const key = candidate.key;
    output.push( key );
    delete candidate.key;
  }
  return output;
};

/**
 * Linking in DEBUG mode.
 * Starting with an HTML file, we will find all dependent JS and CSS.
 *
 * Example: filename = "foo/bar.html"
 * We will create:
 * * `DEBUG/js/foo/@bar.js` for inner JS.
 * * `DEBUG/css/foo/@bar.css` for inner CSS.
 */
Project.prototype.linkForDebug = function ( filename, shiftPath ) {
  // Add this to a Javascript link to force webserver to deliver a non cached file.
  const seed = `?${Date.now()}`;
  // The HTML source file.
  const srcHTML = new Source( this, filename );
  // Array of all needed JS topologically sorted.
  const linkJS = this.sortJS( srcHTML, srcHTML.tag( "linkJS" ) || [] );
  // Array of all needed CSS topologically sorted.
  const linkCSS = this.sortCSS( linkJS, srcHTML.tag( "linkCSS" ) || [] );
  // HTML tree structure.
  const tree = Tree.clone( srcHTML.tag( "tree" ) );
  const manifestFiles = [];

  const head = Tree.getElementByName( tree, "head" );
  if ( !head ) {
    this.fatal(`${"Invalid HTML file: missing <head></head>!" +
            "\n\n"}${
            Tree.toString( tree )}`);
  }

  // Needed CSS files.
  const cssDir = this.mkdir( this.wwwPath( "DEBUG/css" ) );
  linkCSS.forEach(
    function ( item ) {
      const srcCSS = srcHTML.create( item );
      const shortName = Path.basename( srcCSS.getAbsoluteFilePath() );
      const output = Path.join( cssDir, shortName );
      PathUtils.file( output, srcCSS.tag( "debug" ) );
      if ( !head.children ) head.children = [];
      head.children.push(Tree.tag("link", {
        href: `${shiftPath}css/${shortName}${seed}`,
        rel: "stylesheet",
        type: "text/css"
      }));
      head.children.push( {
        type: Tree.TEXT,
        text: "\n"
      } );
      manifestFiles.push( `css/${shortName}` );
      const resources = srcCSS.listResources();
      resources.forEach(
        function ( resource ) {
          const shortCssName = `css/${resource[ 0 ]}`;
          const longCssName = resource[ 1 ];
          manifestFiles.push( shortCssName );
          this.copyFile( longCssName, Path.join( this.wwwPath( "DEBUG" ), shortCssName ) );
        },
        this
      );
    },
    this
  );

  // For type "nodewebkit", all JS must lie in "node_modules" and they
  // don't need to be declared in the HTML file.
  const jsDirShortName = this._type === 'nodewebkit' ? "node_modules" : "js";
  const jsDir = this.mkdir( this.wwwPath( `DEBUG/${jsDirShortName}` ) );
  linkJS.forEach(
    function ( item ) {
      const srcJS = srcHTML.create( item );
      const shortName = Path.basename( srcJS.getAbsoluteFilePath() );
      const output = Path.join( jsDir, shortName );
      let code = srcJS.read();
      if ( item.substr( 0, 4 ) === 'mod/' ) {
        if ( this._type === 'nodewebkit' ) {
          // Let's add internationalisation snippet.
          code = ( srcJS.tag( "intl" ) || "" ) + code;
        } else {
          // This is a module. We need to wrap it in module's declaration snippet.
          code =
            `require('${
                        shortName.substr( 0, shortName.length - 3 ).toLowerCase()
                        }', function(exports, module){\n${
                         srcJS.tag( "intl" ) || ""
                        }${code
                        }\n});\n`;
        }
      }
      PathUtils.file( output, code );
      if ( this._type !== 'nodewebkit' ) {
        // Declaration and  manifest only needed for  project of
        // type that is not "nodewebkit".
        if ( !head.children ) head.children = [];
        head.children.push(Tree.tag("script", {
          src: `${shiftPath + jsDirShortName}/${shortName}${seed}`
        }));
        head.children.push( {
          type: Tree.TEXT,
          text: "\n"
        } );
        manifestFiles.push( `${jsDirShortName}/${shortName}` );
      }
    },
    this
  );
  srcHTML.tag( "resources" ).forEach(itm => {
    let src = itm;
    let dst = src;
    if ( Array.isArray( src ) ) {
      dst = src[ 1 ];
      src = src[ 0 ];
    }
    manifestFiles.push( dst );
    src = this.srcPath( src );
    dst = Path.join( this.wwwPath( "DEBUG" ), dst );
    this.copyFile( src, dst );
  }, this);

  // Adding innerJS and innerCSS.
  const shortNameJS = `${PathUtils.addPrefix( filename.substr( 0, filename.length - 5 ), "@" )}.js`;
  head.children.push(Tree.tag("script", {
    src: `${shiftPath + jsDirShortName}/${shortNameJS}${seed}`
  }));
  manifestFiles.push( `${jsDirShortName}/${shortNameJS}` );
  const wwwInnerJS = Path.join( jsDir, shortNameJS );
  PathUtils.file(
    wwwInnerJS,
    srcHTML.tag( "innerJS" )
  );

  // For now, we decided to put the CSS relative to the inner HTML into the <head>'s tag.
  head.children.push(Tree.tag( "style", {}, srcHTML.tag( "innerCSS" ) ));
  // If we want to externalise the inner CSS in the future, we can use this piece of code.
  /*
    const shortNameCSS = `${PathUtils.addPrefix( filename.substr( 0, filename.length - 5 ), "@" )}.css`;
    head.children.push(Tree.tag("link", {
    href: `${shiftPath}css/${shortNameCSS}${seed}`,
    rel: "stylesheet",
    type: "text/css"
    }));
    manifestFiles.push( `${shiftPath}css/${shortNameCSS}` );
    PathUtils.file(
    Path.join( cssDir, shortNameCSS ),
    srcHTML.tag( "innerCSS" )
    );
  */

  if ( this._type !== 'nodewebkit' ) {
    // Looking for manifest file.
    const html = Tree.findChild( tree, "html" );
    if ( html ) {
      const manifestFilename = Tree.att( "manifest" );
      if ( manifestFilename ) {
        // Writing manifest file only if needed.
        PathUtils.file(
          Path.join( this.wwwPath( "DEBUG" ), `${filename}.manifest` ),
          `${"CACHE MANIFEST\n" +
                    "# "}${new Date()} - ${Date.now()}\n\n` +
            `CACHE:\n${
                    manifestFiles.join( "\n" )
                    }\n\nNETWORK:\n*\n`
        );
      }
    }
  }
  // Writing HTML file.
  PathUtils.file(
    Path.join( this.wwwPath( "DEBUG" ), filename ),
    `<!-- ${( new Date() ).toString()} -->` +
      `<!DOCTYPE html>${Tree.toString( tree )}`
  );
  // Writing ".htaccess" file.
  this.writeHtaccess( "DEBUG" );
  // Looking for webapp manifest for Firefox OS (also used for nodewebkit but with another name).
  copyManifestWebapp.call( this, "DEBUG" );
};

/**
 * @param mode can be "RELEASE" or "DEBUG".
 * @return void
 */
Project.prototype.writeHtaccess = function ( mode ) {
  PathUtils.file(
    Path.join( this.wwwPath( mode ), ".htaccess" ),
    "AddType application/x-web-app-manifest+json .webapp\n" +
      "AddType text/cache-manifest .manifest\n" +
      "ExpiresByType text/cache-manifest \"access plus 0 seconds\"\n" +
      "Header set Expires \"Thu, 19 Nov 1981 08:52:00 GM\"\n" +
      "Header set Cache-Control \"no-store, no-cache, must-revalidate, post-check=0, pre-check=0\"\n" +
      "Header set Pragma \"no-cache\"\n"
  );
};

/**
 * @param mode : "DEBUG" or "RELEASE".
 */
function copyManifestWebapp( mode ) {
  let filename = "manifest.webapp";
  let out;
  if ( this._type == 'nodewebkit' ) filename = "package.json";

  console.log( `Copying ${filename.cyan}...` );

  // Looking for webapp manifest for Firefox OS.
  if ( FS.existsSync( this.srcPath( filename ) ) === false ) {
    out = Template.file( filename, this._config ).out;
    PathUtils.file( this.srcPath( filename ), out );
  }
  const webappFile = this.srcPath( filename );
  if ( webappFile ) {
    const content = FS.readFileSync( webappFile ).toString();
    let json = null;
    try {
      json = JSON.parse( content );
    } catch ( x ) {
      this.fatal( `'${filename}' must be a valid JSON file!\n${x}` );
    }
    json.version = this._config.version;
    if ( typeof json.window === 'object' ) {
      json.window.toolbar = mode === "DEBUG";
    }
    PathUtils.file( Path.join( this.wwwPath( mode ), filename ), JSON.stringify( json, null, 4 ) );
    const icons = json.icons || {};
    let key, val;
    for ( key in icons ) {
      val = this.srcOrLibPath( icons[ key ] );
      if ( val ) {
        this.copyFile( val, Path.join( this.wwwPath( mode ), icons[ key ] ) );
      }
    }
  }
}

/**
 * @return array of HTML files found in _srcDir_.
 */
Project.prototype.findHtmlFiles = function () {
  const that = this;

  let filters = this._config.tfw.compile.files;
  if ( typeof filters === 'undefined' ) filters = "\\.html$";
  let files = [],
      srcDir = this.srcPath(),
      prefixLength = srcDir.length + 1,
      filter, i,
      rxFilters = [],
      arr;
  if ( !Array.isArray( filters ) ) {
    filters = [ filters ];
  }
  for ( i = 0; i < filters.length; i++ ) {
    filter = filters[ i ];
    if ( typeof filter !== 'string' ) {
      this.fatal( "Invalid atribute \"tfw.compile.files\" in \"package.json\"!\n" +
                  "Must be a string or an array of strings." );
    }
    arr = [];
    filter.split( "/" ).forEach(function ( item ) {
      try {
        item = item.trim();
        if ( item == '' || item == '*' ) {
          // `null`matches anything.
          arr.push( null );
        } else {
          arr.push( new RegExp( item, "i" ) );
        }
      } catch ( ex ) {
        this.fatal(`Invalid regular expression for filter: ${JSON.stringify( filter )}!`);
      }
    });
    rxFilters.push( arr );
  }
  rxFilters.forEach(function ( f ) {
    PathUtils.findFiles( srcDir, f ).forEach(function ( item ) {
      if ( item.substr( item.length - 5 ).toLowerCase() !== '.html' ) {
        console.log( `Copying ${item.yellow}` );
        that.copyFile( item, that.wwwPath( Path.basename( item ) ) );
        return;
      }
      files.push( item.substr( prefixLength ) );
    });
  });
  if ( files.length == 0 ) {
    this.fatal(`No HTML file found!\n\nPattern: ${JSON.stringify( filters )
            }\nFolder:  ${srcDir}`);
  }
  return files;
};

/**
 * @param arguments all arguments will be joined to form the path of the directory to create.
 * @return the name of the created directory.
 */
Project.prototype.mkdir = function () {
  let key, arg,
      items = [];
  for ( key in arguments ) {
    arg = arguments[ key ].trim();
    items.push( arg );
  }
  let path = Path.resolve( Path.normalize( items.join( "/" ) ) ),
      item, i,
      curPath = "";
  items = path.replace( /\\/g, '/' ).split( "/" );
  for ( i = 0; i < items.length; i++ ) {
    item = items[ i ];
    curPath += `${item}/`;
    if ( FS.existsSync( curPath ) ) {
      const stat = FS.statSync( curPath );
      if ( !stat.isDirectory() ) {
        break;
      }
    } else {
      try {
        FS.mkdirSync( curPath );
      } catch ( ex ) {
        throw {
          fatal: `Unable to create directory "${curPath}"!\n${ex}`
        };
      }
    }
  }
  return path;
};

// Used for file copy.
var buffer = new Buffer( 64 * 1024 );

/**
 * Copy a file from `src` to `dst`.
 * @param src full path of the source file.
 * @param dst full path of the destination file.
 */
Project.prototype.copyFile = function ( src, dst, log ) {
  if ( log ) {
    console.log( `copyFile( ${src.cyan}, ${dst} )` );
  }
  if ( !FS.existsSync( src ) ) {
    this.fatal( `Unable to copy missing file: ${src}\ninto: ${dst}`, -1, src );
  }
  let stat = FS.statSync( src );
  if ( stat.isDirectory() ) {
    // We need to copy a whole directory.
    if ( FS.existsSync( dst ) ) {
      // Check if the destination is a directory.
      stat = FS.statSync( dst );
      if ( !stat.isDirectory() ) {
        this.fatal( `Destination is not a directory: "${dst
                    }"!\nSource is "${src}".`, -1, "project.copyFile" );
      }
    } else {
      // Make destination directory.
      this.mkdir( dst );
    }
    const files = FS.readdirSync( src );
    files.forEach(
      function ( filename ) {
        this.copyFile(
          Path.join( src, filename ),
          Path.join( dst, filename ),
          log
        );
      },
      this
    );
    return;
  }

  let bytesRead, pos, rfd, wfd;
  this.mkdir( Path.dirname( dst ) );
  try {
    rfd = FS.openSync( src, "r" );
  } catch ( ex ) {
    this.fatal( `Unable to open file "${src}" for reading!\n${ex}`, -1, "project.copyFile" );
  }
  try {
    wfd = FS.openSync( dst, "w" );
  } catch ( ex ) {
    this.fatal( `Unable to open file "${dst}" for writing!\n${ex}`, -1, "project.copyFile" );
  }
  bytesRead = 1;
  pos = 0;
  while ( bytesRead > 0 ) {
    try {
      bytesRead = FS.readSync( rfd, buffer, 0, 64 * 1024, pos );
    } catch ( ex ) {
      this.fatal( `Unable to read file "${src}"!\n${ex}`, -1, "project.copyFile" );
    }
    FS.writeSync( wfd, buffer, 0, bytesRead );
    pos += bytesRead;
  }
  FS.closeSync( rfd );
  return FS.closeSync( wfd );
};


/**
 * @param {string} prjDir root directory of the project. It is where we can find `project.tfw.json`.
 * @return {object} instance of the class `Project`.
 */
function createProject( prjDir ) {
  return new Project( prjDir );
}


/**
 * @param   {object} project - Instance of Project.
 * @returns {undefined}
 */
function initializedPrivateVariables( project ) {
  // Will own the list of HTML files as Source objects.
  project._compiledFiles = [];

  /*
   *  To prevent double flushing of the  same file, this array keeps the
   * name of the already flushed files.
   * @see `this.flushContent()`
   */
  project._flushedContent = [];

  project._modulesPath = [];
}


/**
 * @param {string} version - Version in format `major.minor.patch`.
 * @returns {ojbect} `{major, minor, patch}`.
 */
function parseVersion( version ) {
  try {
    const
    versionArray = version.split( "." ),
    MAJOR_INDEX = 0,
    MINOR_INDEX = 1,
    PATCH_INDEX = 2;
    return {
      major: versionArray[ MAJOR_INDEX ],
      minor: versionArray[ MINOR_INDEX ],
      patch: versionArray[ PATCH_INDEX ]
    };
  } catch ( ex ) {
    throw new Error( `Unable to parse version ${JSON.stringify(version, null, '    ')}` );
  }
}

/**
 * @param {object} cfg - Configuration.
 * @returns {object} The minimal object that we must provide as the module `$.js`.
 */
function getModuleContentFor$( cfg ) {
  const version = parseVersion( cfg.version );
  return {
    name: JSON.stringify( cfg.name ),
    description: JSON.stringify( cfg.description || "" ),
    author: JSON.stringify( cfg.author || "" ),
    version: JSON.stringify( cfg.version ),
    major: version.major,
    minor: version.minor,
    revision: version.patch,
    date: new Date(),
    consts: {}
  };
}


/**
 * @param {array} htmlFiles - List of all the HTML files we add to compile.
 * @param {object} options - Options for debug, release, ...
 * @returns {array} List of actually compiled files.
 * @see findHtmlFiles
 */
function compileHtmlFiles( htmlFiles, options ) {
  const compiledFiles = [];
  for ( let i = 0; i < htmlFiles.length; i++ ) {
    const filename = htmlFiles[ i ];
    try {
      const compiledFile = CompilerHTML2.compile( filename, Util.clone( options ) );
      compiledFiles.push( compiledFile );
    } catch ( ex ) {
      Fatal.bubble( ex, filename );
    }
  }
  return compiledFiles;
}


/**
 * For instance,  if you look for  "page.scorerace.view.layout.js", the following homonymes  will be
 * checked (in that order):
 *  * "page/scorerace/view/layout.js"
 *  * "page/scorerace/view.layout.js"
 *  * "page/scorerace.view.layout.js"
 *  * "page.scorerace.view.layout.js"
 * @param {string} path - Folder where to find any homonyme of `filename`.
 * @param {string} _filename - File without any path, but with an extension.
 * @return {string} If there is at leat one file found, return it.  Otherwise return `null`.
 */
function findHomonyme( path, filename ) {
  try {
    const structure = Path.parse( filename );
    const pieces = structure.name.split('.'),
          dottedFilename = pieces.join('.'),
          precandidates = [ pieces.join('/') ];
    for( let i = pieces.length - 1; i > 1; i-- ) {
      const begin = pieces.slice(0, i).join("/");
      precandidates.push(`${begin}${dottedFilename.substr(begin.length)}`);
    }
    if( precandidates.indexOf( dottedFilename ) === -1 ) {
      precandidates.push( dottedFilename );
    }

    const candidates = precandidates.map(
      c => Path.resolve( path, structure.dir, `${c}${structure.ext}`) );
    const existingFiles = candidates.filter( f => FS.existsSync( f ));

    if( existingFiles.length === 0 ) return null;
    if( existingFiles.length > 1 ) {
      console.info( "Warning!".red, `There are ${existingFiles.length} candidates for file "${filename}":` );
      existingFiles.forEach(function (itm) {
        console.info(`   > ${itm}`);
      });

    }
    return existingFiles[0];
  } catch( ex ) {
    Fatal.bubble( ex, `...in findHomonyme(${JSON.stringify(path)}, ${JSON.stringify(filename)})`);
  }
}

function appendExtension(base, ext) {
  if( typeof ext !== 'string' || ext.trim().length === 0 ) return base;
  return `${base}.${ext}`;
}
