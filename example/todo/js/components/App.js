import { Component } from 'rasti';

import Header from './Header.js';
import ToggleAll from './ToggleAll.js';
import Todo from './Todo.js';
import Footer from './Footer.js';

/**
 * Main Todo application component.
 * Renders the complete todo app with header, todo list, and footer.
 * @class App
 */
class App extends Component {
    // Callbacks for the children, created once per instance so that a render of
    // the app does not re-render children whose props did not change.
    handleAddTodo = (title) => this.model.addTodo({ title });
    handleToggleAll = (completed) => this.model.toggleAll(completed);
    handleRemove = (todo) => this.model.removeTodo(todo);

    template() {
        const { model } = this;
        return this.html`
            <main class="todoapp">
                <${Header} handleAddTodo=${this.handleAddTodo} />

                ${model.todos.length > 0 && this.html`
                    <section class="main">
                        <${ToggleAll}
                            checked="${model.remaining.length === 0}"
                            handleChange=${this.handleToggleAll}
                        />

                        <ul class="todo-list">
                            ${model.filtered.map(todo => this.html`
                                <${Todo} key="${todo.id}" model="${todo}" handleRemove=${this.handleRemove} />
                            `)}
                        </ul>
                    </section>

                    <${Footer} model="${model}" />
                `}
            </main>
        `;
    }
}

export default App;
