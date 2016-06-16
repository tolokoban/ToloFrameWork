// IE11 doe not support String.toLowerCase().
if (typeof String.toLowerCase !== 'function') {
    String.toLowerCase = function(v) { return v.toLowerCase(); };
    String.toUpperCase = function(v) { return v.toUpperCase(); };
    String.trim = function(v) { return v.trim(); };
}
