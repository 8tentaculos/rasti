import { View } from 'https://unpkg.com/rasti/es';

import TodoView from './Todo.js';

// Todo list view.
class List extends View {
    // Do some initialization on the constructor.
    constructor(options) {
        super(options);
        // Bind methods to this.
        this.render = this.render.bind(this);
        this.onTodosAdd = this.onTodosAdd.bind(this);
        this.onTodosRemove = this.onTodosRemove.bind(this);
        this.onTodosChange = this.onTodosChange.bind(this);
        // Listen on model events.
        this.model.on('change:filter', this.render);
        this.model.on('todos:add', this.onTodosAdd);
        this.model.on('todos:remove', this.onTodosRemove);
        this.model.on('todos:change', this.onTodosChange);
    }
    // Lifecycle method, called when view is destroyed.
    onDestroy() {
        // Stop listening to model events when view is destroyed.
        this.model.off('change:filter', this.render);
        this.model.off('todos:add', this.onTodosAdd);
        this.model.off('todos:remove', this.removeTodo);
        this.model.off('todos:change', this.onTodosChange);
    }
    // Render app.
    render() {
        // Remember to destroy children first if view adds children on render.
        this.destroyChildren()
        // Clear.
        this.el.innerHTML = '';
        // Render todos according filter.
        this.model.filtered.forEach(this.onTodosAdd);
        // Return the view itself for chaining.
        return this;
    }
    // Create todo view.
    createTodo(todo) {
        return this.addChild(
            new TodoView({
                model : todo,
                handleRemove : () => this.model.removeTodo(todo)
            })
        );
    }
    // Create todo view and append it into the dom.
    onTodosAdd(todo) {
        this.el.appendChild(this.createTodo(todo).render().el);
    }
    // Remove todo from dom and destroy view.
    onTodosRemove(todo) {
        let view = this.children.find(child => child.model === todo);

        if (view) {
            view.destroy({ remove : true });
            this.children = this.children.filter(child => child !== view);
        }
    }
    // Change todo attribute. Re render if filtering.
    onTodosChange() {
        if (this.model.filter !== 'all') this.render();
    }
}

export default List;
