# Architecture

How Rasti is put together. Read this with [api.md](./api.md): the API reference is the contract; this document is the system.

---

## 1. Overview

Rasti builds user interfaces from components. A component describes its markup with a tagged template, and its first output is an HTML string — the same markup in the browser and on the server. Models, views and event emitters are the building blocks underneath, in the Backbone tradition. Zero runtime dependencies.

Public surface:

```
Emitter  →  Model
         →  View  →  Component
```

`Component` is the product. Everything below it exists so a `template()` can render, hydrate and patch a tree of elements, nested partials and child components.

### Directory map

```
src/
  index.js          public exports
  Emitter.js
  Model.js
  View.js
  Component.js      lifecycle, template(), the component adapter the engine sees
  core/             the render engine (never imports Component)
    parseTemplate.js
    Partial.js
    Slot.js and the five slot classes
    HydrationIndex.js
    *Descriptor.js, Attribute.js, Constants.js, …
  utils/            DOM, HTML, errors, `__DEV__`
```

The engine never names `Component`. What it needs from the component world arrives through a `ComponentAdapter`. A partial holds one adapter as its **owner** and another as its **host**; tests fake the same interface and production builds it in `Component`.

---

## 2. Emitter

The observer contract. `Model` and `View` inherit it.

- `on(type, listener)` / `once` / `off` / `emit` — listen and fire on **this** object.
- `listenTo(emitter, type, listener)` / `listenToOnce` / `stopListening` — inverse of control: this object tracks the subscriptions it made on **others**, and can drop them all at once.

`View.destroy()` calls `stopListening()` and `off()`, so a component that used `listenTo` or `subscribe` does not leak listeners. External subscriptions Rasti does not manage go on `destroyQueue`.

`on` returns an unsubscribe function. `off()` with no arguments removes every listener on this emitter; `off(type)` removes that type; `off(type, listener)` removes one.

---

## 3. Model

A table of attributes that emits `change` and `change:key` when they change.

Construction: `preinitialize` → resolve `defaults` → `parse` → merge into `this.attributes` → define a getter/setter per key. Assigning `model.foo = x` is `set('foo', x)`.

`set` accepts `"key", value` or `{ key: value }`. Nested `set` calls that happen inside a `change:key` listener batch the outer `change` until the nest unwinds, so listeners see a consistent snapshot.

`toJSON()` returns a shallow clone of `attributes`. Override `parse` / `toJSON` for persistence.

A component reuses `Model` three times:

| Field     | Role                                      |
|-----------|-------------------------------------------|
| `model`   | application data, passed in               |
| `state`   | internal UI state, created in `onCreate`  |
| `props`   | options that were not merged onto `this`  |

The component subscribes to `change` on all three (when present) and `onChange` re-renders by default.

---

## 4. View

Render-agnostic. It guarantees:

- a unique `uid` (`r1`, `r2`, …)
- a root element `el` (from `tag` + `attributes`, or an element you pass in)
- declarative event delegation on `el` (`events` as `{'click .sel': 'handler'}`)
- a `children` list and `destroy()` that walks it, undelegates, `stopListening`, runs `destroyQueue`, then `onDestroy`
- a `parent`, the view whose `addChild` adopted it, back to `null` on `destroy()`

It does **not** decide how markup is produced. `render()` is a no-op stub. `Component` overrides element creation and render; a subclass that is not a component writes its own `render`.

Delegation is one listener per event type on `el`. The handler walks from `event.target` up to `el` and fires every matching selector, inner to outer. `stopPropagation()` (`cancelBubble`) stops the walk.

`View.sanitize` escapes `& < > " '` for XSS. It is public and overrideable. It is **not** the HTML fragment serializer the engine uses for attributes.

---

## 5. Component

A view that renders from `template()`. The root partial that method returns is created once and patched in place afterwards.

### Authoring

Three forms, all producing a `Component` subclass:

```js
class Title extends Component {
    template() {
        return this.html`<div>${this.model.title}</div>`;
    }
}

Component.create(function() {
    return this.html`<div>${this.model.title}</div>`;
});

Component.create`<div>${({ model }) => model.title}</div>`;
```

