/*
Functions to resize the canvas and the viewport.
*/
"use strict";

/**
@function
@param {object} gl - WebGL context.
@param {number} resolution - Resolution in CSS pixels. If omitted, the real resolution
of the device is taken. On smartphones, for instance, the resolution is often greater than 1.
*/
module.exports = function ( gl, resolution ) {
  if ( typeof resolution !== 'number' ) {
    resolution = window.devicePixelRatio;
  }
  var displayWidth = Math.floor( gl.canvas.clientWidth * resolution );
  var displayHeight = Math.floor( gl.canvas.clientHeight * resolution );

  // Check if the canvas is not the same size.
  if ( gl.canvas.width !== displayWidth ||
    gl.canvas.height !== displayHeight ) {

    // Make the canvas the same size
    gl.canvas.width = displayWidth;
    gl.canvas.height = displayHeight;
    gl.viewport( 0, 0, displayWidth, displayHeight );
  }
};