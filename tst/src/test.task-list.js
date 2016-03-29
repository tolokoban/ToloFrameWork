var Parent = require("test.task-list");

function TaskList( attributes ) {
    Parent.call( this, attributes );
}

TaskList.prototype = Object.create(Parent.prototype);
TaskList.prototype.constructor = TaskList;

/**
 * Add a task to the `$todos` array.
 */
TaskList.prototype.addTask = function() {
};

module.exports = TaskList;
