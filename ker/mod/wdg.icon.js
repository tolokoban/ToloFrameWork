var $ = require("dom");
var DB = require("tfw.data-binding");

var Icon = function(opts) {
    var that = this;

    var mapColors = [];
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
    DB.prop(this, 'content')(setContent.bind( this, mapColors, g ));
    DB.prop(this, 'value');
    DB.propBoolean(this, 'rotate')(function(v) {
        if (v) {
            $.addClass( elem, "rotate" );
        } else {
            $.removeClass( elem, "rotate" );
        }
    });
    DB.propUnit(this, 'size')(function(v) {
        $.att(root, {
            width: v,
            height: v
        });
    });
    DB.prop(this, 'action');

    var updateColor = function( index, color ) {
        var children = mapColors[index];
        if( typeof children === 'undefined' ) return;
        children.fill.forEach(function (child) {
            $.att( child, "fill", that['color' + index] );
        });
        children.stroke.forEach(function (child) {
            $.att( child, "stroke", that['color' + index] );
        });
    };

    for (var i = 0; i < 6; i++) {
        DB.propColor(this, 'color' + i)(updateColor.bind( this, i ));
    }

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
        size: '2em',
        value: "icon",
        rotate: false,
        wide: false,
        visible: true
    }, opts, this);
};


/**
 * @return void
 */
Icon.prototype.fire = function() {
    DB.fire( this, 'action', this.value );
};


function setContent(mapColors, root, v) {
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
        addChild.call( this, mapColors, root, v );
    }
    catch (ex) {
        console.error("[wdg.icon:content] Bad content: ", v);
        console.error(ex);
    }
}


function addChild( mapColors, parent, child ) {
    if (!Array.isArray( child ) || child.length == 0) {
        console.error("[wdg.icon:content] `child` must be an array: ", child);
        console.error("parent = ", parent);
        return;
    }

    var node;
    child.forEach(function (itm, idx) {
        var key, val, att, color;
        if (idx == 0) {
            node = $.svg(itm);
            $.add( parent, node );
        } else {
            if (typeof itm === 'string') {
                $.addClass( node, itm );
            } else if (Array.isArray( itm )) {
                itm.forEach(function (subchild) {
                    addChild.call( this, mapColors, node, subchild );
                }, this);
            } else if (typeof itm === 'object') {
                for( key in itm ) {
                    val = itm[key];
                    if ((key == 'fill' || key == 'stroke') && typeof val === 'number') {
                        color = Math.floor( val ) % 6;
                        att = 'color' + color;
                        val = this[att];
                        if (typeof mapColors[color] === 'undefined') {
                            mapColors[color] = { fill: [], stroke: [] };
                        }
                        mapColors[color][key].push( node );
                    }
                    $.att( node, key, val );
                }
            }
        }
    }, this);
}

function draw(d) {
    return ['g', [
        ['path', { d: d, stroke: 0, 'stroke-width': 40 }],
        ['path', { d: d, stroke: 1, 'stroke-width': 24 }]
    ]];
}

