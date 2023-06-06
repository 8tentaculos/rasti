import AppModel from './models/App.js';
import TodoModel from './models/Todo.js';
import App from './components/App.js';

// Get saved todos from localStorage
const attrs = JSON.parse(localStorage.getItem('todos')) || {};
// Instantiate app model
const model = new AppModel(attrs);
// Save changes on every update
model.on('change', () => {
    localStorage.setItem('todos', JSON.stringify(model));
});
// DOM node where the app will be rendered
const el = document.getElementById('root');
// Instantiate app view
const app = App.mount({ model }, el);
