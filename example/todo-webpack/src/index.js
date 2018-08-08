import './styles.css';

import AppModel from './AppModel';
import AppView from './AppView';

const el = document.getElementById('root');

const model = new AppModel();

const app = new AppView({ el, model });

app.render();
