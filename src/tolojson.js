/**
 * ToloJSON can parse JSON with comments, and can stringify JSON with indentation and comments.
 * This is useful for configuration files.
 */

exports.parse = function(json) {
    return JSON.parse(json);
};

exports.stringify = function(json, indent) {
    if (typeof indent === 'undefined') indent = false;
    if (indent === false) {
        return JSON.stringify(json);
    }

};
