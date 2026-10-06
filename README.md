<p align="center">
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.1.3/docs/logo-dark.svg">
        <img alt="Rasti.js" src="https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.1.3/docs/logo.svg" height="120">
    </picture>
</p>

<p align="center">
    <b>HTML-first, composable user interfaces</b>
</p>

**Rasti is a library for building state-driven user interfaces from HTML-first components.**

A component's template renders as **HTML first**. That markup is then **hydrated**, and from then on, when state changes, Rasti **patches only the regions that changed**.

This has two consequences:

- Parsing and DOM creation are delegated to the browser's own parser.
- Server rendering, static builds and browser rendering all follow the same path.

Underneath sits a small MVC core — **models**, **views** and **event emitters** — small enough to read when you need to know how something works. Templates are tagged literals, so there's no build step: drop in a `<script>` tag and start.

[![CI](https://github.com/8tentaculos/rasti/actions/workflows/ci.yml/badge.svg)](https://github.com/8tentaculos/rasti/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/rasti.svg)](https://www.npmjs.com/package/rasti)
[![npm package minimized gzipped size](https://img.shields.io/bundlejs/size/rasti)](https://unpkg.com/rasti/dist/rasti.min.js)
[![npm downloads](https://img.shields.io/npm/dm/rasti.svg)](https://www.npmjs.com/package/rasti)
[![jsDelivr hits (npm)](https://img.shields.io/jsdelivr/npm/hm/rasti)](https://www.jsdelivr.com/package/npm/rasti)
[![license](https://img.shields.io/npm/l/rasti.svg)](https://github.com/8tentaculos/rasti/blob/master/LICENSE)

## Key Features

- **Components as tags**  
  A component is used inside another template as a tag: `<${Link} href="${href}">${label}</${Link}>`, with props, children and a closing tag. No registry, no custom elements, no JSX.
- **Handlers in the markup**  
  `onClick=${function() { this.model.count++; }}` — handlers are written as attributes, run with `this` bound to the component, and are delegated from its root element, so an update never binds a listener to a node inside it, and a handler created anew on every render costs nothing.
- **Updates in place**  
  A change re-evaluates every interpolation and writes only what differs. Partials are retained by call site, child components by key or position, so no element is recreated to apply a change: focus, selection and input values persist.
- **State from anything that emits**  
  `model`, `state` and `props` are subscribed automatically, and a change event fires only when a value really differs — nothing re-renders on a no-op set, including a child whose props resolved the same. `subscribe()` takes any object with `on`/`off`: a Backbone model, or a store of your own.
- **Real DOM, no wrapper**  
  `render().el` is the element itself: no shadow DOM, no synthetic events, nothing between you and the node. Query it, style it, or hand it to another library.
- **Server rendering and hydration**  
  Rendering is just `toString`: a component drops into any HTML string, anywhere JavaScript runs — ``const html = `<body>${new App({ model })}</body>` `` — and picks up the served markup in the browser without recreating it.
- **Typed**  
  TypeScript declarations ship with the package and resolve automatically.

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

- [rasti.js](https://cdn.jsdelivr.net/npm/rasti/dist/rasti.js)
- [rasti.min.js](https://cdn.jsdelivr.net/npm/rasti/dist/rasti.min.js)

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
            ({ label, href }) => partial`<${Link} key="${href}" href="${href}">${label}</${Link}>`
        )}
    </nav>
`;

// Create a Main component that includes the Navigation and displays the current route's label as the title.
class Main extends Component {
    template() {
        return this.partial`
            <main>
                <${Navigation} routes="${this.props.routes}" />
                <section>
                    <h1>${this.currentRoute().label}</h1>
                </section>
            </main>
        `;
    }

    currentRoute() {
        return this.props.routes.find(({ href }) => href === (this.model.location || '#'));
    }
}

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
class Counter extends Component {
    template() {
        return this.partial`
            <div>
                <div>Counter: ${this.model.count}</div>
                <button onClick=${() => this.increment()}>Increment</button>
                <button onClick=${() => this.decrement()}>Decrement</button>
            </div>
        `;
    }

    increment() {
        this.model.count++;
    }

    decrement() {
        this.model.count--;
    }
}

// Mount the Counter component to the body and pass the model as an option.
Counter.mount({ model }, document.body);

// Event listeners are delegated from the component's root element.
// When buttons are clicked, only the text node gets updated, not the entire component.
```

[Try it on CodePen](https://codepen.io/8tentaculos/pen/XJXVQOR?editors=0010)

### Writing components

A component renders from its **`template()` method**, which returns a **partial** built with `this.partial`. Write it in a subclass, as `Main` and `Counter` do above: it is the recommended form. `Component.create` can also write it for you from a tagged template, the shortest form for simple components like `Timer` and `Link`, or from a template function. The three forms, how they differ and when to use each are in [Writing components](/docs/components.md).

## Scaffolding a New Project

The fastest way to start a real-world **Rasti** project is [`create-rasti`](https://github.com/8tentaculos/create-rasti), the official scaffolding tool. It generates a ready-to-use **Rasti** + **Vite** setup with optional server-side rendering, routing, styling, and icon components.

```bash
# Interactive setup
npm create rasti

# Non-interactive single-page app
npm create rasti my-app

# Server-side rendering with routing and Tailwind CSS
npm create rasti my-app --ssr --router --tailwind
```

Available options include:

- **Rendering** — Single-page app (default), server-side rendering (`--ssr`), or static pre-rendering (`--static`).
- **Styling** — Plain CSS (default), Tailwind CSS (`--tailwind`), or CSSFUN with light/dark theme support (`--cssfun`).
- **Routing** (`--router`) — A small universal router built on `path-to-regexp`.
- **Icons** (`--icons`) — Generate **Rasti** components from popular SVG icon sets (heroicons, akar-icons, feathericon, pixelarticons, and more).

See the [`create-rasti` repository](https://github.com/8tentaculos/create-rasti) for the full list of templates and options.

## Example

To see how **Rasti**'s API and architecture come together in a small app, explore the sample **TODO application** in the [example folder](https://github.com/8tentaculos/rasti/tree/master/example/todo) of the **Rasti** [GitHub repository](https://github.com/8tentaculos/rasti). It's a concise, self-contained reference for understanding how models, views, and components fit together in a simple application. Try it live [here](https://rasti.js.org/example/todo/index.html).

To scaffold a real-world project, use [`create-rasti`](#scaffolding-a-new-project).

## Documentation

- [Writing components](/docs/components.md) — the three forms and which to use, interpolations, containers and the root partial.
- [TypeScript](/docs/typescript.md) — typing components, models and template interpolations.
- [API documentation](/docs/api.md) — every class, method and option.
- [Architecture overview](/docs/architecture.md) — how the pieces fit together: components, the render engine, recycling and SSR.

## TypeScript

**Rasti** ships with TypeScript declarations out of the box. The types are bundled in the package and resolved automatically. How to type components, models and template interpolations is in the [TypeScript guide](/docs/typescript.md).

## Working with LLMs

For those working with LLMs, there is an [AI Agents reference guide](/docs/AGENTS.md) that provides API patterns, lifecycle methods, and best practices, optimized for LLM context. You can share this guide with AI assistants to help them understand **Rasti**'s architecture and component APIs. The [architecture overview](/docs/architecture.md) is the companion document for how the engine works.

## Changelog

Release history and migration notes for major versions are in [CHANGELOG.md](CHANGELOG.md).

## License

**Rasti** is open-source and available under the [MIT License](LICENSE).

## Contributing

Contributions are welcome! Share feature ideas or report bugs on our [GitHub Issues page](https://github.com/8tentaculos/rasti/issues).
