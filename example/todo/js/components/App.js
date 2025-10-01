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
const App = Component.create`
    <main class="todoapp">
        <${Header} key="header" handleAddTodo="${({ model }) => (title) => model.addTodo({ title })}" />

        ${({ model, partial }) => !!model.todos.length && partial`
            <section class="main">
                <${ToggleAll}
                    key="toggle-all"
                    checked="${() => !!model.todos.length && !model.remaining.length}"
                    handleChange=${(checked) => model.toggleAll(checked)}
                />

                <ul class="todo-list">
                    ${model.filtered.map(todo => partial`
                        <${Todo}
                            model="${todo}"
                            handleRemove=${() => model.removeTodo(todo)}
                        />
                    `)}
                </ul>
            </section>

            <${Footer} key="footer" model="${model}" />
        `}
    </main>
`;

export default App;
