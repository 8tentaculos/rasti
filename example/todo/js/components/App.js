import { Component } from 'https://unpkg.com/rasti@2.0.0-alpha.0/es';

import ToggleAll from './ToggleAll.js';
import List from './List.js';
import Stats from './Stats.js';

import { ENTER_KEY } from '../constants.js';

// Todo app.
const App = Component.create`
    <section 
        class="todoapp" 
        onKeyUp=${{
            // Type new todo.
            '.new-todo' : function(event) {
                // If ENTER key is pressed. Add todo.
                if (event.which === ENTER_KEY && event.target.value) {
                    this.model.addTodo({ title : event.target.value });
                    // Clear input.
                    event.target.value = '';
                }
            }
        }}
    >
        <header class="header">
            <h1>todos</h1>
            <input class="new-todo" placeholder="What needs to be done?" autofocus />
        </header>
        <section class="main">
            ${({ model }) => new ToggleAll({ model })}
            ${({ model }) => new List({ model })}
        </section>
        ${({ model }) => new Stats({ model })}
    </section>
`.extend({
    onChange() {}
});

export default App;
