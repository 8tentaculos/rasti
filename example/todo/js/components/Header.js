import { Component } from 'rasti';

import escapeHTML from '../utils/escapeHTML.js';
import { ENTER_KEY } from '../constants.js';

const Header = Component.create`
    <header class="header" onKeyUp=${{ 'input' : 'onKeyUp' }}>
        <h1>todos</h1>
        <input class="new-todo" placeholder="What needs to be done?" autofocus />
    </header>
`.extend({
    onChange() {},
    onKeyUp(ev) {
        // If ENTER key is pressed. Add todo.
        if (ev.which === ENTER_KEY && ev.target.value) {
            this.model.addTodo({
                title : escapeHTML(ev.target.value)
            });
            // Clear input.
            ev.target.value = '';
        }
    }
});

export default Header;
