"use strict";
var Widget = require("wdg");

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
 * @class Book
 */
var Book = function(book) {
    if (typeof book === 'string') {
        book = document.getElementById(book);
    }
    Widget.call(this, {element: book});
    book.$ctrl = this;
    this.addClass("tfw-wdg-book", "fullscreen");
    var i, child, id, pages = {}, current, count = 0;
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
};

// Extension of Widget.
Book.prototype = Object.create(Widget.prototype);
Book.prototype.constructor = Book;


/**
 * @return void
 */
Book.prototype.show = function(pageID) {
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
};


Book.create = function(book) {
    return new Book(book);
};
module.exports = Book;
