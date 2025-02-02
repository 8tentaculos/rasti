<p align="center">
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="docs/logo-dark.svg">
        <img alt="Rasti.js" src="docs/logo.svg" height="120">
    </picture>
</p>

<p align="center">
    <b>Modern MVC for building user interfaces</b>
</p>

**Rasti** is a lightweight MVC library for building fast, reactive user interfaces. Inspired by **Backbone.js**, it retains a familiar API while removing non-essential features and introducing modern, declarative, and composable components to simplify complex UI development.

[![Travis (.com)](https://img.shields.io/travis/com/8tentaculos/rasti?style=flat-square)](https://app.travis-ci.com/8tentaculos/rasti)
[![npm version](https://img.shields.io/npm/v/rasti.svg?style=flat-square)](https://www.npmjs.com/package/rasti)
[![npm package minimized gzipped size](https://img.shields.io/bundlejs/size/rasti?style=flat-square)](https://unpkg.com/rasti/dist/rasti.min.js)
[![npm downloads](https://img.shields.io/npm/dm/rasti.svg?style=flat-square)](https://www.npmjs.com/package/rasti)
[![jsDelivr hits (npm)](https://img.shields.io/jsdelivr/npm/hm/rasti?style=flat-square)](https://www.jsdelivr.com/package/npm/rasti)

## Key Features  

- 🌟 **Declarative Components**: Build dynamic UI components using intuitive template literals.  
- 🎯 **Event Delegation**: Simplify event handling with built-in delegation.  
- 🔗 **Model-View Binding**: Keep your UI and data in sync with ease.  
- 🌐 **Server-Side Rendering**: Render as plain text for server-side use or static builds.  
- ⚡ **Lightweight and Fast**: Minimal overhead with efficient rendering.  
- 🕰️ **Legacy Compatibility**: Seamlessly integrates into existing **Backbone.js** projects.
- 📐 **Standards-Based**: Built on modern web standards, no tooling required. 

## Getting Started

### Using npm

```bash
$ npm install rasti
```

```javascript
import { Model, Component } from 'rasti';
```

### Using ES modules

```javascript
import { Model, Component } from 'https://esm.run/rasti';
```

### Using `<script>` tag

```html
<script src="https://cdn.jsdelivr.net/npm/rasti/dist/rasti.min.js"></script>
```

```javascript
const { Model, Component } = Rasti;
```

### A simple `Component`

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

### Adding sub components

```javascript
// Create Button component.
const Button = Component.create`
    <button
        onClick="${{ '&' : function() { this.options.onClick() } }}"
    >
        ${({ options }) => options.label}
    </button>
`;
// Create Counter component.
const Counter = Component.create`
    <div>
        ${({ model }) => Button.mount({ label : '-', onClick : () => model.count-- })}
        <span>${({ model }) => model.count}</span>
        ${({ model }) => Button.mount({ label : '+', onClick : () => model.count++ })}
    </div>
`;
// Create model to store count.
const model = new Model({ count: 0 });
// Mount counter on body.
Counter.mount({ model }, document.body);
```

[Try it on CodePen](https://codepen.io/8tentaculos/pen/ZEZarEQ?editors=0010)

## Why Choose **Rasti**?  

- **Small Projects**: Perfect for lightweight apps, free from unnecessary overhead or tooling.  
- **Efficient Rendering**: Ideal for rendering large dynamic tables or datasets without requiring virtual scrolling.  
- **Legacy Maintenance**: Modernize your **Backbone.js** views gradually, allowing for incremental updates without the need for a complete rewrite.

## Example

The rasti [GitHub repository](https://github.com/8tentaculos/rasti) includes, in the [example folder](https://github.com/8tentaculos/rasti/tree/master/example/todo), an example [TODO application](https://rasti.js.org/example/todo/index.html) that can be used as starter project.

## API

Complete [API documentation](/docs/api.md).

## Powered by **Rasti**

### [Crypto Babylon](https://cryptobabylon.net)  

A market analytics platform efficiently rendering over 300 dynamic rows, updated in real-time with thousands of messages per second via multiple WebSocket connections.  

### [jsPacman](https://pacman.js.org)

A DOM-based remake of the classic Ms. Pac-Man game. **Rasti** powers its custom game engine.  

## License

**Rasti** is open-source and available under the [MIT License](LICENSE).

## Contributing

Contributions are welcome! Share feature ideas or report bugs on our [GitHub Issues page](https://github.com/8tentaculos/rasti/issues).

