import { Component } from 'https://unpkg.com/rasti@2.0.0-alpha.0/es/';

import Todo from './Todo.js';

const List = Component.create`
    <ul class="todo-list">
        ${({ model }) => model.filtered.map(todo => new Todo({
            model : todo,
            handleRemove : () => model.removeTodo(todo)
        }))}
    </ul>
`;

export default List;
