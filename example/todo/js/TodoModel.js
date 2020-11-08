TodoApp.TodoModel = function() {
    // Todo model
    class TodoModel extends Rasti.Model {
        toggle() {
            this.completed = !this.completed; 
        }
    }
    // Todo model has 'title' and 'completed' default attributes.
    TodoModel.prototype.defaults = {
        title : '',
        completed : false
    };
    
    return TodoModel;
}();
