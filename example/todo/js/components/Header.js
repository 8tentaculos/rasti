import { Component } from 'rasti';

import { ENTER_KEY } from '../constants.js';

const Header = Component.create`
    <header
        class="header"
        onKeyUp=${{
            'input' : function(ev) {
                // If ENTER key is pressed. Add todo.
                if (ev.which === ENTER_KEY && ev.target.value) {
                    this.model.addTodo({
                        title : ev.target.value
                    });
                    // Clear input.
                   ev.target.value = '';
                }
            }
        }}
    >
        <h1>todos</h1>
        <input class="new-todo" placeholder="What needs to be done?" autofocus />
    </header>
`.extend({ onChange() {} });

export default Header;
