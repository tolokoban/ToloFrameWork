"use strict";
var Hash = require("tfw.hash-watcher");
var Widget = require("wdg");
var Listeners = require("tfw.listeners");


/**
 * @example
 * <div id="book-id">
 *   <div data-page="welcome">...</div>
 *   <div data-page="game">...</div>
 *   <div data-page="highscores">...</div>
 * </div>
 *
 * @example
 * var Book = require("tfw.wdg.book");
 * var book = new Book("book-id");
 * book.show("game");
 *
 * @example
 * var Book = require("tfw.wdg.book");
 * var book = new Book({
 *   welcome: wdgWelcome,
 *   game: wdgGame,
 *   highscores: wdgHighscores
 * });
 * book.show("game");
 */
var Book = function(book, hashPrefix) {
    // Événement déclenché lorsqu'on change de page.
    this.eventChange = new Listeners();

    if (typeof book === 'string') {
        book = document.getElementById(book);
    } else {
        book = expandObject(book);
    }
    Widget.call(this, {element: book});
    book.$ctrl = this;
    this.addClass("tfw-wdg-book", "fullscreen");
    var that = this,
        i, child, id, pages = {}, current, count = 0;
    for (i = 0 ; i < book.childNodes.length ; i++) {
        child = book.childNodes[i];
        if (child.nodeType != 1) continue;
        child = new Widget({element: child});
        id = child.attr("data-page");
        if (id && id.length > 0) {
            child.addClass("page");
            if (!child.attr("data-index")) {
                child.attr("data-index", count);
            } else {
                count = parseInt(child.attr("data-index")) || 0;
            }
            pages[id] = child;
            if (!current) {
                current = child;
            } else {
                child.addClass("hide");
            }
        } else {
            child.addClass("overlay");
        }
        count++;
    }
    this._pages = pages;
    this._current = current;
    if (!current) {
        console.error("[tfw.wdg.book] Book without pages!");
        console.error("[tfw.wdg.book] Pages must have the \"data-page\" attribute!");
    }

    // If hashPrefix has been set, we watch at the hash to change pages.
    // For instance, if the prefix is "MyBook", the hash "/MyBook/MyPage"
    // will switch to the page "MyPage" if it exists.
    if (typeof hashPrefix !== 'undefined') {
        Hash(function () {
            var hashes = Hash.hash().split(';');
            hashes.forEach(function (hash) {
                hash = hash.trim();
                var page;
                if (hash.substr(0, hashPrefix.length + 2) == '/' + hashPrefix + '/') {
                    page = hash.substr(hashPrefix.length + 2).trim();
                    page = page.split('/');
                    that.show(page);
                }
            });
        });
    }
};

// Extension of Widget.
Book.prototype = Object.create(Widget.prototype);
Book.prototype.constructor = Book;


/**
 * @return void
 */
Book.prototype.show = function(args) {
    if (!Array.isArray(args)) args = [args];
    var pageID = args[0];
    var rect;
    var pages = this._pages;
    var page = pages[pageID];
    var current = this._current;
    var pageIdx = parseInt(page.attr("data-index")) || 0;
    var currentIdx = parseInt(current.attr("data-index")) || 0;
    if (!page || page == current) return;
    current.removeClass("transition");
    current.removeClass("right");
    current.removeClass("hide");
    page.removeClass("transition");
    page.removeClass("right");
    page.removeClass("hide");
    if (currentIdx < pageIdx) {
        page.addClass("right");
        rect = page.rect();
        current.addClass("hide");
        page.removeClass("right");
    } else {
        page.addClass("hide");
        rect = page.rect();
        current.addClass("right");
        page.removeClass("hide");
    }
    current.addClass("transition");
    page.addClass("transition");

    this._current = page;
    Listeners.prototype.fire.apply(this.eventChange, args);
};


Book.create = function(book, hashPrefix) {
    return new Book(book, hashPrefix);
};
module.exports = Book;



/**
 * @param {object} book - Pages of the book. The name of this object's
 * attributes  will be  the `data-page`,  the value  will be  the page
 * itself and it can be a DOM element or a Widget..
 */
function expandObject(book) {
    var div = Widget.div();
    var key, val;
    for (key in book) {
        val = book[key];
        if (typeof val.append !== 'function') {
            val = Widget.create({element: val});
        }
        val.attr("data-page", key);
        div.append(val);
    }
    return div.element();
}
