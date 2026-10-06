# Writing components

A component renders from its **`template()` method**, which returns a **partial**: a tagged template built with `this.partial` that describes the root element and its dynamic content. `template()` runs on **every render**.

## Three ways to write a component

The same `Timer`, written in each form:

```javascript
// 1. A subclass, with `template()` next to the component's other methods.
class Timer extends Component {
    template() {
        return this.partial`<div>Seconds: <span>${this.model.seconds}</span></div>`;
    }
}

// 2. A template function, which `create` uses as `template()`.
const Timer = Component.create(function() {
    return this.partial`<div>Seconds: <span>${this.model.seconds}</span></div>`;
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
| TypeScript | checked like any other method | `this` annotated by hand | each function typed with `satisfies` |

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
          return this.props.items.map(item => this.partial`<li>${item}</li>`);
      }
  }

  const List = ListBase.create`<ul>${self => self.renderItems()}</ul>`;
  ```

- **`template` as an option**: `template` is a regular view option, so a component can be mounted with one without defining a class:

  ```javascript
  Component.mount(
      { template() { return this.partial`<p>Hello</p>`; } },
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
        return this.partial`<h1>Hello ${this.props.name}</h1>`;
    }
}
```

Reach for a function when the value should be read lazily from a nested object (`({ model }) => model.count`); use a plain value when you already have it in scope.

## Containers: returning a component

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

## The root partial

The partial returned by `template()` becomes the component's root element, so it carries two restrictions that the partials rendered inside an interpolation don't have:

- **A single root element.** Its outer element becomes `this.el`; anything next to it at the top level would render once and then be left out of every update, so development builds throw (*Invalid root template*). A partial rendered in an interpolation lives between the slot's markers, so it may render as many nodes as it needs.
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
