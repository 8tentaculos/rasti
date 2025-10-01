import { Component } from 'rasti';

/**
 * Header component for todo app.
 * Contains the title and input field for adding new todos.
 * @class Header
 */
const Header = Component.create`
    <header class="header">
        <h1>todos</h1>
        <input
            class="new-todo"
            placeholder="What needs to be done?"
            autofocus
            onKeyUp=${function(ev) {
                // If ENTER key is pressed. Add todo.
                if (ev.key === 'Enter' && ev.target.value) {
                    this.props.handleAddTodo(ev.target.value);
                    // Clear input.
                   ev.target.value = '';
                }
            }}
        />
    </header>
`;

export default Header;
