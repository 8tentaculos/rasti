import { Component } from 'rasti';

const Stats = Component.create`
    <footer
        class="footer"
        onClick=${{
            'a.all' : function() { this.model.filter = 'all' },
            'a.remaining' : function() { this.model.filter = 'remaining' },
            'a.completed' : function() { this.model.filter = 'completed' },
            'button.clear-completed': function() { this.model.removeCompleted() },
        }}
    >
        <span class="todo-count">
            <strong>${({ model }) => model.remaining.length}</strong> 
            ${({ model }) => model.remaining.length === 1 ? 'item' : 'items'} left
        </span>
        <ul class="${({ model }) => ['filters', model.filter].join(' ')}">
            <li><a class="all">All</a></li>
            <li><a class="remaining">Remaining</a></li>
            <li><a class="completed">Completed</a></li>
        </ul>
        ${({ model }) => model.completed.length ?
            '<button class="clear-completed">Clear completed</button>' : null}
    </footer>
`;

export default Stats;
