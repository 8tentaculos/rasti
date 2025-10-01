import { Model } from 'rasti';

/**
 * Individual todo item model.
 * Represents a single todo with title and completion status.
 * @class Todo
 * @extends Model
 */
class Todo extends Model {
    /**
     * Toggle the completion status of the todo.
     */
    toggle() {
        this.completed = !this.completed; 
    }
}

/**
 * Default attributes for the Todo model.
 * @type {Object}
 */
Todo.prototype.defaults = {
    title : '',
    completed : false
};

export default Todo;
