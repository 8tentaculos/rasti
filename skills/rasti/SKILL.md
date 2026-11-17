---
name: rasti
description: Builds user interfaces with Rasti, the HTML-first JavaScript UI library — components written as template functions, subclasses or tagged templates, template interpolations, event handlers, lifecycle hooks, keyed recycling, models and server-side rendering. Use when writing, reviewing or debugging code that imports `rasti`, or when the user asks about Rasti components or models.
license: MIT
metadata:
  version: "5.0.0-alpha.6"
---

# Rasti

Compact reference for developing with Rasti. Full API: [api.md](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v5.0.0-alpha.6/docs/api.md). How the engine works: [architecture.md](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v5.0.0-alpha.6/docs/architecture.md).

Read these when the task needs them:

- [references/model.md](references/model.md) — defining models: defaults, change events, parsing, serialization and subscriptions between models.
- [references/typescript.md](references/typescript.md) — typing components, props, state and template interpolations.

## 🔧 Component API

### Component Creation

A component renders from its `template()` method, which returns a partial (or a child component — see [Container Components](#container-components)). It can be written in three forms, all producing a `Component` subclass, mixable in one app: `Component.create` with a template function or a tagged template, from which it writes `template()`, or a subclass that defines `template()`. Pick by role: a subclass when the component has methods, state or hooks; the template function for presentational components, where it reads simpler. The tagged template, the form Rasti 4 used, captures its interpolations once, with the class: practical in some cases, such as an inline function that must keep its identity across renders.

```js
import { Component, Model } from 'rasti';

// 1. Template function — `create(fn)` uses `fn` as `template()`, called with the component as argument.
// The shortest form, for presentational components; plain values interpolate directly.
const Badge = Component.create(({ props, html }) => html`
    <span class="badge">${props.label}</span>
`);

// 2. Subclass — `template()` sits next to the methods it calls.
class Counter extends Component {
    template() {
        return this.html`
            <div>
                <span>${this.model.count}</span>
                <button onClick=${() => this.increment()}>+</button>
            </div>
        `;
    }

    increment() {
        this.model.count++;
    }
}

// 3. Tagged template — captured once, so dynamic values must be functions.
// Functions written in it are created once with the class, so they keep their identity across renders.
const Row = Component.create`
    <tr>
        <td>${({ model }) => model.label}</td>
        <td><a onClick=${function() { this.props.handleRemove(this.model); }}>Remove</a></td>
    </tr>
`;

// Add lifecycle hooks (or methods) to a created component with `extend`.
const Toggle = Component.create(({ state, html }) => html`
    <button onClick=${() => state.active = !state.active}>
        ${state.active ? 'On' : 'Off'}
    </button>
`).extend({
    onCreate() {
        this.state = new Model({ active : false });
    }
});

// Mount to DOM
Counter.mount({ model : new Model({ count : 0 }) }, document.getElementById('root'));
```

`template()` runs on **every render** — see [Interpolations](#interpolations) for what that means for the values inside it.

**Key Methods:**
- [`Component.create`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v5.0.0-alpha.6/docs/api.md#module_component_create) — creates component class from a template function or a tagged template
- [`component.template`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v5.0.0-alpha.6/docs/api.md#module_component__template) — returns the component's root partial; override it directly, via `extend`, or as a mount option
- [`Component.extend`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v5.0.0-alpha.6/docs/api.md#module_component_extend) — adds methods and lifecycle hooks
- [`Component.mount`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v5.0.0-alpha.6/docs/api.md#module_component_mount) — creates and mounts a component instance

### The Root Partial

The partial returned by `template()` becomes the component's root element, so two restrictions apply to it — and only to it, partials rendered inside an interpolation are free of both:

- **A single root element** — it becomes `this.el`. Sibling elements or loose text at the top level are left out of every update, so development builds throw `Invalid root template`.
- **The same template on every render** — the root is created once and then patched in place, so returning a different template throws `Root template changed`.

```js
// ❌ Wrong — two elements at the top level: throws in development, only <h1> updates in production
template() {
    return this.html`<h1>${this.model.title}</h1><p>${this.model.body}</p>`;
}

// ❌ Wrong — a different root template per render
template() {
    return this.props.loading ?
        this.html`<p>Loading…</p>` :
        this.html`<ul>${this.renderRows()}</ul>`;
}

// ✅ Correct — one root element, branching inside the interpolation
template() {
    return this.html`
        <section>${this.props.loading ? 'Loading…' : this.renderRows()}</section>
    `;
}
```

### Interpolations

Interpolations in content and in quoted attribute values follow the same rule: non-function values are passed directly; functions are called during each render, bound to `this`, with the component instance as argument. An unquoted attribute value is passed as it is, functions included.

**Function vs value interpolations:** in the `create(fn)` and subclass forms the body of `template()` re-runs on every render, so plain values are read fresh each time. In the tagged `Component.create` form the expressions are captured once, when the class is created, so anything dynamic **must be a function** — that is what gets re-evaluated on each render.

```js
// Template function / subclass form — `template()` re-runs, so plain values stay in sync
Component.create(({ model, html }) => html`<span>${model.title}</span>`);

// Tagged form — captured once, so dynamic values must be functions
Component.create`<span>${({ model }) => model.title}</span>`;
```

**Quoted vs Unquoted attributes:**
- **Quoted** `attribute="${fn}"` — function **runs** during render; its return value is used (string, boolean, object, etc.)
- **Unquoted** `attribute=${fn}` — function reference is passed **as-is** (no execution); use for event handlers and callbacks

```js
// Content — a value renders; a function is called and its result renders
${this.model.title}
${({ model }) => model.title}

// Quoted attribute — a value is passed; a function is called and its result is passed
checked="${!!this.model.todos.length && !this.model.remaining.length}"
currentFilter="${({ model }) => model.filter}"

// Unquoted — the function itself is passed: an event handler, or a callback for a child
onClick=${() => this.model.removeCompleted()}
handleChange=${(checked) => this.model.toggleAll(checked)}
```

**Quoted attribute values compose** — a quoted value may mix literal text and any number of interpolations; the parts are joined into a single string. Each interpolated part is evaluated like any quoted value and coerced with the content-interpolation rule: `null`, `undefined`, `true` and `false` become `''`, anything else its string form. A value that is *exactly* one interpolation passes its raw resolved value, so booleans, objects and functions keep their type. On an element, a raw `true` writes the attribute with no value, and `false`, `null` and `undefined` leave it out (`''` writes it empty):

```js
// ✅ Mixed — literal text and interpolations join into one string
class="base ${this.state.active ? 'active' : ''}"
href="/items?page=${this.state.page}"

// ✅ Lone interpolation — raw value (boolean drives attribute presence)
disabled="${this.model.locked}"
// ✅ Lone interpolation — null / undefined leave the attribute out
aria-label="${this.props.label}"

// ❌ Still unsupported (warns in development)
data-${x}="1"    // an interpolation can't be part of an attribute name
attr=x${fn}      // unquoted values take a single interpolation
```

**Whole-attribute interpolation (spread)** — an interpolation in place of a whole attribute, with no name and no value, spreads an object into the attributes; each value follows the lone-interpolation rules. A string is written as an attribute with no value; any other value (`null`, `undefined`, `false`) adds nothing. A function is called first, as in a quoted value. Attributes apply in source order, so a later one overrides an earlier one with the same name. A spread may carry event handlers too (`{ onInput : fn }`). On a component tag the object spreads into the child's options:

```js
<input ${{ type : 'text', name : this.props.name }} />
<button ${() => ({ disabled : this.state.busy, title : this.state.hint })}>Save</button>
<${Avatar} ${{ name : user.name, src : user.photo }} size="small" />
```

**Tag name** — an element's tag name may be an interpolation holding a string, `<${tag}>…</${tag}>`. It is read when the element is first written and never updated, so it suits a value fixed per instance, such as the `tag` option.

### Event Handling

Component builds event delegation on top of View's delegation system. `on*` attributes in the template are compiled into delegated listeners on the component's root element. Events bubble up from descendants; `stopPropagation()` is supported. Events that do not bubble (`onFocus`, `onBlur`, `onMouseEnter`, `onLoad`, `onScroll`…) work on any element and run only the target's handler.

**Handlers across renders:** handlers are not bound to the elements. Each render writes the component's handlers into a list and each element refers to its handler's position there, so a handler created anew on every render (an arrow in `template()`) binds nothing and touches no DOM: the latest one runs. No memoizing is needed. In a [list of markup](#lists), updated by position, the handler goes with the content, like the text and the attributes.

Event names: a camel-cased `on*` name binds the lowercase event (`onDblClick` → `dblclick`), for native events. `on:` binds the type exactly as written, for custom events: `on:sl-change`, `on:ionChange`, `on:htmx:afterSwap`. Both take the same values. Any other attribute (`onclick="…"`) is left to the browser.

`on*` binds DOM events on elements only. On a component tag, every attribute is an option for the child — see [Component Tags & Props](#component-tags--props).

**Handler signature:** `(event, component, matched)`
- `event` — native DOM event
- `component` — component instance (same as `this`)
- `matched` — element that matched the event

```js
// Inline function (most common)
<button onClick=${() => this.model.count++}>+</button>

// A method — runs bound to the component
class Form extends Component {
    template() {
        return this.html`
            <form onSubmit=${this.handleSubmit}>
                <input onChange=${this.handleChange} />
            </form>
        `;
    }

    handleSubmit(ev) {
        ev.preventDefault();
        // ...
    }

    handleChange(ev) {
        this.model.value = ev.target.value;
    }
}
```

A string names a method of the component instead (`onSubmit="handleSubmit"`), as in a View's `events`: useful in a tagged template, whose methods are added with `.extend()`.

A handler that is `null`, `undefined` or `false` binds nothing, so an optional callback prop can be passed straight through: `onInput=${this.props.handleInput}`.

**Related:** [`delegateEvents`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v5.0.0-alpha.6/docs/api.md#module_view__delegateevents)

### Component Tags & Props

When using `<${Component} />`, attributes become component options. Some options belong to the component itself and never reach `props`: `key`, `model`, `state`, `template`, `el`, `tag`, `attributes`, `events`, and the lifecycle hooks (`onCreate`, `onHydrate`, `onChange`, `onBeforeUpdate`, `onUpdate`, `onBeforeRecycle`, `onRecycle`, `onDestroy`). Those are set on the instance (read `this.tag`, not `this.props.tag`). Every other option is collected into `this.props` (a Model). When a child is recycled, only its props are updated.

**Callback props:** a function passed as a prop is the child's to use, usually by calling it from one of its own event handlers (`Header` below calls `handleAddTodo` on Enter). Name callback props `handle*`: it sets them apart from DOM event handlers, and keeps them clear of the lifecycle hook names, which the component takes for itself — `<${Input} onChange=${fn} />` would replace `Input`'s own `onChange` (see [Common Pitfalls](#common-pitfalls)).

```js
// Child — receives the options as props
class Header extends Component {
    template() {
        return this.html`<header><input onKeyUp=${(ev) => this.handleKeyUp(ev)} /></header>`;
    }

    handleKeyUp(ev) {
        if (ev.key === 'Enter' && ev.target.value) {
            this.props.handleAddTodo(ev.target.value);
            ev.target.value = '';
        }
    }
}

// Parent — passes values as component options
const App = Component.create(({ model, html }) => html`
    <main>
        <${Header} handleAddTodo=${(title) => model.addTodo({ title })} />
        <${Footer} model="${model}" currentFilter="${model.filter}" />
    </main>
`);
```

**Key properties:**
- `this.model` — [`Model`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v5.0.0-alpha.6/docs/api.md#module_model) for application data
- `this.state` — [`Model`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v5.0.0-alpha.6/docs/api.md#module_model) for internal component state
- `this.props` — [`Model`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v5.0.0-alpha.6/docs/api.md#module_model) auto-created from non-standard options

**When a child re-renders:** on a parent render, a recycled child gets its props set again, compared by identity (`!==`), and re-renders only if one changed. Primitives and references that persist don't trigger it. A function, object or array built during the parent's render does, and so does slotted content, since `renderChildren` is recreated on every render. To spare the rows of a list, pass references that persist, such as a class field:

```js
class TodoList extends Component {
    handleRemove = (todo) => this.model.removeTodo(todo); // created once per instance

    template() {
        return this.html`<ul>${this.model.todos.map(todo => this.html`
            <${TodoItem} key="${todo.id}" model="${todo}" handleRemove=${this.handleRemove} />
        `)}</ul>`;
    }
}
```

### renderChildren

When a component is rendered with content between tags, Rasti creates `renderChildren` and passes it as a prop. Call `props.renderChildren()` to render that content.

- `<${Child}>content</${Child}>` → `renderChildren` created and passed as prop
- `<${Child} />` (self-closing) → no `renderChildren`

```js
const Button = Component.create(({ props, html }) => html`
    <button>${props.renderChildren()}</button>
`);

// Support both with-content and self-closing (label fallback)
const FlexButton = Component.create(({ props, html }) => html`
    <button>${props.renderChildren ? props.renderChildren() : props.label}</button>
`);

// Usage — Rasti creates renderChildren automatically
const Main = Component.create(({ html }) => html`
    <div>
        <${Button}>click me</${Button}>
    </div>
`);
```

When using `Component.mount()`, pass `renderChildren` manually: `{ renderChildren : () => value }`.

For more places to fill, take other `render*` props as thunks the parent builds with its own `html`, and call them as `renderChildren` is called. Build their content with component tags, never `mount()`, so it recycles:

```js
// Parent
html`<${Button} renderIcon=${() => html`<${SaveIcon} />`}>Save</${Button}>`

// Button
html`<button>${props.renderIcon ? props.renderIcon() : null}${props.renderChildren()}</button>`
```

### Context

A host can't pass props to the content slotted into it: that content is written, and its props decided, by the template around it. The host **provides** a context instead, and the components inside **inject** it.

- `provide()` runs on every render of the host, before its children render, and returns `{ [key]: values }`. Each key gets one `Model`, created on the first render and `set` later: return the same keys and properties every render, `null` for an absent value.
- `inject(key)` returns the model of the nearest component above (searched up `this.parent`, the component that renders this one) that provides the key, or a shared, empty, frozen model without a provider. It is bound, so templates destructure it.
- Reading a context subscribes to it: the consumer re-renders when the provided values change, even with the same props.

```js
// form-control.js — the contract, imported by both sides
export const FormControl = Symbol('formControl');

class Field extends Component {
    provide() {
        const { controlId, error } = this.props;
        return { [FormControl] : { id : controlId, describedBy : error ? `${controlId}-error` : null } };
    }

    template() {
        const { controlId, error } = this.props;
        return this.html`<div>
            ${this.props.renderChildren()}
            ${error && this.html`<p id="${controlId}-error">${error}</p>`}
        </div>`;
    }
}

// Explicit props win; without a Field it is a plain input (`undefined` leaves the attribute out).
const Input = Component.create(({ props, inject, html }) => {
    const control = inject(FormControl);
    return html`<input id="${props.id || control.id}" aria-describedby="${control.describedBy}">`;
});

// Usage
html`<${Field} controlId="email" error="${this.model.error}"><${Input} /></${Field}>`
```

Rules: the key is a `Symbol` in a module of its own, never imported from the provider; props win over context; the consumer works without a provider; use it for families of components designed together (field/controls, tabs, radio group) and tree-wide values (theme, language, router), not to skip props. Consumers read and don't write: the model is shared by every consumer; provide a function to talk back.

**Related API:** [`component.provide`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v5.0.0-alpha.6/docs/api.md#module_component__provide) · [`component.inject`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v5.0.0-alpha.6/docs/api.md#module_component__inject)

### Partials

`html`, an alias of [`partial`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v5.0.0-alpha.6/docs/api.md#module_component__partial), creates sub-templates (partials) for conditional blocks and lists. A partial is patched in place on update — attributes diffed, child components recycled — so the DOM nodes inside it, and their focus, selection and input value, survive re-renders. In a [list of markup](#lists) they stay with the position, not with the item.

```js
const App = Component.create(({ model, html }) => html`
    <main>
        ${!!model.todos.length && html`
            <ul class="todo-list">
                ${model.filtered.map(todo => html`
                    <${Todo} key="${todo.id}" model="${todo}" />
                `)}
            </ul>
        `}
        ${model.completed.length ? html`
            <button onClick=${() => model.removeCompleted()}>Clear completed</button>
        ` : null}
    </main>
`);
```

For large templates, extract helper methods that return partials (use `this.html` inside them):

```js
class Page extends Component {
    template() {
        return this.html`<div>${this.renderHeader()}</div>`;
    }

    renderHeader() {
        return this.html`<header><h1>${this.model.title}</h1></header>`;
    }
}
```

Unlike [the root partial](#the-root-partial), a partial rendered in an interpolation may produce any number of nodes, and may be swapped for a different template between renders (its slot is regenerated when the template changes). A partial that is nothing but a component tag is the exception: it stands for its component, so swapping it for another tag of the same class and key, from any call site, recycles the instance.

### Lists

An interpolation that returns an array renders a list; nested arrays are flattened into one (`groups.map(g => g.map(…))` is a single list), and items that render nothing (`null`, `undefined`, booleans) are left out, so a `map` that returns `null` to skip an item updates like any other list. How it updates depends on whether its items have an identity:

- **Items as markup** — `html` partials from one call site have no identity of their own, so the list is updated **by position**: each item's DOM stays where it is and the new content is patched through it. This is the fastest way to update a list. When the list reorders, the DOM at each position — focus and input values included — stays there and shows another item's content.
- **Items as components** — each item is a component tag with a `key`, which identifies it among its siblings. The instance is recycled across renders and moves with its item when the list reorders, keeping its state and DOM. Without a key, a component in a list is rebuilt on every render (development builds warn).

```js
// Markup — updated by position
${model.todos.map(todo => html`<li>${todo.title}</li>`)}

// Components — keyed, recycled and moved with their item
${model.todos.map(todo => html`<${TodoItem} key="${todo.id}" model="${todo}" />`)}

// ❌ The item is markup, not the component: Row belongs to the <li> and is
// recreated when the list reorders — its key identifies nothing in the list
${model.todos.map(todo => html`<li><${Row} key="${todo.id}" /></li>`)}
```

The key goes on the item itself: a component tag that is the whole item. A component wrapped in markup, or built in a partial that is only an interpolation (``html`${Row.mount({ key })}` ``), belongs to that partial instead (development builds warn).

### Component Recycling

Rasti reuses component instances across renders to preserve state and improve performance. Matching is **slot-local**: a candidate is only matched against the components the *same interpolation* held in the previous render.

- **Keyed**: matched by `key` among the components that interpolation held — how the items of a [list](#lists) keep their identity, or how a single child is forced to be recreated when its key changes
- **Unkeyed**: matched by type, in an interpolation that renders a single value. In a list, an unkeyed component is never recycled
- A keyed component that moves to a **different interpolation** is recreated, not recycled — keys are not a global scope

**Rendering behavior:**
- **Recreation** — no match found; constructor runs, `onHydrate` fires
- **Recycling** — same instance reused: `onBeforeRecycle()` → props updated → `onRecycle()`

**Tags vs built components:** a component tag (`<${Row} />`) is built only when it is recreated; when recycled, its attributes go straight to the previous instance as props. A component built in an expression (`Row.mount(options)`, `new Row(options)`) is built on every parent render — constructor and `onCreate` run — and when the previous one is recycled instead, the new instance is destroyed (`onDestroy` runs) without rendering. Both recycle by the same rules; always prefer the tag.

```js
// Same type, different identity — use key to force recreation instead of recycling
<${TodoForm} key="${this.props.editingId}" model="${this.props.editingTodo}" />
```

### Container Components

A component whose template is a single component tag — or whose `template()` returns a child component instance — is a **container**. `this.el` references the child's element directly (no wrapper).

```js
const PrimaryButton = Component.create(({ html }) => html`
    <${Button} className="primary" variant="solid" />
`);

// Tagged form
const SecondaryButton = Component.create`
    <${Button} className="secondary" variant="outlined" />
`;

// Subclass form
class TertiaryButton extends Component {
    template() {
        return this.html`<${Button} className="tertiary" />`;
    }
}
```

`template()` may also return a built component (`Button.mount(options)`), which is then built on every render (see [Component Recycling](#component-recycling)). A component tag and a built component both make a container, but they count as *different root templates*: alternating between them across renders throws `Root template changed`.

### Lifecycle Hooks

| Hook | Runs | Use for |
|------|------|---------|
| `preinitialize()` | Very start of constructor | Instance props needed by constructor itself |
| `onCreate()` | End of constructor (client + server); for a built child, on every parent render | State init, config before render |
| `onHydrate()` | After first DOM render (client only) | Subscriptions, API calls, browser APIs |
| `onChange(model, changed)` | On subscribed model change | Conditional render (default calls `render()`) |
| `onBeforeUpdate()` | Start of update render | Save previous state |
| `onUpdate()` | After update render | DOM operations (focus, scroll, etc.) |
| `onBeforeRecycle()` | Before recycling starts | Prepare for prop update |
| `onRecycle()` | After props updated on recycle | Post-recycle setup |
| `onDestroy()` | On component destroy; also for a built child discarded by recycling | Custom cleanup |

`template()` first runs on render, not on construction, so everything set up in `preinitialize()` and `onCreate()` — `state` included — is already available to it.

```js
class MyComponent extends Component {
    onCreate() {
        // Always runs (client + server). Initialize state here.
        this.state = new Model({ editing : false });
    }

    onHydrate() {
        // Client only, first time in DOM.
        // subscribe/listenTo are auto-cleaned on destroy — no destroyQueue needed.
        this.subscribe(this.props.externalModel);
        this.listenTo(this.props.externalModel, 'sync', this.onSync.bind(this));
        // Use destroyQueue.push for external subscriptions Rasti doesn't manage:
        const onResize = this.onResize.bind(this);
        window.addEventListener('resize', onResize);
        this.destroyQueue.push(() => window.removeEventListener('resize', onResize));
    }

    onChange(model, changed) {
        // Override to avoid unnecessary re-renders
        if ('relevantKey' in changed) this.render();
    }

    onUpdate() {
        if (this.state.editing) this.$('input.edit').focus();
    }

    onDestroy() {
        // destroyQueue handlers run automatically — only add manual cleanup here
    }

    template() {
        return this.html`<div>…</div>`;
    }
}
```

**`destroyQueue`** — array of functions called on destroy. Use for external subscriptions not managed by Rasti (DOM events, timers, third-party libraries). `subscribe()` and `listenTo()` are automatically cleaned up by `View.destroy()` — no need to push those.

**Related API:**
- [`component.onCreate`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v5.0.0-alpha.6/docs/api.md#module_component__oncreate) · [`component.onHydrate`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v5.0.0-alpha.6/docs/api.md#module_component__onhydrate) · [`component.onChange`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v5.0.0-alpha.6/docs/api.md#module_component__onchange) · [`component.onUpdate`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v5.0.0-alpha.6/docs/api.md#module_component__onupdate) · [`component.onDestroy`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v5.0.0-alpha.6/docs/api.md#module_component__ondestroy)

### Model Integration

Components auto-subscribe to `this.model`, `this.state`, `this.props`, and the contexts they read with `inject`. Changes trigger `onChange()` which by default calls `render()`.

```js
const Counter = Component.create(({ model, html }) => html`
    <div>
        <span>${model.count}</span>
        <button onClick=${() => model.count++}>+</button>
    </div>
`);

Counter.mount({ model : new Model({ count : 0 }) }, document.body);
```

Subscribe to other models in `onHydrate` (see [Lifecycle Hooks](#lifecycle-hooks)). Defining models — `defaults`, change events, `parse` and `toJSON` — is in [references/model.md](references/model.md).

**Related API:**
- [`component.subscribe`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v5.0.0-alpha.6/docs/api.md#module_component__subscribe) · [`Emitter.listenTo`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v5.0.0-alpha.6/docs/api.md#module_emitter__listento)

### Rendering

[`render()`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v5.0.0-alpha.6/docs/api.md#module_component__render) handles both initial hydration and updates:

- **First render** — runs `template()`, renders as string inside `DocumentFragment`, hydrates DOM, calls `onHydrate()`. If an `el` option was provided, hydrates onto that existing DOM instead (server-rendered markup)
- **Update render** — runs `template()` again while retaining the component's root partial and root element. Reconciliation is recursive: elements and retained partials patch in place, matching children recycle, and an interpolation region regenerates only when its occupant changes identity or shape. A partial's identity is its call site, so two literals with the same text are different templates; a lone component tag's is its component (class and key). Calls `onBeforeUpdate()` then `onUpdate()`

Use [`Component.markAsSafeHTML`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v5.0.0-alpha.6/docs/api.md#module_component_markassafehtml) only for pre-sanitized trusted HTML:

```js
${Component.markAsSafeHTML(this.props.trustedHTML)}
```

### Server-Side Rendering

On the server a component renders to HTML with `toString()`, so it drops into any string that builds the page. On the client, `Component.mount(options, el, true)` hydrates that markup instead of rendering it again.

```js
// Server — reset the uid counter on every request
Component.resetUid();
const html = `<!doctype html><html><body>${new App({ model })}</body></html>`;

// Client — bind to the served DOM
App.mount({ model }, document.body, true);
```

- `toString()` runs the constructor, `onCreate` and `template()`, children included. It subscribes to nothing, binds no events and never calls `onHydrate`, which runs only on the client.
- Events fired before hydration, such as an image's `load` or `error`, are not replayed: check the element's state in `onHydrate` (`img.complete`).
- Hydration finds elements by ids derived from `View.uid`, so the server resets the counter on every request (`Component.resetUid()`) and the client must render the same markup: same Rasti version and the same data (for example, a serialized model the client parses).

**Related API:** [`Component.mount`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v5.0.0-alpha.6/docs/api.md#module_component_mount) · [`component.toString`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v5.0.0-alpha.6/docs/api.md#module_component__tostring) · [`View.resetUid`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v5.0.0-alpha.6/docs/api.md#module_view_resetuid)

## ⚠️ Best Practices

### Component Structure
- Use a subclass (`class X extends Component { template() {…} }`) when the component has methods, state or lifecycle hooks.
- Use a template function, ``Component.create(({ props, html }) => html`…`)``, for presentational components, where it reads simpler.
- Use the tagged ``Component.create`…` `` form where capturing the interpolations once is practical, such as an inline function that must keep its identity across renders, like a callback passed to a child.
- Keep the root template stable and single-rooted; branch inside the interpolations.
- Use `html` for conditional blocks and lists. Return `null` from an interpolation to render nothing: `''` and `false` work too, but `null` makes the intent visible.
- Inline partials or helper methods (`renderHeader()`): pick whichever makes the component easier to read.
- Render a list as markup when its items are only content, and make each item a keyed component tag when it must keep its state, lifecycle or DOM across reorders. See [Lists](#lists).
- Use `props.renderChildren()` when the component accepts slotted content.

### Handlers & Props
- Name callback props `handle*` (`handleChange`, `handleSelect`): it sets them apart from DOM event handlers and keeps them clear of lifecycle hook names such as `onChange`.
- Unquoted for handlers and callbacks: `onClick=${() => this.model.toggle()}`, `handleChange=${(v) => this.model.set(v)}`. A callback written as an arrow is a new function on every render, so the child re-renders with its parent: fine for a single child; for list rows pass a class field (see [Component Tags & Props](#component-tags--props)).

### Lifecycle
- Init state in `onCreate()`. Subscribe to external models in `onHydrate()`.
- Use `destroyQueue.push` to co-locate cleanup with subscriptions.
- Use `onUpdate()` for DOM side effects (focus, scroll) after re-render.
- Write a DOM property that has no attribute, such as `indeterminate`, by hand in both `onHydrate()` and `onUpdate()`: `this.$('input').indeterminate = !!this.props.indeterminate`.
- Override `onChange()` to conditionally render only on relevant attribute changes.

### Performance
- A list of markup is the cheapest to update; make its items components only when they need an identity. Conditionally call `render()` in `onChange()` to avoid unnecessary work.
- Pass list rows props that keep their identity (class fields, models), so a parent render doesn't re-render every row.

## Common Pitfalls

1. **Quoted vs unquoted**: when the value is a function, the most frequent source of errors. Use quoted when it must run and pass its result; use unquoted when the function itself is the value. See [Interpolations](#interpolations).

2. **Unexpected recycling**: a component of the same type in the same interpolation is recycled, not recreated, so whatever runs only at creation — the constructor, `onCreate`, `onHydrate` — does not run again, and a recycled child receives only its new props, not `model` or `state`. A conditional that renders the same component with a different model keeps the first one:

    ```js
    // ❌ Recycled — still bound to `saved` after `editing` turns true
    <${Form} model="${this.state.editing ? draft : saved}" />

    // ✅ A key that changes per case forces a fresh instance
    <${Form} key="${this.state.editing ? 'draft' : 'saved'}" model="${this.state.editing ? draft : saved}" />
    ```

3. **A component in a list without a key**: it is never recycled — every render recreates it, losing its state and DOM nodes. Key it by a stable identity, or render the item as markup if it needs no identity. See [Lists](#lists).

4. **A key that identifies nothing**: a key is matched among the items one interpolation holds directly. On a component wrapped in markup (`<li><${Row} key="…" /></li>`), or rendered from a different interpolation than before, it does not preserve the instance. Make the keyed component tag the item itself, in a single interpolation.

5. **Swapping the root template**: `template()` must return the same template (and a single root element) on every render, or it throws `Root template changed`. Branch inside the interpolations instead. See [The Root Partial](#the-root-partial).

6. **Interpolating a plain value in a tagged template**: in ``Component.create`...` `` the expressions are captured once, so a plain value freezes at its first reading. Use a function, or author the template with `create(fn)` / a subclass, where `template()` re-runs per render.

7. **Subscriptions in `onCreate`**: Rasti itself subscribes to models and delegates DOM events in `onHydrate`, not on creation. On the server a component is usually just rendered with `toString()`: there is no DOM and nothing to keep in sync. And a component built in an expression runs `onCreate` even when recycling discards it right away. Follow the same rule: subscriptions, DOM listeners and API calls go in `onHydrate`. A write made in `onHydrate` reaches the components already hydrated, ancestors included, but not the ones hydrated after this one, which rendered the previous value and show it until the next change. Initialize shared state before mounting, when the store is created, rather than from a component's `onHydrate`.

8. **A callback prop named like a lifecycle hook**: `onCreate`, `onHydrate`, `onChange`, `onBeforeUpdate`, `onUpdate`, `onBeforeRecycle`, `onRecycle` and `onDestroy` are component options. Passed on a component tag, they are copied onto the instance, replacing the child's hook, and never reach `props`: `<${Input} onChange=${fn} />` makes `Input` call `fn` on its own model changes instead of re-rendering, and `this.props.onChange` is `undefined`. Name callback props `handle*`:

    ```js
    // Parent
    <${Input} handleChange=${(value) => this.model.query = value} />

    // Input
    <input onInput=${(ev) => this.props.handleChange(ev.target.value)} />
    ```

9. **Interpolating inside a `textarea` or a `script`**: their content is text, not markup, so an interpolation there shows its markers as characters and the next update fails (development builds throw). Bind a textarea through `value`, which also works on a `select`.

    ```js
    // ❌ <textarea>${this.state.text}</textarea>
    // ✅
    <textarea value="${this.state.text}"></textarea>
    ```

10. **Reading a context from slotted content**: an expression written between a component's tags belongs to the surrounding template, so `inject` there searches from that component and misses the host. In `<${Field}><${Input} id="${self => self.inject(FormControl).id}" /></${Field}>`, `self` is the page, not `Field`. Read the context in the consumer's own template. Likewise, `inject` in the constructor or `onCreate` runs before any parent rendered the component and gets the empty model.

## Additional Resources

- **Full API Documentation**: [api.md](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v5.0.0-alpha.6/docs/api.md)
- **Writing components**: [components.md](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v5.0.0-alpha.6/docs/components.md) — the three forms and which to use
- **Architecture**: [architecture.md](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v5.0.0-alpha.6/docs/architecture.md) — render engine, recycling, SSR, development mode
- **TypeScript**: [typescript.md](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v5.0.0-alpha.6/docs/typescript.md) — generics, helper types, declaration merging, known limitations
- **GitHub Repository**: [8tentaculos/rasti](https://github.com/8tentaculos/rasti)
