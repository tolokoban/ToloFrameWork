require("tfw.promise");

exports.later = function(delay) {
    if (typeof delay === 'undefined') delay = 1;
    return new Promise(
        function(resolve, reject) {
            window.setTimeout(resolve, delay);
        }
    );
};


/**
 * @param action Promise to start after delay.
 * @param delay Milliseconds.
 */
var Action = function(action, delay) {
    if (typeof delay !== 'number') delay = 300;
    if (delay < 0) delay = 0;
    var that = this;
    this.enabled = true;
    this.waiting = false;
    this.action = action;
    this.delay = delay;
    this.timer = 0;
};

/**
 * @return void
 */
Action.prototype.fire = function() {
    var that = this;
    if (this.timer) {
        window.clearTimeout(this.timer);
    }
    if (this.enabled) {
        this.waiting = false;
        var f = function() {
            that.enabled = true;
            if (that.waiting) {
                that.fire();
            }
        };
        this.timer = window.setTimeout(
            function() {
                that.timer = 0;
                that.enabled = false;
                that.action.then(f, f);
            },
            that.delay
        );
    } else {
        this.waiting = true;
    }
};


exports.laterPromise = function(action, delay) {
    return new Action(action, delay);
};
