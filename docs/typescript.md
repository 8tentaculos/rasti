# TypeScript

**Rasti** ships with TypeScript declarations out of the box. The types are bundled in the package and resolved automatically.

## Components

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
interface CardProps { title: string; renderChildren?: () => any; }
type CardComponent = Component<CardProps>;

const Card = Component.create<CardProps>`
    <div class="card">
        <h2>${({ props }: CardComponent) => props.title}</h2>
        ${({ props }: CardComponent) => props.renderChildren?.()}
    </div>
`;
```

The interpolations are typed by annotating their parameter with the component type (see [Typing template interpolations](#typing-template-interpolations)).

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

## Models

Type the attributes with `Model<YourAttrs>`. Use **declaration merging** to surface the auto-generated getters/setters as instance properties:

```ts
import { Model } from 'rasti';

interface TodoAttrs { title: string; completed: boolean; }

class Todo extends Model<TodoAttrs> {
    get defaults() { return { title: '', completed: false }; }
    toggle() { this.completed = !this.completed; }
}
interface Todo extends TodoAttrs {} // Exposes this.title, this.completed

const t = new Todo({ title: 'x' });
t.title.toUpperCase(); // ✅
t.on('change:completed', (m, value) => value && /* boolean */ console.log('done'));
```

## Helper types

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

> Components made with `Component.create` are **values**, not types. To use one as a type outside its own template — as with `Counter` above — add `type X = InstanceType<typeof X>` next to the definition, or write `InstanceType<typeof X>` inline. Inside its own template, use `Component<P, S, M>` instead (see [Typing template interpolations](#typing-template-interpolations)). Neither a `Model` subclass nor a component authored as a subclass needs an alias, since `class` already declares both a value and a type.

## Typing template interpolations

This section applies to the **tagged `Component.create` form**. In the subclass and `create(fn)` forms the template body is ordinary code inside a typed method, so its interpolations are checked without helpers — that is the simplest way to get full typing.

Functions inside a tagged template are `any` — rasti can't infer them from the surrounding string. How to type one depends on what rasti calls it with, and that depends on where it sits in the template.

> Under `strict` / `noImplicitAny`, an untyped interpolation callback is an error (TS7031/TS7006), not a silent `any`. In non-strict mode typing is opt-in.

| Interpolation | Called with | Type it with |
|---|---|---|
| Content `${fn}` or quoted attr `attr="${fn}"` | The component, as its argument and as `this` | An arrow annotated with the component type: `({ props }: C) => …` |
| Unquoted `onX=${fn}` | `(event, component, matched)`, with `this` the component | `satisfies EventHandler<C, E>` |
| Function passed to a child (`handler=${fn}`) | Whatever the child calls it with | `satisfies ChildProps['handler']` |

The component type `C` is `Component<P, S, M>` with the same generics passed to `create`, aliased next to the component. It is not a copy: it is the exact type of the component's instances.

```ts
interface ToggleProps { label: string; }
class ToggleState extends Model<{ active: boolean }> {}
interface ToggleState { active: boolean; }
type ToggleComponent = Component<ToggleProps, ToggleState>;

const Toggle = Component.create<ToggleProps, ToggleState>`
    <button onClick=${(function() { this.state!.active = !this.state!.active; }) satisfies EventHandler<ToggleComponent, MouseEvent>}>
        ${({ props, state }: ToggleComponent) => `${props.label}: ${state!.active ? 'on' : 'off'}`}
    </button>
`.extend({
    onCreate() { this.state = new ToggleState({ active: false }); }
});
```

Inside its own template, a component can't use `InstanceType<typeof Toggle>`: the type of `Toggle` depends on the template itself, so TypeScript reports a circular reference (TS7022).

**Content and quoted attributes** receive the component as their argument, so annotating the parameter types everything they read. A `function` that reads `this` instead needs `satisfies RenderExpression<C>`, which types `this` as well:

```ts
${(function() { return this.props.label; }) satisfies RenderExpression<ToggleComponent>}
```

**Unquoted handlers** receive the event first, not the component. An annotated parameter still compiles there, since the template's expressions are `any`, and fails at runtime. `satisfies` checks the function against what rasti passes it:

```ts
// Compiles, but the argument is the MouseEvent: `props` is undefined at runtime.
onClick=${({ props }: ToggleComponent) => console.log(props.label)}

// Rejected (TS2339): `props` does not exist on `MouseEvent`.
onClick=${(({ props }) => console.log(props.label)) satisfies EventHandler<ToggleComponent, MouseEvent>}
```

### Templates that call the component's own methods

When the template calls the component's own methods, as in `(self) => self.renderItems()`, `Component<P, S, M>` doesn't have them. Declare them in a class and call `create` on it. The new component extends that class, so the class is the type to use:

```ts
interface ListProps { items: string[]; handleSelect: (item: string) => void; }

