# <a href='http://rasti.js.org'><img src='logo.svg' height='80' alt='Rasti' aria-label='rasti.js.org' /></a>

Rasti is a minimalistic JavaScript MV library for building user interfaces.<br />
It gives structure to applications by providing [models](docs/api.md#module_Model) that emit events on properties changes, and [views](docs/api.md#module_View) with declarative event handling to define UI components.<br />
Rasti is inspired by Backbone. You can consider it as an ES6 subset of Backbone with no dependencies.<br />
It's ideal for building simple lightweight applications, without the need of config or boilerplate. Projects where a resulting small codebase is prioritized over using a complex rendering system.<br />
The project is [hosted on GitHub](https://github.com/8tentaculos/rasti), and it's available for use under the [MIT](LICENSE.md) software license.<br />
You can report bugs and discuss features on the [GitHub issues page](https://github.com/8tentaculos/rasti/issues).

[![build status](https://img.shields.io/travis/8tentaculos/rasti/master.svg?style=flat-square)](https://travis-ci.org/8tentaculos/rasti)
[![npm version](https://img.shields.io/npm/v/rasti.svg?style=flat-square)](https://www.npmjs.com/package/rasti)
[![npm downloads](https://img.shields.io/npm/dm/rasti.svg?style=flat-square)](https://www.npmjs.com/package/rasti)

## Getting started

#### Using npm

```bash
$ npm install --save rasti
```

```javascript
import { View } from 'rasti';
```

#### Using `<script>` tag

```html
<script src="https://unpkg.com/rasti/dist/rasti.min.js"></script>
```

```javascript
const { View } = Rasti;
```

#### A simple `View`

```javascript
const hello = new View({
    tag : 'h1',
    template : (model) => `Hello ${model.who}!`,
    model : { who : 'World' }
});

document.body.appendChild(hello.render().el); // <h1>Hello World!</h1>
```

The [rasti npm package](https://www.npmjs.com/package/rasti) includes precompiled production and development UMD builds in the dist folder. They can be used directly without a bundler and are thus compatible with many popular JavaScript module loaders and environments.<br />
For example, you can drop a UMD build as a `<script>` tag on the page, or tell Bower to install it. The UMD builds make Rasti available as a window.Rasti global variable.

## Example

The rasti [GitHub repository](https://github.com/8tentaculos/rasti) includes, in the example folder, a [vanila js](https://github.com/8tentaculos/rasti/tree/master/example/todo) and a [webpack](https://github.com/8tentaculos/rasti/tree/master/example/todo-webpack) versions of a [Todo app](http://rasti.js.org/example/todo/index.html) that can be used as starter project.

## API

Complete [API documentation](docs/api.md).

## License

[MIT](LICENSE.md)
