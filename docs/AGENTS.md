# Rasti API Reference for AI Agents

Compact reference for developing with Rasti. Full API: [api.md](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.1.2/docs/api.md). How the engine works: [architecture.md](./architecture.md)

---

## 🔧 Component API

### Component Creation

A component renders from its `template()` method, which returns a partial (or a child component — see [Container Components](#container-components)). `Component.create` is a factory that writes that method for you. The three forms below are equivalent ways to author the same component:

```js
import { Component, Model } from 'rasti';

// 1. Tagged template — the shortest form.
const MyComponent = Component.create`
    <div class="${({ props }) => props.className}">
        <span>${({ model }) => model.title}</span>
        <button onClick=${function() { this.model.count++; }}>+</button>
    </div>
`;

// 2. Template function — `create(fn)` uses `fn` as the component's `template()`.
const MyComponent = Component.create(function() {
    return this.partial`
        <div class="${this.props.className}">
            <span>${this.model.title}</span>
            <button onClick=${function() { this.model.count++; }}>+</button>
        </div>
    `;
});

// 3. Subclass — `template()` sits next to the other methods.
class MyComponent extends Component {
    template() {
        return this.partial`<div><span>${this.model.title}</span></div>`;
    }
}

// Add lifecycle hooks and methods
const MyComponent = Component.create`...`.extend({
    onCreate() {
        this.state = new Model({ editing: false });
    },
    onUpdate() {
        if (this.state.editing) this.$('input.edit').focus();
    }
});

// Mount to DOM
MyComponent.mount({ model }, document.getElementById('root'));
```

`template()` runs on **every render** — see [Interpolations](#interpolations) for what that means for the values inside it.

**Key Methods:**
- [`Component.create`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.1.2/docs/api.md#module_component_create) — creates component class from a tagged template or a template function
- [`component.template`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.1.2/docs/api.md#module_component__template) — returns the component's root partial; override it directly, via `extend`, or as a mount option
- [`Component.extend`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.1.2/docs/api.md#module_component_extend) — adds methods and lifecycle hooks
- [`Component.mount`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.1.2/docs/api.md#module_component_mount) — creates and mounts a component instance

---

### The Root Partial

The partial returned by `template()` becomes the component's root element, so two restrictions apply to it — and only to it, partials rendered inside an interpolation are free of both:

- **A single root element** — it becomes `this.el`. Sibling elements or loose text at the top level are dropped silently.
- **The same template on every render** — the root is created once and then patched in place, so returning a different template throws `Root template changed`.

```js
// ❌ Wrong — two elements at the top level; only <h1> survives
template() {
    return this.partial`<h1>${this.model.title}</h1><p>${this.model.body}</p>`;
}

// ❌ Wrong — a different root template per render
template() {
    return this.props.loading ?
        this.partial`<p>Loading…</p>` :
        this.partial`<ul>${this.renderRows()}</ul>`;
}

// ✅ Correct — one root element, branching inside the interpolation
template() {
    return this.partial`
        <section>${this.props.loading ? 'Loading…' : this.renderRows()}</section>
    `;
}
```

---

### Interpolations

All interpolations in templates (content or attribute values) follow the same rule: non-function values are passed directly; functions are called during each render, bound to `this`, with the component instance as argument.

**Function vs value interpolations:** in the tagged `Component.create` form the expressions are captured once, when the class is created, so anything dynamic **must be a function** — that is what gets re-evaluated on each render. In the `create(fn)` and subclass forms the body of `template()` re-runs on every render, so plain values are read fresh each time and work as well.

```js
// Tagged form — captured once, so dynamic values must be functions
Component.create`<span>${({ model }) => model.title}</span>`;

// Function / subclass form — `template()` re-runs, so plain values stay in sync
template() {
    return this.partial`<span>${this.model.title}</span>`;
}
```

Reach for a function when the value must be read lazily from a nested object; use a plain value when you already have it in scope.

**Quoted vs Unquoted attributes:**
- **Quoted** `attribute="${fn}"` — function **runs** during render; its return value is used (string, boolean, handler to pass to child, etc.)
- **Unquoted** `attribute=${fn}` — function reference is passed **as-is** (no execution); use for event handlers and callbacks

```js
// Content interpolations — function is called, return value renders
${({ model }) => model.title}
${({ model, state }) => model.count + state.offset}
${function() { return this.model.title; }}

// Quoted attribute — executes, passes result (a handler thunk) to child
handleAddTodo="${({ model }) => (title) => model.addTodo({ title })}"

// Quoted attribute — executes, passes current value
checked="${({ model }) => !!model.todos.length && !model.remaining.length}"
currentFilter="${({ model }) => model.filter}"

// Unquoted — passes function reference directly (event handler, callback)
onClick=${function() { this.model.removeCompleted(); }}
handleChange=${(checked) => model.toggleAll(checked)}
```

**Quoted attribute values compose** — a quoted value may mix literal text and any number of interpolations; the parts are joined into a single string. Each interpolated part is evaluated like any quoted value and coerced with the content-interpolation rule: `null`, `undefined`, `true` and `false` become `''`, anything else its string form. A value that is *exactly* one interpolation passes its raw resolved value, so booleans, objects and handler thunks keep working:

```js
// ✅ Mixed — literal text and interpolations join into one string
class="base ${({ state }) => state.active ? 'active' : ''}"
href="/items?page=${({ state }) => state.page}"

// ✅ Lone interpolation — raw value (boolean drives attribute presence)
disabled="${({ model }) => model.locked}"

// ❌ Still unsupported (warns in development)
data-${x}="1"    // attribute names must be literal
attr=x${fn}      // unquoted values take a single interpolation
```

---

### Event Handling

Component builds event delegation on top of View's delegation system. `on*` attributes in the template are compiled into delegated listeners on the component's root element. Events bubble up from descendants; `stopPropagation()` is supported.

**Handler signature:** `(event, component, matched)`
- `event` — native DOM event
- `component` — component instance (same as `this`)
- `matched` — element that matched the event

```js
// Inline function (most common)
<button onClick=${function(ev) { this.model.count++; }}>+</button>

// String method name — resolved as this.handleSubmit
const Form = Component.create`
    <form onSubmit="handleSubmit">
        <input onChange="handleChange" />
    </form>
`.extend({
    handleSubmit(ev) {
        ev.preventDefault();
        // ...
    },
    handleChange(ev) {
        this.model.value = ev.target.value;
    }
});

// Arrow function quoted — parent executes, passes handler thunk to child
handleSave="${({ model, props }) => () => model.delete(props.itemId)}"

// Arrow function unquoted — parent passes function reference directly to child
handleSelect="${({ props }) => props.handleSelect}"
```

**Related:** [`delegateEvents`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.1.2/docs/api.md#module_view__delegateevents)

---

### Component Tags & Props

When using `<${Component} />`, attributes become component options. Non-standard options are automatically collected into `this.props` (a Model).

```js
// Parent — passes values as component options
const App = Component.create`
    <main>
        <${Header} handleAddTodo="${({ model }) => (title) => model.addTodo({ title })}" />
        <${Footer} model="${({ model }) => model}" currentFilter="${({ model }) => model.filter}" />
    </main>
`;

// Child — receives them as props
const Header = Component.create`
    <header>
        <input onKeyUp=${function(ev) {
            if (ev.key === 'Enter' && ev.target.value) {
                this.props.handleAddTodo(ev.target.value);
                ev.target.value = '';
            }
        }} />
    </header>
`;
```

**Key properties:**
- `this.model` — [`Model`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.1.2/docs/api.md#module_model) for application data
- `this.state` — [`Model`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.1.2/docs/api.md#module_model) for internal component state
- `this.props` — [`Model`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.1.2/docs/api.md#module_model) auto-created from non-standard options

---

### renderChildren

When a component is rendered with content between tags, Rasti creates `renderChildren` and passes it as a prop. Call `props.renderChildren()` to render that content.

- `<${Child}>content</${Child}>` → `renderChildren` created and passed as prop
- `<${Child} />` (self-closing) → no `renderChildren`

```js
const Button = Component.create`
    <button>${({ props }) => props.renderChildren()}</button>
`;

// Support both with-content and self-closing (label fallback)
const FlexButton = Component.create`
    <button>${({ props }) => props.renderChildren ? props.renderChildren() : props.label}</button>
`;

// Usage — Rasti creates renderChildren automatically
const Main = Component.create`
    <div>
        <${Button}>click me</${Button}>
    </div>
`;
```

When using `Component.mount()`, pass `renderChildren` manually: `{ renderChildren : () => value }`.

---

### Partials

[`partial`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.1.2/docs/api.md#module_component__partial) creates sub-templates for conditional blocks and lists. A partial is patched in place on update — attributes diffed, child components recycled — so the DOM nodes inside it, and their focus, selection and input value, survive re-renders.

```js
const App = Component.create`
    <main>
        ${({ model, partial }) => !!model.todos.length && partial`
            <section class="main">
                <${ToggleAll}
                    checked="${() => !!model.todos.length && !model.remaining.length}"
                    handleChange=${(checked) => model.toggleAll(checked)}
                />
                <ul class="todo-list">
                    ${model.filtered.map(todo => partial`
                        <${Todo}
                            key="${todo.id}"
                            model="${todo}"
                            handleRemove=${() => model.removeTodo(todo)}
                        />
                    `)}
                </ul>
            </section>
        `}
        ${({ model, partial }) => model.completed.length ? partial`
            <button onClick=${function() { this.model.removeCompleted(); }}>
                Clear completed
            </button>
        ` : null}
    </main>
`;
```

For very large templates, extract named sub-template helpers (use `this.partial` inside them):

```js
const MyComponent = Component.create`
    <div>
        ${(self) => self.renderHeader()}
    </div>
`.extend({
    renderHeader() {
        return this.partial`<header><h1>${this.model.title}</h1></header>`;
    }
});
```

Unlike [the root partial](#the-root-partial), a partial rendered in an interpolation may produce any number of nodes, and may be swapped for a different template between renders (its slot is regenerated when the template changes).

---

### Component Recycling

Rasti reuses component instances across renders to preserve state and improve performance. Matching is **slot-local**: a candidate is only matched against the components the *same interpolation* held in the previous render.

- **Keyed**: matched by `key` attribute, within that interpolation — **required for arrays**, where unkeyed children are never recycled
- **Unkeyed**: matched by type, in a slot that renders a single value (not an array)
- A keyed component that moves to a **different interpolation** is recreated, not recycled — keys are not a global scope

**Rendering behavior:**
- **Recreation** — no match found; constructor runs, `onHydrate` fires
- **Recycling** — same instance reused: `onBeforeRecycle()` → props updated → `onRecycle()`

```js
// Arrays — always key the items, or every item is recreated on each render
${model.items.map(item => partial`
    <${Item} key="${item.id}" model="${item}" />
`)}

// Same type, different identity — use key to force recreation instead of recycling
${({ props }) => partial`<${TodoForm} key="${props.editingId}" model="${props.editingTodo}" />`}
```

---

### Container Components

A component whose template is a single child component expression — or whose `template()` returns a child component instance — is a **container**. `this.el` references the child's element directly (no wrapper).

```js
const PrimaryButton = Component.create`
    <${Button} className="primary" variant="solid" />
`;

// Function form — returning the mounted child
const SecondaryButton = Component.create(() =>
    Button.mount({ className : 'secondary', variant : 'outlined' })
);

// Subclass form
class TertiaryButton extends Component {
    template() {
        return Button.mount({ className : 'tertiary' });
    }
}
```

Rendering a component tag and returning the mounted child are equivalent ways to write a container, but they count as *different root templates*: alternating between them across renders throws `Root template changed`.

---

### Lifecycle Hooks

| Hook | Runs | Use for |
|------|------|---------|
| `preinitialize()` | Very start of constructor | Instance props needed by constructor itself |
| `onCreate()` | End of constructor (client + server) | State init, config before render |
| `onHydrate()` | After first DOM render (client only) | Subscriptions, API calls, browser APIs |
| `onChange(model, changed)` | On subscribed model change | Conditional render (default calls `render()`) |
| `onBeforeUpdate()` | Start of update render | Save previous state |
| `onUpdate()` | After update render | DOM operations (focus, scroll, etc.) |
| `onBeforeRecycle()` | Before recycling starts | Prepare for prop update |
| `onRecycle()` | After props updated on recycle | Post-recycle setup |
| `onDestroy()` | On component destroy | Custom cleanup |

`template()` first runs on render, not on construction, so everything set up in `preinitialize()` and `onCreate()` — `state` included — is already available to it.

```js
const MyComponent = Component.create`...`.extend({
    onCreate() {
        // Always runs (client + server). Initialize state here.
        this.state = new Model({ editing : false });
    },

    onHydrate() {
        // Client only, first time in DOM.
        // subscribe/listenTo are auto-cleaned on destroy — no destroyQueue needed.
        this.subscribe(this.props.externalModel);
        this.listenTo(this.props.externalModel, 'sync', this.onSync.bind(this));
        // Use destroyQueue.push for external subscriptions Rasti doesn't manage:
        const onResize = this.onResize.bind(this);
        window.addEventListener('resize', onResize);
        this.destroyQueue.push(() => window.removeEventListener('resize', onResize));
    },

    onChange(model, changed) {
        // Override to avoid unnecessary re-renders
        if ('relevantKey' in changed) this.render();
    },

    onUpdate() {
        if (this.state.editing) this.$('input.edit').focus();
    },

    onDestroy() {
        // destroyQueue handlers run automatically — only add manual cleanup here
    }
});
```

**`destroyQueue`** — array of functions called on destroy. Use for external subscriptions not managed by Rasti (DOM events, timers, third-party libraries). `subscribe()` and `listenTo()` are automatically cleaned up by `View.destroy()` — no need to push those.

**Related API:**
- [`component.onCreate`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.1.2/docs/api.md#module_component__oncreate) · [`component.onHydrate`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.1.2/docs/api.md#module_component__onhydrate) · [`component.onChange`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.1.2/docs/api.md#module_component__onchange) · [`component.onUpdate`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.1.2/docs/api.md#module_component__onupdate) · [`component.onDestroy`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.1.2/docs/api.md#module_component__ondestroy)

---

### Model Integration

Components auto-subscribe to `this.model`, `this.state`, and `this.props`. Changes trigger `onChange()` which by default calls `render()`.

```js
const Counter = Component.create`
    <div>
        <span>${({ model }) => model.count}</span>
        <button onClick=${function() { this.model.count++; }}>+</button>
    </div>
`;

Counter.mount({ model : new Model({ count : 0 }) }, document.body);
```

**Additional subscriptions** — use `onHydrate` (client only). `subscribe()` and `listenTo()` are auto-cleaned on destroy:

```js
const Dashboard = Component.create`...`.extend({
    onHydrate() {
        // subscribe() triggers onChange() on model change
        this.subscribe(this.props.externalModel);
        // listenTo() for custom events
        this.listenTo(this.props.externalModel, 'sync', this.onSync.bind(this));
    },
    onSync() { this.render(); }
});
```

**Related API:**
- [`component.subscribe`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.1.2/docs/api.md#module_component__subscribe) · [`Emitter.listenTo`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.1.2/docs/api.md#module_emitter__listento)

---

### Rendering

[`render()`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.1.2/docs/api.md#module_component__render) handles both initial hydration and updates:

- **First render** — runs `template()`, renders as string inside `DocumentFragment`, hydrates DOM, calls `onHydrate()`. If an `el` option was provided, hydrates onto that existing DOM instead (server-rendered markup)
- **Update render** — runs `template()` again and patches the DOM in place, never regenerating it: attributes are diffed across the template and its partials, and each interpolation is reconciled (children recycled, nested partials updated). Calls `onBeforeUpdate()` then `onUpdate()`

Use [`Component.markAsSafeHTML`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.1.2/docs/api.md#module_component_markassafehtml) only for pre-sanitized trusted HTML:

```js
${({ props }) => Component.markAsSafeHTML(props.trustedHTML)}
```

---

### TypeScript

Type declarations ship with the package. The **subclass form types best**: generics give `props` and `state`, the interpolations are ordinary expressions the compiler checks, handlers are arrows closing over a typed `this`, and the class name is a value *and* a type.

```ts
interface CounterProps { initial: number; label: string }

class Counter extends Component<CounterProps> {
    template() {
        return this.partial`
            <div>
                <span>${this.props.label}: ${this.props.initial}</span>
                <button onClick=${() => this.increment()}>+</button>
            </div>
        `;
    }
    increment() { /* `this.props` is typed */ }
}

const counter: Counter = Counter.mount({ initial: 0, label: 'Clicks' }, document.body);
```

With the tagged form, interpolation callbacks are `any` and need opt-in typing (`RenderExpression<C>` for content and quoted attributes, `EventHandler<C, E>` for unquoted handlers), and the class is a value only — alias it with `type X = InstanceType<typeof X>` to use the name as a type.

Full details (generics, helper types, declaration merging, known limitations): [TypeScript section in the README](https://github.com/8tentaculos/rasti#typescript).

---

## 📦 Model API

### Model Creation

```js
import { Model } from 'rasti';

class AppModel extends Model {
    addTodo(attrs) {
        const todo = this.createTodo(attrs);
        this.todos = this.todos.concat(todo);
    }
    removeCompleted() {
        this.completed.forEach(todo => this.removeTodo(todo));
    }
}

AppModel.prototype.defaults = {
    todos: [],
    filter: 'all'
};
```

**Related:** [`Model`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.1.2/docs/api.md#module_model)

---

### Attributes & Change Events

Each key in `defaults` gets an auto-generated getter/setter. Setting a property emits `change` and `change:key`:

```js
model.count = 1; // emits 'change' and 'change:count'
model.set({ a: 1, b : 2 }); // batched, emits one 'change' with { a, b }

// Listen to any change
model.on('change', (model, changed) => console.log(changed));

// Listen to specific attribute
model.on('change:filter', (model, value) => console.log(value));
```

---

### Parsing & Serialization

`parse()` is called during construction to transform raw data (e.g. from localStorage or API):

```js
class AppModel extends Model {
    parse(data) {
        if (!data || !Object.keys(data).length) return {};
        return {
            todos : (data.todos || []).map(attrs => this.createTodo(attrs)),
            filter : data.filter
        };
    }
    toJSON() {
        return {
            todos : this.todos.map(t => t.toJSON()),
            filter : this.filter
        };
    }
}

// Persist to localStorage
model.on('change', () => {
    localStorage.setItem('todos', JSON.stringify(model));
});
```

---

### Inter-model Subscriptions

Use `listenTo` / `stopListening` to manage subscriptions between models:

```js
createTodo(attrs) {
    const todo = new TodoModel(attrs);
    // Listen to child model — bubbles change up
    this.listenTo(todo, 'change', (...args) => this.emit('change', ...args));
    return todo;
}

removeTodo(todo) {
    this.todos = this.todos.filter(t => t !== todo);
    this.stopListening(todo); // clean up listener
}
```

**Related:** [`Emitter.listenTo`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.1.2/docs/api.md#module_emitter__listento) · [`Emitter.stopListening`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.1.2/docs/api.md#module_emitter__stoplistening)

---

## ⚠️ Best Practices

### Component Structure
- Use `Component.create` with semantic HTML. Keep template structure visible — prefer inline `partial` over helper methods.
- Reach for the subclass form (`class X extends Component { template() {…} }`) when a component has many methods, when plain-value interpolations read better than functions, or in TypeScript, where it types best.
- Keep the root template stable and single-rooted; branch inside the interpolations.
- Use `partial` for conditional blocks and lists. Return `null` in interpolations to render nothing.
- Use `key` attribute when rendering arrays.
- Extract class/style logic to helper functions (e.g. `getClassName`, `getFilterClass`).
- Use `props.renderChildren()` when the component accepts slotted content.

### Handlers & Props
- Unquoted for local handlers: `onClick=${function() { this.model.toggle(); }}`
- Quoted when passing a thunk from parent: `handleAdd="${({ model }) => (v) => model.add(v)}"`
- Unquoted for simple pass-through callbacks: `handleChange=${(v) => model.set(v)}`

### Lifecycle
- Init state in `onCreate()`. Subscribe to external models in `onHydrate()`.
- Use `destroyQueue.push` to co-locate cleanup with subscriptions.
- Use `onUpdate()` for DOM side effects (focus, scroll) after re-render.
- Override `onChange()` to conditionally render only on relevant attribute changes.

### Performance
- Use `key` for list item components. Conditionally call `render()` in `onChange()` to avoid unnecessary work.

---

## Common Pitfalls

1. **Quoted vs unquoted**: most frequent source of errors. Use quoted when you need to execute and pass the result; use unquoted when passing a function reference directly. See [Interpolations](#interpolations).

2. **Unexpected recycling**: two components of the same type in the same interpolation are recycled, not recreated. If you need a fresh instance (e.g. alternating A/B), give each a distinct `key` that changes per case.

3. **Missing keys in arrays**: unkeyed components inside an array are never recycled — every render recreates them, losing their state. Key them by a stable identity.

4. **Expecting a key to survive a move**: keys are matched within one interpolation. Rendering the same keyed component from a different interpolation recreates it; keep it in a single slot if its state must be preserved.

5. **Swapping the root template**: `template()` must return the same template (and a single root element) on every render, or it throws `Root template changed`. Branch inside the interpolations instead. See [The Root Partial](#the-root-partial).

6. **Interpolating a plain value in a tagged template**: in ``Component.create`...` `` the expressions are captured once, so a plain value freezes at its first reading. Use a function, or author the template with `create(fn)` / a subclass, where `template()` re-runs per render.

7. **Subscriptions in `onCreate` instead of `onHydrate`**: `onCreate` runs on the server too — subscriptions to models, DOM events, and APIs all belong in `onHydrate`.

---

## Additional Resources

- **Full API Documentation**: [api.md](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.1.2/docs/api.md)
- **Architecture**: [architecture.md](./architecture.md) — render engine, recycling, SSR, development mode
- **TypeScript usage** (generics, helpers, declaration merging, known limitations): see the [TypeScript section in the README](https://github.com/8tentaculos/rasti#typescript)
- **GitHub Repository**: [8tentaculos/rasti](https://github.com/8tentaculos/rasti)
