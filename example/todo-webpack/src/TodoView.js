import { View } from 'rasti';

import { ENTER_KEY, ESC_KEY } from './constants';

// Todo ui
class TodoView extends View {
    // Do some initialization on the constructor
    constructor(options) {
        super(options);
        // Store handleRemove handler
        this.handleRemove = options.handleRemove;
        // Bind event handlers
        this.close = this.close.bind(this);
        this.render = this.render.bind(this);
        // Listen to model change event
        this.model.on('change', this.render);
    }
    // Lifecycle method, called when view is destroyed
    onDestroy() {
        // Remove reference to handler
        this.handleRemove = null;
        // Stop listening to model events
        this.model.off('change', this.render);
        // Stop listening to input blur event
        this.$input.removeEventListener('blur', this.close);
    }
    // Render todo
    render() {
        // Stop listening to input blur event, if it was previously rendered
        if (this.$input) {
            this.$input.removeEventListener('blur', this.close);
        }
        // Render template inside el
        this.el.innerHTML = this.template(this.model);
        // Cache ref to input dom element
        this.$input = this.$('.edit');
        // Add listener to blur event. 
        // It cannot be delegated, so we have to manually add an event listener.
        this.$input.addEventListener('blur', this.close);

        return this;
    }
    // Toggle the 'completed' state of the model
    toggle() {
        this.model.toggle();
    }
    // Switch this view into 'editing' mode, displaying the input field.
    edit() {
        // Add 'editing' class to element
        this.el.classList.add('editing');
        // Focus input field
        this.$input.focus();
    }
    // Close the "editing" mode, discarding changes.
    close() {
        // Check 'editing' class
        if (!this.el.classList.contains('editing')) return;
        // Also reset the hidden input back to the original value.
        setTimeout(() => { this.$input.value = this.model.title; }, 10);
        // Remove 'editing' class from element
        this.el.classList.remove('editing');
    }
    // Close the 'editing' mode, saving changes.
    saveAndClose() {
        // Check 'editing' class
        if (!this.el.classList.contains('editing')) return;
        
        let value = this.$input.value;
        
        if (value) {
            this.model.title = value;
        } else {
            this.clear();
        }
        
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
    // Click destroy
    onClickDestroy() {
        // Call handler
        this.handleRemove();
    }
}

Object.assign(TodoView.prototype, {
    // Element tag name
    tag : 'li',
    // Delegated events
    events : {
        'click .toggle' : 'toggle',
        'dblclick label' : 'edit',
        'click .destroy' : 'onClickDestroy',
        'keydown .edit' : 'onKeyPressEdit',
        'keypress .edit' : 'onKeyPressEdit'
    },
    // Template
    template : (model) => `
        <div class="view${model.completed ? ' completed' : ''}">
            <input class="toggle" type="checkbox"${model.completed ? ' checked' : ''}>
            <label>${model.title}</label>
            <button class="destroy"></button>
        </div>
        <input class="edit" value="${model.title}">
    `
});

export default TodoView;
