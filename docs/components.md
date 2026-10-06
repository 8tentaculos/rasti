# Defining a component's template

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

## Function vs. value interpolations

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

## `template` as an option

Because `template` is a regular view option, you can also pass one when mounting, without defining a class:

```javascript
Component.mount(
    { template() { return this.partial`<p>Hello</p>`; } },
    document.body,
);
```
