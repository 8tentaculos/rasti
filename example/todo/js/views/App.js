import { View } from 'https://unpkg.com/rasti/es';

import ListView from './List.js';
import TodoView from './Todo.js';
import StatsView from './Stats.js';

import { ENTER_KEY } from '../constants.js';

// App ui view.
class App extends View {
    // Do some initialization on the constructor.
    constructor(options) {
        super(options);
        // Bind methods to this.
        this.onTodosChange = this.onTodosChange.bind(this);
        // Listen on model events.
        this.model.on('todos:change', this.onTodosChange);
    }
    // Lifecycle method, called when view is destroyed.
    onDestroy() {
        // Stop listening to model events when view is destroyed.
        this.model.off('todos:change', this.onTodosChange);
    }
    // Render app.
    render() {
        // Remember to destroy children first if view adds children on render.
        this.destroyChildren()
        // Render template inside element.
        this.el.innerHTML = this.template(this.model);
        // Cache some dom elements now present under `this.el`.
        this.$input = this.$('.new-todo');
        this.$allCheckbox = this.$('.toggle-all');
        // Add list child view and render it. 
        // Remember that addChild and render methods return the view itself.
        this.list = this.addChild(
            new ListView({
                // Render on footer cached element.
                el : this.$('.todo-list'),
                // Pass app model.
                model : this.model
            }).render()
        );
        // Add stats child view and render it. 
        this.stats = this.addChild(
            new StatsView({
                // Render on footer cached element.
                el : this.$('.footer'),
                // Pass app model.
                model : this.model
            }).render()
        );
        // Return the view itself for chaining.
        return this;
    }
    // Update stats and ui.
    onTodosChange() {
        this.$allCheckbox.checked = this.model.todos.length && !this.model.remaining.length;
    }
    // Event handlers
    // KeyPress on input. If you hit return in the main input field, create new todo model.
    onKeyPressNewTodo(event) {
        if (event.which === ENTER_KEY && this.$input.value) {
            // Add todo to app model.
            this.model.addTodo({ title : this.$input.value });
            // Clear input.
            this.$input.value = '';
        }
    }
    // Click on toggle.
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
