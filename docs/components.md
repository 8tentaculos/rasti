# Writing components

A component renders from its **`template()` method**, which returns a **partial**: a tagged template built with `this.html` (an alias of `this.partial`) that describes the root element and its dynamic content. `template()` runs on **every render**.

## Three ways to write a component

The same `Timer`, written in each form:

```javascript
// 1. A subclass, with `template()` next to the component's other methods.
class Timer extends Component {
    template() {
        return this.html`<div>Seconds: <span>${this.model.seconds}</span></div>`;
    }
}

// 2. A template function, which `create` uses as `template()`.
const Timer = Component.create(function() {
    return this.html`<div>Seconds: <span>${this.model.seconds}</span></div>`;
});

// 3. A tagged template, from which `create` writes `template()`.
const Timer = Component.create`
    <div>Seconds: <span>${({ model }) => model.seconds}</span></div>
`;
```

All three render the same component, and an application can mix them: a parent does not know how the components it renders were written. What changes is where the code lives and when the interpolations are read:

| | Subclass | Template function | Tagged template |
|---|---|---|---|
| `template()` | a method of the class | the function passed to `create` | built by `create` from the template |
| Interpolations | read on every render: plain values or functions | read on every render: plain values or functions | captured once: anything dynamic must be a function |
| Methods and hooks | in the class body | added with `.extend()` | added with `.extend()` |
| TypeScript | checked like any other method | checked like any other function | each function typed by hand |

### Which one to use

**Write components as subclasses.** The template, the handlers it binds and the methods it calls sit together in one class body, interpolations are plain expressions read fresh on every render, instance fields are declared like in any class, and in TypeScript the whole template is checked with no annotations (see the [TypeScript guide](./typescript.md)).

**The tagged template is for simple components**: small and presentational, with little or no logic of their own, like a link or an icon. There it is the shortest to write. Once a component needs methods, state or several hooks, a subclass reads better than a tagged template followed by `.extend()`.

**The template function** sits between the two: its `template()` re-runs on every render like a subclass's, without declaring a class. It suits a container that picks the child it renders (see [Containers](#containers-returning-a-component)).

## Combining the forms

Every form produces a subclass of `Component`, so they compose:

- **`.extend()`** adds methods and lifecycle hooks to a component made with `create`.
- **`create` called on a subclass** builds the new component on top of it, so a tagged template can call the class's methods:

  ```javascript
  class ListBase extends Component {
      renderItems() {
          return this.props.items.map(item => this.html`<li>${item}</li>`);
      }
  }

  const List = ListBase.create`<ul>${self => self.renderItems()}</ul>`;
  ```

- **`template` as an option**: `template` is a regular view option, so a component can be mounted with one without defining a class:

  ```javascript
  Component.mount(
      { template() { return this.html`<p>Hello</p>`; } },
      document.body,
  );
  ```

## Function vs. value interpolations

In the **tagged template** form, the interpolations are captured once, so anything dynamic must be a **function** — it is re-evaluated on each render, bound to the component and receiving it as its argument:

```javascript
Component.create`<span>${({ model }) => model.seconds}</span>`;
```

In the **function and subclass forms**, the body of `template()` re-runs on every render, so you can interpolate **plain values** as well — they are read fresh each time:

```javascript
class Greeting extends Component {
    template() {
        // Read on every render, so it stays in sync with the props.
        return this.html`<h1>Hello ${this.props.name}</h1>`;
    }
}
```

Reach for a function when the value should be read lazily from a nested object (`({ model }) => model.count`); use a plain value when you already have it in scope.

## Attribute values

An attribute value can be quoted or unquoted, and the difference matters only when the value is a function:

- **Quoted**, `title="${fn}"`: the function is **called** on every render, bound to the component and receiving it as its argument, and its result is the value.
- **Unquoted**, `handleSelect=${fn}`: the function **is** the value, passed as it is.

Any other value is passed as it is either way. Event handlers and functions meant for a child are written unquoted; values computed by a function, quoted:

```javascript
// Quoted: the function runs and its result is the value.
class="${({ model }) => model.completed ? 'completed' : ''}"

// Unquoted: the function is the value, a handler or a callback for a child.
onClick=${() => this.save()}
handleSelect=${this.handleSelect}

// Not a function: the same either way.
checked="${this.model.completed}"
```

A quoted value may also mix literal text with any number of interpolations, which are joined into one string; `null`, `undefined`, `true` and `false` join as nothing. A value that is exactly one interpolation keeps its raw value instead, so a boolean decides whether the attribute is present (`disabled="${this.props.locked}"`) and an object or a function reaches a child intact:

```javascript
class="row ${this.state.active ? 'active' : ''}"
href="/items?page=${this.state.page}"
```

Attribute names can't be interpolated, and an unquoted value takes a single interpolation with no text around it. Development builds warn about both.

## Event handlers

An `on*` attribute on an element, such as `onClick`, `onInput` or `onKeyUp`, binds a handler for that event: a function, or a string naming a method of the component (`onSubmit="handleSubmit"`). The handler runs with `this` bound to the component and receives `(event, component, matched)`, where `matched` is the element that carries the attribute:

```javascript
class Search extends Component {
    template() {
        return this.html`
            <form onSubmit="handleSubmit">
                <input onInput=${(event) => this.props.handleQuery(event.target.value)} />
            </form>
        `;
    }

    handleSubmit(event) {
        event.preventDefault();
    }
}
```

