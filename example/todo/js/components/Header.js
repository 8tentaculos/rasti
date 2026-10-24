import { Component, Model } from 'rasti';

/**
 * Header component for todo app.
 * Contains the title and input field for adding new todos.
 * @class Header
 */
class Header extends Component {
    /**
     * Called when the component is created, at the end of the constructor.
     * Add internal component state.
     */
    onCreate() {
        // `title` holds what the input shows.
        this.state = new Model({ title : '' });
    }

    /**
     * Add a todo with the typed title, unless it is empty, and clear the input.
     */
    add() {
        const title = this.state.title.trim();
        if (!title) return;
        this.props.handleAddTodo(title);
        this.state.title = '';
    }

    template() {
        const { state } = this;
        return this.html`
            <header class="header">
                <h1>todos</h1>
                <input
                    class="new-todo"
                    name="new-todo"
                    placeholder="What needs to be done?"
                    autofocus
                    value="${state.title}"
                    onInput=${({ target }) => {
                        state.title = target.value;
                    }}
                    onKeyUp=${({ key }) => {
                        if (key === 'Enter') this.add();
                    }}
                />
            </header>
        `;
    }
}

export default Header;
