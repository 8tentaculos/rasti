<p align="center">
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.2.1/docs/logo-dark.svg">
        <img alt="Rasti.js" src="https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.2.1/docs/logo.svg" height="120">
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

Underneath sits a small MVC core — **models**, **views** and **event emitters** — small enough to read when you need to know how something works.

[![CI](https://github.com/8tentaculos/rasti/actions/workflows/ci.yml/badge.svg)](https://github.com/8tentaculos/rasti/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/rasti.svg)](https://www.npmjs.com/package/rasti)
[![npm package minimized gzipped size](https://img.shields.io/bundlejs/size/rasti)](https://unpkg.com/rasti/dist/rasti.esm.min.js)
[![npm downloads](https://img.shields.io/npm/dm/rasti.svg)](https://www.npmjs.com/package/rasti)
[![jsDelivr hits (npm)](https://img.shields.io/jsdelivr/npm/hm/rasti)](https://www.jsdelivr.com/package/npm/rasti)
[![license](https://img.shields.io/npm/l/rasti.svg)](https://github.com/8tentaculos/rasti/blob/master/LICENSE)

## Key Features

- **Template literals, components as tags**  
  Templates are standard tagged template literals: no JSX, no compiler, no build step. A component is used inside another template as a tag, with props and children: `<${Link} href="${href}">${label}</${Link}>`. No registry, no custom elements.
- **Handlers in the markup**  
  Event handlers are written as attributes: `onClick=${() => this.increment()}`. They are delegated from the component's root element, so re-renders never bind listeners and an inline handler costs nothing.
- **Updates in place**  
  When state changes, Rasti re-evaluates the template and writes only the values that differ. The DOM is patched, not rebuilt, so focus, selection and input values persist.
- **State from anything that emits**  
  `model`, `state` and `props` are subscribed automatically, and a component re-renders only when a value actually changes, its children included. `subscribe()` accepts any object with `on`/`off`: a Backbone model, or a store of your own.
- **Real DOM, no wrapper**  
  `render().el` is the element itself: no shadow DOM, no synthetic events, nothing between you and the node. Query it, style it, or hand it to another library.
- **Server rendering and hydration**  
  Rendering is just `toString`: a component drops into any HTML string, anywhere JavaScript runs — ``const html = `<body>${new App({ model })}</body>` `` — and picks up the served markup in the browser without recreating it.
- **Typed**  
  TypeScript declarations ship with the package, covering components, models and template interpolations.

## Getting Started

### Installing via npm

```bash
$ npm install rasti
```

```javascript
import { Model, Component } from 'rasti';
```

### Using native ES modules

No bundler needed: an import map points `rasti` to the ES module build, so imports read the same as with npm.

```html
<script type="importmap">
    {
        "imports": {
            "rasti": "https://cdn.jsdelivr.net/npm/rasti/dist/rasti.esm.min.js"
        }
    }
</script>

<script type="module">
    import { Model, Component } from 'rasti';
</script>
```

The import map can also point to a copy of the file served from your own site, or to `https://esm.run/rasti`. During development, use `rasti.esm.js` for development warnings and detailed error messages.

### Using the UMD build

For a classic `<script>` tag, the UMD build exposes the `Rasti` global object. It also loads as an AMD module, with RequireJS for example.

```html
<script src="https://cdn.jsdelivr.net/npm/rasti/dist/rasti.umd.min.js"></script>
```

```javascript
const { Model, Component } = Rasti;
```

The development build is `rasti.umd.js`.

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
// `html` builds a partial: a sub-template for lists and conditional blocks.
const Navigation = Component.create`
    <nav>
        ${({ props, html }) => props.routes.map(
            ({ label, href }) => html`<${Link} key="${href}" href="${href}">${label}</${Link}>`
        )}
    </nav>
`;

// Create a Main component that includes the Navigation and displays the current route's label as the title.
class Main extends Component {
    template() {
        return this.html`
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
        return this.html`
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

A component renders from its **`template()` method**, which returns a **partial** built with `this.html` (an alias of `this.partial`). Write it in a subclass, as `Main` and `Counter` do above: it is the recommended form. `Component.create` can also write it for you from a tagged template, the shortest form for simple components like `Timer` and `Link`, or from a template function. The three forms, how they differ and when to use each are in [Writing components](/docs/components.md).

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
- [Agent skill](/skills/rasti/SKILL.md) — the API, patterns and best practices for coding agents. Install it with `npx skills add 8tentaculos/rasti`, or copy `node_modules/rasti/skills/rasti` into your agent's skills folder.

## TypeScript

**Rasti** ships with TypeScript declarations out of the box. The types are bundled in the package and resolved automatically. How to type components, models and template interpolations is in the [TypeScript guide](/docs/typescript.md).

## Changelog

Release history and migration notes for major versions are in [CHANGELOG.md](CHANGELOG.md).

## License

**Rasti** is open-source and available under the [MIT License](LICENSE).

## Contributing

Contributions are welcome! Share feature ideas or report bugs on our [GitHub Issues page](https://github.com/8tentaculos/rasti/issues).
