import { Component } from 'rasti';

import Todo from './Todo.js';

const List = Component.create`
    <ul class="todo-list">
        ${({ model }) => model.filtered.map(todo => Todo.mount({
            model : todo,
            handleRemove : () => model.removeTodo(todo)
        }))}
    </ul>
`;

export default List;
