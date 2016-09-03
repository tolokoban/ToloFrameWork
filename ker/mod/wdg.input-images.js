require("tfw.promise");
var $ = require("dom");
var DB = require("tfw.data-binding");


function InputImages(opts) {
    var that = this;

    var elem = $.elem(this, 'input', {type: 'file', multiple: true});

    DB.propRemoveClass(this, 'visible', 'hide');
    DB.prop(this, 'onload');

    elem.addEventListener('change', function() {
        console.info("[wdg.input-images] elem.files=...", elem.files);
        var output = [], file;
        if (typeof that.onload === 'function') {
            for (var i=0; i < elem.files.length; i++) {
                file = elem.files[i];
                if (file.type.substr(0, 6) == 'image/') {
                    // On ne garde que les images.
                    output.push( file );
                }
            }
            that.onload(output);
        } else {
            console.error("[wdg.input-images] There is no slot `onload`!");
        }
    });
}


/**
 * @return void
 */
InputImages.prototype.loadImage = function(file) {
    return new Promise(function (resolve, reject) {
        var reader  = new FileReader();

        reader.addEventListener("load", function () {
            resolve({file: file, content: reader.result});
        }, false);

        if (file) {
            reader.readAsDataURL(file);
        }
    });
};

function processFile( file, opts ) {
}

module.exports = InputImages;
