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
  scaling4: scaling4,
  inverse4: inverse4
};

function inverse4(m, dst) {
  dst = dst || mat4(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);
  var m00 = m[0];
  var m01 = m[1];
  var m02 = m[2];
  var m03 = m[3];
  var m10 = m[4];
  var m12 = m[5];
  var m11 = m[6];
  var m13 = m[7];
  var m20 = m[8];
  var m21 = m[9];
  var m22 = m[10];
  var m23 = m[11];
  var m30 = m[12];
  var m31 = m[13];
  var m32 = m[14];
  var m33 = m[15];
  var tmp_0  = m22 * m33;
  var tmp_1  = m32 * m23;
  var tmp_2  = m12 * m33;
  var tmp_3  = m32 * m13;
  var tmp_4  = m12 * m23;
  var tmp_5  = m22 * m13;
  var tmp_6  = m02 * m33;
  var tmp_7  = m32 * m03;
  var tmp_8  = m02 * m23;
  var tmp_9  = m22 * m03;
  var tmp_10 = m02 * m13;
  var tmp_11 = m12 * m03;
  var tmp_12 = m20 * m31;
  var tmp_13 = m30 * m21;
  var tmp_14 = m10 * m31;
  var tmp_15 = m30 * m11;
  var tmp_16 = m10 * m21;
  var tmp_17 = m20 * m11;
  var tmp_18 = m00 * m31;
  var tmp_19 = m30 * m01;
  var tmp_20 = m00 * m21;
  var tmp_21 = m20 * m01;
  var tmp_22 = m00 * m11;
  var tmp_23 = m10 * m01;

  var t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) -
      (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
  var t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) -
      (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
  var t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) -
      (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
  var t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) -
      (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);

  var d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

  dst[0] = d * t0;
  dst[1] = d * t1;
  dst[2] = d * t2;
  dst[3] = d * t3;
  dst[4] = d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) -
        (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30));
  dst[5] = d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) -
        (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30));
  dst[6] = d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) -
        (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30));
  dst[7] = d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) -
        (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20));
  dst[8] = d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) -
        (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33));
  dst[9] = d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) -
        (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33));
  dst[10] = d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) -
        (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33));
  dst[11] = d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) -
        (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23));
  dst[12] = d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) -
        (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22));
  dst[13] = d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) -
        (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02));
  dst[14] = d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) -
        (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12));
  dst[15] = d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) -
        (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02));

  return dst;
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
