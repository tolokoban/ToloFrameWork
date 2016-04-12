"use strict";
var Hash = require("tfw.hash-watcher");
var Widget = require("wdg");
var Listeners = require("tfw.listeners");


/**
 @example
 <div id="book-id">
 <div data-page="welcome">...</div>
 <div data-page="game">...</div>
 <div data-page="highscores">...</div>
 </div>

 @example
 var Book = require("tfw.wdg.book");
 var book = new Book("book-id");
 book.show("game");

 @example
 var Book = require("tfw.wdg.book");
 var book = Book.create({
 list: list,
 import: importBibs,
 edit: edit,
 print: print
 }, 'book');

 */
var Book = function(book, hashPrefix) {
    var that = this,
        i, child, id, pages = {}, current, count = 0;

    Object.defineProperty( this, 'eventChange', { value: new Listeners() } );
    if (typeof book === 'string') {
        book = document.getElementById(book);
        Widget.call(this, {element: book});
        book.$ctrl = this;
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
                    this._pageID = id;
                    activate.call( this, child );
                } else {
                    child.addClass("hide");
                }
            } else {
                child.addClass("overlay");
            }
            count++;
        }
    } else {
        Widget.call( this );
        for( id in book ) {
            child = book[id];
            this.append( child );
            child.addClass("page");
            child.attr("data-index", count);
            pages[id] = child;
            if (!current) {
                current = child;
                activate.call( this, child );
            } else {
                child.addClass("hide");
            }
        }
    }
    this.addClass("tfw-wdg-book", "fullscreen");

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
                    page = hash.substr(hashPrefix.length + 2).trim().split( '/' )[0];
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
Book.prototype.show = function(pageID) {
    var rect;
    var pages = this._pages;
    var page = pages[pageID];
    if( typeof page === 'undefined' ) {
        console.error( "[tfw.wdg.book.show] Unknown page `" + pageID + "`!" );
        return false;
    }
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
    this._pageID = pageID;

    activate.call( this, page );
};


function activate( page ) {
    var autofocusable = page.element().querySelector("input[autofocus]");
    if( autofocusable ) {
        window.setTimeout( autofocusable.focus.bind( autofocusable ), 300 );
    }
    var slotName = page.attr( 'data-activate' );
    if( slotName ) {
        var slot = window.APP[slotName];
        if( typeof slot === 'function' ) {
            slot( this );
        }
    }
    // Fire an event because page has changed.
    this.eventChange.fire( this._pageID, page );
};


Book.create = function(book, hashPrefix) {
    return new Book(book, hashPrefix);
};
module.exports = Book;
