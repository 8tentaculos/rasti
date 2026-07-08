<p align="center">
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.1.0-alpha.1/docs/logo-dark.svg">
        <img alt="Rasti.js" src="https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.1.0-alpha.1/docs/logo.svg" height="120">
    </picture>
</p>

<p align="center">
    <b>Modern MVC for building user interfaces</b>
</p>

**Rasti is a lightweight MVC library for building fast, reactive user interfaces.**  
It provides declarative, composable **components** for building state-driven UIs.  
Its low-level MVC core, inspired by **Backbone.js**’s architecture, provides **models**, **views** and **event emitters** as the fundamental building blocks.

[![CI](https://github.com/8tentaculos/rasti/actions/workflows/ci.yml/badge.svg)](https://github.com/8tentaculos/rasti/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/rasti.svg)](https://www.npmjs.com/package/rasti)
[![npm package minimized gzipped size](https://img.shields.io/bundlejs/size/rasti)](https://unpkg.com/rasti/dist/rasti.min.js)
[![npm downloads](https://img.shields.io/npm/dm/rasti.svg)](https://www.npmjs.com/package/rasti)
[![jsDelivr hits (npm)](https://img.shields.io/jsdelivr/npm/hm/rasti)](https://www.jsdelivr.com/package/npm/rasti)
[![license](https://img.shields.io/npm/l/rasti.svg)](https://github.com/8tentaculos/rasti/blob/master/LICENSE)

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
  Seamlessly integrates into existing **Backbone.js** legacy projects.  
- **Standards-Based** 📐  
  Built on modern web standards, no tooling required.  
- **TypeScript Support** 🧩  
  Ships with type definitions for strict typing of models, views, components, props, and events.  

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
            ({ label, href }) => partial`<${Link} href="${href}">${label}</${Link}>`
        )}
    </nav>
`;

// Create a Main component that includes the Navigation and displays the current route's label as the title.
const Main = Component.create`
    <main>
        <${Navigation} routes="${({ props }) => props.routes}" />
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

[Try it on CodePen](https://codepen.io/8tentaculos/pen/XJXVQOR?editors=0010)

## Why Choose **Rasti**?  

**Rasti** is built for developers who want a simple yet powerful way to create UI components without the complexity of heavy frameworks. Whether you're building a high-performance dashboard, or embedding a lightweight widget, **Rasti** lets you:  

- **Skip the Setup**  
  No installations, no build tools—just load it and start coding.  
- **Lightweight and Efficient**  
  Minimal footprint with optimized performance, ensuring smooth updates.  
- **Just the Right Abstraction**  
  Keeps you close to the DOM with no over-engineering. Fully hackable — if you're curious about how something works, just check the source code.  

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

## API Documentation

For detailed information on how to use **Rasti**, refer to the [API documentation](/docs/api.md).

## TypeScript

**Rasti** ships with TypeScript declarations out of the box. The types are bundled in the package and resolved automatically.

### Components

Pass generics explicitly to type the resulting class:

```ts
const Header = Component.create<{ handleAddTodo: (title: string) => void }>`
    <header>...</header>
`;

new Header({ handleAddTodo: (t) => console.log(t) }); // ✅

// With a typed model:
const App = Component.create<{}, any, AppModel>`<main>...</main>`;
App.mount({ model: new AppModel() }, document.body);
```

Without generics, `Component.create` stays permissive (parity with JS):

```ts
const Plain = Component.create`<div></div>`;
new Plain({ anything: 'goes' }); // ✅
```

`Component.extend` adds the object members to the instance type. Inside its methods, `this` is the extended component, and lifecycle overrides get their parameters typed automatically:

```ts
const Counter = Component.create<{ initial: number }>`<div>...</div>`.extend({
    onCreate() {
        this.state = new Model({ count: this.props.initial }); // `this` is typed
    },
    onChange(model, changed) { // parameters typed automatically
        if ('count' in changed) this.render();
    },
    increment() { this.state.count++; },
});

Counter.mount({ initial: 0 }, document.body).increment(); // ✅ increment is typed
```

### Models

Type the attributes with `Model<Attrs>`. Use **declaration merging** to surface the auto-generated getters/setters as instance properties:

```ts
import { Model } from 'rasti';

interface TodoAttrs { title: string; completed: boolean; }

class Todo extends Model<TodoAttrs> {
    preinitialize() {
        this.defaults = { title: '', completed: false };
    }
    toggle() { this.completed = !this.completed; }
}
interface Todo extends TodoAttrs {} // Exposes this.title, this.completed

const t = new Todo({ title: 'x' });
t.title.toUpperCase(); // ✅
t.on('change:completed', (m, value) => value && /* boolean */ console.log('done'));
```

### Helper types

```ts
import {
    EventHandler,
    RenderExpression,
    Attrs,
    Props,
    State,
    ComponentModel,
} from 'rasti';

// Typed event handler with `this` bound to the component
const onClick: EventHandler<Counter, MouseEvent> = function(ev) {
    this.props.label;
};

// Typed render expression (`(component) => any`)
const renderLabel: RenderExpression<Counter> = ({ props }) => props.label;

// Extract types from existing classes
type T = Attrs<Todo>;    // TodoAttrs
type P = Props<Counter>; // CounterProps
type S = State<Counter>; // CounterState
```

### Known limitations

- **Template interpolation callbacks are `any`**. Functions inside `Component.create\`...\`` template literals (`${({ model }) => ...}`, `onClick=${function() { this.x }}`) cannot be inferred from the surrounding template. To type them, annotate explicitly: `function(this: MyComponent, ev) { ... }` or `({ model }: MyComponent) => ...`.
- **`Model<A>` instance keys require declaration merging**. TypeScript can't add `A`'s keys to a `class extends Model<A>` automatically — see the `interface Todo extends TodoAttrs {}` pattern above.
- **`this.$()` can return `null`**. It mirrors `querySelector`, so handle the empty case (`?.`) and pass a type argument to narrow the element: `this.$<HTMLInputElement>('input.edit')?.focus()`. `this.$$()` returns a `NodeListOf<HTMLElement>` (also narrowable).
- **`this.model` / `this.state` are optional**. Both are `undefined` unless provided, so guard (`this.model?.foo`) or assert (`this.model!`) when you know one was passed. Both accept a Rasti `Model` or a model from another library (e.g. Backbone); Components subscribe to `change` events automatically when the object exposes `on`/`off`.

## Working with LLMs

For those working with LLMs, there is an [AI Agents reference guide](/docs/AGENTS.md) that provides API patterns, lifecycle methods, and best practices, optimized for LLM context. You can share this guide with AI assistants to help them understand **Rasti**'s architecture and component APIs.

## Changelog

Release history and migration notes for major versions are in [CHANGELOG.md](CHANGELOG.md).

## License

**Rasti** is open-source and available under the [MIT License](LICENSE).

## Contributing

Contributions are welcome! Share feature ideas or report bugs on our [GitHub Issues page](https://github.com/8tentaculos/rasti/issues).
