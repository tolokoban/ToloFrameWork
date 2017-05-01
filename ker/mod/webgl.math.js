"use strict";

module.exports = {
  mat2: mat2,
  mat3: mat3,
  mat4: mat4,
  mul: mul,
  projection3: projection3,
  projection4: projection4,
  translation3: translation3,
  translation4: translation4,
  rotation3: rotation3,
  rotationX4: rotationX4,
  rotationY4: rotationY4,
  rotationZ4: rotationZ4,
  scaling3: scaling3,
  scaling4: scaling4
};

function projection3( width, height ) {
  return mat3( 2 / width, 0, 0, 0, -2 / height, 0, 0, 0, 1 );
}

function projection4( width, height, depth ) {
  return mat4( 2 / width, 0, 0, 0, 0, -2 / height, 0, 0, 0, 0, 2 / depth, 0, 0, 0, 0, 1 );
}

function translation3( tx, ty ) {
  return mat3( 1, 0, 0, 0, 1, 0, tx, ty, 1 );
}

function translation4( tx, ty, tz ) {
  return mat4( 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, tx, ty, tz, 1 );
}

function rotation3( rad ) {
  var c = Math.cos( rad );
  var s = Math.sin( rad );
  return mat3( c, -s, 0, s, c, 0, 0, 0, 1 );
}

function rotationX4( rad ) {
  var c = Math.cos( rad );
  var s = Math.sin( rad );
  return mat4( 1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1 );
}

function rotationY4( rad ) {
  var c = Math.cos( rad );
  var s = Math.sin( rad );
  return mat4( c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1 );
}

function rotationZ4( rad ) {
  var c = Math.cos( rad );
  var s = Math.sin( rad );
  return mat4( c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 );
}

function scaling3( sx, sy ) {
  return mat3( sx, 0, 0, 0, sy, 0, 0, 0, 1 );
}

function scaling4( sx, sy, sz ) {
  return mat4( sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, 0, 0, 0, 1 );
}

function mat2( v00, v10, v01, v11 ) {
  var m = new Float32Array( [ v00, v10, v01, v11 ] );
  m.$type = 'mat2';
  return m;
}

function mat3( v00, v10, v20, v01, v11, v21, v02, v12, v22 ) {
  var m = new Float32Array( [ v00, v10, v20, v01, v11, v21, v02, v12, v22 ] );
  m.$type = 'mat3';
  return m;
}

function mat4( v00, v10, v20, v30, v01, v11, v21, v31, v02, v12, v22, v32, v03, v13, v23, v33 ) {
  var m = new Float32Array( [ v00, v10, v20, v30, v01, v11, v21, v31, v02, v12, v22, v32, v03, v13, v23, v33 ] );
  m.$type = 'mat4';
  return m;
}

function vec2( a, b ) {
  var m = new Float32Array( [ a, b ] );
  m.$type = 'vec2';
  return m;
}

function vec3( a, b, c ) {
  var m = new Float32Array( [ a, b, c ] );
  m.$type = 'vec3';
  return m;
}

function vec4( a, b, c, d ) {
  var m = new Float32Array( [ a, b, c, d ] );
  m.$type = 'vec4';
  return m;
}

