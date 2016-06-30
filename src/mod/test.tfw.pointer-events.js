/**
 * @module test.tfw.pointer-events
 *
 * @description
 * 
 *
 * @example
 * var mod = require('test.tfw.pointer-events');
 */

var $ = require("dom");


exports.start = function() {
    var canvas0 = document.getElementById( 'canvas0' );
    var ctx0 = canvas0.getContext( '2d' );
    var canvas = document.getElementById( 'canvas' );
    var ctx = canvas.getContext( '2d' );

    $.on( canvas, {
        tap: function(evt) {
            ctx.fillStyle = 'yellow';
            ctx.strokeStyle = 'black';
            var x = evt.x - 3.5, y = evt.y - 3.5;
            ctx.fillRect( x, y, 7, 7 );
            ctx.strokeRect( x, y, 7, 7 );
        },
        doubletap: function(evt) {
            ctx.fillStyle = 'green';
            ctx.strokeStyle = 'black';
            var x = evt.x - 35, y = evt.y - 35;
            ctx.fillRect( x, y, 70, 70 );
            ctx.strokeRect( x, y, 70, 70 );
        },
        down: function(evt) {
            ctx.fillStyle = 'orange';
            ctx.strokeStyle = 'black';
            var x = evt.x - 3.5, y = evt.y - 3.5;
            ctx.fillRect( x, y, 7, 7 );
            ctx.strokeRect( x, y, 7, 7 );
        },
        up: function(evt) {
            ctx.fillStyle = 'rgb(' + Math.floor(Math.random() * 255) + ',' + Math.floor(Math.random() * 255) + ',' + Math.floor(Math.random() * 255) + ')';
            ctx.strokeStyle = 'black';
            var x = evt.x - 5.5, y = evt.y - 5.5;
            ctx.fillRect( x, y, 11, 11 );
            ctx.strokeRect( x, y, 11, 11 );
        },
        drag: function(evt) {
            ctx.strokeFill = "black";
            ctx.beginPath();
            ctx.moveTo( evt.x0, evt.y0 );
            ctx.lineTo( evt.x, evt.y );
            ctx.stroke();
        },
        move: function(evt) {
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.fillRect( evt.x - 1, evt.y - 1, 3, 3 );
        }
    });

    $.on( canvas0, {
        tap: function(evt) {
            ctx0.fillStyle = 'yellow';
            ctx0.strokeStyle = 'black';
            var x = evt.x - 3.5, y = evt.y - 3.5;
            ctx0.fillRect( x, y, 7, 7 );
            ctx0.strokeRect( x, y, 7, 7 );
        }
    });
};
