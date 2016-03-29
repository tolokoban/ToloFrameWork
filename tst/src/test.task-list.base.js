var Template = require("tfw.template");
var $ = require("dom");


function TaskList( attributes ) {
    Template.call( this );
    Object.defineProperty( this, 'Element', {
        value: $.tag( 'article', 'test-task-list', 'custom' ),
        writable: false
    });
    this.todos = [];
    var refresh = this.Refresh.bind( this );
    
}

TaskList.prototype = Object.create(Template.prototype);
TaskList.prototype.constructor = TaskList;


/**
 * @return void
 */
TaskList.prototype.Refresh = function() {
    $.clear( this.Element );
    var e1 = $.tag( 'h1' );
    var e2 = $.text( "Todo" );
    $.add( e1, e2 );
    var e3 = $.tag( 'ul' );
    Template.prototype.getArray.call( this, 'todos' ).forEach(function ( $task ) {
        var e4 = $.tag( 'li' );
        var e5 = $.text( $task );
        $.add( e4, e5 );
        $.add( e3, e4 );
    });
    var e6 = $.tag( 'input', { type: 'text' } );
    
    var e7 = $.tag( 'button' );
    
    $.add( this.Element, e1, e3, e6, e7 );
};


Object.defineProperty( TaskList.prototype, 'todos', {
    get: function() { return this._todos; },
    set: function(v) {
        this._todos = v;
    },
    configurable: true,
    enumerable: true
});


module.exports = TaskList;