var MUL = {
  mat2mat2: function ( a, b ) {
    return mat2(
      a[ 0 ] * b[ 0 ] + a[ 2 ] * b[ 1 ],
      a[ 1 ] * b[ 0 ] + a[ 3 ] * b[ 1 ],
      a[ 0 ] * b[ 2 ] + a[ 2 ] * b[ 3 ],
      a[ 1 ] * b[ 2 ] + a[ 3 ] * b[ 3 ]
    );
  },
  mat3mat3: function ( a, b ) {
    return mat3(
      a[ 0 ] * b[ 0 ] + a[ 3 ] * b[ 1 ] + a[ 6 ] * b[ 2 ],
      a[ 1 ] * b[ 0 ] + a[ 4 ] * b[ 1 ] + a[ 7 ] * b[ 2 ],
      a[ 2 ] * b[ 0 ] + a[ 5 ] * b[ 1 ] + a[ 8 ] * b[ 2 ],
      a[ 0 ] * b[ 3 ] + a[ 3 ] * b[ 4 ] + a[ 6 ] * b[ 5 ],
      a[ 1 ] * b[ 3 ] + a[ 4 ] * b[ 4 ] + a[ 7 ] * b[ 5 ],
      a[ 2 ] * b[ 3 ] + a[ 5 ] * b[ 4 ] + a[ 8 ] * b[ 5 ],
      a[ 0 ] * b[ 6 ] + a[ 3 ] * b[ 7 ] + a[ 6 ] * b[ 8 ],
      a[ 1 ] * b[ 6 ] + a[ 4 ] * b[ 7 ] + a[ 7 ] * b[ 8 ],
      a[ 2 ] * b[ 6 ] + a[ 5 ] * b[ 7 ] + a[ 8 ] * b[ 8 ]
    );
  },
  mat4mat4: function ( a, b ) {
    return mat4(
      a[ 0 ] * b[ 0 ] + a[ 4 ] * b[ 1 ] + a[ 8 ] * b[ 2 ] + a[ 12 ] * b[ 3 ],
      a[ 1 ] * b[ 0 ] + a[ 5 ] * b[ 1 ] + a[ 9 ] * b[ 2 ] + a[ 13 ] * b[ 3 ],
      a[ 2 ] * b[ 0 ] + a[ 6 ] * b[ 1 ] + a[ 10 ] * b[ 2 ] + a[ 14 ] * b[ 3 ],
      a[ 3 ] * b[ 0 ] + a[ 7 ] * b[ 1 ] + a[ 11 ] * b[ 2 ] + a[ 15 ] * b[ 3 ],
      a[ 0 ] * b[ 4 ] + a[ 4 ] * b[ 5 ] + a[ 8 ] * b[ 6 ] + a[ 12 ] * b[ 7 ],
      a[ 1 ] * b[ 4 ] + a[ 5 ] * b[ 5 ] + a[ 9 ] * b[ 6 ] + a[ 13 ] * b[ 7 ],
      a[ 2 ] * b[ 4 ] + a[ 6 ] * b[ 5 ] + a[ 10 ] * b[ 6 ] + a[ 14 ] * b[ 7 ],
      a[ 3 ] * b[ 4 ] + a[ 7 ] * b[ 5 ] + a[ 11 ] * b[ 6 ] + a[ 15 ] * b[ 7 ],
      a[ 0 ] * b[ 8 ] + a[ 4 ] * b[ 9 ] + a[ 8 ] * b[ 10 ] + a[ 12 ] * b[ 11 ],
      a[ 1 ] * b[ 8 ] + a[ 5 ] * b[ 9 ] + a[ 9 ] * b[ 10 ] + a[ 13 ] * b[ 11 ],
      a[ 2 ] * b[ 8 ] + a[ 6 ] * b[ 9 ] + a[ 10 ] * b[ 10 ] + a[ 14 ] * b[ 11 ],
      a[ 3 ] * b[ 8 ] + a[ 7 ] * b[ 9 ] + a[ 11 ] * b[ 10 ] + a[ 15 ] * b[ 11 ],
      a[ 0 ] * b[ 12 ] + a[ 4 ] * b[ 13 ] + a[ 8 ] * b[ 14 ] + a[ 12 ] * b[ 15 ],
      a[ 1 ] * b[ 12 ] + a[ 5 ] * b[ 13 ] + a[ 9 ] * b[ 14 ] + a[ 13 ] * b[ 15 ],
      a[ 2 ] * b[ 12 ] + a[ 6 ] * b[ 13 ] + a[ 10 ] * b[ 14 ] + a[ 14 ] * b[ 15 ],
      a[ 3 ] * b[ 12 ] + a[ 7 ] * b[ 13 ] + a[ 11 ] * b[ 14 ] + a[ 15 ] * b[ 15 ]
    );
  }
};

function mul( a, b ) {
  var f = MUL[ a.$type + b.$type ];
  if ( typeof f !== 'function' ) {
    throw Error( "[webgl.math.mul] I don't know how to multiply '" +
      a.$type + "' with '" + b.$type + "'!" );
  }
  return f( a, b );
}