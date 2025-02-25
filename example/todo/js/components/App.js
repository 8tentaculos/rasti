import { Component } from 'rasti';

import ToggleAll from './ToggleAll.js';
import List from './List.js';
import Stats from './Stats.js';

import { ENTER_KEY } from '../constants.js';

// Todo app.
const App = Component.create`
    <main 
        class="todoapp" 
        onKeyUp=${{ '.new-todo' : 'onKeyUp' }}
    >
        <header class="header">
            <h1>todos</h1>
            <input class="new-todo" placeholder="What needs to be done?" autofocus />
        </header>
        <section class="main">
            <${ToggleAll} model=${({ model }) => model} />
            <${List} model=${({ model }) => model} />
        </section>
        <${Stats} model=${({ model }) => model} />
    </main>
`.extend({
    onChange() {},
    onKeyUp(event) {
        // If ENTER key is pressed. Add todo.
        if (event.which === ENTER_KEY && event.target.value) {
            this.model.addTodo({ title : event.target.value });
            // Clear input.
            event.target.value = '';
        }
    }
});

export default App;
