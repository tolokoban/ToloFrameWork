/**
 * Component x-loop
 */

exports.tags = ["x-loop"];
exports.priority = 0;

/**
 * Called the  first time the  component is  used in the  complete build
 * process.
 */
exports.initialize = function(libs) {};

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
debugger;
    var N = libs.Tree,
    children = [],
    vars = [],
    sep = ';',
    seed = JSON.stringify(root.children),
    current;
    N.forEachAttrib(root, function (key, val) {
        if (key == 'sep') {
            sep = val;
        }
        else if (key.substr(0, 1) == '$') {
            var variable = {name: key.substr(1), index: 0, tmp: val};
            vars.push(variable);
        }
        else {
            libs.fatal("Unknown attribute in tag \"" + root.name + "\": \"" + key + "\"!");
        }
    });
    vars.forEach(function (variable) {
        variable.values = [];
        variable.tmp.split(sep).forEach(function (v) {
            variable.values.push(v);
        });
        delete variable.tmp;
    });
    if (vars.length == 0) {
        libs.fatal("<x-loop> needs at least one variable!\nVariables are attributes starting with a '$'.");
    }
    vars[vars.length - 1].index = -1;
    
    while (next(vars)) {
        // Setting all variables in current scope.
        vars.forEach(function (variable) {
            libs.setVar(variable.name, variable.values[variable.index]);
        });
        // Adding a new child from the seed.
        current = JSON.parse(seed);
        current.forEach(function (child) {
            libs.compile(child);
        });
        children.push({children: current});
    }

    delete root.attribs;
    delete root.name;
    root.type = N.VOID;
    root.children = children;
};


function next(vars) {
    var cursor = vars.length - 1;
    vars[cursor].index++;
    while (cursor > 0) {
        if (vars[cursor].index < vars[cursor].values.length) return true;
        vars[cursor].index = 0;
        cursor--;
        vars[cursor].index++;
    }
    if (vars[cursor].index < vars[cursor].values.length) return true;
    return false;
}
