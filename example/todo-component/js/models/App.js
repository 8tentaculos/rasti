import { Model } from 'https://unpkg.com/rasti/es';

import TodoModel from './Todo.js';

// App state and methods.
class App extends Model {
    constructor(attrs) {
        super(attrs);
        // Bind event handler to this.
        this.onChangeTodo = this.onChangeTodo.bind(this);
        // Create models and bind events for the first time.
        this.attributes.todos = this.attributes.todos.map(this.createTodo.bind(this));
    }
    // Get todos filtered by `this.filter`
    get filtered() {
        return this[this.filter];
    }
    // Getter for all todos.
    get all() {
        return this.todos;
    }
    // Getter for completed todos.
    get completed() {
        return this.todos.filter(todo => todo.completed);
    }
    // Getter for remaining todos.
    get remaining() {
        return this.todos.filter(todo => !todo.completed);
    }
    // Create model and bind events.
    createTodo(attrs) {
        const todo = new TodoModel(attrs);
        // Bind event on todo change.
        todo.on('change', this.onChangeTodo);
        return todo;
    }
    // Add todo model to this.todos, bind and emit events.
    addTodo(attrs) {
        const todo = this.createTodo(attrs);
        // Add todo model to list.
        this.todos.push(todo);
        // Emit events to update app view.
        this.emit('todos:add', todo);
        this.emit('change');
    }
    // Remove todo model from this.todos, emit and unbind events.
    removeTodo(todo) {
        // Index of todo to be removed.
        const idx = this.todos.indexOf(todo);
        // Remove from array.
        this.todos.splice(idx, 1);
        // Emit events to update app view.
        this.emit('todos:remove', todo);
        this.emit('change');
        // Unbind todo model events.
        todo.off();
    }
    // Remove completed todos calling removeTodo method.
    removeCompleted() {
        this.todos.filter(todo => todo.completed)
            .forEach(this.removeTodo.bind(this));
    }
    // Set completed attribute on all models.
    toggleAll(completed) {
        this.todos.forEach(todo => { 
            todo.completed = completed;
        });
    }
    // Event handler.
    // Emit 'todos:change' event when a todo changes.
    onChangeTodo() {
        // Emit event to update app view.
        this.emit('todos:change');
        this.emit('change');
    }
}

// App default attribute 'filter'.
App.prototype.defaults = {
    todos : [],
    filter : 'all',
};

export default App;
