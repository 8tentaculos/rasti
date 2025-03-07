import { Component } from 'rasti';

import Header from './Header.js';
import ToggleAll from './ToggleAll.js';
import Todo from './Todo.js';
import Footer from './Footer.js';

// Todo app.
const App = Component.create`
    <main class="todoapp">
        <${Header} model=${({ model }) => model} key="header" />
        <section class="main">
            <${ToggleAll} model=${({ model }) => model} key="toggle-all" />
            <ul class="todo-list">
                ${self => self.model.filtered.map(todo => self.partial`
                    <${Todo} ${{ model : todo, handleRemove : () => self.model.removeTodo(todo) }} />
                `)}
            </ul>
        </section>
        <${Footer} model=${({ model }) => model} key="footer" />
    </main>
`;

export default App;
