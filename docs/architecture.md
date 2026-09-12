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

It does **not** decide how markup is produced. `render()` is a no-op stub. `Component` overrides element creation and render; a subclass that is not a component writes its own `render`.

Delegation is one listener per event type on `el`. The handler walks from `event.target` up to `el` and fires every matching selector, inner to outer. `stopPropagation()` (`cancelBubble`) stops the walk.

`View.sanitize` escapes `& < > " '` for XSS. It is public and overrideable. It is **not** the HTML fragment serializer the engine uses for attributes.

---

## 5. Component

A view that renders from `template()`. The root partial that method returns is created once and patched in place afterwards.

### Authoring

Three equivalent forms:

```js
Component.create`<div>${({ model }) => model.title}</div>`;

Component.create(function() {
    return this.partial`<div>${this.model.title}</div>`;
});

class Title extends Component {
    template() {
        return this.partial`<div>${this.model.title}</div>`;
    }
}
```

The tagged form captures expressions once, so anything dynamic must be a function. The function and subclass forms re-run `template()` every render, so plain values work.

`template()` may also return a child component instance. That makes this component a **container**: no wrapper element; `this.el` is the child's.

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
  template() → root partial → toString (emit HTML)
  parseHTML → hydrate (bind refs, subscribe, delegate, onHydrate)
        │
        ▼
update render (hydrated)
  onBeforeUpdate → template() again → patch in place → onUpdate
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

`subscribe(model)` is `listenTo` on `change` → `onChange`. Default `onChange` calls `render()`. Override it to skip irrelevant keys.

### Slotted content

`<${Child}>…</${Child}>` compiles an inner skeleton and passes `renderChildren` as a prop. The child calls `props.renderChildren()` to render that content.

