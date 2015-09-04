exports.fire = function(msg, id, src) {
    msg = "" + msg;
    var ex = Error(msg);
    ex.fatal = msg;
    ex.id = id;
    ex.src = [src];
    throw ex;    
};

exports.bubble = function (ex, src) {
    if (typeof src !== 'undefined') {
        if (!ex.src) {
            ex.src = [];
        }
        ex.src.push(src);
    }
    throw ex;
};
