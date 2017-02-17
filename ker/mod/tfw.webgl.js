/**
 * @module webgl
 *
 * Useful functions to help avoiding use of syntaxical complexity of WebGL.
 */
"use strict";


var Renderer = function(canvas) {
    if( typeof canvas === 'string' ) canvas = document.getElementById( canvas );
    Object.defineProperty( this, 'canvas', {
        value: canvas,
        writable: false,
        configurable: false,
        enumerable: true
    });
    // Get WebGL 1.0 context.
    Object.defineProperty( this, 'gl', {
        value: canvas.getContext('webgl') || canvas.getContext('experimental-webgl'),
        writable: false,
        configurable: false,
        enumerable: true
    });
};

// Start the animation loop.
Renderer.prototype.start = function(renderingFunction) {
    var rendering = function(time) {
        window.requestAnimationFrame( rendering );
        renderingFunction( time );
    };
    window.requestAnimationFrame( rendering );
};

/**
 * Creating  a  WebGL  program  for shaders  is  painful.  This  class
 * simplifies the process.
 * 
 * @param gl - WebGL context.
 * @param codes  - Object  with two  mandatory attributes:  `vert` for
 * vertex shader and `frag` for fragment shader.
 * @param  includes  -  (optional)  If  defined,  the  `#include  foo`
 * directives  of  shaders   will  be  replaced  by   the  content  of
 * `includes.foo`.
 */
function Program(gl, codes, includes) {
    if (!typeof codes.vert === 'string') {
        throw Error('[tfw.webgl.Program] Missing attribute `vert` in argument `codes`!');
    }
    if (!typeof codes.frag === 'string') {
        throw Error('[tfw.webgl.Program] Missing attribute `frag` in argument `codes`!');
    }

    codes = parseIncludes( codes, includes );

    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, getVertexShader(gl, codes.vert || '//No Vertex Shader'));
    gl.attachShader(shaderProgram, getFragmentShader(gl, codes.frag || '//No Fragment Shader'));
    gl.linkProgram(shaderProgram);

    this.program = shaderProgram;
    Object.freeze( this.program );

    this.use = function() {
        gl.useProgram(shaderProgram);
    };
    this.use();

    var index, item;
    var attribs = {};
    var attribsCount = gl.getProgramParameter(shaderProgram, gl.ACTIVE_ATTRIBUTES);
    for (index = 0; index < attribsCount; index++) {
        item = gl.getActiveAttrib( shaderProgram, index );
        attribs[item.name] = gl.getAttribLocation(shaderProgram, item.name);
        this['$' + item.name] = gl.getAttribLocation(shaderProgram, item.name);
    }

    Object.freeze(attribs);
    this.attribs = attribs;
    var uniforms = {};
    var uniformsCount = gl.getProgramParameter(shaderProgram, gl.ACTIVE_UNIFORMS);
    for (index = 0; index < uniformsCount; index++) {
        item = gl.getActiveUniform( shaderProgram, index );
        uniforms[item.name] = gl.getUniformLocation(shaderProgram, item.name);
        Object.defineProperty(this, '$' + item.name, {
            set: createUniformSetter(gl, item, uniforms[item.name]),
            get: createUniformGetter(item),
            enumerable: true,
            configurable: true
        });
    }
    Object.freeze(uniforms);
    this.uniforms = uniforms;
}

/**
 * This is a preprocessor for shaders.
 * Directives  `#include`  will be  replaced  by  the content  of  the
 * correspondent attribute in `includes`.
 */
function parseIncludes( codes, includes ) {
    var result = {};
    var id, code;
    for( id in codes ) {
        code = codes[id];
        result[id] = code.split('\n').map(function(line) {
            if( line.trim().substr(0, 8) != '#include' ) return line;
            var pos = line.indexOf( '#include' ) + 8;
            var includeName = line.substr( pos ).trim();
            // We accept all this systaxes:
            // #include foo
            // #include 'foo'
            // #include <foo>
            // #include "foo"
            if( "'<\"".indexOf( includeName.charAt(0) ) > -1 ) {
                includeName = includeName.substr( 1, includeName.length - 2 );
            }
            var snippet = includes[includeName];
            if( typeof snippet !== 'string' ) {
                console.error( "Include <" + includeName + "> not found in ", includes );
                throw Error( "Include not found in shader: " + includeName );
            }
            return snippet;
        }).join("\n");
    }
    return result;
}


function createUniformSetter(gl, item, nameGL) {
    var nameJS = '_$' + item.name;

    switch (item.type) {
    case gl.BYTE:
    case gl.UNSIGNED_BYTE:
    case gl.SHORT:
    case gl.UNSIGNED_SHORT:
    case gl.INT:
    case gl.UNSIGNED_INT:
        if (item.size == 1) {
            return function(v) {
                gl.uniform1i(nameGL, v);
                this[nameJS] = v;
            };
        } else {
            return function(v) {
                gl.uniform1iv(nameGL, v);
                this[nameJS] = v;
            };
        }
        break;
    case gl.FLOAT:
        if (item.size == 1) {
            return function(v) {
                gl.uniform1f(nameGL, v);
                this[nameJS] = v;
            };
        } else {
            return function(v) {
                gl.uniform1fv(nameGL, v);
                this[nameJS] = v;
            };
        }
        break;
    }
}

function createUniformGetter(item) {
    var name = '_$' + item.name;
    return function() {
        return this[name];
    };
}


function getShader( type, gl, code ) {
    var shader = gl.createShader( type );
    gl.shaderSource( shader, code );
    gl.compileShader( shader );
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.log( code );
        console.error("An error occurred compiling the shader: " + gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function getFragmentShader( gl, code ) {
    return getShader( gl.FRAGMENT_SHADER, gl, code );
}

function getVertexShader( gl, code ) {
    return getShader( gl.VERTEX_SHADER, gl, code );
}




var createTextureForFB = function(gl, width, height) {
    var texture = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set up texture so we can render any size image and so we are
    // working with pixels.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0,
        gl.RGBA, gl.UNSIGNED_BYTE, null);

    return texture;
};


var getDataFromImage = function( img ) {
    var w = img.width;
    var h = img.height;
    var canvas = document.createElement( 'canvas' );
    canvas.setAttribute( "width", w );
    canvas.setAttribute( "height", h );
    var ctx = canvas.getContext( "2d" );
    ctx.drawImage( img, 0, 0 );
    return ctx.getImageData( 0, 0, w, h ).data;
};


//===================================================================================

exports.Renderer = Renderer;
exports.Program = Program;
exports.createTextureForFB = createTextureForFB;
exports.getDataFromImage = getDataFromImage;
