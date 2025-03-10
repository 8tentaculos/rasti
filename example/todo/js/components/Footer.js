import { Component } from 'rasti';

const getFilterClassName = (filter, current) => [
    filter,
    filter === current ? 'selected' : ''
].join(' ');

const Footer = Component.create`
    <footer
        class="footer"
        onClick=${{
            'a.all' : function() {
                this.model.filter = 'all';
            },
            'a.remaining' : function() {
                this.model.filter = 'remaining';
            },
            'a.completed' : function() {
                this.model.filter = 'completed';
            },
            'button.clear-completed' : function() {
                this.model.removeCompleted();
            },
        }}
    >
        <span class="todo-count">
            <strong>${({ model }) => model.remaining.length}</strong> 
            ${({ model }) => model.remaining.length === 1 ? 'item' : 'items'} left
        </span>
        <ul class="filters">
            <li><a class="${({ model }) => getFilterClassName('all', model.filter)}">All</a></li>
            <li><a class="${({ model }) => getFilterClassName('remaining', model.filter)}">Remaining</a></li>
            <li><a class="${({ model }) => getFilterClassName('completed', model.filter)}">Completed</a></li>
        </ul>
        ${({ model, partial }) => model.completed.length ?
            partial`<button class="clear-completed">Clear completed</button>` : null}
    </footer>
`;

export default Footer;
