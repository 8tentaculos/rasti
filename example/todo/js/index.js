import AppModel from './models/App.js';
import AppView from './views/App.js';

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
const app = new AppView({ el, model });
// Render app
app.render();
