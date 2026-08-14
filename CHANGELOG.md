# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- **Attribute serialization**: attribute values are now escaped when a component is serialized to string (first render and server-side rendering), so a double quote in an interpolated value stays part of the value instead of terminating the attribute. Attribute names that can't be serialized are skipped. Attribute updates already went through `setAttribute` and were not affected.

## [4.1.0] - 2026-07-25

### Added

- **TypeScript support**: shipped type definitions for `Emitter`, `Model`, `View` and `Component` (props, state and model generics, typed events, and helper types like `EventHandler`, `RenderExpression`, `ModelAttrs`, `ComponentProps`, `ComponentState`, `ComponentModel`). Exposed via the `types` field and the `exports` map — no extra install needed.
- Type tests with `tsd` (`npm run test:types`), wired into the `posttest` hook.

### Changed

- **CI/Release moved to GitHub Actions**: replaced Travis CI with `CI` and `Release` workflows (test/build on push and pull request, plus OIDC trusted publishing to npm). Removed `.travis.yml` and the Travis badge from the README.

## [4.0.1] - 2026-03-30

### Changed

- **Event delegation for containers**: Added full event delegation support to container components, for children content.
- **Event propagation control**: Implemented `stopPropagation()` support in the delegation system.

- Added tests for container events delegation and propagation control
- Improved AGENTS.md documentation

## [4.0.0] - 2025-12-27

### Changed

#### Emitter
* Added inverse-of-control helpers `listenTo`, `listenToOnce` and `stopListening` to simplify cleanup of cross-object listeners.
  ```js
  // v3
  other.on('change', this.render);
  … later …
  other.off('change', this.render);

  // v4
  this.listenTo(other, 'change', this.render);
  … later …
  this.stopListening(); // removes *all* listening relationships owned by this object
  ```

#### View
* Delegated-events overhaul
  * Listener is now invoked only for elements inside `view.el` (bug fix).
  * If multiple ancestors between `event.target` and the root match, the listener fires **once per match** (inner-to-outer).
  * Listener signature gains a third argument `matched` – the element that satisfied the selector.
    ```js
    this.delegateEvents({
        'click button.save': (e, view, matched) => {
            // matched === the <button> that actually matched, could be a parent of e.target
        }
    });
    ```
* New `ensureUid()` helper exposes a stable `view.uid` you can extend/override.
* New `resetUid()` static method allows reset of the UID counter, useful for server-side rendering scenarios where you need to reset component UIDs between requests.
* `destroy()` now calls `this.stopListening()` so any listeners created with `listenTo` / `listenToOnce` are automatically cleaned up – no more manual unbinding.

#### Model
* New `parse(data, …args)` hook executed during construction lets you coerce incoming data or convert nested objects into models.
* Static `attributePrefix` lets you generate prefixed getters/setters (`attr_name` instead of `name`).

#### Component
* More granular render pipeline – components now patch their DOM incrementally, updating only changed attributes and content rather than replacing entire subtrees.
* Event handling changes – root-level `on*` selector maps removed (the `events` option remains). Compare:

  **v3 style (object on root element)**
  ```js
  const Counter = Component.create`
      <div
          onClick=${{
              '.up': () => model.count++,
              '.down': () => model.count--,
          }}
      >
          <div>Counter: ${() => model.count}</div>
          <button class="up">Increment</button>
          <button class="down">Decrement</button>
      </div>
  `;
  ```

  **v4 style (handlers per element)**
  ```js
  const Counter = Component.create`
      <div>
          <div>Counter: ${() => model.count}</div>
          <button class="up" onClick=${() => model.count++}>Increment</button>
          <button class="down" onClick=${() => model.count--}>Decrement</button>
      </div>
  `;
  ```
  Delegation still happens under the hood. You can still supply the selector→handler map via the `events` option when mounting if needed.

