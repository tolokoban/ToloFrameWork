var UglifyCSS = require('uglifycss');


exports.analyse = function(source) {
    console.log("[CSS] " + source.filename());
    var css = UglifyCSS.processFiles(
        [source.file()],
        { maxLineLen: 256, expandVars: true }
    );
    source.tag("zip", css);
    source.save();
    console.log("      zipped at " + Math.floor(1000 * css.length / source.content().length) / 10 + " %");
};