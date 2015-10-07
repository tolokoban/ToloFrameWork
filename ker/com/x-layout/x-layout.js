/**
 * Component x-layout
 *
 * Absolute CSS positionning using `calc()`.
 * Example:
 * ```
 * <x-layout orientation='wide'>
 *   <x-layout-fill>
 *     <img src="background.png"/>
 *   </x-layout-fill>
 *   <div cell-ratio='3/4'>Hello world</div>
 *   <layout-horizontal>
 *     <button>Backward</button>
 *     <div cell-weight='2'>Title</div>
 *     <button>Foreward</button>
 *   </layout-horizontal>
 * </x-layout>
 * ```
 */


/**
 * @return {string} Next ID to be used as a CSS classname.
 */
var nextId = (function() {
    var id = -1;
    return function() {
        id++;
        return 'x-layout-' + id;
    };
})();


exports.tags = ["x-layout"];
exports.priority = 0;

/**
 * Called the  first time the  component is  used in the  complete build
 * process.
 */
exports.initialize = function(libs) {};

/**
 * Called after the complete build process is over (success or failure).
 */
exports.terminate = function(libs) {};

/**
 * Called the first time the component is used in a specific HTML file.
 */
exports.open = function(file, libs) {};

/**
 * Called after a specific HTML file  as been processed. And called only
 * if the component has been used in this HTML file.
 */
exports.close = function(file, libs) {};

/**
 * Compile a node of the HTML tree.
 */
exports.compile = function(root, libs) {
    // `N` is just a shortcut for `libs.Tree`.
    var N = libs.Tree;
    // Children have to be compiled first becvause they can create new cells.
    libs.compileChildren(root);
    // Final cells.
    // Elements are objects with three attributes:
    // * __node__: final TAG.
    // * __portrait__: CSS for the _portrait_ mode.
    // * __landspace__: CSS for the _landscape_ mode.
    var cells = [];
    // Look for orientation. Possible values are :
    // `horizontal`,  `vertical`,  `wide` (`horizontal`  in  landscape
    // mode and  `vertical`otherwise) and `narrow` (opposite  value of
    // `wide`).
    var orientation = root.attribs.orientation || `wide`;
    // Four functions can be called depending on `orientation`.
    var fun;
    switch (orientation.trim().toLowerCase()) {
    case 'horizontal': fun = horizontal; break;
    case 'vertical':   fun = vertical;   break;
    case 'wide':       fun = wide;       break;
    case 'narrow':     fun = narrow;     break;
    default:
        libs.fatal(
            '[x-layout] Allowed values for attribute `orientation` are "wide", "narrow", "horizontal" and "vertical". But not "' 
                + orientation + '"!\nDefault value is "wide".'
);
    }
    fun(libs, root.chldren, cells, {
        portrait:  { left: 0, top: 0, width: '100vw', height: '100vh' },
        landscape: { left: 0, top: 0, width: '100vw', height: '100vh' }
    });
    
};


function horizontal(libs, nodes, cells, dims) {
    var children = parseChildren(libs, nodes);
    var sizes = {
        portrait:  computeFixedSize(children, dims.portrait.height ),
        landscape: computeFixedSize(children, dims.landscape.height)
    };
    ['portrait', 'landscape'].forEach(function (orientation) {
        
    });

}


function vertical(libs, nodes, cells, dims) {
}


function wide(libs, nodes, cells, dims) {
}


function narrow(libs, nodes, cells, dims) {
}


/**
 * 
 */
function computeFixedSize(nodes, referenceSize) {
    var fixedSize = "";

    nodes.forEach(function (node) {
        var ratio = node.attribs['cell-ratio'];
        if (typeof ratio === 'undefined') return;
        var size = referenceSize + '*' + ratio;
        if (fixedSize != '') fixedSize += '+';
        fixedSize += size;
        node.size = size;
    });

    return fixedSize;
}

/**
 * @return `{totalWeight: ..., nodes: [...]}`
 */
function parseChildren(libs, nodes) {
    var totalWeight = 0;
    var children = [];
    nodes.forEach(function (node) {
        if (node.type != libs.Tree.TAG) return;
        children.push(node);
        if (node.name.toLowerCase() == 'x-layout-fill') {
            // A weight of zero means that the cell must fill the whole parent.
            node.weight = 0;
            return;
        }
        // Weight   are  used   to  give   relatives  sizes   to  each
        // cell. Default weight is __1__.
        var weight = parseInt(node.attribs["cell-weight"] || 1);
        if (isNaN(weight)) {
            libs.fatal('Attribute `cell-weight` must be a number, but not "' 
                       + node.attribs["cell-weight"] + '"!');
        }
        // Ratio is the _width_ divided by the _height_.
        // For a square, `ratio=1`.
        // If you specify a `ratio`, you can't specify a `weight`.
        var ratio = node.attribs['cell-ratio'];
        if (typeof ratio === 'string') {
            if (typeof node.attribs["cell-weight"] !== 'undefined') {
                libs.fatal("Attributes `cell-weight` and `cell-ratio` are exclusives!");
            }
            node.ratio = ratio.trim();            
        } else {
            totalWeight += weight;
            node.weight = weight;
        }
    });

    return {totalWeight: totalWeight, nodes: children};
}
