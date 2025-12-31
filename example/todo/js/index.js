import AppModel from './models/App.js';
import App from './components/App.js';

/**
 * Initialize the todo application.
 * Loads saved todos from localStorage, sets up persistence,
 * and mounts the app to the DOM.
 */
function initApp() {
    // Get saved todos from localStorage.
    const attrs = JSON.parse(localStorage.getItem('todos')) || {};
    // Instantiate app model.
    const model = new AppModel(attrs);
    // Save changes on every update.
    model.on('change', () => {
        localStorage.setItem('todos', JSON.stringify(model));
    });
    // Instantiate app view. Mount it on #root element.
    App.mount({ model }, document.getElementById('root'));
}

// Initialize the app when the script loads.
initApp();
