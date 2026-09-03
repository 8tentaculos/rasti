<p align="center">
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.1.2/docs/logo-dark.svg">
        <img alt="Rasti.js" src="https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.1.2/docs/logo.svg" height="120">
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

### Defining a component's template

Every component renders from its **`template()` method**, which returns a **partial**: a tagged template built with `this.partial` that describes the root element and its dynamic content. `Component.create` is a factory that writes this method for you, so the following are equivalent ways to author the same component:

```javascript
// 1. Tagged template — the shortest form.
const Timer = Component.create`
    <div>Seconds: <span>${({ model }) => model.seconds}</span></div>
`;

// 2. A template function passed to `create`.
const Timer = Component.create(function() {
    return this.partial`<div>Seconds: <span>${this.model.seconds}</span></div>`;
});

// 3. A subclass defining `template()` directly, next to other methods.
class Timer extends Component {
    template() {
        return this.partial`<div>Seconds: <span>${this.model.seconds}</span></div>`;
    }
}
```

`template()` runs on **every render**.

#### Function vs. value interpolations

The forms differ in one important way. In the **tagged `Component.create` form**, the interpolations are captured once, so anything dynamic must be a **function** — it is re-evaluated on each render, bound to the component and receiving it as its argument:

```javascript
Component.create`<span>${({ model }) => model.seconds}</span>`;
```

In the **function and subclass forms**, the body of `template()` re-runs on every render, so you can interpolate **plain values** as well — they are read fresh each time:

```javascript
class Greeting extends Component {
    template() {
        // Read on every render, so it stays in sync with the props.
        return this.partial`<h1>Hello ${this.props.name}</h1>`;
    }
}
```

Reach for a function when the value should be read lazily from a nested object (`({ model }) => model.count`); use a plain value when you already have it in scope.

#### Containers: returning a component

If `template()` returns a **component instance** instead of a partial, the component becomes a *container*: it renders that child and adopts the child's root element as its own `this.el`. This is convenient for wrapping or picking a component:

```javascript
// Given a `Button` component:

// As sugar, with a component tag.
const ButtonOk = Component.create`<${Button} className="ok">Ok</${Button}>`;

// Or explicitly, by returning the mounted child.
const ButtonCancel = Component.create(() => Button.mount({
    className : 'cancel',
    renderChildren : () => 'Cancel',
}));
```

#### The root partial

The partial returned by `template()` becomes the component's root element, so it carries two restrictions that the partials rendered inside an interpolation don't have:

- **A single root element.** Its outer element becomes `this.el`; anything next to it at the top level is dropped. A partial rendered in an interpolation lives between the slot's markers, so it may render as many nodes as it needs.
- **The same template on every render.** The root is created once and then patched in place, so returning a different template throws (*Root template changed*). Branch inside the interpolations instead:

```javascript
class Panel extends Component {
    template() {
        return this.partial`
            <section>${this.props.loading ? 'Loading…' : this.renderRows()}</section>
        `;
    }
}
```

Containers follow the same rule: returning the mounted child and returning a component tag are equivalent ways to write one, but they count as different root templates, so a component must keep to one of them across renders.

#### `template` as an option

Because `template` is a regular view option, you can also pass one when mounting, without defining a class:

```javascript
Component.mount(
    { template() { return this.partial`<p>Hello</p>`; } },
    document.body,
);
```

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

For detailed information on how to use **Rasti**, refer to the [API documentation](/docs/api.md). How the pieces fit together — components, the render engine, recycling and SSR — is in the [architecture overview](/docs/architecture.md).

## TypeScript

**Rasti** ships with TypeScript declarations out of the box. The types are bundled in the package and resolved automatically.

### Components

In TypeScript the **subclass form types best**. The generics type `props` and `state`, the interpolations are ordinary expressions the compiler already checks, handlers are arrows that close over a typed `this`, and the class name is a value *and* a type — so no `InstanceType` alias and no annotated callbacks:

```ts
interface CounterProps { initial: number; label: string }

class Counter extends Component<CounterProps> {
    timer: number | null = null; // instance fields declared normally

    template() {
        return this.partial`
            <div>
                <span>${this.props.label}: ${this.props.initial}</span>
                <button onClick=${() => this.increment()}>+</button>
            </div>
        `;
    }

    increment() { /* `this` and `this.props` are typed */ }
}

const counter: Counter = new Counter({ initial: 0, label: 'Clicks' }); // ✅ `Counter` is also a type
Counter.mount({ initial: 0, label: 'Clicks' }, document.body).increment(); // ✅ options and methods typed
```

With `Component.create`, pass generics explicitly to type the resulting class:

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

When a component is used with inner content (`<${Card}>...</${Card}>`), rasti injects a `renderChildren` function into its props at runtime. Declare it in `P` to use it:

```ts
const Card = Component.create<{ title: string; renderChildren?: () => any }>`
    <div class="card">
        <h2>${({ props }) => props.title}</h2>
        ${({ props }) => props.renderChildren?.()}
    </div>
`;
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

To read attributes off a typed `state` (or `model`) directly, define it as a named `Model` subclass with declaration merging and pass it as the `S` (or `M`) generic — then there are no casts anywhere:

```ts
class ScoreState extends Model<{ points: number }> {}
interface ScoreState { points: number } // exposes this.points

class Scoreboard extends Component<{}, ScoreState> {
    onCreate() {
        this.state = new ScoreState({ points: 0 });
        this.state.points++; // ✅ typed, no cast
    }
}
```

### Models

Type the attributes with `Model<YourAttrs>`. Use **declaration merging** to surface the auto-generated getters/setters as instance properties:

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
    ModelAttrs,
    ComponentProps,
    ComponentState,
    ComponentModel,
} from 'rasti';

// `Counter` (defined above with Component.create) is a *value*. To use the name in
// type position, alias it once — now `Counter` is both a value and a type:
type Counter = InstanceType<typeof Counter>;

// Typed event handler with `this` bound to the component
const onClick: EventHandler<Counter, MouseEvent> = function(ev) {
    this.props.initial;
};

// Typed render expression (`(component) => any`)
const renderLabel: RenderExpression<Counter> = ({ props }) => props.initial;

// Extract types from existing classes
type A = ModelAttrs<Todo>;        // Todo extends Model → already a type, no alias
type P = ComponentProps<Counter>; // pass the instance; `ComponentProps<typeof Counter>` is `never`
type S = ComponentState<Counter>;
```

> Components made with `Component.create` are **values**, not types. To use one as a type — as with `Counter` above — add `type X = InstanceType<typeof X>` next to the definition, or write `InstanceType<typeof X>` inline. Neither a `Model` subclass nor a component authored as a subclass needs an alias, since `class` already declares both a value and a type.

### Typing template interpolations

This section applies to the **tagged `Component.create` form**. In the subclass and `create(fn)` forms the template body is ordinary code inside a typed method, so its interpolations are checked without helpers — that is the simplest way to get full typing.

Functions inside a tagged template are `any` — rasti can't infer them from the surrounding string. Which type to use depends on how rasti treats the function (quoted attribute or content → run on render; unquoted attribute → passed as-is):

> Under `strict` / `noImplicitAny`, every interpolation callback **must** be annotated — an untyped parameter is an error (TS7031/TS7006), not a silent `any`. In non-strict mode typing is opt-in: annotate where you want safety and leave trivial ones as `any`.

| Interpolation | What it is | Type to use |
|---|---|---|
| Content `${fn}` or quoted attr `attr="${fn}"` | Run on render; `this` and the argument are the component | `RenderExpression<C>` |
| Unquoted `onX=${fn}` | DOM handler, called `(event, component, matched)` | `EventHandler<C, E>` |
| Function passed to a child (`handler=${fn}`) | Becomes the child's prop; typed by the child, not this component | the child's prop signature |

