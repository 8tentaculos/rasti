import { View } from 'https://unpkg.com/rasti/es';

import TodoView from './Todo.js';
import StatsView from './Stats.js';

import TodoModel from '../models/Todo.js';

import { ENTER_KEY } from '../constants.js';

// App ui
class App extends View {
    // Do some initialization on the constructor
    constructor(options) {
        super(options);
        // Set default todos filter
        this.filter = 'all';
        // Bind methods to this
        this.addTodo = this.addTodo.bind(this);
        this.removeTodo = this.removeTodo.bind(this);
        this.update = this.update.bind(this);
        // Listen on model events
        this.model.on('todos:add', this.addTodo);
        this.model.on('todos:remove', this.removeTodo);
        this.model.on('todos:update', this.update);
    }
    // Lifecycle method, called when view is destroyed
    onDestroy() {
        // Stop listening to model events when view is destroyed
        this.model.off('todos:add', this.addTodo);
        this.model.off('todos:remove', this.removeTodo);
        this.model.off('todos:update', this.update);
    }
    // Render app
    render() {
        // Remember to destroy children first if view adds children on render
        this.destroyChildren()
        // Render template inside element
        this.el.innerHTML = this.template(this.model);
        // Cache some dom elements now present on the document
        this.$input = this.$('.new-todo');
        this.$allCheckbox = this.$('.toggle-all');
        this.$list = this.$('.todo-list');
        this.$footer = this.$('.footer');
        // Render todos according filter
        this.model[this.filter].forEach(this.addTodo);
        // Add stats child view and render it. 
        // Remember that addChild and render methods return the view itself.
        this.stats = this.addChild(
            new StatsView({
                // Stats view options
                // Render on footer cached element
                el : this.$footer,
                // Pass app model
                model : this.model,
                // Current filter
                filter : this.filter,
                // A handler to be called from stats to filter todos
                handleFilter : (filter) => {
                    this.filter = filter;
                    this.render();
                },
                // Clear all completed todo items, destroying their models.
                handleRemoveCompleted : () => {
                    this.model.removeCompleted();
                }
            })
        ).render(); // Render stats

        return this;
    }
    // Update stats and ui
    update() {
        this.$allCheckbox.checked = this.model.todos.length && !this.model.remaining.length;
        this.stats.render();
    }
    // Create todo view and append it to the dom
    addTodo(todo) {
        let view = this.addChild(
            new TodoView({
                model : todo,
                handleRemove : () => this.model.removeTodo(todo)
            })
        );

        this.$list.appendChild(view.render().el);
    }
    // Remove todo from dom and destroy view
    removeTodo(todo) {
        let view = this.children.find(child => child.model === todo);
        if (view) view.destroy({ remove : true });
    }
    // Event handlers
    // KeyPress on input. If you hit return in the main input field, create new todo model.
    onKeyPressNewTodo(event) {
        if (event.which === ENTER_KEY && this.$input.value) {
            // Create todo model
            let model = new TodoModel({
                // Model attributes
                // Take title from input
                title : this.$input.value
            });
            // Add todo model to app model
            this.model.addTodo(model);
            // Clear input
            this.$input.value = '';
        }
    }
    // Click on toggle
    onClickToggleAll(event) {
        let completed = this.$allCheckbox.checked;
        this.model.toggleAll(completed);
    }
}

Object.assign(App.prototype, {
    // Delegated events.
    events : {
        'keypress .new-todo' : 'onKeyPressNewTodo',
        'click .toggle-all' : 'onClickToggleAll'
    },
    // Template.
    template : (model) => `
        <section class="todoapp">
            <header class="header">
                <h1>todos</h1>
                <input class="new-todo" placeholder="What needs to be done?" autofocus />
            </header>
            <section class="main">
            <input class="toggle-all" id="toggle-all" type="checkbox"${model.todos.length && !model.remaining.length ? ' checked' : ''} />
                <label for="toggle-all">Mark all as complete</label>
                <ul class="todo-list"></ul>
            </section>
            <footer class="footer">
            </footer>
        </section>
    `
});

export default App;