* Attribute quoting semantics – when an attribute value is **quoted** it is *evaluated first* (old behaviour). When it is **unquoted** the expression itself is used as the value. This lets you pass a function reference directly.
  ```html
  <!-- Pass a *result* (string) to the class attribute -->
  <button class="${() => 'primary'}">…</button>

  <!-- Pass a *function* itself to onClick -->
  <button onClick=${handleClick}>…</button>
  ```
* Smarter reuse – un-keyed children returned from an interpolation or a partial are now recycled **when the same component type stays in the same position**. Components inside arrays still require a `key` to be recycled.
* `props` model – every option **not** matched by a predefined option key (model, state, key, etc.) is collected in a read-only `Model` at `this.props`. When a recycled component receives new props it re-renders automatically.
* Boolean attributes (`true`/`false`) are now handled consistently across the entire template and all partials, not just on the root element as in v3: `false` attributes are removed from the DOM, and `true` attributes are rendered as boolean attributes (attribute name only, without a value).
* Enhanced error messages in development mode – improved error messages with formatted template source, line numbers, and error position markers. Errors now include component context (constructor name and UID) and show the exact expression that caused the error with visual indicators. Production builds use minimal error messages for smaller bundle size.
* New lifecycle split:
  * `onHydrate()` – first render (previously `onRender('hydrate')`).
  * `onBeforeUpdate()` – called before the component is updated or re-rendered, only during updates (when the component already has an element), not during the initial render.
  * `onUpdate()` – state/model/props change (previously `onRender('update')`).
  * `onBeforeRecycle()` – called before the component is recycled and reused between renders.
  * `onRecycle()` – when the component instance is reused between renders.

---


1. **BREAKING:** **Component event API**
   Camel-cased attributes on the *root element* that contained **selector → handler** maps (e.g. `onClick=${{ '.btn': 'onClick' }}`) have been removed.
   Instead, define handlers on each target element as shown in the Counter example above.
   The classic `events` option (passed either in the constructor or as `options.events`) **still works** and is the recommended fallback when you truly need selector delegation from the root element.

2. **BREAKING:** **Component recycling semantics**
   Un-keyed child components returned by an interpolation or inside a `partial` are now recycled **as long as they keep the same component type and position in the template/partial**. Items produced by mapping an **array** are still recreated each render unless they have a `key`.

3. **BREAKING:** **Lifecycle API split**
   `onRender(type)` has been removed. Implement the new hooks (`onHydrate`, `onUpdate`, `onRecycle`).

4. **BREAKING:** **View.render() default implementation**
   The default `View.render()` method now returns `this` without any implementation. Previously, it would automatically update `this.el.innerHTML` with the result of calling `this.template(this.model)`.
   You must now override `render()` in your view subclasses to implement your own rendering logic. This change encourages using `Component` for rendering, which provides a more declarative template syntax, automatic DOM updates, and a more efficient render pipeline. Views remain available as low-level building blocks when needed.

## [3.0.1] - 2025-04-08

### Changed

- Minor improvements on `render` and changes in how `options` are added to the instance.
- Changes in docs.
- Added tests.

### Fixed

- Improve recycle life cycle consistency for containers.
- Call `onRender` on recycled containers, and pass the correct render type to `onRender` when containers are hydrated.

## [3.0.0] - 2025-03-10

### Changed

#### Component
* Introducing **Containers**: A type of **Component** that renders a single sub-**Component**, without producing an extra root element.
  ```javascript
  // A Button component.
  const Button = Component.create`
      <button class="${({ options }) => options.primary ? 'primary' : ''}">
          ${({ options }) => options.renderChildren()}
      </button>
  `;
  // A container that renders a Button component.
  const PrimaryButton = Component(({ options }) => Button.mount({ ...options, primary: true }));
  ```
* **Component** element tags are dynamic and can be set as part of the template.
  ```javascript
  // If `options.href` is provided, renders a link; otherwise, renders a button.
  const Button = Component.create`
      <${({ options }) => options.href ? 'a' : 'button'} href="${({ options }) => options.href}">
          ${({ options }) => options.renderChildren()}
      </${({ options }) => options.href ? 'a' : 'button'}>
  `;
  ```
