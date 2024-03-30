import { Component } from 'https://esm.run/rasti';

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
