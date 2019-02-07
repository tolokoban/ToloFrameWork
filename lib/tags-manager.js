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
}


module.exports = TagsManager;