* Sub-**components** can now be added using a **Component** tag in the template instead of using `mount`.
  ```javascript
  // Create a container that renders a Button component
  // setting `primary` and `renderChildren` options.
  const OkButton = Component.create`
      <${Button} primary>Ok</${Button}>
  `;
  ```
* Attributes are now dynamic and can be defined with objects.
  ```javascript
  Component.create`<a ${{ ...linkAttributes }}>${({ options }) => options.renderChildren()}</a>`;
  ```
* Introducing the `partial` method: A tagged template to render HTML strings while adding Sub-**Components**.
  ```javascript
  const Main = Component.create`
      <main>
          ${self => self.renderHeader()}
          <section></section>
      </main>
  `.extend({
      renderHeader() {
          return this.partial`
              <header>
                  <h1>Home</h1>
                  <${MenuButton} />
              </header>
          `;
      }
  });
  ```
* General improvements and fixes.

#### Emitter
* The `on` method now returns an unbind function.

#### Model
* If `this.defaults` is a function, it will be called and its return value will be used.

#### View
* If `this.el`, `this.tag`, `this.attributes`, or `this.events` are functions, they will be called and their return values will be used.
* Introducing `this.destroyQueue`: Push functions to this array, and they will be called when the **View** is destroyed.
  ```javascript
  // Add a listener to the 'change' event, and add returned `off` function to `destroyQueue`,
  // so the listener is removed when the view is destroyed.
  this.destroyQueue.push(this.model.on('change', this.onChange.bind(this)));
  ```
* Introducing `View.samitize` method. To sanitize values to be inserted into the DOM.

* **BREAKING:** `Component` now sanitize all its interpolation by default, calling `Component.sanitize` (Inherited from View). Use `Component.partial` to interpolate HTML strings in your templates.
* **BREAKING:** Dropped **ES5** support: Code is no longer transpiled to **ES5** and runs natively in **ES6**.
* **BREAKING:** The package is now of type `module`, so Node.js will import the ESM version without conversion.
* **BREAKING:** The **CommonJS** version located in `lib` now has a `.cjs` extension and exports classes as `module.exports` instead of `module.exports.default`.
* **BREAKING:** Boolean attributes for the **Component** inner template are no longer transformed. Only **Component** element boolean attributes are transformed.

* Added tests.
* Updated examples.
* Updated modules and build.

## [2.0.2] - 2024-09-28

### Fixed

- Keep new lines for templates.

## [2.0.1] - 2024-04-30

### Changed

* Added tests.

### Fixed

* Fixed `Component.create` regex to support `h1`, ..., `h6`tags.
* Fixed true and false attributes render helper, to support `data-`attributes.
* Render empty string on `true` expressions.

## [2.0.0] - 2024-03-31

### Changed

* Introducing Components. A special kind of View that is designed to be easily composable, making it simple to add child views and build complex user interfaces.
Unlike views, which are render-agnostic, components have a specific set of rendering guidelines that allow for a more declarative development style.
* `destroy` method doesn't receive options as parameter anymore. And now it can be chained, as it returns the view itself.
 Any argument passed to `destroy` will be passed to `onDestroy` method.
* `removeElement` now returns the view itself for chaining.
* **BREAKING:** Improve set method.
  - **BREAKING:** Atomic `change` events.
    When using `Model.set` with object attribute with several keys, `change` event will be fired once, after firing all `change:attribute` events.
  - **BREAKING:** Support nested `change` and `change:attribute` events.
    When calling `Model.set` from an event listener.
  - **BREAKING:** Fixed `previous` object to reflect atomic changes.
    Clone attributes before every set call.
  - **BREAKING:** `change` event listener attributes has changed due to the atomic nature of `change` events.
    Instead of `model`, `key`, `value`. It now receives `model`, `changed`, `...args`.
    Being `changed`, an object containing the changed attributes. And `...args`, the rest of the arguments passed to `Model.set` method.
    ```
      // Before:
      onChange(model, key, value) {}
      // Now:
      onChange(model, changed, ...args) {}
    ```
