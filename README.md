# <a href="http://rasti.js.org"><img src="docs/logo.svg" height="80" alt="Rasti" aria-label="rasti.js.org" /></a>

Rasti is a minimalistic JavaScript library for building user interfaces.  
It is designed to simplify the creation of complex dynamic applications by providing a declarative API for building reusable and composable UI components.  
Rasti is based on web standards, has a small footprint, and can be used directly in the browser without requiring any boilerplate or configuration.  

The project is [hosted on GitHub](https://github.com/8tentaculos/rasti), and it's available for use under the [MIT](LICENSE.md) software license.  
You can report bugs and discuss features on the [GitHub issues page](https://github.com/8tentaculos/rasti/issues).

[![Travis (.com)](https://img.shields.io/travis/com/8tentaculos/rasti?style=flat-square)](https://app.travis-ci.com/8tentaculos/rasti)
[![npm version](https://img.shields.io/npm/v/rasti.svg?style=flat-square)](https://www.npmjs.com/package/rasti)
[![npm downloads](https://img.shields.io/npm/dm/rasti.svg?style=flat-square)](https://www.npmjs.com/package/rasti)
[![](https://data.jsdelivr.com/v1/package/npm/rasti/badge)](https://www.jsdelivr.com/package/npm/rasti)

## Getting started

#### Using npm

```bash
$ npm install rasti
```

```javascript
import { Model, Component } from 'rasti';
```

#### Using ES modules

```javascript
import { Model, Component } from 'https://esm.run/rasti';
```

#### Using `<script>` tag

```html
<script src="https://cdn.jsdelivr.net/npm/rasti/dist/rasti.min.js"></script>
```

```javascript
const { Model, Component } = Rasti;
```

#### A simple `Component`

```javascript
// Create Timer component.
const Timer = Component.create`
    <div>
        Seconds: <span>${({ model }) => model.seconds}</span>
    </div>
`;
// Create model to store seconds.
const model = new Model({ seconds: 0 });
// Mount timer on body.
Timer.mount({ model }, document.body);
// Increment `model.seconds` every second.
setInterval(() => model.seconds++, 1000);
```

[Try it on CodePen](https://codepen.io/8tentaculos/pen/gOQxaOE?editors=0010)

The [rasti npm package](https://www.npmjs.com/package/rasti) includes precompiled production and development UMD builds in the dist folder. They can be used directly without a bundler and are thus compatible with many popular JavaScript module loaders and environments.  
The UMD builds make Rasti available as a `window.Rasti` global variable.

## Example

The rasti [GitHub repository](https://github.com/8tentaculos/rasti) includes, in the [example folder](https://github.com/8tentaculos/rasti/tree/master/example/todo), an example [TODO application](http://rasti.js.org/example/todo/index.html) that can be used as starter project.

## API

Complete [API documentation](docs/api.md).

## Powered by Rasti

### Crypto Babylon

[Crypto Babylon](https://cryptobabylon.net), a markets analytics platform, leverages the capabilities of Rasti.  
The Rasti rendering system is responsible for efficiently rendering a table containing over 300 rows. Additionally, it seamlessly updates the DOM in real-time, handling thousands of messages per second from multiple WebSocket connections.

### jsPacman

[jsPacman](https://pacman.js.org), a JavaScript DOM-based remake of the classic Ms. Pac-Man game, utilizes Rasti at a low level for its custom game engine.

## License

[MIT](LICENSE.md)
