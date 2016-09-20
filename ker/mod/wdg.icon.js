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
    var svg = $.svgRoot({
        width: '100%',
        height: '100%',
        viewBox: '-65 -65 130 130',
        preserveAspectRatio: "xMidYMid meet"
    });
    var root = $.div('wdg-icon', [svg]);
    var elem = $.elem(this, root);
    $.add( svg, g );
    DB.prop(this, 'content')(setContent.bind( this, mapColors, g ));
    DB.prop(this, 'value');
    DB.propBoolean(this, 'rotate')(function(v) {
        if (v) {
            $.addClass( svg, "rotate" );
        } else {
            $.removeClass( svg, "rotate" );
        }
    });
    DB.propBoolean(this, 'button')(function(v) {
        if (v) {
            $.addClass( elem, 'theme-elevation-8');
            $.removeClass( elem, 'flat');
            $.css( elem, {
                padding: 'calc(0.25 * ' + that.size + ') 0 0 0',
                width: "calc(1.5 * " + that.size + ")",
                height: "calc(1.5 * " + that.size + ")",
                'line-height': that.size
            });
            $.css(svg, {
                'line-height': v
            });
            //that.size = '2rem';
            $.on( elem, {
                down: function(evt) {
                    if (that.button) {
                        $.addClass(elem, 'theme-elevation-12');
                        evt.stopPropagation();
                        evt.preventDefault();
                    }
                },
                up: function() {
                    $.removeClass(elem, 'theme-elevation-12');
                },
                tap: function() {
                    DB.fire( that, 'action', that.value );
                }
            });
        } else {
            $.removeClass( elem, 'theme-elevation-8');
            $.addClass( elem, 'flat');
            $.css( elem, {
                padding: 0
            });
            $.off( elem );
        }
    });
    DB.propUnit(this, 'size')(function(v) {
        $.css(svg, {
            width: v,
            height: v,
            'line-height': v
        });
    });
    DB.prop(this, 'action');
    DB.propAddClass(this, 'wide');
    DB.propRemoveClass(this, 'visible', 'hide');
    DB.propToggleClass(this, 'type', {
        default: "theme-color-bg-B0",
        accent: "theme-color-bg-A5"
    });
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
        type: 'default',
        angle: 0,
        size: '2rem',
        button: false,
        value: "icon",
        rotate: false,
        wide: false,
        visible: true
    }, opts, this);
};

/**
 * @class Icon
 * @function on
 * @param {function} slot - Function to call when `action` has changed.
 */
Icon.prototype.on = function(slot) {
    return DB.bind( this, 'action', slot );
};

/**
 * @return void
 */
Icon.prototype.fire = function() {
    DB.fire( this, 'action', this.value );
};


function setContent(mapColors, svg, v) {
    $.clear( svg );
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
                return;
            }
        }
    }
    if (!Array.isArray( v )) {
        console.error("[wdg.icon:content] Value must be an array: ", v);
        return;
    }

    try {
        addChild.call( this, mapColors, svg, v );
    }
    catch (ex) {
        console.error("[wdg.icon:content] Bad content: ", v);
        console.error(ex);
    }
}