* Added test.
* Updated modules.

## [1.1.5] - 2023-08-01

### Changed

* Added test.

### Fixed

* Fixed `delegateEvents` to work as expected on most implementations.

## [1.1.4] - 2023-07-10

### Changed

* Added extensions to imports. Improve cdn name resolution.

## [1.1.3] - 2023-07-09

### Changed

* Added extensions to index imports.
* Changed example cdn.

## [1.1.2] - 2023-07-02

### Changed

* Fixed bug in `delegateEvents` when delegating to the root element.
* Updated build.
* Updated modules.

## [1.1.1] - 2022-10-13

### Changed

* Migrated documentation from gitbook to docsify.
* Minor fix in `Model` getter.
* Added test.
* Bump modules.

## [1.1.0] - 2022-04-01

### Changed

- `View.delegateEvents`:
  * All listeners are bound to the view.
  * Undelegate first, if there are already delegated events.
  * Return `this` to enable chained calls.

- `View.undelegateEvents`
  * Return `this` to enable chained calls.

- Added test.

## [1.0.0] - 2022-03-30

### Changed

* Added `preinitialize` method to `Model` and `View`.
* Docs: Added CodePen code example.
* Docs: Improved TODO app example.
* Bugfix: Support delegated event selectors including spaces.

## [0.0.14] - 2020-11-09

### Changed

* Bugfix: Fixed uid generator.
* Improved uid generator test.

## [0.0.9] - 2019-01-05

### Changed

* Moved ensure view's element logic into a separate method.
* Added test. Check view's unique id.
* Removed globals from todo-webpack example.

## [0.0.8] - 2018-12-17

### Changed

* Bugfix: Fixed model previous attributes.
* Docs.

## [0.0.6] - 2018-08-13

### Changed

* **BREAKING:** Removed emitter.emitAsync method.

[unreleased]: https://github.com/8tentaculos/rasti/compare/v4.1.0...HEAD
[4.1.0]: https://github.com/8tentaculos/rasti/compare/v4.0.1...v4.1.0
[4.0.1]: https://github.com/8tentaculos/rasti/compare/v4.0.0...v4.0.1
[4.0.0]: https://github.com/8tentaculos/rasti/compare/v3.0.1...v4.0.0
[3.0.1]: https://github.com/8tentaculos/rasti/compare/v3.0.0...v3.0.1
[3.0.0]: https://github.com/8tentaculos/rasti/compare/v2.0.2...v3.0.0
[2.0.2]: https://github.com/8tentaculos/rasti/compare/v2.0.1...v2.0.2
[2.0.1]: https://github.com/8tentaculos/rasti/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/8tentaculos/rasti/compare/v1.1.5...v2.0.0
[1.1.5]: https://github.com/8tentaculos/rasti/compare/v1.1.4...v1.1.5
[1.1.4]: https://github.com/8tentaculos/rasti/compare/v1.1.3...v1.1.4
[1.1.3]: https://github.com/8tentaculos/rasti/compare/v1.1.2...v1.1.3
[1.1.2]: https://github.com/8tentaculos/rasti/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/8tentaculos/rasti/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/8tentaculos/rasti/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/8tentaculos/rasti/compare/v0.0.14...v1.0.0
[0.0.14]: https://github.com/8tentaculos/rasti/compare/v0.0.9...v0.0.14
[0.0.9]: https://github.com/8tentaculos/rasti/compare/v0.0.8...v0.0.9
[0.0.8]: https://github.com/8tentaculos/rasti/compare/v0.0.6...v0.0.8
[0.0.6]: https://github.com/8tentaculos/rasti/releases/tag/v0.0.6