The subclass and function forms re-run `template()` every render, so plain values work. `create` with a tagged template writes a `template()` that rebuilds the partial from expressions captured once, so anything dynamic must be a function. Which form to use, and why the subclass is the default, is in [Writing components](./components.md).

`template()` may also return a child component instance, or a partial that is a single component tag. Either makes this component a **container**: no wrapper element; `this.el` is the child's.

### Root restrictions

They apply only to the partial `template()` returns, not to partials inside interpolations:

1. A **single root element** — it becomes `this.el`. Development builds throw `Invalid root template` when the template resolves to anything else.
2. The **same template** every render — identity is the `strings` array of the tagged template. Switching the root throws `Root template changed`. Branch inside interpolations.

### Lifecycle

```
constructor
  preinitialize → merge options → props Model → onCreate
        │
        ▼
first render (not yet hydrated)
  template() → root partial → provide() → toString (emit HTML)
  parseHTML → hydrate (bind refs, subscribe, delegate, onHydrate)
        │
        ▼
update render (hydrated)
  onBeforeUpdate → provide() → template() again → patch in place → onUpdate
        │
        ▼
recycle (parent re-render reused this instance)
  onBeforeRecycle → move DOM if needed → props.set → onRecycle
        │
        ▼
destroy
  children, events, subscriptions, destroyQueue, onDestroy
```

`template()` first runs on render, not on construction, so `state` and anything set in `onCreate` are already there.

A child written as a component tag reaches the constructor only when the parent's render mounts it. A child built in an expression (`Child.mount(options)`, `new Child(options)`) runs it on every parent render, and when the render recycles the previous child instead, the new one is destroyed without rendering (`onDestroy` included). See [Slot-based recycling](#slot-based-recycling).

`subscribe(model)` is `listenTo` on `change` → `onChange`. Default `onChange` calls `render()`. Override it to skip irrelevant keys. `hydrate` subscribes to `model`, `state`, `props` and the contexts the first render read, so nothing listens on the server.

### Slotted content

`<${Child}>…</${Child}>` compiles an inner skeleton and passes `renderChildren` as a prop. The child calls `props.renderChildren()` to render that content.

