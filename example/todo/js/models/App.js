import { Model } from 'rasti';

import TodoModel from './Todo.js';

/**
 * Main application model for the todo app.
 * Manages the collection of todos, filtering, and todo operations.
 * @class App
 * @extends Model
 */
class App extends Model {
    /**
     * Create a new App model instance.
     * @param {Object} attrs Initial attributes for the app.
     */
    constructor(attrs) {
        super(attrs);
        // Bind event handler to this.
        this.onChangeTodo = this.onChangeTodo.bind(this);
        // Create models and bind events for the first time.
        this.attributes.todos = this.attributes.todos.map(this.createTodo.bind(this));
    }
    
    /**
     * Get todos filtered by the current filter setting.
     * @return {Array<Todo>} Filtered todos.
     */
    get filtered() {
        return this[this.filter];
    }
    
    /**
     * Get all todos.
     * @return {Array<Todo>} All todos.
     */
    get all() {
        return this.todos;
    }
    
    /**
     * Get completed todos.
     * @return {Array<Todo>} Completed todos.
     */
    get completed() {
        return this.todos.filter(todo => todo.completed);
    }
    
    /**
     * Get remaining (incomplete) todos.
     * @return {Array<Todo>} Remaining todos.
     */
    get remaining() {
        return this.todos.filter(todo => !todo.completed);
    }
    
    /**
     * Create a new todo model and bind events.
     * @param {Object} attrs Attributes for the new todo.
     * @return {Todo} The created todo model.
     */
    createTodo(attrs) {
        const todo = new TodoModel(attrs);
        // Bind event on todo change.
        todo.on('change', this.onChangeTodo);
        return todo;
    }
    
    /**
     * Add a new todo to the collection.
     * @param {Object} attrs Attributes for the new todo.
     */
    addTodo(attrs) {
        const todo = this.createTodo(attrs);
        // Add todo model to list.
        this.todos.push(todo);
        // Emit events to update app view.
        this.emit('todos:add', todo);
        this.emit('change');
    }
    
    /**
     * Remove a todo from the collection.
     * @param {Todo} todo The todo to remove.
     */
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
    
    /**
     * Remove all completed todos.
     */
    removeCompleted() {
        this.todos.filter(todo => todo.completed)
            .forEach(this.removeTodo.bind(this));
    }
    
    /**
     * Toggle completion status of all todos.
     * @param {boolean} completed Whether to mark all todos as completed.
     */
    toggleAll(completed) {
        this.todos.forEach(todo => { 
            todo.completed = completed;
        });
    }
    
    /**
     * Event handler for todo changes.
     * Emits 'todos:change' and 'change' events when a todo changes.
     */
    onChangeTodo() {
        // Emit event to update app view.
        this.emit('todos:change');
        this.emit('change');
    }
}

/**
 * Default attributes for the App model.
 * @type {Object}
 */
App.prototype.defaults = {
    todos : [],
    filter : 'all',
};

export default App;
