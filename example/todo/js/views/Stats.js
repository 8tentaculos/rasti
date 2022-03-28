import { View } from 'https://unpkg.com/rasti/es';

// Stats ui.
class Stats extends View {
    // Do some initialization on the constructor.
    constructor(options) {
        super(options);
        // Store options.
        this.filter = options.filter;
        this.handleFilter = options.handleFilter;
        this.handleRemoveCompleted = options.handleRemoveCompleted
        // Bind render to this. To be called as event listener.
        this.render = this.render.bind(this);
        // Listen to model changes.
        this.model.on('todos:update', this.render);
    }
    // Lifecycle method, called when view is destroyed.
    onDestroy() {
        // Stop listening to model event.
        this.model.off('todos:update', this.render);
    }
    // Render stats.
    render() {
        // Render template inside element.
        this.el.innerHTML = this.template(this.model, this.filter);
        return this;
    }
    // Event handlers.
    // Click on filter all.
    onClickAll() {
        this.handleFilter('all');
    }
    // Click on filter remaining.
    onClickRemaining() {
        this.handleFilter('remaining');
    }
    // Click on filter completed.
    onClickCompleted() {
        this.handleFilter('completed');
    }
    // Click clear completed.
    onClickClearCompleted() {
        this.handleRemoveCompleted();
    }
}

Object.assign(Stats.prototype, {
    // Delegated events.
    events : {
        'click .all' : 'onClickAll',
        'click .remaining' : 'onClickRemaining',
        'click .completed' : 'onClickCompleted',
        'click .clear-completed' : 'onClickClearCompleted',
    },
    // Template.
    template : (model, filter) => `
        <span class="todo-count">
            <strong>${model.remaining.length}</strong> ${model.remaining.length === 1 ? 'item' : 'items'} left
        </span>
        <ul class="filters ${filter}">
            <li>
                <a class="all">All</a>
            </li>
            <li>
                <a class="remaining">Remaining</a>
            </li>
            <li>
                <a class="completed">Completed</a>
            </li>
        </ul>
        ${model.completed.length ?
            `<button class="clear-completed">Clear completed</button>` : ''}
    `
});

export default Stats;
