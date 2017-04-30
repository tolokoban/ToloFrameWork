"use strict";

module.exports = {
  mat2: mat2,
  mat3: mat3,
  mat4: mat4,
  mul: mul,
  cameraPolar: cameraPolar,
  perspective4: perspective4,
  identity3: identity3,
  identity4: identity4,
  projection3: projection3,
  projection4: projection4,
  translation3: translation3,
  translation4: translation4,
  rotation3: rotation3,
  rotationX4: rotationX4,
  rotationY4: rotationY4,
  rotationZ4: rotationZ4,
  scaling3: scaling3,
  scaling4: scaling4,
  copy: copy,
  normalize: normalize
};

function copy( arr ) {
  var n = new Float32Array( arr );
  n.$type = arr.$type;
  return n;
}

function normalize( arr ) {
  var n = copy( arr );
  var len = 0,
    v, k;
  for ( k = 0; k < n.length; k++ ) {
    v = n[ k ];
    len += v * v;
  }
  if ( len > 0 ) {
    var coeff = 1 / Math.sqrt( len );
    for ( k = 0; k < n.length; k++ ) {
      n[ k ] *= coeff;
    }
  }
  return n;
}

function cameraPolar( targetX, targetY, targetZ, dis, lat, lng ) {
  var rot = mul(
    rotationZ4( -lng ),
    rotationX4( -lat + Math.PI * 0.5 )
  );
  var tX = rot[ 8 ] * dis + targetX;
  var tY = rot[ 9 ] * dis + targetY;
  var tZ = rot[ 10 ] * dis + targetZ;
  return mul(
    translation4( -tX, -tY, -tZ ), rot
  );
}

/**
 * Define the `frustum`.
 * @param {number} fieldAngle - View angle in radians. Maximum is PI.
 * @param {number} aspect - (width / height) of the canvas.
 * @param {number} near - Clip every Z lower than `near`.
 * @param {number} far - Clip every Z greater than `far`.
 */
function perspective4( fieldAngle, aspect, near, far ) {
  var f = Math.tan( Math.PI * 0.5 - 0.5 * fieldAngle );
  var rangeInv = 1.0 / ( near - far );

  return mat4(
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, ( near + far ) * rangeInv, -1,
    0, 0, near * far * rangeInv * 2, 0
  );
}

function identity3() {
  return mat3( 1, 0, 0, 0, 1, 0, 0, 0, 1 );
}

function identity4() {
  return mat4( 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 );
}

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