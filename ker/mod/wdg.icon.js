var $ = require("dom");
var DB = require("tfw.data-binding");

var Icon = function(opts) {
    var that = this;

    var elem = $.elem(this, 'button', 'wdg-icon');
    var g = $.svg('g', {
        'stroke-width': 6,
        'stroke-linecap': 'round'
    });
    var root = $.svgRoot({
        width: '100%',
        height: '100%',
        viewBox: '-63.5 -63.5 128 128',
        preserveAspectRatio: "xMidYMid meet"
    });
    $.add( root, g );
    $.add( elem, root );
    DB.prop(this, 'content')(setContent.bind( this, g ));
    DB.prop(this, 'value');
    DB.propUnit(this, 'size')(function(v) {
        $.att(root, {
            width: v,
            height: v
        });
    });
    DB.prop(this, 'action');
    DB.propColor(this, 'color0');
    DB.propColor(this, 'color1');
    DB.propColor(this, 'color3');
    DB.propColor(this, 'color4');
    DB.propColor(this, 'color5');

    $.on( elem, {
        keydown: function(evt) {
            if (evt.keyCode == 13 || evt.keyCode == 32) {
                evt.preventDefault();
                evt.stopPropagation();
                that.fire();
            }
        },
        tap: that.fire.bind( that )
    });

    opts = DB.extend({
        color0: '#000000',
        color1: '#ffffff',
        color2: '#ff0000',
        color3: '#00ff00',
        color4: '#0000ff',
        content: ['circle', {
            stroke: 1, fill: 0, r: 90, cx: 0, cy: 0
        }],
        size: '2em'
    }, opts, this);
};


/**
 * @return void
 */
Icon.prototype.fire = function() {
    DB.fire( this, 'action', this.value );
};


function setContent(root, v) {
    if (typeof v === 'string') {
        var def = Icon[v];
        if( typeof def !== 'undefined' ) v = def;
        else {
            try {
                v = JSON.parse( v );
            }
            catch (ex) {
                console.error("[wdg.icon:content] Bad value: ", v);
                console.error(ex);
            }
        }
    }
    if (!Array.isArray( v )) {
        console.error("[wdg.icon:content] Value must be an array: ", v);
        return;
    }

    $.clear( root );
    addChild.call( this, root, v );
}


function addChild( parent, child ) {
    if (!Array.isArray( child ) || child.length == 0) {
        console.error("[wdg.icon:content] `child` must be an array: ", child);
        console.error("parent = ", parent);
        return;
    }

    var node;
    child.forEach(function (itm, idx) {
        var key, val, att;
        if (idx == 0) {
            node = $.svg(itm);
            $.add( parent, node );
        } else {
            if (typeof itm === 'string') {
                $.addClass( node, itm );
            } else if (Array.isArray( itm )) {
                itm.forEach(function (subchild) {
                    addChild.call( this, node, subchild );
                }, this);
            } else if (typeof itm === 'object') {
                for( key in itm ) {
                    val = itm[key];
                    key = antiCamelCase( key );
                    if ((key == 'fill' || key == 'stroke') && typeof val === 'number') {
                        att = 'color' + Math.floor( val );
                        val = this[att];
                    }
                    $.att( node, key, val );
                }
            }
        }
    }, this);
}


function antiCamelCase(v) {
    var out = '', c;
    for (var i = 0; i < v.length ; i++) {
        c = v.charAt(i);
        if (c == c.toUpperCase()) {
            c = c.toLowerCase();
            out += '-';
        }
        out += c;
    }
    return out;
}


Icon.Close = ['g', [
    ['path', {
        d: 'M-40,-40L40,40M-40,40L40,-40',
        stroke: 0, strokeWidth: 40
    }],
    ['path', {
        d: 'M-40,-40L40,40M-40,40L40,-40',
        stroke: 1, strokeWidth: 24
    }]
]];

module.exports = Icon;
