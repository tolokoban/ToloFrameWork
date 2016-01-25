var timer = 0;

exports.start = function() {
    timer = Date.now();
};


/**
 * @return {number} Number of second since the last call of `start()`or `stop()`.
 */
exports.stop = function() {
    var now = Date.now();
    var elapsed = now - timer;
    timer = now;
    return elapsed / 1000;
};