The inner partial is **owned** by the parent (expressions and events evaluate there) and **hosted** by whoever currently renders it (child components join that component's `children`). Owner and host are the same component except for this case.

### Context

A host passes values to the components it renders, slotted content included, through a context: `provide()` on the host, `inject(key)` on the consumer.

- **`parent`.** `View#addChild` sets `child.parent`. The adoption happens right before the child's `toString` (`InterpolationSlot#renderMounted`), and `template()` first runs inside that `toString`, so the parent is there on the first render. A child never changes host: a recycled child is adopted again from the same slot, and keys are local to an interpolation. `parent` is the host, so the chain follows who renders a component, not whose template wrote it.
- **Provider.** `Component#updateContexts` calls `provide()` at the start of every render of the component: in `toString` after `ensureEngine`, in `renderUpdate` after `onBeforeUpdate`. It keeps one `Model` per key in `contexts` (`Object.create(null)`, keys read with `Reflect.ownKeys` so symbols count), created the first time the key is provided and `set` with the new values later. A component that provides nothing has no `contexts`.
- **Consumer.** `inject(key)` walks `parent` up from the consumer, not from itself, and returns the first `contexts[key]` by key presence: a context holding `null` values still stops the search, so values of two providers never mix. With no provider it returns `EMPTY_CONTEXT`, one module-level `Model`, frozen (development builds give it a `set` and `on` that throw a clear error first). `inject` is bound to the instance in `ensureEngine`, like `partial` and `html`, so templates destructure it.
- **Reactivity.** `inject` records each provider model it returns, once, in `injected`. `hydrate` subscribes to them with `subscribe`; a model first read after hydration is subscribed right away. The provider's `set` runs before its own pass, so `Model#set` notifies the consumers whose values changed, and they re-render from `onChange` before the provider patches its tree: no re-entry into a tree being patched, and the consumers the pass renders afterwards read the current values. `destroy` unsubscribes them with the rest (`stopListening`).

Known costs: a consumer whose props and context change in the same render renders twice, once from the context `set` and once from the `propsQueue`; one the provider's pass then destroys rendered for nothing. Everything is synchronous, so the intermediate state is never painted.

### Handlers and props across renders

`on*` attributes on elements are not bound to nodes. Every render resets the owner's `EventsManager` and pushes the handlers into it in emission order; each element carries its handler's index under `ATTRIBUTE_EVENT`. `events` delegates one listener per type to `el` (again only when a new type appears), which reads the index off the matched element and calls the current handler. A handler that is a new function on every render changes only the list. The attribute is rewritten only when the index moves, because a handler emitted before it appeared or disappeared.

A recycled child's props go through `props.set`, which compares with `!==`. A function, object or array created during the parent's render re-renders the child every time. `renderChildren` is a new closure on every render of the owner, so a child with slotted content re-renders with its parent.

---

## 6. The render engine

### Skeleton and partial

A tagged template is compiled **once per call site**. The `strings` array is the identity: `Partial.create` caches a subclass keyed on it. Two `partial\`…\`` with the same `strings` share one class; two with different `strings` are different templates.

Compilation (`parseTemplate`) turns the template into a **skeleton**: an ordered list of **parts**. A part is a literal (`LiteralDescriptor`), a bare expression (`ExpressionDescriptor`, in practice a dynamic tag name), or a descriptor (element, interpolation, component tag). Descriptors hold parse-time structure (attribute lists, inner skeletons); they do not hold live DOM.

A **partial** is a live instance: the skeleton class plus this render's `expressions` and the owner. Slot state (ids, refs, previous occupants) lives on the instance, created lazily on the first render.

```
strings  ──compile──►  Partial subclass (parts, source)
                         │
expressions + owner  ──►  Partial instance
                         │
                    slots[]  (one per part, same order)
```

### Slots

Every part has a slot. `part.constructor.Slot` names the class. Position in `parts` is the only pairing.

| Class                 | Part                         | What it owns                                              |
|-----------------------|------------------------------|-----------------------------------------------------------|
| `LiteralSlot`         | `LiteralDescriptor`          | nothing (emitted as written, never patched)               |
| `ExpressionSlot`      | `ExpressionDescriptor`       | a dynamic tag name; resolved on emit, never reconciled    |
| `ElementSlot`         | `ElementDescriptor`          | emission id, DOM node, last attributes                    |
| `InterpolationSlot`   | `InterpolationDescriptor`    | markers, occupant, list recycle                           |
| `ComponentSlot`       | `ComponentDescriptor`        | same as interpolation; builds the child only if not recycled |

`ComponentSlot` extends `InterpolationSlot`. `LiteralSlot` and `ExpressionSlot` extend `Slot` (empty `update`). `ElementSlot` and `InterpolationSlot` add their fields after `super()`.

`Partial` only orchestrates: walk slots in document order through emit, hydrate and update.

### Three phases

**Emit** (`Partial#toString`). Walk slots, concatenate HTML. Elements get `data-rst-el="${uid}-${n}"` in emission order. Interpolations are wrapped in comment markers, except on an **anchored** partial (see below), which writes no markers of its own.

**Hydrate.** Bind those nodes to the slots that wrote them, then recurse. Nothing is searched for: whoever enters the hydration builds a `HydrationIndex` — a snapshot of the rendered content, its elements in document order and its comments mapped by text — and hands it down through the whole subtree. One index answers for all of it, nested components included.

It is one walk, in document order: each slot takes its own nodes — `index.nextElement()` for an element, the start and end `index.comment(text)` for an interpolation — and then descends into what it holds, so nested partials and the child components the render mounted are attached where the walk reaches them (`onHydrate`). A child claimed from the previous render is left alone: it is already live, and the reconcile pass moves it onto the placeholder that stands for it.

Elements need no lookup because the walk and the render agree on the order, which is what makes the two cheap: a cursor over a static `NodeList`. The emission ids are still written out — they locate a server-rendered component's root element, and in development they are checked against the node the cursor hands back, so a DOM that does not match the render fails where it happens instead of shifting every slot after it.

The index belongs to the hydration, not to a component: built where the content is (a freshly parsed fragment, or the element a server rendered), dropped when the hydration ends. Nothing holds it afterwards, so it cannot go stale and it keeps no DOM alive. Because it is a snapshot taken up front, the refs it resolves are right even though `onHydrate` runs in the middle of the walk and may move nodes.

**Update.** Swap expressions, then each slot patches itself: elements diff attributes; interpolations reconcile the occupant.

### Emission is `toString`

Emitting is one contract, answered by every piece the engine renders: `Slot`, `Partial`, `Component` and `SafeHTML` all return the markup they stand for from `toString`. That is why a partial interpolates into a template, an array of children joins into HTML, and a component concatenates into a page — no render call, no wrapper.

Inside the engine the contract is **called**, never coerced: `slot.toString(pass)`, `child.toString()`. Calling a known `toString` is 3-5x faster than coercing the object (implicit coercion walks `Symbol.toPrimitive` and `valueOf` before reaching `toString`), and the reconcile pass rides along as an argument that a coercion could not pass. Coercion is left for values with no contract — a plain interpolated value, which goes through `valueToString` and the owner's `sanitize`.

A descriptor is not part of this: it is parse-time data, so `LiteralSlot` reads `descriptor.value` rather than stringifying it.

### Interpolation reconcile

For one slot, in order:

1. **Same partial** (same constructor / call site) → `prev.update(newExpressions)` in place.
2. **Same child** (key, or unkeyed type) → recycle in place: no DOM move, props queued.
3. **Anything else** → **regenerate**: render a fresh fragment, locate the recycled list children's placeholder comments in it, place it (between markers, or next to an anchored element's node), move those children onto their placeholders, hydrate new children, then finish props.