The inner partial is **owned** by the parent (expressions and events evaluate there) and **hosted** by whoever currently renders it (child components join that component's `children`). Owner and host are the same component except for this case.

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
| `ComponentSlot`       | `ComponentDescriptor`        | same as interpolation; `evaluate` synthesizes the child   |

`ComponentSlot` extends `InterpolationSlot`. `LiteralSlot` and `ExpressionSlot` extend `Slot` (empty `update`). `ElementSlot` and `InterpolationSlot` add their fields after `super()`.

`Partial` only orchestrates: walk slots in document order through emit, hydrate and update.

### Three phases

**Emit** (`Partial#toString`). Walk slots, concatenate HTML. Elements get `data-rst-el="${uid}-${n}"` in emission order. Interpolations are wrapped in comment markers, except on an **anchored** partial (see below), which writes no markers of its own.

**Hydrate.** Bind those ids and markers to live nodes, then recurse. Three passes, in this order — they cannot collapse:

1. **Element refs** — `querySelector` by emission id under `parent`. All of them, before any marker.
2. **Markers** — `findComment` under the component root, skipping nested component subtrees (`isComponent`: the element's id ends in `-1`).
3. **Occupants** — nested partials hydrate; on a fresh tree, child components hydrate too (`onHydrate`).

Pass 1 must finish before pass 2 because the search root for markers is the first element, and an interpolation can precede that element in document order (`html\`${a}<div>${b}</div>\``). Pass 2 must finish before pass 3 because hydrating a child runs `onHydrate`, which may move nodes and would break a marker lookup still pending.

**Update.** Swap expressions, then each slot patches itself: elements diff attributes; interpolations reconcile the occupant.

### Emission is `toString`

Emitting is one contract, answered by every piece the engine renders: `Slot`, `Partial`, `Component` and `SafeHTML` all return the markup they stand for from `toString`. That is why a partial interpolates into a template, an array of children joins into HTML, and a component concatenates into a page — no render call, no wrapper.

Inside the engine the contract is **called**, never coerced: `slot.toString(pass)`, `child.toString()`. Calling a known `toString` is 3-5x faster than coercing the object (implicit coercion walks `Symbol.toPrimitive` and `valueOf` before reaching `toString`), and the reconcile pass rides along as an argument that a coercion could not pass. Coercion is left for values with no contract — a plain interpolated value, which goes through `valueToString` and the owner's `sanitize`.

A descriptor is not part of this: it is parse-time data, so `LiteralSlot` reads `descriptor.value` rather than stringifying it.

### Interpolation reconcile

For one slot, in order:

1. **Same partial** (same constructor / call site) → `prev.update(newExpressions)` in place.
2. **Same child** (key, or unkeyed type) → recycle in place: no DOM move, props queued.
3. **Anything else** → **regenerate**: render a fresh fragment, place it (between markers, or next to an anchored element's node), move recycled list children onto placeholder comments, hydrate new children, then finish props.

`regenerate` is one cycle; only placement forks (markers vs anchored).

### Slot-based recycling

The unit of identity is the **partial**, by call site (`strings`). Each interpolation reconciles **its own region**. An occupant that keeps identity is patched; anything else is regenerated. If an intermediate regenerates, everything below regenerates with it.

Position inside a partial keeps an unkeyed component stable. A **key** identifies a child among the siblings of **that interpolation** — in practice, the items of a list. Keys are not a global namespace. A keyed child that moves to a different interpolation is created fresh.

A partial cannot be keyed. A list item that should keep identity must **be** a component, directly or through transparent partials (they add no node of their own):

```js
// item is the component — recycled and reordered
items.map(i => partial`<${Row} key="${i.id}" />`)

// item is a partial with markup — regenerated every time
items.map(i => partial`<li><${Row} key="${i.id}" /></li>`)
```

Recycle **markers** (`<!--rst-r-${uid}-->`) are emitted only when a keyed child is claimed during regeneration of a **list**, so its nodes can be moved to the new position. Outside a list, retain-in-place or mount-anew; no placeholder.

### Transparent, container, anchored

These are different predicates. Do not collapse them.

| Predicate         | Means                                                                 | Used for                                      |
|-------------------|-----------------------------------------------------------------------|-----------------------------------------------|
| `isTransparent()` | skeleton is exactly one interpolation, no markup                      | see-through for `collectChildren` / `rootElement` |
| `isComponentTag()`| skeleton is exactly one component tag                                 | `partial\`<${Comp} />\`` ≡ mounting Comp      |
| `isAnchored()`    | transparent **and** either a component's root partial or a component tag | no interpolation markers; stands on a component's element |

Container is a property of a **component**. Transparency is a property of a partial's **shape**.

### Attributes

Quoted values may mix literals and interpolations; they join into one string. A value that is exactly one interpolation keeps its raw resolved value (booleans, handlers, objects).

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
| `DATASET_ELEMENT`     | `rstEl`                         | dataset key matching `ATTRIBUTE_ELEMENT`  |
| `MARKER_START` / `_END` | `rst-s-${id}` / `rst-e-${id}` | interpolation region                      |
| `MARKER_RECYCLED`     | `rst-r-${uid}`                  | placeholder for a claimed list child      |

Emission ids are convention, not an entry: `${uid}-${n}` counting from 1 in emission order. A component's root is emitted first, so it always ends in `-1`. `isComponent` uses that suffix to skip nested component subtrees when looking up comments. Compile-time placeholders never reach the DOM; they stay local to `parseTemplate`.

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

| Build            | `__DEV__`                                      |
|------------------|------------------------------------------------|
| ESM / CJS        | `process.env.NODE_ENV !== 'production'`        |
| UMD `rasti.js`   | `true`                                         |
| UMD `rasti.min.js` | `false`, then terser                           |

Terser drops what is left in dead position: `__DEV__ ? … : …`, `__DEV__ && …`, `if (__DEV__)`. Development strings must sit behind one of those forms, not behind a helper that would keep them alive. Component errors pass the long message as `__DEV__ && \`…\`` into a module-level throw helper so the min bundle keeps only the short production line.

Warnings (lists without keyed components, duplicate keys, unsupported attribute forms) use `console.warn`, once per call site, and point at the interpolation in the template source when it is available. They are absent from `rasti.min.js`.

---

## 9. Internal boundary and extension points

**Component adapter.** The engine's only door into the component world. Production fills it in `buildComponentAdapter` (evaluate, ids, listeners, child lifecycle). Tests pass a fake with the same shape. Adding an engine capability that needs the component means adding an adapter method, not an `import Component` — behavior only: the wire format is the engine's own, written from `Constants`, and a child component is read directly for its `el` and `uid`. Owner and host are roles played by adapters bound to different components.

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
| **container**   | A component whose root partial is transparent. `this.el` is the child's element. |
| **transparent** | A partial that is a single interpolation with no markup. The engine sees through it. |
| **anchored**    | A partial that stands on a component's element and writes no interpolation markers (container or lone component tag). |
| **marker**      | HTML comment delimiting an interpolation (`rst-s-` / `rst-e-`), or a recycle placeholder (`rst-r-`). |
| **pass**        | Reconcile context for one regeneration: previous keyed children, used set, recycled children, newly mounted ones. |
| **emission id** | `${uid}-${n}` assigned when an element or interpolation is first written out. Root element is `-1`. |
| **wire format** | What hits the DOM: data attributes, dataset keys, comment markers, emission-id convention. |

---

## Related

- [api.md](./api.md) — public API, generated from JSDoc
- [AGENTS.md](./AGENTS.md) — compact reference for authoring components
