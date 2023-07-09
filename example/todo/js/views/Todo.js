import { View } from 'https://esm.run/rasti';

import { ENTER_KEY, ESC_KEY } from '../constants.js';

// Single todo view.
class Todo extends View {
    // Do some initialization on the constructor.
    constructor(options) {
        super(options);
        // Store handleRemove handler.
        this.handleRemove = options.handleRemove;
        // Bind event handlers.
        this.render = this.render.bind(this);
        // Listen to model change event.
        this.model.on('change', this.render);
    }
    // Lifecycle method, called when view is destroyed.
    onDestroy() {
        // Stop listening to model events.
        this.model.off('change', this.render);
    }
    // Render todo.
    render() {
        // Render template inside el.
        this.el.innerHTML = this.template(this.model);
        // Cache ref to input dom element.
        this.$input = this.$('.edit');
        // Return the view itself for chaining.
        return this;
    }
    // Toggle the 'completed' state of the model.
    toggle() {
        this.model.toggle();
    }
    // Switch this view into 'editing' mode, displaying the input field.
    edit() {
        // Add 'editing' class to element.
        this.el.classList.add('editing');
        // Focus input field.
        this.$input.focus();
    }
    // Close the 'editing' mode, discarding changes.
    close() {
        // Check 'editing' class.
        if (!this.el.classList.contains('editing')) return;
        // Also reset the hidden input back to the original value.
        setTimeout(() => { this.$input.value = this.model.title; }, 10);
        // Quit editing. Remove 'editing' class from element.
        this.el.classList.remove('editing');
    }
    // Close the 'editing' mode, saving changes.
    saveAndClose() {
        // Check 'editing' class.
        if (!this.el.classList.contains('editing')) return;
        // Get value from dom.
        let value = this.$input.value;
        // If not empty, set model title.
        if (value) {
            this.model.title = value;
        }
        // Quit editing. Remove 'editing' class from element.
        this.el.classList.remove('editing');
    }
    // Event handlers
    // If you hit 'enter', we're through editing the item.
    // If you're pressing 'escape' we revert your change by simply leaving
    // the 'editing' state.
    onKeyPressEdit(event) {
        if (event.which === ENTER_KEY) {
            this.saveAndClose();
        }

        if (event.which === ESC_KEY) {
            this.close();
        }
    }
    // Click destroy.
    onClickDestroy() {
        // Call handler.
        this.handleRemove();
    }
}

Object.assign(Todo.prototype, {
    // Element tag name.
    tag : 'li',
    // Delegated events.
    events : {
        'click .toggle' : 'toggle',
        'dblclick label' : 'edit',
        'click .destroy' : 'onClickDestroy',
        'keydown .edit' : 'onKeyPressEdit',
        'keypress .edit' : 'onKeyPressEdit',
        'focusout .edit' : 'close',
    },
    // Template.
    template : (model) => `
        <div class="view${model.completed ? ' completed' : ''}">
            <input class="toggle" type="checkbox"${model.completed ? ' checked' : ''}>
            <label>${model.title}</label>
            <button class="destroy"></button>
        </div>
        <input class="edit" value="${model.title}">
    `
});

export default Todo;