`regenerate` is one cycle; only placement forks (markers vs anchored).

### Slot-based recycling

The unit of identity is the **partial**, by call site (`strings`). Each interpolation reconciles **its own region**. An occupant that keeps identity is patched; anything else is regenerated. If an intermediate regenerates, everything below regenerates with it.

Position inside a partial keeps an unkeyed component stable. A **key** identifies a child among the siblings of **that interpolation** — in practice, the items of a list. Keys are not a global namespace. A keyed child that moves to a different interpolation is created fresh.

A partial cannot be keyed. Identity belongs to components, and a list item has one when it **is** a component: a child an expression built (`mount`, `new`), or a component tag, which describes one.

What separates a tag from every other partial is the region. A partial that writes markers owns a region of the DOM, reconciled by its own slots, so it is a **boundary**: the components in its interpolations belong to it, and the pool and keys of the list holding it never reach them. Markup makes no difference: a transparent partial (`${x}`) writes markers too, and what it resolves to can change from one render to the next. A lone component tag is anchored: it owns no region, stands on its component's element, and is known to be a component from its skeleton alone, before anything is evaluated. That is what lets a list be classified before it renders, and a previous child be claimed for a tag without building a new one (see candidates below).

```js
// item is the component — recycled and reordered
items.map(i => html`<${Row} key="${i.id}" />`)

// item is a partial — Row belongs to it, and is recreated when the list reorders
items.map(i => html`<li><${Row} key="${i.id}" /></li>`)
items.map(i => html`${Row.mount({ key : i.id })}`)
```

The items of a list are its value with nested arrays flattened (`flatten`, in `InterpolationSlot#evaluate`). A nested array is not a boundary: `groups.map(g => g.map(…))` is one list, whose components are siblings, keyed and placed like those of a flat list.

What claims a previous child is a **candidate**. A component an expression built is one: it claims by its `key` or type, hands its props to the child it claims, and is destroyed. A component tag is one before any component exists: `ComponentSlot#evaluate` synthesizes only the options, which carry the `key`, and the slot builds the component (`tag.mount(options)`) only when nothing is claimed. A claimed tag builds nothing; its options become the retained child's props (`ComponentAdapter#reuseChild`, which splits them as the constructor does).

A list places the keyed children it claims in one of two ways. When the previous render and this one are both lists of components only, the slot's region holds nothing but their elements, so the regeneration **walks** the new order (`placeInOrder`): children arrive and leave, and only the ones out of place move, the longest run already in order staying put. Otherwise recycle **markers** (`<!--rst-r-${uid}-->`) are emitted for the claimed children, and each is moved onto its placeholder (`placeBetweenMarkers`). Outside a list, retain-in-place or mount-anew; no placeholder.