class ListBase extends Component<ListProps> {
    renderItems() {
        return this.props.items.map((item) => this.partial`<li>${item}</li>`);
    }
    select(ev: MouseEvent) {
        const li = (ev.target as HTMLElement).closest('li');
        if (li) this.props.handleSelect(li.textContent!);
    }
}

const List = ListBase.create`
    <ul onClick=${(function(ev) { this.select(ev); }) satisfies EventHandler<ListBase, MouseEvent>}>
        ${(self: ListBase) => self.renderItems()}
    </ul>
`;

List.mount({ items: ['a', 'b'], handleSelect: (item) => console.log(item) }, document.body);
```

A subclass that defines `template()` itself, as in [Components](#components), needs neither the helpers nor `create`.

### Functions passed to a child

For a function passed to a child, neither helper fits — its type comes from the child's prop. Type it against that prop's declared type (rasti can't connect the attribute to the child, since both live inside the template string):

```ts
// where the child was created with Component.create<ToggleAllProps>`...`
handleChange=${((checked) => model.toggleAll(checked)) satisfies ToggleAllProps['handleChange']}
```

A quoted value is the result of a function the parent runs, so what reaches the child is what that function returns. Annotate its return type with the child's prop: that checks the value, and it types the parameters of a callback returned by a thunk, which would otherwise be an implicit `any` (TS7006):

```ts
// where the child was created with Component.create<HeaderProps>`...`
handleAddTodo="${({ model }: AppComponent): HeaderProps['handleAddTodo'] => (title) => model!.addTodo(title)}"
```

`satisfies` on the returned callback does the same, `({ model }: AppComponent) => ((title) => model!.addTodo(title)) satisfies HeaderProps['handleAddTodo']`; the return type keeps the whole contract in the signature.

## Known limitations

- **Template interpolation callbacks are `any`** *(tagged form only)*. Functions in ``Component.create`...` `` templates can't be inferred from the surrounding string — type them by where they sit in the template (see [Typing template interpolations](#typing-template-interpolations)), or author the component as a subclass, where the template body is checked like any other method.
- **A component can't name its own type in its template** *(tagged form only)*. `InstanceType<typeof X>` is circular there (TS7022). Use `Component<P, S, M>` (see [Typing template interpolations](#typing-template-interpolations)), or the class `create` is called on when the template calls its methods (see [Templates that call the component's own methods](#templates-that-call-the-components-own-methods)).
- **`Model<A>` instance keys require declaration merging**. TypeScript can't add `A`'s keys to a `class extends Model<A>` automatically — see the `interface Todo extends TodoAttrs {}` pattern above.
- **An attribute can't be named after a member of `Model`**. With declaration merging, an attribute such as `on`, `get` or `set` conflicts with the member it shadows, and TypeScript reports it on the merged interface (TS2320). The shadowing breaks the model at runtime too, and development builds warn about it: rename the attribute, or prefix the generated properties with `static attributePrefix`.
- **`this.$()` can return `null`**. It mirrors `querySelector`, so handle the empty case (`?.`) and pass a type argument to narrow the element: `this.$<HTMLInputElement>('input.edit')?.focus()`. `this.$$()` returns a `NodeListOf<HTMLElement>` (also narrowable).
- **`this.model` / `this.state` are optional**. Both are `undefined` unless provided, so guard (`this.model?.foo`) or assert (`this.model!`) when you know one was passed. Both accept a Rasti `Model` or a model from another library (e.g. Backbone); Components subscribe to `change` events automatically when the object exposes `on`/`off`.
- **`state` / `model` are raw generics, `props` is not**. `this.props` is *always* a `Model` built by rasti, so it's typed `Model<P> & P` (direct access to `P`'s keys). But `state` and `model` can be anything you provide — a Rasti `Model`, a Backbone model, a store, or a plain object — so they stay the raw generic. To read a typed `Model` state/model directly, define it as a named subclass with declaration merging and pass it as the `S`/`M` generic (see the `Scoreboard` example above) — no casts needed.
- **Weak-type error on narrow props**. If a component's `P` has no required keys and you pass only options not declared in it, TypeScript reports *"has no properties in common"* (weak-type check). Fix: declare those options in `P` — non-reserved options become props at runtime.
- **Instance fields set in `.extend` hooks need predeclaration**. `.extend` infers the instance type from the object's members only, so a field first assigned in `onCreate` (`this.router = ...`) isn't known. Predeclare it in the object: `router: null as unknown as Router`. For components with many instance fields, a class is usually cleaner than `.extend`: `declare router: Router` in the class body, assigned in `onCreate`, and `create` called on the class (see [Templates that call the component's own methods](#templates-that-call-the-components-own-methods)).
