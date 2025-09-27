import { Component } from 'rasti';

const getFilterClassName = (filter, current) => [
    filter,
    filter === current ? 'selected' : ''
].join(' ');

const onClickFilter = (filter) => function() {
    this.model.filter = filter;
};

const Footer = Component.create`
    <footer class="footer">
        <span class="todo-count">
            <strong>${({ model }) => model.remaining.length}</strong> 
            ${({ model }) => model.remaining.length === 1 ? 'item' : 'items'} left
        </span>
        <ul class="filters">
            <li>
                <a
                    class="${({ model }) => getFilterClassName('all', model.filter)}"
                    onClick=${onClickFilter('all')}
                >
                    All
                </a>
            </li>
            <li>
                <a
                    class="${({ model }) => getFilterClassName('remaining', model.filter)}"
                    onClick=${onClickFilter('remaining')}
                >
                    Remaining
                </a>
            </li>
            <li>
                <a
                    class="${({ model }) => getFilterClassName('completed', model.filter)}"
                    onClick=${onClickFilter('completed')}
                >
                    Completed
                </a>
            </li>
        </ul>
        ${({ model, partial }) => model.completed.length ?
            partial`
                <button
                    class="clear-completed"
                    onClick=${function() {
                        this.model.removeCompleted();
                    }}
                >
                    Clear completed
                </button>
            ` : null}
    </footer>
`;

export default Footer;
