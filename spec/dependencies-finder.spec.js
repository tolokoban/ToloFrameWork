"use strict";

var Finder = require("../lib/dependencies-finder");

describe('Module "dependencies-finder"', function() {
    it('should find requires', function() {
        var result = Finder(`
/**
 * @module page.event-admin
 *
 * @description
 * Poste de contrôle pour un chronométrage live.
 *
 * @example
 * var mod = require('page.event-admin');
 */

var DateSelector = require("tp4.near-past-date-time");
var Message = require("tfw.message");
var Bad = require("bad.require", "THIS IS BAD");
var Text = require("wdg.text");
var $ = require("dom");

// Event.
var g_event;
var g_modalBib;`);
        expect(result.requires).toEqual([
            'tp4.near-past-date-time', 'tfw.message', 'wdg.text', 'dom'
        ]);
    });

});