Icon.Icons = {
    bug: ['path', {
        stroke: "none", fill: 0,
        d: "M14,12H10V10H14M14,16H10V14H14M20,8H17.19C16.74,7.22 16.12,6.55 15.37,6.04L17,4.41L15.59,3L13.42,5.17C12.96,5.06 12.5,5 12,5C11.5,5 11.04,5.06 10.59,5.17L8.41,3L7,4.41L8.62,6.04C7.88,6.55 7.26,7.22 6.81,8H4V10H6.09C6.04,10.33 6,10.66 6,11V12H4V14H6V15C6,15.34 6.04,15.67 6.09,16H4V18H6.81C7.85,19.79 9.78,21 12,21C14.22,21 16.15,19.79 17.19,18H20V16H17.91C17.96,15.67 18,15.34 18,15V14H20V12H18V11C18,10.66 17.96,10.33 17.91,10H20V8Z"
    }],
    question: ['path', {
        stroke: "none", fill: 0,
        d: "M10,19H13V22H10V19M12,2C17.35,2.22 19.68,7.62 16.5,11.67C15.67,12.67 14.33,13.33 13.67,14.17C13,15 13,16 13,17H10C10,15.33 10,13.92 10.67,12.92C11.33,11.92 12.67,11.33 13.5,10.67C15.92,8.43 15.32,5.26 12,5A3,3 0 0,0 9,8H6A6,6 0 0,1 12,2Z"
    }],
    improvement: ['path', {
        stroke: "none", fill: 0,
        d: "M12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22M12,7L7,12H10V16H14V12H17L12,7Z"
    }],
    ok: ['g', [
        ['path', {
            d: 'M-30,0L-10,30,30,-30',
            stroke: 0, 'stroke-width': 30
        }],
        ['path', {
            d: 'M-30,0L-10,30,30,-30',
            stroke: 4, 'stroke-width': 16
        }]
    ]],
    cancel: ['g', [
        ['path', {
            d: 'M-30,-30L30,30M-30,30L30,-30',
            stroke: 0, 'stroke-width': 30
        }],
        ['path', {
            d: 'M-30,-30L30,30M-30,30L30,-30',
            stroke: 3, 'stroke-width': 16
        }]
    ]],
    close: draw('M-40,-40L40,40M-40,40L40,-40'),
    menu: draw('M-40,-34h80M-40,0h80M-40,34h80'),
    left: draw('M30,-30L-30,0,30,30'),
    'left-double': draw('M-10,-30L-40,0,-10,30M40,-30L10,0,40,30'),
    right: draw('M-30,-30L30,0,-30,30'),
    'right-double': draw('M10,-30L40,0,10,30M-40,-30L-10,0,-40,30'),
    up: draw('M-30,30L0,-30,30,30'),
    'up-double': draw('M-30,40L0,10,30,40M-30,-10L0,-40,30,-10'),
    down: draw('M-30,-30L0,30,30,-30'),
    'down-double': draw('M-30,-40L0,-10,30,-40M-30,10L0,40,30,10'),
    fullscreen: ['g', [
        ['path', {
            d: 'M-20,-10h70v50h-70Z',
            stroke: 0, fill: 1, 'stroke-width': 8
        }],
        ['path', {
            d: 'M-40,-30h70v50h-70Z',
            stroke: 0, fill: 1, 'stroke-width': 8
        }]
    ]],
    'tri-left': ['g', [
        ['path', {
            d: 'M30,-30L-30,0,30,30Z',
            stroke: 0, fill: 1, 'stroke-width': 8
        }]
    ]],
    'tri-right': ['g', [
        ['path', {
            d: 'M-30,-30L30,0,-30,30Z',
            stroke: 0, fill: 1, 'stroke-width': 8
        }]
    ]],
    'tri-up': ['g', [
        ['path', {
            d: 'M-30,30L0,-30,30,30Z',
            stroke: 0, fill: 1, 'stroke-width': 8
        }]
    ]],
    'tri-down': ['g', [
        ['path', {
            d: 'M-30,-30L0,30,30,-30Z',
            stroke: 0, fill: 1, 'stroke-width': 8
        }]
    ]],
    plus: draw("M-45,0H45M0,-45V45"),
    minus: draw("M-45,0H45"),
    "plus-o": ["g", [
        ["circle", { r: 60, stroke: "none", fill: 0 }],
        ["circle", { r: 50, stroke: "none", fill: 1 }],
        ["path", { d: "M-30,0H30M0,-30V30", fill: "none", stroke: 0, "stroke-width": 16 }]
    ]],
    "minus-o": ["g", [
        ["circle", { r: 60, stroke: "none", fill: 0 }],
        ["circle", { r: 50, stroke: "none", fill: 1 }],
        ["path", { d: "M-30,0H30", fill: "none", stroke: 0, "stroke-width": 16 }]
    ]],
    "plus-small": draw("M-30,0H30M0,-30V30"),
    "minus-small": draw("M-30,0H30"),
    hand: draw("M-10,36v-80M10,46v-50M30,46v-50M45,31v-25M-40,16l40,30h30l15,-15"),
    location: ["g", {"stroke-linejoin": "miter"}, [
        ["path", {
            "fill": 1, "stroke": 0, "stroke-width": 8,
            "d": "M0,50L20,0c20,-20,10,-50,-20,-50c-30,0,-40,30,-20,50Z"
        }],
        ["circle", {
            "fill": 0, "stroke": "none", "r": 10, "cy": -20
        }]
    ]],
    "flag-jp": ["g", {stroke: "none"}, [
        ["path", {fill: "#000", d: "M-65,50h130v-100h-130z"}],
        ["path", {fill: "#fff", d: "M-60,45h120v-90h-120z"}],
        ["circle", {fill: "#bc002d", r: 24}]
    ]],
    "flag-fr": ["g", {stroke: "none"}, [
        ["path", {fill: "#000", d: "M-65,50h130v-100h-130z"}],
        ["path", {fill: "#002395", d: "M-60,45h40v-90h-40z"}],
        ["path", {fill: "#fff", d: "M-20,45h40v-90h-40z"}],
        ["path", {fill: "#ed2939", d: "M20,45h40v-90h-40z"}]
    ]],
    "flag-it": ["g", {stroke: "none"}, [
        ["path", {fill: "#000", d: "M-65,50h130v-100h-130z"}],
        ["path", {fill: "#009246", d: "M-60,45h40v-90h-40z"}],
        ["path", {fill: "#fff", d: "M-20,45h40v-90h-40z"}],
        ["path", {fill: "#ce2b37", d: "M20,45h40v-90h-40z"}]
    ]],
    "flag-de": ["g", {stroke: "none"}, [
        ["path", {fill: "#000", d: "M-65,41h130v-82h-130z"}],
        ["path", {fill: "#ffce00", d: "M-60,36h120v-24h-120z"}],
        ["path", {fill: "#dd0000", d: "M-60,12h120v-24h-120z"}]
    ]],
    "flag-en": ["g", {stroke: "none"}, [
        ["path", {fill: "#000", d: "M-65,37h130v-75h-130z"}],
        ["path", {fill: "#bb133e", d: "M-60,32h120v-65h-120z"}],
        ["path", {fill: "#fff", d: "M-60,22h120v5h-120z"}],
        ["path", {fill: "#fff", d: "M-60,12h120v5h-120z"}],
        ["path", {fill: "#fff", d: "M-60,2h120v5h-120z"}],
        ["path", {fill: "#fff", d: "M-60,-8h120v5h-120z"}],
        ["path", {fill: "#fff", d: "M-60,-18h120v5h-120z"}],
        ["path", {fill: "#fff", d: "M-60,-28h120v5h-120z"}],
        ["path", {fill: "#002664", d: "M-60,-33h48v35h-48z"}],

    ]],
    heart: ["g", [
        ["path", {
            "d": "M0,-20c0,-30,40,-30,40,0c0,40,-40,40,-40,60c0,-20,-40,-20,-40,-60c0,-30,40,-30,40,0",
            "stroke-width": 8,
            "fill": 1,
            "stroke": 0
        }]
    ]],
    "heart-anim": ["g", [
        ["path", {
            "d": "M0,-20c0,-30,40,-30,40,0c0,40,-40,40,-40,60c0,-20,-40,-20,-40,-60c0,-30,40,-30,40,0",
            "stroke-width": 8,
            "fill": 1,
            "stroke": 0
        }],
        ['animateTransform', {
            attributeName: "transform",
            begin: "0s",
            dur: "2s",
            type: "scale",
            values: "1;1;1;1;1;1.3;.8;1.3;1",
            repeatCount: "indefinite"
        }]
    ]],
    star: ["g", [
        ["path", {
            "d": "M0,-60L18,-24L57,-19L29,9L35,49L0,30L-35,49L-29,9L-57,-19L-18,-24Z",
            "stroke-width": 8, "fill": 1, "stroke": 0
        }]
    ]],
    edit: ["g", [
        ["path", {
            "d": "M-50,50h70v-90h-70Z",
            "fill": 1, "stroke": 0, "stroke-width":8
        }],
        ["path", {
            "d": "M50,-50L-20,20",
            "fill": "none", "stroke": 0, "stroke-width": 28
        }],
        ["path", {
            "stroke-linecap": "miter", "fill": "none",
            "d": "M50,-50L0,0",
            "stroke": 1, "stroke-width": 12
        }],
        ["path", {
            "fill": 1, "stroke": "none",
            "d": "M-25,25l20,-10,-10,-10Z"
        }]
    ]],
    gear: ["path", {
        "d": "M0,-60L12,-59Q8,-18,35,-49L45,-40L52,-30L57,-19Q20,-2,60,6L57,19L52,30L45,40Q12,16,24,55L12,59L0,60L-12,59Q-8,18,-35,49L-45,40L-52,30L-57,19Q-20,2,-60,-6L-57,-19L-52,-30L-45,-40Q-12,-16,-24,-55L-12,-59L0,-60M20,0A15,15,0,1,0,-20,0M-20,0A15,15,0,1,0,20,0",
        "stroke-width": 8, "fill": 1, "stroke": 0
    }],
    user: ["g", [
        ["path", {
            "d": "M-50,0l30,50h40l30,-50c0,-30,-100,-30,-100,0",
            "fill": 1, "stroke": 0, "stroke-width":8
        }],
        ["circle", { "r": 27, "cy": -30, "fill": 1, "stroke": 0, "stroke-width":8 }]
    ]],
    wait: ['g', {transform: "rotate(0)"}, [
        ['path', {
            d: "M0,40 A40,40,0,1,1,40,0",
            stroke: 0, 'stroke-width': 40
        }],
        ['path', {
            d: "M0,40 A40,40,0,1,1,40,0",
            stroke: 1, 'stroke-width': 24
        }]
    ]]
};

module.exports = Icon;


var x =
        ["g", [
            ["path", {
                "d": "M-50,50h60v-90h-60Z",
                "fill": 1, "stroke": 0, "stroke-width":8
            }],
            ["path", {
                "d": "M50,-50L-20,20",
                "fill": "none", "stroke": 0, "stroke-width": 28
            }],

            ["path", {
                "stroke-linecap": "miter", "fill": "none",
                "d": "M50,-50L-20,20",
                "stroke": 0, "stroke-width": 12
            }]

        ]]
;
