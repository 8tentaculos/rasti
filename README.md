# <a href="http://rasti.js.org"><img src="docs/logo.svg" height="80" alt="Rasti" aria-label="rasti.js.org" /></a>


Rasti is a minimalistic, ultra-lightweight JavaScript library designed for efficient user interface development.<br />
Its goal is to help you create projects with a compact codebase, eliminating the need for boilerplate.<br />
While offering a low-level Model and View with a Backbone.js-like API, Rasti also introduces a higher-level Component class that enables a more composable and declarative approach to building UI components.<br />

The project is [hosted on GitHub](https://github.com/8tentaculos/rasti), and it's available for use under the [MIT](LICENSE.md) software license.<br />
You can report bugs and discuss features on the [GitHub issues page](https://github.com/8tentaculos/rasti/issues).

[![Build Status](https://app.travis-ci.com/8tentaculos/rasti.svg?branch=master)](https://app.travis-ci.com/8tentaculos/rasti)
[![npm version](https://img.shields.io/npm/v/rasti.svg?style=flat-square)](https://www.npmjs.com/package/rasti)
[![npm downloads](https://img.shields.io/npm/dm/rasti.svg?style=flat-square)](https://www.npmjs.com/package/rasti)

## Getting started

#### Using npm

```bash
$ npm install --save rasti
```

```javascript
import { Model, Component } from 'rasti';
```

#### Using native modules

```javascript
import { Model, Component } from 'https://unpkg.com/rasti/es';
```

#### Using `<script>` tag

```html
<script src="https://unpkg.com/rasti/dist/rasti.min.js"></script>
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

The [rasti npm package](https://www.npmjs.com/package/rasti) includes precompiled production and development UMD builds in the dist folder. They can be used directly without a bundler and are thus compatible with many popular JavaScript module loaders and environments.<br />
The UMD builds make Rasti available as a `window.Rasti` global variable.

## Example

The rasti [GitHub repository](https://github.com/8tentaculos/rasti) includes, in the [example folder](https://github.com/8tentaculos/rasti/tree/master/example/todo), an example [TODO application](http://rasti.js.org/example/todo/index.html) that can be used as starter project.

## API

Complete [API documentation](docs/api.md).

## License

[MIT](LICENSE.md)
