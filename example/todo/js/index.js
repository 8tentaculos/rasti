import AppModel from './models/App.js';
import TodoModel from './models/Todo.js';
import AppView from './views/App.js';

// Get saved todos from localStorage
const savedTodos = (JSON.parse(localStorage.getItem('todos')) || []).map(todo => new TodoModel(todo));
// Instantiate app model
const model = new AppModel(savedTodos);
// Save changes on every update
model.on('todos:update', () => {
  localStorage.setItem('todos', JSON.stringify(model.todos));
});
// DOM node where the app will be rendered
const el = document.getElementById('root');
// Instantiate app view
const app = new AppView({ el, model });
// Render app
app.render();
