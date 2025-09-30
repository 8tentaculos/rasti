import { Component } from 'rasti';

import Header from './Header.js';
import ToggleAll from './ToggleAll.js';
import Todo from './Todo.js';
import Footer from './Footer.js';

// Todo app.
const App = Component.create`
    <main class="todoapp">
        <${Header} model="${({ model }) => model}" key="header" />

        ${({ model, partial }) => !!model.todos.length && partial`
            <section class="main">
                <${ToggleAll} checked="${() => !!model.todos.length && !model.remaining.length}" handleChange=${(checked) => model.toggleAll(checked)} key="toggle-all" />

                <ul class="todo-list">
                    ${model.filtered.map(todo => partial`
                        <${Todo} model="${todo}" handleRemove=${() => model.removeTodo(todo)} />
                    `)}
                </ul>
            </section>

            <${Footer} model="${model}" key="footer" />
        `}
    </main>
`;

export default App;
