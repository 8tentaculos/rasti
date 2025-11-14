<p align="center">
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.0.0-alpha.7/docs/logo-dark.svg">
        <img alt="Rasti.js" src="https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.0.0-alpha.7/docs/logo.svg" height="120">
    </picture>
</p>

<p align="center">
    <b>Modern MVC for building user interfaces</b>
</p>

**Rasti** is a lightweight MVC library for building fast, reactive user interfaces. Inspired by **Backbone.js**, it retains a familiar API while removing non-essential features and introducing modern, declarative, and composable components to simplify complex UI development.

[![Travis (.com)](https://img.shields.io/travis/com/8tentaculos/rasti)](https://app.travis-ci.com/8tentaculos/rasti)
[![npm version](https://img.shields.io/npm/v/rasti.svg)](https://www.npmjs.com/package/rasti)
[![npm package minimized gzipped size](https://img.shields.io/bundlejs/size/rasti)](https://unpkg.com/rasti/dist/rasti.min.js)
[![npm downloads](https://img.shields.io/npm/dm/rasti.svg)](https://www.npmjs.com/package/rasti)
[![jsDelivr hits (npm)](https://img.shields.io/jsdelivr/npm/hm/rasti)](https://www.jsdelivr.com/package/npm/rasti)

## Key Features  

- **Declarative Components** 🌟  
  Build dynamic UI components using intuitive template literals.  
- **Event Delegation** 🎯  
  Simplify event handling with built-in delegation.  
- **Model-View Binding** 🔗  
  Keep your UI and data in sync with ease.  
- **Server-Side Rendering** 🌐  
  Render as plain text for server-side use or static builds.  
- **Lightweight and Fast** ⚡  
  Minimal overhead with efficient rendering.  
- **Legacy Compatibility** 🕰️  
  Seamlessly integrates into existing **Backbone.js** projects.  
- **Standards-Based** 📐  
  Built on modern web standards, no tooling required.  

## Getting Started

### Installing via npm

```bash
$ npm install rasti
```

```javascript
import { Model, Component } from 'rasti';
```

### Using ES modules via CDN

```javascript
import { Model, Component } from 'https://esm.run/rasti';
```

### Using a UMD build via CDN

Include **Rasti** directly in your HTML using a CDN. Available UMD builds:

- [https://cdn.jsdelivr.net/npm/rasti/dist/rasti.js](https://cdn.jsdelivr.net/npm/rasti/dist/rasti.js)
- [https://cdn.jsdelivr.net/npm/rasti/dist/rasti.min.js](https://cdn.jsdelivr.net/npm/rasti/dist/rasti.min.js)

```html
<script src="https://cdn.jsdelivr.net/npm/rasti"></script>
```

The UMD build exposes the `Rasti` global object:

```javascript
const { Model, Component } = Rasti;
```

### Create a `Component`

```javascript
// Define a Timer component that displays the number of seconds from the model.
const Timer = Component.create`
    <div>
        Seconds: <span>${({ model }) => model.seconds}</span>
    </div>
`;

// Create a model to store the seconds.
const model = new Model({ seconds : 0 });

// Mount the Timer component to the body and pass the model as an option.
Timer.mount({ model }, document.body);

// Increment the `seconds` property of the model every second.
// Only the text node inside the <span> gets updated on each render.
setInterval(() => model.seconds++, 1000);
```

[Try it on CodePen](https://codepen.io/8tentaculos/pen/gOQxaOE?editors=0010)

### Adding sub components

```javascript
// Define the routes for the navigation menu.
const routes = [
    { label : 'Home', href : '#' },
    { label : 'Faq', href : '#faq' },
    { label : 'Contact', href : '#contact' },
];

// Create a Link component for navigation items.
const Link = Component.create`
    <a href="${({ props }) => props.href}">
        ${({ props }) => props.renderChildren()}
    </a>
`;

// Create a Navigation component that renders Link components for each route.
const Navigation = Component.create`
    <nav>
        ${({ props, partial }) => props.routes.map(
            ({ label, href }) => partial`<${Link} href="${href}">${label}</${Link}>`
        )}
    </nav>
`;

// Create a Main component that includes the Navigation and displays the current route's label as the title.
const Main = Component.create`
    <main>
        <${Navigation} routes=${({ props }) => props.routes} />
        <section>
            <h1>
                ${({ model, props }) => props.routes.find(
                    ({ href }) => href === (model.location || '#')
                ).label}
            </h1>
        </section>
    </main>
`;

// Initialize a model to store the current location.
const model = new Model({ location : document.location.hash });

// Update the model's location state when the browser's history changes.
window.addEventListener('popstate', () => model.location = document.location.hash);

// Mount the Main component to the body, passing the routes and model as options.
Main.mount({ routes, model }, document.body);
```

[Try it on CodePen](https://codepen.io/8tentaculos/pen/dyBMNbq?editors=0010)

### Adding event listeners

```javascript
// Create a model to store the counter value.
const model = new Model({ count : 0 });

// Create a Counter component with increment and decrement buttons.
const Counter = Component.create`
    <div>
        <div>Counter: ${({ model }) => model.count}</div>
        <button onClick=${function() { this.model.count++; }}>Increment</button>
        <button onClick=${function() { this.model.count--; }}>Decrement</button>
    </div>
`;

// Mount the Counter component to the body and pass the model as an option.
Counter.mount({ model }, document.body);

// Event listeners are bound to 'this' and use delegation from the root element.
// When buttons are clicked, only the text node gets updated, not the entire component.
```

[Try it on CodePen](https://https://codepen.io/8tentaculos/pen/XJXVQOR?editors=0010)

## Why Choose **Rasti**?  

**Rasti** is built for developers who want a simple yet powerful way to create UI components without the complexity of heavy frameworks. Whether you're building a high-performance dashboard, or embedding a lightweight widget, **Rasti** lets you:  

- **Skip the Setup**  
  No installations, no build tools—just load it and start coding.  
- **Lightweight and Efficient**  
  Minimal footprint with optimized performance, ensuring smooth updates.  
- **Just the Right Abstraction**  
  Keeps you close to the DOM with no over-engineering. Fully hackable—if you're curious about how something works, just check the source code.  

## Example

You can find a sample **TODO application** in the [example folder](https://github.com/8tentaculos/rasti/tree/master/example/todo) of the **Rasti** [GitHub repository](https://github.com/8tentaculos/rasti). This example serves as a great starting point for your own projects. Try it live [here](https://rasti.js.org/example/todo/index.html).

## API Documentation

For detailed information on how to use **Rasti**, refer to the [API documentation](/docs/api.md).

## Version History

We strive to minimize breaking changes between major versions. However, if you're migrating between major versions, please refer to the release notes below for details on any breaking changes and migration tips.

- **[v4.0.0](https://github.com/8tentaculos/rasti/releases/tag/v4.0.0)**
- **[v3.0.0](https://github.com/8tentaculos/rasti/releases/tag/v3.0.0)**
- **[v2.0.0](https://github.com/8tentaculos/rasti/releases/tag/v2.0.0)**
- **[v1.0.0](https://github.com/8tentaculos/rasti/releases/tag/v1.0.0)**

## License

**Rasti** is open-source and available under the [MIT License](LICENSE).

## Contributing

Contributions are welcome! Share feature ideas or report bugs on our [GitHub Issues page](https://github.com/8tentaculos/rasti/issues).

