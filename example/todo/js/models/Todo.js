import { Model } from 'https://esm.run/rasti@alpha';

// Todo model.
class Todo extends Model {
    toggle() {
        this.completed = !this.completed; 
    }
}
// Todo model has 'title' and 'completed' default attributes.
Todo.prototype.defaults = {
    title : '',
    completed : false
};

export default Todo;
