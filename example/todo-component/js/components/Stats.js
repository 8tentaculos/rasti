import component from '/lib/component.js';

const Stats = component`
    <footer
        class="footer"
        onClick=${{
            '.all' : function() { this.model.filter = 'all' },
            '.remaining' : function() { this.model.filter = 'remaining' },
            '.completed' : function() { this.model.filter = 'completed' },
            '.clear-completed': function() { this.model.removeCompleted() },
        }}
    >
        <span class="todo-count">
            <strong>${({ model }) => model.remaining.length}</strong> ${({ model }) => model.remaining.length === 1 ? 'item' : 'items'} left
        </span>
        <ul class="filters ${({ model }) => model.filter}">
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
        ${({ model }) => model.completed.length ? '<button class="clear-completed">Clear completed</button>' : ''}
    </footer>
`;

export default Stats;
