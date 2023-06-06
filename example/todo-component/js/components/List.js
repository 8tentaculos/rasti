import component from '/lib/component.js';

import Todo from './Todo.js';

const List = component`
    <ul class="todo-list">
        ${({ model }) => model.filtered.map(todo => new Todo({
            model : todo,
            handleRemove : () => model.removeTodo(todo)
        }))}
    </ul>
`;

export default List;
