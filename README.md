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

### Using ES modules

```javascript
import { Model, Component } from 'https://esm.run/rasti';
```

### Using a `<script>` tag

```html
<script src="https://cdn.jsdelivr.net/npm/rasti/dist/rasti.min.js"></script>
```

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
const model = new Model({ seconds: 0 });

// Mount the Timer component to the body and pass the model as an option.
Timer.mount({ model }, document.body);

// Increment the `seconds` property of the model every second.
setInterval(() => model.seconds++, 1000);
```

[Try it on CodePen](https://codepen.io/8tentaculos/pen/gOQxaOE?editors=0010)

### Adding sub components

```javascript
// Define the routes for the navigation menu.
const routes = [
    { label: 'Home', href: '#' },
    { label: 'Faq', href: '#faq' },
    { label: 'Contact', href: '#contact' },
];

// Create a Link component for navigation items.
const Link = Component.create`
    <a href="${({ options }) => options.href}">
        ${({ options }) => options.renderChildren()}
    </a>
`;

// Create a Navigation component that renders Link components for each route.
const Navigation = Component.create`
    <nav>
        ${({ options, partial }) => options.routes.map(
            ({ label, href }) => partial`<${Link} href="${href}">${label}</${Link}>`
        )}
    </nav>
`;

// Create a Main component that includes the Navigation and displays the current route's label as the title.
const Main = Component.create`
    <main>
        <${Navigation} routes=${({ options }) => options.routes} />
        <section>
            <h1>
                ${({ model, options }) => options.routes.find(
                    ({ href }) => href === (model.location || '#')
                ).label}
            </h1>
        </section>
    </main>
`;

// Initialize a model to store the current location.
const model = new Model({ location: document.location.hash });

// Update the model's location state when the browser's history changes.
window.addEventListener('popstate', () => model.location = document.location.hash);

// Mount the Main component to the body, passing the routes and model as options.
Main.mount({ routes, model }, document.body);
```

[Try it on CodePen](https://codepen.io/8tentaculos/pen/dyBMNbq?editors=0010)

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


## Powered by **Rasti**

### [Crypto Babylon](https://cryptobabylon.net)  

A market analytics platform efficiently rendering over 300 dynamic rows, updated in real-time with thousands of messages per second via multiple WebSocket connections.  

### [jsPacman](https://pacman.js.org)

A DOM-based remake of the classic Ms. Pac-Man game. **Rasti** powers its custom game engine.  

## License

**Rasti** is open-source and available under the [MIT License](LICENSE).

## Contributing

Contributions are welcome! Share feature ideas or report bugs on our [GitHub Issues page](https://github.com/8tentaculos/rasti/issues).

