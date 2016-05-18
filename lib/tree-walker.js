/**
 * @module tree-walker
 *
 * @description
 * Add hooks on an object's tree.
 *
 * @example
 * var TW = require('tree-walker');
 * var data = {
 *     students: [
 *         { gender: "M", name: "John" },
 *         { gender: "F", name: "Arya" },
 *         { gender: "F", name: "Shae" },
 *         { gender: "M", name: "Tyron" },
 *         { gender: "M", name: "Jammy" }
 *     ]
 * };
 *
 * var a = new TW({
 *     "students/2": display
 * });
 * a.walk( data );
 *
 * var b = new TW({
 *     "students/[gender=M]": display
 * });
 * b.walk( data );
 */



// Matches this kind of strings:
// * `[Var]`
// * ` [Toto]`
// * ` [Toto]  `
// * ` [Toto  ]  `
// * ` [ Toto]  `
// * `[Var=bob]`
// * `[titi= Fla ga da Johnes ]`
var rxTest = /^[ \t]*\[[ \t]*([a-z_][a-z_0-9]*)[ \t]*(=[^\]]+)?[ \t]*\]/i;


/**
 * @example
 * var TreeWalker = require("tree-walker");
 * var instance = new TreeWalker(opts);
 * @class TreeWalker
 */
var TreeWalker = function( actions ) {
    this._actions = compile.call( this, actions );
};

/**
 * @return void
 */
TreeWalker.prototype.walk = function( data ) {
    this._actions.forEach(function ( item ) {
        var action = item.action;
        var path = item.path;
        var tester = path[0];
        tester( data, action, path, 1 );
    });

};


function compile( actions ) {
    var out = [];
    var path, action;
    var compiledActions;
    var pathItems;
    for( path in actions ) {
        compiledActions = [];
        action = actions[path];
        pathItems = explodePath( path );
        out.push({ path: pathItems, action: action });
    }

    return out;
}

/**
 * Transform `"a/*"` into `[["att", "a"], ["any"]]`.
 * Transform `"bob/** /[youp]"` into `[["att", "bob"], ["all"], ["tst", {youp: undefined}]]`.
 * Transform `"a/b"` into `[["att", "a"], ["att", "b"]]`.
 * Transform `"a/4"` into `[[att: "a"], [idx: 4]]`.
 * Transform `"[x=toto]"` into `[["tst", {x: 'toto'}]]`.
 * Transform `"[x=toto][y=foo]"` into `[["tst", {x: 'toto', y: 'foo'}]]`.
 */
function explodePath( path ) {
    var items = path.split( '/' );
    return items.map(function( itm ) {
        itm = itm.trim();
        if( itm == '*' ) return buildAny();
        if( itm == '**' ) return buildAll();
        if( itm.charAt(0) != '[' ) {
            // Not a test.
            var idx = parseInt( itm );
            if( isNaN( idx ) ) {
                return buildAtt( itm );
            }
            return buildIdx( idx );
        }
        var tst = {};
        while( itm.length > 0 ) {
            var m = itm.match(rxTest);
            if (!m) break;
            var key = m[1];
            var val = m[2];
            if (val) {
                val = val.substr(1);
            }
            tst[key] = val;
            // Go to next test, if any.
            itm = itm.substr( m[0].length );
        }
        return buildTst( tst );
    });
}

function buildAtt( att ) {
    return function( node, action, path, idx ) {
        node = node[att];
        if( typeof node === 'undefined' ) return false;
        if( idx < path.length ) {
            return path[idx]( node, action, path, idx + 1 );
        }
        action( node );
        return false;
    };
}

function buildIdx( index ) {
    return function( node, action, path, idx ) {
        node = node[index];
        if( typeof node === 'undefined' ) return false;
        if( idx < path.length ) {
            return path[idx]( node, action, path, idx + 1 );
        }
        action( node );
        return false;
    };
}

function buildTst( tst ) {
    return function( node, action, path, idx ) {
        var arr = node;
        if( !Array.isArray( arr ) ) arr = [arr];
        arr.forEach(function ( child ) {
            var success = true;
            var key, val;
            for( key in tst ) {
                val = tst[key];
                if( typeof child[key] === 'undefined' ) {
                    success = false;
                    break;
                }
                if( typeof val !== 'undefined' ) {
                    if( child[key] != val ) {
                        success = false;
                        break;
                    }
                }
            }
            if( success ) {
                if( idx < path.length ) {
                    return path[idx]( child, action, path, idx + 1 );
                }
                action( child );
            }
        });
    };
}

function actionAny( node, action, path, idx ) {
    if( typeof node === 'undefined' ) return;

    if( Array.isArray( node ) ) {
        node.forEach(function ( child ) {
            if( idx < path.length ) {
                path[idx]( child, action, path, idx + 1 );
            } else {
                action( child );
            }
        });
    } else {
        var key, child;
        for( key in node ) {
            child = node[key];
            if( idx < path.length ) {
                path[idx]( child, action, path, idx + 1 );
            } else {
                action( child );
            }
        }
    }
}

function buildAny() {
    return actionAny;
}

function actionAll( node, action, path, idx ) {
    if( typeof node === 'undefined' ) return;

    var test = path[idx];
    var noMoreTests = (typeof test !== 'function');

    if( isLeaf( node ) ) {
        if( noMoreTests ) action( node );
        return;
    }

    if( Array.isArray( node ) ) {
        node.forEach(function ( child ) {
            if( !noMoreTests ) test( child, action, path, idx + 1 );
            actionAll( child, action, path, idx );
        });

    } else {
        var key, child;
        for( key in node ) {
            child = node[key];
            if( !noMoreTests ) test( child, action, path, idx + 1 );
            actionAll( child, action, path, idx );
        }
    }
}

function buildAll() {
    return actionAll;
}

function isLeaf( node ) {
    switch( typeof node ) {
    case 'function':
    case 'string':
    case 'number':
    case 'boolean':
        return true;
    }
    return false;
}

TreeWalker.create = function( actions ) {
    return new TreeWalker( actions );
};
module.exports = TreeWalker;
