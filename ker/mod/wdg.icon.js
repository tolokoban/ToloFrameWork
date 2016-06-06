var $ = require("dom");
var DB = require("tfw.data-binding");

var Icon = function(opts) {
    var that = this;

    var g = $.svg('g', {
        'stroke-width': 6,
        fill: "none",
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
    });
    var root = $.svgRoot({
        width: '100%',
        height: '100%',
        viewBox: '-63.5 -63.5 128 128',
        preserveAspectRatio: "xMidYMid meet"
    }, 'wdg-icon');
    var elem = $.elem(this, root);
    $.add( root, g );
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
    DB.propColor(this, 'color6');

    opts = DB.extend({
        color0: '#000000',
        color1: '#ffffff',
        color2: '#777777',
        color3: '#ff0000',
        color4: '#00ff00',
        color5: '#0000ff',
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
        var def = Icon.Icons[v.trim().toLowerCase()];
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
    try {
        addChild.call( this, root, v );
    }
    catch (ex) {
        console.error("[wdg.icon:content] Bad content: ", v);
        console.error(ex);
    }
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


Icon.Icons = {
    close: ['g', [
        ['path', {
            d: 'M-40,-40L40,40M-40,40L40,-40',
            stroke: 0, strokeWidth: 40
        }],
        ['path', {
            d: 'M-40,-40L40,40M-40,40L40,-40',
            stroke: 1, strokeWidth: 24
        }]
    ]],
    ok: ['g', [
        ['path', {
            d: 'M-30,0L-10,30,30,-30',
            stroke: 0, strokeWidth: 30
        }],
        ['path', {
            d: 'M-30,0L-10,30,30,-30',
            stroke: 4, strokeWidth: 16
        }]
    ]],
    cancel: ['g', [
        ['path', {
            d: 'M-30,-30L30,30M-30,30L30,-30',
            stroke: 0, strokeWidth: 30
        }],
        ['path', {
            d: 'M-30,-30L30,30M-30,30L30,-30',
            stroke: 3, strokeWidth: 16
        }]
    ]],
    menu: ['g', [
        ['path', {
            d: 'M-40,-34h80M-40,0h80M-40,34h80',
            stroke: 0, strokeWidth: 40
        }],
        ['path', {
            d: 'M-40,-34h80M-40,0h80M-40,34h80',
            stroke: 1, strokeWidth: 24
        }]
    ]],
    left: ['g', [
        ['path', {
            d: 'M30,-30L-30,0,30,30',
            stroke: 0, strokeWidth: 40
        }],
        ['path', {
            d: 'M30,-30L-30,0,30,30',
            stroke: 1, strokeWidth: 24
        }]
    ]],
    right: ['g', [
        ['path', {
            d: 'M-30,-30L30,0,-30,30',
            stroke: 0, strokeWidth: 40
        }],
        ['path', {
            d: 'M-30,-30L30,0,-30,30',
            stroke: 1, strokeWidth: 24
        }]
    ]],
    up: ['g', [
        ['path', {
            d: 'M-30,30L0,-30,30,30',
            stroke: 0, strokeWidth: 40
        }],
        ['path', {
            d: 'M-30,30L0,-30,30,30',
            stroke: 1, strokeWidth: 24
        }]
    ]],
    down: ['g', [
        ['path', {
            d: 'M-30,-30L0,30,30,-30',
            stroke: 0, strokeWidth: 40
        }],
        ['path', {
            d: 'M-30,-30L0,30,30,-30',
            stroke: 1, strokeWidth: 24
        }]
    ]],
    'tri-left': ['g', [
        ['path', {
            d: 'M30,-30L-30,0,30,30Z',
            stroke: 0, fill: 1, strokeWidth: 8
        }]
    ]],
    'tri-right': ['g', [
        ['path', {
            d: 'M-30,-30L30,0,-30,30Z',
            stroke: 0, fill: 1, strokeWidth: 8
        }]
    ]],
    'tri-up': ['g', [
        ['path', {
            d: 'M-30,30L0,-30,30,30Z',
            stroke: 0, fill: 1, strokeWidth: 8
        }]
    ]],
    'tri-down': ['g', [
        ['path', {
            d: 'M-30,-30L0,30,30,-30Z',
            stroke: 0, fill: 1, strokeWidth: 8
        }]
    ]],
    wait: ['g', [
        ['path', {
            d: "M0,40 A40,40,0,1,1,40,0",
            stroke: 0, strokeWidth: 40
        }],
        ['path', {
            d: "M0,40 A40,40,0,1,1,40,0",
            stroke: 1, strokeWidth: 24
        }],
        ['animateTransform', {
            attributeName: "transform",
            begin: "0s",
            dur: "1s",
            type: "rotate",
            from: 0,
            to: 360,
            repeatCount: "indefinite"
        }]
    ]]
};

module.exports = Icon;
