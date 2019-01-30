"use strict";

const
FS = require("fs"),
Path = require("path"),
Util = require("./util"),
PathUtils = require("./pathutils");


class TagsManager {
    constructor( root ) {
        Util.readonly( this, { root } );
        PathUtils.mkdir( root );
    }

    path( name ) {
        return Path.resolve( this.root, name );
    }

    load( name ) {
        const path = this.path( name );
        if( !FS.exists( path ) ) return null;
        return FS.fileReadSync( path );
    }

    save( name, content ) {
        const path = this.path( name );
        PathUtils.mkdir( Path.dirname( path ) );
        FS.fileWriteSync( path, content );
    }

    time( name ) {
        const path = this.path( name );
        if( !FS.exists( path ) ) return 0;
        const stat = FS.statSync( path );
        return stat.mtime.getTime();
    }

    loadModJs( moduleName ) {
        return this.load(`mod/${moduleName}.js`);
    }

    saveModJs( moduleName, content ) {
         this.save(`mod/${moduleName}.js`, content);
    }

    timeModJs( moduleName ) {
        return this.time(`mod/${moduleName}.js`);
    }

    loadModXjs( moduleName ) {
        return this.load(`mod/${moduleName}.xjs`);
    }

    saveModXjs( moduleName, content ) {
         this.save(`mod/${moduleName}.xjs`, content);
    }

    timeModXjs( moduleName ) {
        return this.time(`mod/${moduleName}.xjs`);
    }

    loadModIni( moduleName ) {
        return this.load(`mod/${moduleName}.ini`);
    }

    saveModIni( moduleName, content ) {
         this.save(`mod/${moduleName}.ini`, content);
    }

    timeModIni( moduleName ) {
        return this.time(`mod/${moduleName}.ini`);
    }

    loadModDepWatch( moduleName ) {
        return this.load(`mod/${moduleName}.dep.watch`);
    }

    saveModDepWatch( moduleName, content ) {
         this.save(`mod/${moduleName}.dep.watch`, content);
    }

    timeModDepWatch( moduleName ) {
        return this.time(`mod/${moduleName}.dep.watch`);
    }
}


module.exports = TagsManager;
