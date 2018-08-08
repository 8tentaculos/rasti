TodoApp.AppModel = function() {
    // App state and methods
    class AppModel extends Rasti.Emitter {
        constructor() {
            super();
            // Bind event handler to this
            this.onChangeTodo = this.onChangeTodo.bind(this);
            // Todos list
            this.todos = [];
        }
        // Getter for all todos
        get all() {
            return this.todos;
        }
        // Getter for completed todos
        get completed() {
            return this.todos.filter(todo => todo.completed);
        }
        // Getter for remaining todos
        get remaining() {
            return this.todos.filter(todo => !todo.completed);
        }
        // Add todo model to this.todos, bind and emit events
        addTodo(todo) {
            // Bind event on todo change
            todo.on('change', this.onChangeTodo);
            // Add todo model to list
            this.todos.push(todo);
            // Emit events to update app view
            this.emit('todos:add', todo);
            this.emit('todos:update');
        }
        // Remove todo model from this.todos, emit and unbind events
        removeTodo(todo) {
            // Index of todo to be removed
            const idx = this.todos.indexOf(todo);
            // Remove from array
            this.todos.splice(idx, 1);
            // Emit events to update app view
            this.emit('todos:remove', todo);
            this.emit('todos:update');
            // Unbind todo model events
            todo.off();
        }
        // Remove completed todos calling removeTodo method
        removeCompleted() {
            this.todos.forEach(todo => {
                if (todo.completed) this.removeTodo(todo);
            });
        }
        // Set completed attribute on all models
        toggleAll(completed) {
            this.todos.forEach(todo => { todo.completed = completed; });
        }
        // Event handler
        // Emit 'todos:update' event when a todo changes
        onChangeTodo() {
            // Emit event to update app view
            this.emit('todos:update');
        }
    }
    
    return AppModel;
}();