function addChild( mapColors, parent, child ) {
    if (typeof child === 'string') {
        var textNode = window.document.createTextNode( child );
        parent.appendChild( textNode );
        return;
    }
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
    android:  path2('M15,-35H10V-40H15M-10,-35H-15V-40H-10M18,-49L24,-56C25,-57,25,-58,24,-59C23,-60,22,-60,21,-59L13,-52C9,-54,5,-55,0,-55C-5,-55,-9,-54,-13,-52L-21,-59C-22,-60,-23,-60,-24,-59C-25,-58,-25,-57,-24,-56L-18,-49C-25,-44,-30,-35,-30,-25H30C30,-35,25,-44,18,-49M43,-20A8,8,0,0,0,35,-12V23A8,8,0,0,0,43,30A8,8,0,0,0,50,23V-12A8,8,0,0,0,43,-20M-42,-20A8,8,0,0,0,-50,-12V23A8,8,0,0,0,-42,30A8,8,0,0,0,-35,23V-12A8,8,0,0,0,-42,-20M-30,30A5,5,0,0,0,-25,35H-20V53A8,8,0,0,0,-12,60A8,8,0,0,0,-5,53V35H5V53A8,8,0,0,0,13,60A8,8,0,0,0,20,53V35H25A5,5,0,0,0,30,30V-20H-30V30Z'),
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
    center: path2('M0,-15A15,15,0,0,0,-15,0A15,15,0,0,0,0,15A15,15,0,0,0,15,0A15,15,0,0,0,0,-15M35,35H15V45H35A10,10,0,0,0,45,35V15H35M35,-45H15V-35H35V-15H45V-35A10,10,0,0,0,35,-45M-35,-35H-15V-45H-35A10,10,0,0,0,-45,-35V-15H-35M-35,15H-45V35A10,10,0,0,0,-35,45H-15V35H-35V15Z'),
    close: draw('M-40,-40L40,40M-40,40L40,-40'),
    code: path2('M13,23L36,0L13,-23L20,-30L50,0L20,30L13,23M-13,23L-36,0L-13,-23L-20,-30L-50,0L-20,30L-13,23Z'),
    delete: path2('M35,-40H18L13,-45H-12L-17,-40H-35V-30H35M-30,35A10,10,0,0,0,-20,45H20A10,10,0,0,0,30,35V-25H-30V35Z'),
    down: draw('M-30,-30L0,30,30,-30'),
    'down-double': draw('M-30,-40L0,-10,30,-40M-30,10L0,40,30,10'),
    edit: path2("M24,-46C22,-46,20,-46,19,-44L8,-34L35,-7L45,-17C48,-21,48,-25,45,-28L29,-44C28,-46,26,-46,24,-46M5,-30L-36,11L-23,12L-22,23L-11,24L-9,37L31,-3M-39,15L-47,49L-14,40L-15,29L-27,28L-28,16"),
    'export': path2('M-35,40H35V30H-35M35,-15H15V-45H-15V-15H-35L0,20L35,-15Z'),
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
    gear: path2('M0,18A18,18,0,0,1,-17,0A18,18,0,0,1,0,-17A18,18,0,0,1,18,0A18,18,0,0,1,0,18M37,5C37,3,38,2,38,0C38,-2,37,-3,37,-5L48,-13C49,-14,49,-15,48,-16L38,-34C38,-35,36,-35,35,-35L23,-30C20,-32,18,-33,14,-35L13,-48C12,-49,11,-50,10,-50H-10C-11,-50,-12,-49,-12,-48L-14,-35C-17,-33,-20,-32,-23,-30L-35,-35C-36,-35,-38,-35,-38,-34L-48,-16C-49,-15,-49,-14,-48,-13L-37,-5C-37,-3,-37,-2,-37,0C-37,2,-37,3,-37,5L-48,13C-49,14,-49,15,-48,16L-38,34C-38,35,-36,35,-35,35L-23,30C-20,32,-17,33,-14,35L-12,48C-12,49,-11,50,-10,50H10C11,50,12,49,13,48L14,35C18,33,20,32,23,30L35,35C36,35,38,35,38,34L48,16C49,15,49,14,48,13L37,5Z'),
    gps: path2('M0,-20A20,20,0,0,1,20,0A20,20,0,0,1,0,20A20,20,0,0,1,-20,0A20,20,0,0,1,0,-20M-45,5H-55V-5H-45C-42,-26,-26,-42,-5,-45V-55H5V-45C26,-42,43,-26,45,-5H55V5H45C43,26,26,43,5,45V55H-5V45C-26,43,-42,26,-45,5M0,-35A35,35,0,0,0,-35,0A35,35,0,0,0,0,35A35,35,0,0,0,35,0A35,35,0,0,0,0,-35Z'),
    hand: path2("M-10,-50A10,10,0,0,1,0,-40V-17C0,-17,10,-19,10,-14C10,-14,20,-15,20,-10C20,-10,30,-11,30,-6C30,-6,40,-7,40,-2V15C40,20,25,45,25,50H-15C-15,50,-25,15,-40,5C-40,5,-45,-25,-20,0V-40A10,10,0,0,1,-10,-50Z"),
    heart: ["g", [
        ["path", {
            "d": "M0,-20c0,-30,40,-30,40,0c0,40,-40,40,-40,60c0,-20,-40,-20,-40,-60c0,-30,40,-30,40,0",
            "stroke-width": 8,
            "fill": 1,
            "stroke": 0
        }]
    ]],
    hide: path2('M-1,-15L15,1C15,1,15,0,15,0A15,15,0,0,0,0,-15C0,-15,-1,-15,-1,-15M-22,-11L-15,-3C-15,-2,-15,-1,-15,0A15,15,0,0,0,0,15C1,15,2,15,3,15L11,22C8,24,4,25,0,25A25,25,0,0,1,-25,0C-25,-4,-24,-8,-22,-11M-50,-39L-39,-27L-36,-25C-45,-18,-51,-10,-55,0C-46,22,-25,38,0,38C8,38,15,36,22,33L24,35L39,50L45,44L-44,-45M0,-25A25,25,0,0,1,25,0C25,3,24,6,23,9L38,24C45,18,51,9,55,0C46,-22,25,-37,0,-37C-7,-37,-14,-36,-20,-34L-9,-23C-6,-24,-3,-25,0,-25Z'),
    home: path2('M-10,40V10H10V40H35V0H50L0,-45L-50,0H-35V40H-10Z'),
    import: path2('M-15,20V-10H-35L0,-45L35,-10H15V20H-15M-35,40V30H35V40H-35Z'),
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
    mail: path2('M40,-40H-40A10,10,0,0,0,-50,-30V30A10,10,0,0,0,-40,40H40A10,10,0,0,0,50,30V-30A10,10,0,0,0,40,-40M40,30H-40V-20L0,5L40,-20V30M40,-30L0,-5L-40,-30V-30H40V-30Z'),
    "map-layer": path2('M0,20L37,-9L45,-15L0,-50L-45,-15L-37,-9M0,33L-37,4L-45,10L0,45L45,10L37,4L0,33Z'),
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
    print: ['path', {fill: 0, d: 'M30,-45H-30V-25H30M35,0A5,5,0,0,1,30,-5A5,5,0,0,1,35,-10A5,5,0,0,1,40,-5A5,5,0,0,1,35,0M20,35H-20V10H20M35,-20H-35A15,15,0,0,0,-50,-5V25H-30V45H30V25H50V-5A15,15,0,0,0,35,-20Z'}],
    question: path2("M-10,35H5V50H-10V35M0,-50C27,-49,38,-22,23,-2C18,3,12,7,8,11C5,15,5,20,5,25H-10C-10,17,-10,10,-7,5C-3,0,3,-3,8,-7C20,-18,17,-34,0,-35A15,15,0,0,0,-15,-20H-30A30,30,0,0,1,0,-50Z"),
    right: draw('M-30,-30L30,0,-30,30'),
    'right-double': draw('M10,-30L40,0,10,30M-40,-30L-10,0,-40,30'),
    search: path2('M-12,-45A33,33,0,0,1,20,-12C20,-4,17,3,12,9L14,10H18L43,35L35,43L10,18V14L9,12C3,17,-4,20,-12,20A33,33,0,0,1,-45,-12A33,33,0,0,1,-12,-45M-12,-35C-25,-35,-35,-25,-35,-12C-35,0,-25,10,-12,10C0,10,10,0,10,-12C10,-25,0,-35,-12,-35Z'),
    share: path2('M30,20C26,20,23,22,20,24L-15,3C-15,2,-15,1,-15,0C-15,-1,-15,-2,-15,-3L20,-24C23,-22,26,-20,30,-20A15,15,0,0,0,45,-35A15,15,0,0,0,30,-50A15,15,0,0,0,15,-35C15,-34,15,-33,15,-31L-20,-11C-22,-13,-26,-15,-30,-15A15,15,0,0,0,-45,0A15,15,0,0,0,-30,15C-26,15,-22,13,-20,11L16,32C16,33,15,34,15,35C15,43,22,50,30,50C38,50,45,43,45,35A15,15,0,0,0,30,20Z'),
    show: path2('M0,-15A15,15,0,0,0,-15,0A15,15,0,0,0,0,15A15,15,0,0,0,15,0A15,15,0,0,0,0,-15M0,25A25,25,0,0,1,-25,0A25,25,0,0,1,0,-25A25,25,0,0,1,25,0A25,25,0,0,1,0,25M0,-37C-25,-37,-46,-22,-55,0C-46,22,-25,38,0,38C25,38,46,22,55,0C46,-22,25,-37,0,-37Z'),
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
    user: path2('M0,-40A20,20,0,0,1,20,-20A20,20,0,0,1,0,0A20,20,0,0,1,-20,-20A20,20,0,0,1,0,-40M0,10C22,10,40,19,40,30V40H-40V30C-40,19,-22,10,0,10Z'),
    wait: ['g', [
        ['path', {
            d: "M0,40 A40,40,0,1,1,40,0",
            stroke: 0, 'stroke-width': 40
        }],
        ['path', {
            d: "M0,40 A40,40,0,1,1,40,0",
            stroke: 1, 'stroke-width': 24
        }]
    ]],
    "zoom-in": ["g", [
        path2('M-12,-45A33,33,0,0,1,20,-12C20,-4,17,3,12,9L14,10H18L43,35L35,43L10,18V14L9,12C3,17,-4,20,-12,20A33,33,0,0,1,-45,-12A33,33,0,0,1,-12,-45M-12,-35C-25,-35,-35,-25,-35,-12C-35,0,-25,10,-12,10C0,10,10,0,10,-12C10,-25,0,-35,-12,-35Z'),
        path2('M-50,42h10v-10h4v10h10v4h-10v10h-4v-10h-10Z')
    ]],
    "zoom-out": ["g", [
        path2('M-12,-45A33,33,0,0,1,20,-12C20,-4,17,3,12,9L14,10H18L43,35L35,43L10,18V14L9,12C3,17,-4,20,-12,20A33,33,0,0,1,-45,-12A33,33,0,0,1,-12,-45M-12,-35C-25,-35,-35,-25,-35,-12C-35,0,-25,10,-12,10C0,10,10,0,10,-12C10,-25,0,-35,-12,-35Z'),
        path2('M-50,42h24v4h-32Z')
    ]]
};

// Synonyms.
Icon.Icons.add = Icon.Icons.plus;
Icon.Icons.back = Icon.Icons.left;
Icon.Icons.help = Icon.Icons.question;


Icon.draw = draw;
Icon.path2 = path2;

/**
 * You can register more icons with this function.
 */
Icon.register = function( icons ) {
    var key, val;
    for( key in icons ) {
        val = icons[key];
        Icon.Icons[key] = val;
    }

};


module.exports = Icon;
