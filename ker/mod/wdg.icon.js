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
        $.css(root, {
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

function path2(d) {
    return ['g', [
        ['path', { d: d, stroke: 0, fill: 'none', 'stroke-width': 16 }],
        ['path', { d: d, stroke: 'none', fill: 1 }]
    ]];
};

Icon.Icons = {
    bug: path2("M10,0H-10V-10H10M10,20H-10V10H10M40,-20H26C24,-24 21,-27 17,-30L25,-38L18,-45L7,-34C5,-35 3,-35 0,-35C-2,-35 -5,-35 -7,-34L-18,-45L-25,-38L-17,-30C-21,-27 -24,-24 -26,-20H-40V-10H-30C-30,-8 -30,-7 -30,-5V0H-40V10H-30V15C-30,17 -30,18 -30,20H-40V30H-26C-21,39 -11,45 0,45C11,45 21,39 26,30H40V20H30C30,18 30,17 30,15V10H40V0H30V-5C30,-7 30,-8 30,-10H40V-20Z"),
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
    down: draw('M-30,-30L0,30,30,-30'),
    'down-double': draw('M-30,-40L0,-10,30,-40M-30,10L0,40,30,10'),
    edit: path2("M24,-46C22,-46,20,-46,19,-44L8,-34L35,-7L45,-17C48,-21,48,-25,45,-28L29,-44C28,-46,26,-46,24,-46M5,-30L-36,11L-23,12L-22,23L-11,24L-9,37L31,-3M-39,15L-47,49L-14,40L-15,29L-27,28L-28,16"),
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
    'format-align-center': path2('M-45,-45H45V-35H-45V-45M-25,-25H25V-15H-25V-25M-45,-5H45V5H-45V-5M-25,15H25V25H-25V15M-45,35H45V45H-45V35Z'),
    'format-align-justify': path2('M-45,-45H45V-35H-45V-45M-45,-25H45V-15H-45V-25M-45,-5H45V5H-45V-5M-45,15H45V25H-45V15M-45,35H45V45H-45V35Z'),
    'format-align-left': path2('M-45,-45H45V-35H-45V-45M-45,-25H15V-15H-45V-25M-45,-5H45V5H-45V-5M-45,15H15V25H-45V15M-45,35H45V45H-45V35Z'),
    'format-align-right': path2(' M-45,-45H45V-35H-45V-45M-15,-25H45V-15H-15V-25M-45,-5H45V5H-45V-5M-15,15H45V25H-15V15M-45,35H45V45H-45V35Z '),
    'format-bold': path2('M8,18H-10V3H8A8,8,0,0,1,15,10A8,8,0,0,1,8,18M-10,-27H5A8,8,0,0,1,13,-20A8,8,0,0,1,5,-12H-10M18,-6C23,-9,26,-15,26,-20C26,-31,18,-40,6,-40H-25V30H10C21,30,29,22,29,11C29,3,24,-3,18,-6Z'),
    'format-italic': path2('M-10,-40V-25H1L-16,15H-30V30H10V15H-1L16,-25H30V-40H-10Z'),
    'format-underline': path2('M-35,45H35V35H-35V45M0,25A30,30,0,0,0,30,-5V-45H18V-5A18,18,0,0,1,0,13A18,18,0,0,1,-17,-5V-45H-30V-5A30,30,0,0,0,0,25Z'),
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
    gear: ["path", {
        "d": "M0,-60L12,-59Q8,-18,35,-49L45,-40L52,-30L57,-19Q20,-2,60,6L57,19L52,30L45,40Q12,16,24,55L12,59L0,60L-12,59Q-8,18,-35,49L-45,40L-52,30L-57,19Q-20,2,-60,-6L-57,-19L-52,-30L-45,-40Q-12,-16,-24,-55L-12,-59L0,-60M20,0A15,15,0,1,0,-20,0M-20,0A15,15,0,1,0,20,0",
        "stroke-width": 8, "fill": 1, "stroke": 0
    }],
    hand: path2("M-10,-50A10,10,0,0,1,0,-40V-17C0,-17,10,-19,10,-14C10,-14,20,-15,20,-10C20,-10,30,-11,30,-6C30,-6,40,-7,40,-2V15C40,20,25,45,25,50H-15C-15,50,-25,15,-40,5C-40,5,-45,-25,-20,0V-40A10,10,0,0,1,-10,-50Z"),
    heart: ["g", [
        ["path", {
            "d": "M0,-20c0,-30,40,-30,40,0c0,40,-40,40,-40,60c0,-20,-40,-20,-40,-60c0,-30,40,-30,40,0",
            "stroke-width": 8,
            "fill": 1,
            "stroke": 0
        }]
    ]],
    improvement: path2("M0,50A50,50,0,0,1,-50,0A50,50,0,0,1,0,-50A50,50,0,0,1,50,0A50,50,0,0,1,0,50M0,-25L-25,0H-10V20H10V0H25L0,-25Z"),
    left: draw('M30,-30L-30,0,30,30'),
    'left-double': draw('M-10,-30L-40,0,-10,30M40,-30L10,0,40,30'),
    location: ["g", {"stroke-linejoin": "miter"}, [
        ["path", {
            "fill": 1, "stroke": 0, "stroke-width": 8,
            "d": "M0,50L20,0c20,-20,10,-50,-20,-50c-30,0,-40,30,-20,50Z"
        }],
        ["circle", {
            "fill": 0, "stroke": "none", "r": 10, "cy": -20
        }]
    ]],
    logout: path2("M25,26V10H-10V-10H25V-26L51,0L25,26M5,-50A10,10,0,0,1,15,-40V-20H5V-40H-40V40H5V20H15V40A10,10,0,0,1,5,50H-40A10,10,0,0,1,-50,40V-40A10,10,0,0,1,-40,-50H5Z"),
    menu: draw('M-40,-34h80M-40,0h80M-40,34h80'),
    minus: draw("M-45,0H45"),
    "minus-o": ["g", [
        ["circle", { r: 60, stroke: "none", fill: 0 }],
        ["circle", { r: 50, stroke: "none", fill: 1 }],
        ["path", { d: "M-30,0H30", fill: "none", stroke: 0, "stroke-width": 16 }]
    ]],
    "minus-small": draw("M-30,0H30"),
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
    plus: draw("M-45,0H45M0,-45V45"),
    "plus-o": ["g", [
        ["circle", { r: 60, stroke: "none", fill: 0 }],
        ["circle", { r: 50, stroke: "none", fill: 1 }],
        ["path", { d: "M-30,0H30M0,-30V30", fill: "none", stroke: 0, "stroke-width": 16 }]
    ]],
    "plus-small": draw("M-30,0H30M0,-30V30"),
    question: path2("M-10,35H5V50H-10V35M0,-50C27,-49,38,-22,23,-2C18,3,12,7,8,11C5,15,5,20,5,25H-10C-10,17,-10,10,-7,5C-3,0,3,-3,8,-7C20,-18,17,-34,0,-35A15,15,0,0,0,-15,-20H-30A30,30,0,0,1,0,-50Z"),
    right: draw('M-30,-30L30,0,-30,30'),
    'right-double': draw('M10,-30L40,0,10,30M-40,-30L-10,0,-40,30'),
    star: ["g", [
        ["path", {
            "d": "M0,-60L18,-24L57,-19L29,9L35,49L0,30L-35,49L-29,9L-57,-19L-18,-24Z",
            "stroke-width": 8, "fill": 1, "stroke": 0
        }]
    ]],
    'tri-down': ['g', [
        ['path', {
            d: 'M-30,-30L0,30,30,-30Z',
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
    up: draw('M-30,30L0,-30,30,30'),
    'up-double': draw('M-30,40L0,10,30,40M-30,-10L0,-40,30,-10'),
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
