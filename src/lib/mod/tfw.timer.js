require("tfw.promise");

exports.later = function(delay) {
    if (typeof delay === 'undefined') delay = 1;
    return new Promise(
        function(resolve, reject) {
            window.setTimeout(resolve, delay);
        }
    );
};
