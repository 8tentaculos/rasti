import { View } from 'https://unpkg.com/rasti/es';

// Stats, filters and controls view.
class Stats extends View {
    // Do some initialization on the constructor.
    constructor(options) {
        super(options);
        // Bind render to this. To be called as event listener.
        this.render = this.render.bind(this);
        // Listen to model changes.
        this.model.on('todos:change', this.render);
        this.model.on('change:filter', this.render);
    }
    // Lifecycle method, called when view is destroyed.
    onDestroy() {
        // Stop listening to model event.
        this.model.off('todos:change', this.render);
        this.model.off('change:filter', this.render);
    }
    // Event handlers.
    // Click on filter all.
    onClickAll() {
        this.model.filter = 'all';
    }
    // Click on filter remaining.
    onClickRemaining() {
        this.model.filter = 'remaining';
    }
    // Click on filter completed.
    onClickCompleted() {
        this.model.filter = 'completed';
    }
    // Click clear completed.
    onClickClearCompleted() {
        this.model.removeCompleted();
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
    template : (model) => `
        <span class="todo-count">
            <strong>${model.remaining.length}</strong> ${model.remaining.length === 1 ? 'item' : 'items'} left
        </span>
        <ul class="filters ${model.filter}">
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