The engine writes those markers and reads them back: the regeneration indexes its fresh fragment before inserting it, and that same index resolves the placeholder of every claimed child. The component is handed the node to replace and never searches for it.

### Transparent, container, anchored

These are different predicates. Do not collapse them.

| Predicate         | Means                                                                 | Used for                                      |
|-------------------|-----------------------------------------------------------------------|-----------------------------------------------|
| `isTransparent()` | skeleton is exactly one interpolation, no markup                      | `rootElement`; with `isRoot`, a container |
| `isComponentTag()`| skeleton is exactly one component tag                                 | `partial\`<${Comp} />\`` ≡ mounting Comp; the one partial a list's pass reaches |
| `isAnchored()`    | transparent **and** either a component's root partial or a component tag | no interpolation markers; stands on a component's element |

Container is a property of a **component**. Transparency is a property of a partial's **shape**.

### Attributes

Quoted values may mix literals and interpolations; they join into one string. A value that is exactly one interpolation keeps its raw resolved value (booleans, handlers, objects).

Presence is decided on the resolved attributes object, whatever wrote each key (a lone interpolation, a spread, `attributes`): `true` serializes as the bare name and sets the attribute empty on update; `false`, `null` and `undefined` leave it out, and on update remove it. Any other value, `''` included, is written as its string form. `getAttributesHTML` (emission) and `getAttributesDiff` (update) apply the same rule.

Escape is by origin. A **pure template literal** is HTML source and serializes as written (character references kept). Everything else — dynamic, mixed, spread, `attributes`, the emission id — is plain text: `&` → `&amp;`, U+00A0 → `&nbsp;`, `"` → `&quot;`, matching `setAttribute` on update.

Unsupported forms (interpolated attribute **name**, unquoted value mixed with literal text) warn once per call site in development.

`value` / `checked` / `selected` are patched as properties as well as attributes: the browser stops reflecting them after user interaction.

The component's `attributes` merge only onto the **root** element: the root partial's first `ElementSlot`. Nested partials never get that merge.

### Wire format (`Constants`)

Everything written into the DOM comes from `Constants`:

| Entry                 | Default                         | Role                                      |
|-----------------------|---------------------------------|-------------------------------------------|
| `ATTRIBUTE_ELEMENT`   | `data-rst-el`                   | emission id on every tracked element      |
| `ATTRIBUTE_EVENT`     | `data-rst-on-${type}-${uid}`    | delegated listener index                  |
| `MARKER_START` / `_END` | `rst-s-${id}` / `rst-e-${id}` | interpolation region                      |
| `MARKER_RECYCLED`     | `rst-r-${uid}`                  | placeholder for a claimed list child      |

Emission ids are convention, not an entry: `${uid}-${n}` counting from 1 in emission order. A component's root is emitted first, so it always ends in `-1`. Carrying the uid makes the id unique across the page, which is what lets one `HydrationIndex` cover a whole subtree without collisions. Compile-time placeholders never reach the DOM; they stay local to `parseTemplate`.

---

## 7. SSR and hydration

`component.toString()` (and string coercion) is the SSR path: emit the tree as HTML, no DOM. Ids are deterministic (`View.uid` plus per-component counters), so a client that starts from the same uid sequence produces the same markup.

Since rendering is the `toString` contract (see §6), a component drops into whatever string builds the page:

```js
const html = `<!doctype html><html><body>${new App({ model })}</body></html>`;
```

Hydration onto served DOM:

```js
Component.mount(options, el, true);
```

`toString()` still runs (to build child components and assign ids), then `hydrate` binds to the existing nodes instead of parsing a new fragment. Server and client must run the same version: the wire format is part of the contract.

`Component.mount(options, el)` without hydrate renders into a fragment and appends. `mount(options)` constructs only; call `render()` and attach `this.el` later.

---

## 8. Development mode

`src/utils/dev.js` exports `__DEV__`, `true` in source. Builds replace that binding:

| Build                                          | `__DEV__`                               |
|------------------------------------------------|-----------------------------------------|
| ESM / CJS modules (`es`, `lib`)                | `process.env.NODE_ENV !== 'production'` |
| Bundles `rasti.esm.js`, `rasti.umd.js`         | `true`                                  |
| Bundles `rasti.esm.min.js`, `rasti.umd.min.js` | `false`, then terser                    |

