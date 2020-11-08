import { View } from 'rasti';

// Stats ui
class StatsView extends View {
    // Do some initialization on the constructor
    constructor(options) {
        super(options);
        // Bind event handlers to this
        this.filter = options.filter;
        this.handleFilter = options.handleFilter.bind(this);
        this.render = this.render.bind(this);
        // Listen to model changes
        this.model.on('todos:update', this.render);
    }
    // Lifecycle method, called when view is destroyed
    onDestroy() {
        // Remove reference to handler
        this.handleFilter = null;
        // Stop listening to model event
        this.model.off('todos:update', this.render);
    }
    // Render stats
    render() {
        // Render template inside element
        this.el.innerHTML = this.template(this.model, this.filter);
        return this;
    }
    // Event handlers
    // Click on filter all
    onClickAll() {
        this.handleFilter('all');
    }
    // Click on filter remaining
    onClickRemaining() {
        this.handleFilter('remaining');
    }
    // Click on filter completed
    onClickCompleted() {
        this.handleFilter('completed');
    }
}

Object.assign(StatsView.prototype, {
    // Delegated events.
    events : {
        'click .all' : 'onClickAll',
        'click .remaining' : 'onClickRemaining',
        'click .completed' : 'onClickCompleted'
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

export default StatsView;