On a component tag, `<${Button} onClick=${fn} />`, an `on*` attribute is not a DOM listener: it is a prop like any other, and the child decides what to do with it.

## Functions across renders

In the subclass and function forms, every function written in `template()` is created anew on each render. In the tagged form, a function written directly in the template is created once, with the class, but one created inside an interpolation, such as a function returned by a quoted value or one written in a partial built in a `map`, is new on every render. That costs nothing for event handlers, and it can cost a render for props.

**Event handlers** are not attached to the elements. Each render writes the component's handlers into a list it keeps, and a single listener per event type on its root element looks up the one to call. A new `onClick=${() => this.save()}` on every render binds nothing and touches no DOM: the next click runs the latest one. In a list updated by position, a list of items without keys, the handler goes with the content like the text and the attributes do: the element stays where it is, and its handler is the one of the item now rendered there.

**Props** are compared with the previous render's by identity, and a child re-renders when one of them changed. A function, an object or an array created during the render is a new value each time, so the child re-renders whenever its parent does. Nothing breaks, it is only extra work; where it matters, in the rows of a large list or in an expensive child, pass something that keeps its identity, such as a class field:

```javascript
class TodoList extends Component {
    // Created once per instance, so it never re-renders the rows.
    handleRemove = (todo) => this.model.removeTodo(todo);

    template() {
        return this.html`
            <ul>
                ${this.model.todos.map(todo => this.html`
                    <${TodoItem} key="${todo.id}" model="${todo}" handleRemove=${this.handleRemove} />
                `)}
            </ul>
        `;
    }
}
```

A child rendered with content between its tags, `<${Card}>…</${Card}>`, re-renders with its parent regardless: that content belongs to the parent and may have changed with it.

## Switching components

The class in a component tag is part of the template's structure, like an element's tag name: write a fixed one there, not an expression that changes between renders. To render one component or another, branch on the structure, with a partial for each:

```javascript
// Given `Input` and `TextArea` components:
class Field extends Component {
    template() {
        return this.html`
            <label>
                ${this.props.multiline
                    ? this.html`<${TextArea} value="${this.props.value}" />`
                    : this.html`<${Input} value="${this.props.value}" />`}
            </label>
        `;
    }
}
```

Each branch is a template of its own, so each keeps its tag fixed, and switching from one to the other regenerates the content as a changed tag would.

A template is parsed once, on its first render, and a component tag is paired with its closing tag by the class both name. Tags that name the same class on that render are taken as the same reference from then on: if one of them later names another class, it keeps rendering the first one's.

## Component tags and built components

A child component is written as a tag, ``this.html`<${Row} key="${row.id}" model="${row}" />` ``. An interpolation may also hold a component that an expression builds, `Row.mount(options)` or `new Row(options)`, and both are recycled by the same rules: by key in a list, by type and position anywhere else. They differ in when the instance is built.

A **tag** hands the render a class and the options to build it with. The render builds the component only when it has none to recycle; when it recycles the previous child, the tag's attributes go to it as its new props and nothing else is created.

An **expression** has already built the component by the time the render sees it, on every render of the parent: its constructor and `onCreate` run each time. When the render recycles the previous child in its place, the new instance's props are handed to the previous one and the new instance is destroyed, running `onDestroy`, without ever rendering.

```javascript
class List extends Component {
    template() {
        return this.html`
            <ul>
                ${this.model.rows.map(row => this.html`<${Row} key="${row.id}" model="${row}" />`)}
            </ul>
        `;
    }
}
```

Written as `Row.mount({ key : row.id, model : row })`, the same list would build a `Row` for every row on every update, only to keep the ones it already had. Prefer the tag; keep the expression for when the component has to be built by code, and keep `onCreate` free of side effects that outlive the instance either way.

A key identifies the item itself, so the component has to be the item. Wrapped in another partial, ``this.html`<li><${Row} key="${row.id}" /></li>` ``, it belongs to that partial and is recreated when the list reorders. Nested arrays are one list: ``groups.map(group => group.map(row => this.html`<${Row} key="${row.id}" />`))`` keys and moves its rows like a flat one.

## Containers: returning a component

If `template()` returns a single component, the component becomes a *container*: it renders that child and adopts the child's root element as its own `this.el`. This is convenient for wrapping or picking a component:

```javascript
// Given a `Button` component:

const ButtonOk = Component.create`<${Button} className="ok">Ok</${Button}>`;

class ButtonCancel extends Component {
    template() {
        return this.html`<${Button} className="cancel">Cancel</${Button}>`;
    }
}
```

`template()` may also return a component it builds, `Button.mount(options)`, which is then built on every render as described above.

## The root partial

The partial returned by `template()` becomes the component's root element, so it carries two restrictions that the partials rendered inside an interpolation don't have:

- **A single root element.** Its outer element becomes `this.el`; anything next to it at the top level would render once and then be left out of every update, so development builds throw (*Invalid root template*). A partial rendered in an interpolation lives between the slot's markers, so it may render as many nodes as it needs.
- **The same template on every render.** The root is created once and then patched in place, so returning a different template throws (*Root template changed*). Branch inside the interpolations instead:

```javascript
class Panel extends Component {
    template() {
        return this.html`
            <section>${this.props.loading ? 'Loading…' : this.renderRows()}</section>
        `;
    }
}
```

Containers follow the same rule: returning a component tag and returning a built component both make one, but they count as different root templates, so a component must keep to one of them across renders.