Terser drops what is left in dead position: `__DEV__ ? … : …`, `__DEV__ && …`, `if (__DEV__)`. Development strings must sit behind one of those forms, not behind a helper that would keep them alive. Component errors pass the long message as `__DEV__ && \`…\`` into a module-level throw helper so the min bundle keeps only the short production line.

Warnings (lists without keyed components, duplicate keys, unsupported attribute forms) use `console.warn`, once per call site, and point at the interpolation in the template source when it is available. Context warnings (`inject` before the component has a parent or an engine, `provide()` changing its keys or properties between renders) print once per component class. They are absent from the minified bundles.

---

## 9. Internal boundary and extension points

**Component adapter.** The engine's only door into the component world. The engine declares its shape as the `ComponentAdapter` typedef in `Partial.js`; production implements it in the `ComponentAdapter` class in `Component.js` (evaluate, ids, listeners, child lifecycle). Tests pass a fake with the same shape. Adding an engine capability that needs the component means adding an adapter method, not an `import Component` — behavior only: the wire format is the engine's own, written from `Constants`, and a child component is read directly for its `el`, `uid` and `key`. Owner and host are roles played by adapters bound to different components.

**`Component.markAsSafeHTML(value)`.** Opt out of sanitization for a trusted HTML string. Literals in tagged templates are marked automatically.

**`View.sanitize`.** Public, overrideable, XSS escape for text interpolations. Different contract from attribute serialization.

**`Component.extend` / `View` events.** Methods, lifecycle hooks, and (rarely) a custom `events` map for delegation beyond `on*` attributes.

---

## 10. Glossary

| Term            | Meaning |
|-----------------|--------|
| **skeleton**    | Compile result of one call site: ordered `parts`, plus optional template `source`. Static, cached. |
| **part**        | One entry in `parts`: a literal, an expression index, or a descriptor. |
| **descriptor**  | Parse-time structure for an element, interpolation or component tag. Shared by every partial from that call site. |
| **partial**     | Live instance: skeleton class + this render's expressions + owner. Identity is the `strings` array (the subclass). |
| **slot**        | Live state for one part. One per part, same order. Owns emit / hydrate / update of its region. |
| **call site**   | A tagged-template expression in source. Its `strings` array is stable across renders. |
| **owner**       | Component whose template the partial comes from. Expressions and event listeners belong to it. |
| **host**        | Component currently rendering the partial. Child components join its `children`. Same as owner except for slotted content. |
| **parent**      | The view that adopted a component with `addChild`: its host. Contexts are searched up the `parent` chain. |
| **context**     | A `Model` a component keeps per key from `provide()`, read by the components below it with `inject(key)`. |
| **container**   | A component whose root partial is transparent. `this.el` is the child's element. |
| **transparent** | A partial that is a single interpolation with no markup. The engine sees through it to resolve an element, never to recycle. |
| **boundary**    | A partial that owns a region (writes markers), with or without markup: the components in its interpolations belong to its own slots, out of reach of the list holding it. Every nested partial but a lone component tag, which is anchored. |
| **anchored**    | A partial that stands on a component's element and writes no interpolation markers (container or lone component tag). |
| **marker**      | HTML comment delimiting an interpolation (`rst-s-` / `rst-e-`), or a recycle placeholder (`rst-r-`). |
| **pass**        | Reconcile context for one slot's render, reaching only its own items and the component tags among them: previous keyed children, the order standing in the DOM, the keyed children and order being collected, the recycled children by the candidate each replaced, and the index of the content it rendered. |
| **candidate**   | What claims a previous child in a render: a component an expression built, or the options of a component tag, which builds its component only when nothing is claimed. |
| **index**       | `HydrationIndex`: snapshot of one render's nodes — elements in document order, comments by text — built before hydrating and shared by the subtree. |
| **emission id** | `${uid}-${n}` assigned when an element or interpolation is first written out. Root element is `-1`. |
| **wire format** | What hits the DOM: data attributes, dataset keys, comment markers, emission-id convention. |

---

## Related

- [api.md](./api.md) — public API, generated from JSDoc
- [Agent skill](../skills/rasti/SKILL.md) — compact reference for authoring components
