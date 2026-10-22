# Rasti and TypeScript

Full guide (generics, helper types, declaration merging, known limitations): [typescript.md](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.2.1/docs/typescript.md).

Type declarations ship with the package.

## Subclasses

The **subclass form types best**: generics give `props` and `state`, the interpolations are ordinary expressions the compiler checks, handlers are arrows closing over a typed `this`, and the class name is a value *and* a type.

```ts
interface CounterProps { initial: number; label: string }

class Counter extends Component<CounterProps> {
    template() {
        return this.html`
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

To type `state` (or `model`), define it as a named `Model` subclass with declaration merging, which exposes its attributes, and pass it as the `S` (or `M`) generic. `state` and `model` are optional, so read them with `!`:

```ts
interface ToggleProps { label: string }
class ToggleState extends Model<{ active: boolean }> {}
interface ToggleState { active: boolean } // exposes state.active

class Toggle extends Component<ToggleProps, ToggleState> {
    onCreate() {
        this.state = new ToggleState({ active: false });
    }

    template() {
        return this.html`
            <button onClick=${() => this.toggle()}>
                ${this.props.label}: ${this.state!.active ? 'on' : 'off'}
            </button>
        `;
    }

    toggle() {
        this.state!.active = !this.state!.active;
    }
}
```

With the tagged form, interpolation callbacks are `any` and need opt-in typing (an annotated arrow parameter, `({ props }: C) => …`, for content and quoted attributes; `satisfies EventHandler<C, E>` for unquoted handlers), and the class is a value only — alias it with `type X = InstanceType<typeof X>` to use the name as a type.

## Typing tagged templates

In a tagged ``Component.create`…` `` template, functions are `any`. Type each one by what rasti calls it with, which depends on where it sits:

| Interpolation | Called with | Type it with |
|---|---|---|
| Content `${fn}` or quoted attribute `attr="${fn}"` | The component | Annotated arrow: `({ props }: C) => …` |
| Unquoted handler `onX=${fn}` | `(event, component, matched)` | `satisfies EventHandler<C, E>` |
| Function passed to a child `handler=${fn}` | Whatever the child passes | `satisfies ChildProps['handler']` |

```ts
interface ToggleProps { label: string; }
class ToggleState extends Model<{ active: boolean }> {}
interface ToggleState { active: boolean; } // exposes state.active
type ToggleComponent = Component<ToggleProps, ToggleState>;

const Toggle = Component.create<ToggleProps, ToggleState>`
    <button onClick=${(function() { this.state!.active = !this.state!.active; }) satisfies EventHandler<ToggleComponent, MouseEvent>}>
        ${({ props, state }: ToggleComponent) => `${props.label}: ${state!.active ? 'on' : 'off'}`}
    </button>
`.extend({
    onCreate() { this.state = new ToggleState({ active: false }); }
});
```

`C` is the component type, chosen by where the function is:

- **In the component's own template:** a `Component<P, S, M>` alias with the same generics passed to `create` (`ToggleComponent` above).
- **In its own template, calling its own methods** (`(self) => self.renderItems()`): declare them in a class and call `create` on it, `class ListBase extends Component<P> { renderItems() { … } }` then ``ListBase.create`…` ``. The class is `C`.
- **Outside the component:** `type X = InstanceType<typeof X>`.

A quoted thunk passed to a child annotates its return type with the child's prop, which also types the callback's parameters: `handleAdd="${({ model }: C): ChildProps['handleAdd'] => (title) => model!.add(title)}"`.

Never annotate the parameter of an unquoted handler: its first argument is the event, not the component, and the template's `any` lets the wrong annotation compile. A `function` reading `this` in content or a quoted attribute needs `satisfies RenderExpression<C>`: `${(function() { return this.props.label; }) satisfies RenderExpression<ToggleComponent>}`.

| Error | Cause | Fix |
|---|---|---|
| TS7031 / TS7006 | Untyped template function under `strict` | Annotate the arrow's parameter, or `satisfies` the helper for handlers |
| TS7022 / TS2456 | `InstanceType<typeof X>` used inside `X`'s own template | `Component<P, S, M>` alias |
| TS2339 on the component's own method | `Component<P, S, M>` has no `.extend` members | Methods in a class, `create` called on it |
| TS18048 on `state` / `model` | Both are optional | `this.state!` or `this.state?.` |
| TS2339 on a model attribute | Attributes need declaration merging | `interface X extends Attrs {}` next to `class X extends Model<Attrs>` |

---

## Contexts

Type a context key with `InjectionKey<T>`; at runtime it is a plain `Symbol`. `inject` returns `Model<T> & Partial<T>` (empty without a provider); a plain symbol or string key reads as `Record<string, any>`. The object `provide()` returns is not checked against its keys.

```ts
import { Component, InjectionKey } from 'rasti';

export const FormControl: InjectionKey<{ id: string | null; invalid: boolean }> = Symbol('formControl');

class Field extends Component<{ controlId: string; error?: string }> {
    provide() {
        return { [FormControl]: { id: this.props.controlId, invalid: !!this.props.error } };
    }
}

class Input extends Component<{ id?: string }> {
    template() {
        return this.html`<input id="${this.props.id || this.inject(FormControl).id || false}">`;
    }
}
```
