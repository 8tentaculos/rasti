import { Component, Model } from 'rasti';

/**
 * Single todo item component.
 * Displays a todo with checkbox, label, and delete button.
 * Supports editing mode with inline editing.
 * @class Todo
 */
class Todo extends Component {
    /**
     * Called when the component is created, at the end of the constructor.
     * Add internal component state.
     */
    onCreate() {
        // `draft` holds what the edit input shows while editing.
        this.state = new Model({ editing : false, draft : '' });
    }

    /**
     * Enter editing mode with the current title as the draft, then focus the input
     * and select its text. The render is synchronous, so the input is already shown.
     */
    edit() {
        this.state.set({ editing : true, draft : this.model.title });
        const input = this.$('input.edit');
        input.focus();
        input.select();
    }

    /**
     * Save the draft as the title, unless it is empty, and leave editing mode.
     */
    save() {
        const title = this.state.draft.trim();
        if (title) this.model.title = title;
        this.state.editing = false;
    }

    /**
     * Leave editing mode, discarding the draft.
     */
    cancel() {
        this.state.editing = false;
    }

    template() {
        const { model, state } = this;
        return this.html`
            <li class="${[model.completed && 'completed', state.editing && 'editing'].filter(Boolean).join(' ')}">
                <div class="view">
                    <input
                        class="toggle"
                        name="toggle"
                        type="checkbox"
                        checked="${model.completed}"
                        onChange=${() => model.toggle()}
                    >
                    <label onDblClick=${() => this.edit()}>${model.title}</label>
                    <button class="destroy" onClick=${() => this.props.handleRemove(model)}></button>
                </div>

                <input
                    class="edit"
                    name="edit"
                    value="${state.draft}"
                    onInput=${({ target }) => {
                        state.draft = target.value;
                    }}
                    onKeyUp=${({ key }) => {
                        if (key === 'Enter') this.save();
                        else if (key === 'Escape') this.cancel();
                    }}
                    onFocusOut=${() => this.cancel()}
                />
            </li>
        `;
    }
}

export default Todo;