Three ways to apply them:

```ts
// `Home` is a value (made with Component.create), so alias it to use the name as a type:
const Home = Component.create<{}, { location: string }>`<div></div>`.extend({
    close() { /* ... */ },
});
type Home = InstanceType<typeof Home>;

// 1. Named const — cleanest for non-trivial handlers
const onClick: EventHandler<Home, MouseEvent> = function(ev, self) {
    ev.preventDefault();
    self.close();
};

// 2. Inline with `satisfies` — checks + types the params without widening
${(({ state }) => state?.location) satisfies RenderExpression<Home>}

// 3. Bare annotation — lightest, just types the argument
${({ state }: Home) => state?.location}
```

For a function passed to a child, neither helper fits — its type comes from the child's prop. Type it against that prop's declared type (rasti can't connect the attribute to the child, since both live inside the template string):

```ts
// where the child was created with Component.create<ToggleAllProps>`...`
handleChange=${((checked) => model.toggleAll(checked)) satisfies ToggleAllProps['handleChange']}
```

### Known limitations

- **Template interpolation callbacks are `any`** *(tagged form only)*. Functions in ``Component.create`...` `` templates can't be inferred from the surrounding string — type them opt-in (see [Typing template interpolations](#typing-template-interpolations)), or author the component as a subclass, where the template body is checked like any other method.
- **`Model<A>` instance keys require declaration merging**. TypeScript can't add `A`'s keys to a `class extends Model<A>` automatically — see the `interface Todo extends TodoAttrs {}` pattern above.
- **`this.$()` can return `null`**. It mirrors `querySelector`, so handle the empty case (`?.`) and pass a type argument to narrow the element: `this.$<HTMLInputElement>('input.edit')?.focus()`. `this.$$()` returns a `NodeListOf<HTMLElement>` (also narrowable).
- **`this.model` / `this.state` are optional**. Both are `undefined` unless provided, so guard (`this.model?.foo`) or assert (`this.model!`) when you know one was passed. Both accept a Rasti `Model` or a model from another library (e.g. Backbone); Components subscribe to `change` events automatically when the object exposes `on`/`off`.
- **`state` / `model` are raw generics, `props` is not**. `this.props` is *always* a `Model` built by rasti, so it's typed `Model<P> & P` (direct access to `P`'s keys). But `state` and `model` can be anything you provide — a Rasti `Model`, a Backbone model, a store, or a plain object — so they stay the raw generic. To read a typed `Model` state/model directly, define it as a named subclass with declaration merging and pass it as the `S`/`M` generic (see the `Scoreboard` example above) — no casts needed.
- **Weak-type error on narrow props**. If a component's `P` has no required keys and you pass only options not declared in it, TypeScript reports *"has no properties in common"* (weak-type check). Fix: declare those options in `P` — non-reserved options become props at runtime.
- **Instance fields set in `.extend` hooks need predeclaration**. `.extend` infers the instance type from the object's members only, so a field first assigned in `onCreate` (`this.router = ...`) isn't known. Predeclare it in the object: `router: null as unknown as Router`. For components with many instance fields, `class MyComponent extends Component<P, S>` is usually cleaner than `.extend`.

## Working with LLMs

For those working with LLMs, there is an [AI Agents reference guide](/docs/AGENTS.md) that provides API patterns, lifecycle methods, and best practices, optimized for LLM context. You can share this guide with AI assistants to help them understand **Rasti**'s architecture and component APIs. The [architecture overview](/docs/architecture.md) is the companion document for how the engine works.

## Changelog

Release history and migration notes for major versions are in [CHANGELOG.md](CHANGELOG.md).

## License

**Rasti** is open-source and available under the [MIT License](LICENSE).

## Contributing

Contributions are welcome! Share feature ideas or report bugs on our [GitHub Issues page](https://github.com/8tentaculos/rasti/issues).
