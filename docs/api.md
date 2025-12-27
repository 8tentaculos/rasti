## Modules

* [Component](#module_component) ⇐ <code>View</code>
    * _instance_
        * [.subscribe(model, [type], [listener])](#module_component__subscribe) ⇒ <code>Component</code>
        * [.partial(strings, ...expressions)](#module_component__partial) ⇒ [<code>Partial</code>](#new_partial_new)
        * [.toString()](#module_component__tostring) ⇒ <code>string</code>
        * [.render()](#module_component__render) ⇒ <code>Component</code>
        * [.onCreate(...args)](#module_component__oncreate)
        * [.onChange(model, changed)](#module_component__onchange)
        * [.onHydrate()](#module_component__onhydrate)
        * [.onBeforeRecycle()](#module_component__onbeforerecycle)
        * [.onRecycle()](#module_component__onrecycle)
        * [.onBeforeUpdate()](#module_component__onbeforeupdate)
        * [.onUpdate()](#module_component__onupdate)
        * [.onDestroy(...args)](#module_component__ondestroy)
    * _static_
        * [.markAsSafeHTML(value)](#module_component_markassafehtml) ⇒ [<code>SafeHTML</code>](#new_safehtml_new)
        * [.extend(object)](#module_component_extend)
        * [.mount([options], [el], [hydrate])](#module_component_mount) ⇒ <code>Component</code>
        * [.create(strings, ...expressions)](#module_component_create) ⇒ <code>Component</code>
* [Emitter](#module_emitter)
    * [.on(type, listener)](#module_emitter__on) ⇒ <code>function</code>
    * [.once(type, listener)](#module_emitter__once) ⇒ <code>function</code>
    * [.off([type], [listener])](#module_emitter__off)
    * [.emit(type, [...args])](#module_emitter__emit)
    * [.listenTo(emitter, type, listener)](#module_emitter__listento) ⇒ <code>function</code>
    * [.listenToOnce(emitter, type, listener)](#module_emitter__listentoonce) ⇒ <code>function</code>
    * [.stopListening([emitter], [type], [listener])](#module_emitter__stoplistening)
* [Model](#module_model) ⇐ <code>Emitter</code>
    * [.preinitialize([attributes], [...args])](#module_model__preinitialize)
    * [.defineAttribute(key)](#module_model__defineattribute)
    * [.get(key)](#module_model__get) ⇒ <code>any</code>
    * [.set(key, [value], [...args])](#module_model__set) ⇒ <code>Model</code>
    * [.parse([data], [...args])](#module_model__parse) ⇒ <code>object</code>
    * [.toJSON()](#module_model__tojson) ⇒ <code>object</code>
* [View](#module_view) ⇐ <code>Emitter</code>
    * _instance_
        * [.preinitialize(options)](#module_view__preinitialize)
        * [.$(selector)](#module_view__$) ⇒ <code>node</code>
        * [.$$(selector)](#module_view__$$) ⇒ <code>Array.&lt;node&gt;</code>
        * [.destroy(options)](#module_view__destroy) ⇒ <code>View</code>
        * [.onDestroy(options)](#module_view__ondestroy)
        * [.addChild(child)](#module_view__addchild) ⇒ <code>View</code>
        * [.destroyChildren()](#module_view__destroychildren)
        * [.ensureUid()](#module_view__ensureuid)
        * [.ensureElement()](#module_view__ensureelement)
        * [.createElement(tag, attributes)](#module_view__createelement) ⇒ <code>node</code>
        * [.removeElement()](#module_view__removeelement) ⇒ <code>View</code>
        * [.delegateEvents([events])](#module_view__delegateevents) ⇒ <code>View</code>
        * [.undelegateEvents()](#module_view__undelegateevents) ⇒ <code>View</code>
        * [.render()](#module_view__render) ⇒ <code>View</code>
    * _static_
        * [.sanitize(value)](#module_view_sanitize) ⇒ <code>string</code>
        * [.resetUid()](#module_view_resetuid)

<a name="module_component" id="module_component" class="anchor"></a>
## Component ⇐ <code>View</code>
Components are a special kind of `View` that is designed to be easily composable, 
making it simple to add child views and build complex user interfaces.  
Unlike views, which are render-agnostic, components have a specific set of rendering 
guidelines that allow for a more declarative development style.  
Components are defined with the [Component.create](#module_component_create) static method, which takes a tagged template string or a function that returns another component.

**Extends**: <code>View</code>  
**See**: [Component.create](#module_component_create)  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | Object containing options. The following keys will be merged to `this`: model, state, key, onDestroy, onHydrate, onBeforeRecycle, onRecycle, onBeforeUpdate, onUpdate, onCreate, onChange. Any additional options not in the component or view options list will be automatically extracted as props and stored as `this.props`. |

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [key] | <code>string</code> | A unique key to identify the component. Components with keys are recycled when the same key is found in the previous render. Unkeyed components are recycled based on type and position. |
| [model] | <code>Model</code> | A `Model` or any emitter object containing data and business logic. The component will listen to `change` events and call `onChange` lifecycle method. |
| [state] | <code>Model</code> | A `Model` or any emitter object containing data and business logic, to be used as internal state. The component will listen to `change` events and call `onChange` lifecycle method. |
| [props] | <code>Model</code> | Automatically created from any options not merged to the component instance. Contains props passed from parent component as a `Model`. The component will listen to `change` events on props and call `onChange` lifecycle method. When a component with a `key` is recycled during parent re-render, new props are automatically updated and any changes trigger a re-render. |

**Example**  
```js
import { Component, Model } from 'rasti';
// Create Timer component.
const Timer = Component.create`
    <div>
        Seconds: <span>${({ model }) => model.seconds}</span>
    </div>
`;
// Create model to store seconds.
const model = new Model({ seconds : 0 });
// Mount timer on body.
Timer.mount({ model }, document.body);
// Increment `model.seconds` every second.
setInterval(() => model.seconds++, 1000);
```

* [Component](#module_component) ⇐ <code>View</code>
    * _instance_
        * [.subscribe(model, [type], [listener])](#module_component__subscribe) ⇒ <code>Component</code>
        * [.partial(strings, ...expressions)](#module_component__partial) ⇒ [<code>Partial</code>](#new_partial_new)
        * [.toString()](#module_component__tostring) ⇒ <code>string</code>
        * [.render()](#module_component__render) ⇒ <code>Component</code>
        * [.onCreate(...args)](#module_component__oncreate)
        * [.onChange(model, changed)](#module_component__onchange)
        * [.onHydrate()](#module_component__onhydrate)
        * [.onBeforeRecycle()](#module_component__onbeforerecycle)
        * [.onRecycle()](#module_component__onrecycle)
        * [.onBeforeUpdate()](#module_component__onbeforeupdate)
        * [.onUpdate()](#module_component__onupdate)
        * [.onDestroy(...args)](#module_component__ondestroy)
    * _static_
        * [.markAsSafeHTML(value)](#module_component_markassafehtml) ⇒ [<code>SafeHTML</code>](#new_safehtml_new)
        * [.extend(object)](#module_component_extend)
        * [.mount([options], [el], [hydrate])](#module_component_mount) ⇒ <code>Component</code>
        * [.create(strings, ...expressions)](#module_component_create) ⇒ <code>Component</code>

<a name="module_component__subscribe" id="module_component__subscribe" class="anchor"></a>
### component.subscribe(model, [type], [listener]) ⇒ <code>Component</code>
Subscribes to a `change` event on a model or emitter object and invokes the `onChange` lifecycle method.
The subscription is automatically cleaned up when the component is destroyed.
By default, the component subscribes to changes on `this.model`, `this.state`, and `this.props`.

**Kind**: instance method of [<code>Component</code>](#module_component)  
**Returns**: <code>Component</code> - The current component instance for chaining.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| model | <code>Object</code> |  | The model or emitter object to listen to. |
| [type] | <code>string</code> | <code>&quot;&#x27;change&#x27;&quot;</code> | The event type to listen for. |
| [listener] | <code>function</code> | <code>this.onChange</code> | The callback to invoke when the event is emitted. |

<a name="module_component__partial" id="module_component__partial" class="anchor"></a>
### component.partial(strings, ...expressions) ⇒ [<code>Partial</code>](#new_partial_new)
Tagged template helper method.
Used to create a partial template.  
It will return a Partial object that preserves structure for position-based recycling.
Components will be added as children by the parent component. Template strings literals 
will be marked as safe HTML to be rendered.
This method is bound to the component instance by default.

**Kind**: instance method of [<code>Component</code>](#module_component)  
**Returns**: [<code>Partial</code>](#new_partial_new) - Partial object containing strings and expressions.  

| Param | Type | Description |
| --- | --- | --- |
| strings | <code>TemplateStringsArray</code> | Template strings. |
| ...expressions | <code>any</code> | Template expressions. |

**Example**  
```js
import { Component } from 'rasti';
// Create a Title component.
const Title = Component.create`
    <h1>${({ props }) => props.renderChildren()}</h1>
`;
// Create Main component.
const Main = Component.create`
    <main>
        ${self => self.renderHeader()}
    </main>
`.extend({
    // Render header method.
    // Use `partial` to render an HTML template adding children components.
    renderHeader() {
        return this.partial`
            <header>
                <${Title}>${({ model }) => model.title}</${Title}>
            </header>
        `;
    }
});
```
<a name="module_component__tostring" id="module_component__tostring" class="anchor"></a>
### component.toString() ⇒ <code>string</code>
Render the component as a string.
Used internally on the render process.
Use it for server-side rendering or static site generation.

**Kind**: instance method of [<code>Component</code>](#module_component)  
**Returns**: <code>string</code> - The rendered component.  
**Example**  
```js
import { Component } from 'rasti';
const Button = Component.create`
    <button class="button">Click me</button>
`;
const App = Component.create`
    <div>
        <${Button}>Click me</${Button}>
    </div>
`;

const app = new App();

console.log(app.toString());
// <div data-rasti-el="r1-1"><!--rasti-s-r1-1--><button class="button" data-rasti-el="r2-1">Click me</button><!--rasti-e-r1-1--></div>

console.log(`${app}`);
// <div data-rasti-el="r1-1"><!--rasti-s-r1-1--><button class="button" data-rasti-el="r2-1">Click me</button><!--rasti-e-r1-1--></div>
```
<a name="module_component__render" id="module_component__render" class="anchor"></a>
### component.render() ⇒ <code>Component</code>
Render the `Component`.

**First render (when `this.el` is not present):**
This is the initial render call. The component will be rendered as a string inside a `DocumentFragment` and hydrated, 
making `this.el` available. `this.el` is the root DOM element of the component that can be applied to the DOM. 
The `onHydrate` lifecycle method will be called. 

**Note:** Typically, you don't need to call `render()` directly for the first render. The static method `Component.mount()` 
handles this process automatically, creating the component instance, rendering it, and appending it to the DOM.

**Update render (when `this.el` is present):**
This indicates the component is being updated. The method will:
- Update only the attributes of the root element and child elements
- Update only the content of interpolations (the dynamic parts of the template)
- For container components (components that render a single child component), update the single interpolation

The `onBeforeUpdate` lifecycle method will be called at the beginning, followed by the `onUpdate` lifecycle method at the end.

**Child component handling:**
When rendering child components, they can be either recreated or recycled:

- **Recreation:** A new component instance is created, running the constructor again. This happens when no matching component 
  is found for recycling.

- **Recycling:** The same component instance is reused. Recycling happens in two ways:
  - Components with a `key` are recycled if a previous child with the same key exists
  - Unkeyed components are recycled if they have the same type and position in the template or partial

  When a component is recycled:
  - The `onBeforeRecycle` lifecycle method is called when recycling starts
  - The component's `this.props` is updated with the new props from the parent
  - The `onRecycle` lifecycle method is called after props are updated

  A recycled component may not use props at all and remain unchanged, or it may be subscribed to a different model 
  (or even the same model as the parent) and update independently in subsequent render cycles.

**Kind**: instance method of [<code>Component</code>](#module_component)  
**Returns**: <code>Component</code> - The component instance.  
<a name="module_component__oncreate" id="module_component__oncreate" class="anchor"></a>
### component.onCreate(...args)
Lifecycle method. Called when the component is created, at the end of the constructor.
This method receives the same arguments passed to the constructor (options and any additional parameters).
It executes both on client and server.
Use this method to define models or state that will be used later in `onHydrate`.

**Kind**: instance method of [<code>Component</code>](#module_component)  

| Param | Type | Description |
| --- | --- | --- |
| ...args | <code>\*</code> | The constructor arguments (options and any additional parameters). |

<a name="module_component__onchange" id="module_component__onchange" class="anchor"></a>
### component.onChange(model, changed)
Lifecycle method. Called when model emits `change` event.
By default calls `render` method.
This method can be extended with custom logic.
Maybe comparing new attributes with previous ones and calling
render when needed.

**Kind**: instance method of [<code>Component</code>](#module_component)  

| Param | Type | Description |
| --- | --- | --- |
| model | <code>Model</code> | The model that emitted the event. |
| changed | <code>object</code> | Object containing keys and values that has changed. |
| [...args] | <code>any</code> | Any extra arguments passed to set method. |

<a name="module_component__onhydrate" id="module_component__onhydrate" class="anchor"></a>
### component.onHydrate()
Lifecycle method. Called when the component is rendered for the first time and hydrated in a DocumentFragment.
This method only executes on the client and only during the first render.
Use this method for client-only operations like making API requests or setting up browser-specific functionality.

**Kind**: instance method of [<code>Component</code>](#module_component)  
<a name="module_component__onbeforerecycle" id="module_component__onbeforerecycle" class="anchor"></a>
### component.onBeforeRecycle()
Lifecycle method. Called before the component is recycled and reused between renders.
This method is called at the beginning of the `recycle` method, before any recycling operations occur.

A component is recycled when:
- It has a `key` and a previous child with the same key exists
- It doesn't have a `key` but has the same type and position in the template or partial

Use this method to perform operations that need to happen before the component is recycled,
such as storing previous state or preparing for the recycling.

**Kind**: instance method of [<code>Component</code>](#module_component)  
<a name="module_component__onrecycle" id="module_component__onrecycle" class="anchor"></a>
### component.onRecycle()
Lifecycle method. Called when the component is recycled and reused between renders.

A component is recycled when:
- It has a `key` and a previous child with the same key exists
- It doesn't have a `key` but has the same type and position in the template or partial

During recycling, the component instance is reused and its props are updated with new values.
The component's element may be moved in the DOM if the new template structure differs from the previous one.

**Kind**: instance method of [<code>Component</code>](#module_component)  
<a name="module_component__onbeforeupdate" id="module_component__onbeforeupdate" class="anchor"></a>
### component.onBeforeUpdate()
Lifecycle method. Called before the component is updated or re-rendered.
This method is called at the beginning of the `render` method when the component's state, model, or props change and trigger a re-render.
Use this method to perform operations that need to happen before the component is updated,
such as saving previous state or preparing for the update.

**Kind**: instance method of [<code>Component</code>](#module_component)  
<a name="module_component__onupdate" id="module_component__onupdate" class="anchor"></a>
### component.onUpdate()
Lifecycle method. Called when the component is updated or re-rendered.
This method is called when the component's state, model, or props change and trigger a re-render.
Use this method to perform operations that need to happen on every update.

**Kind**: instance method of [<code>Component</code>](#module_component)  
<a name="module_component__ondestroy" id="module_component__ondestroy" class="anchor"></a>
### component.onDestroy(...args)
Lifecycle method. Called when the component is destroyed.
Use this method to clean up resources, cancel timers, remove event listeners, etc.

**Kind**: instance method of [<code>Component</code>](#module_component)  

| Param | Type | Description |
| --- | --- | --- |
| ...args | <code>\*</code> | Options object or any arguments passed to `destroy` method. |

<a name="module_component_markassafehtml" id="module_component_markassafehtml" class="anchor"></a>
### Component.markAsSafeHTML(value) ⇒ [<code>SafeHTML</code>](#new_safehtml_new)
Mark a string as safe HTML to be rendered.  
Normally you don't need to use this method, as Rasti will automatically mark string literals 
as safe HTML when the component is [created](#module_component_create) and when 
using the [Component.partial](#module_component__partial) method.  
Be sure that the string is safe to be rendered, as it will be inserted into the DOM without any sanitization.

**Kind**: static method of [<code>Component</code>](#module_component)  
**Returns**: [<code>SafeHTML</code>](#new_safehtml_new) - A safe HTML object.  

| Param | Type |
| --- | --- |
| value | <code>string</code> | 

<a name="module_component_extend" id="module_component_extend" class="anchor"></a>
### Component.extend(object)
Helper method used to extend a `Component`, creating a subclass.

**Kind**: static method of [<code>Component</code>](#module_component)  

| Param | Type | Description |
| --- | --- | --- |
| object | <code>object</code> \| <code>function</code> | Object containing methods to be added to the new `Component` subclass. Also can be a function that receives the parent prototype and returns an object. |

<a name="module_component_mount" id="module_component_mount" class="anchor"></a>
### Component.mount([options], [el], [hydrate]) ⇒ <code>Component</code>
Mount the component into the DOM.
Creates a new component instance with the provided options and optionally mounts it into the DOM.

**Mounting modes:**
- **Normal mount** (default): Renders the component as HTML and appends it to the provided element. Use this for client-side rendering.
- **Hydration mode**: Assumes the DOM already contains the component's HTML (from server-side rendering). 

If `el` is not provided, the component is instantiated but not mounted (the same as using `new Component(options)`). You can mount it later by calling `render()` and appending the element (`this.el`) to the DOM.

**Kind**: static method of [<code>Component</code>](#module_component)  
**Returns**: <code>Component</code> - The component instance.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>object</code> | <code>{}</code> | The component options. These will be passed to the constructor and can include                               `model`, `state`, `props`, lifecycle methods, and any other component-specific options. |
| [el] | <code>node</code> |  | The DOM element where the component will be mounted. If provided, the component will be                     rendered and appended to this element. If not provided, the component is created but not mounted. |
| [hydrate] | <code>boolean</code> | <code>false</code> | If `true`, enables hydration mode for server-side rendering. The component will                                   assume the DOM already contains its HTML structure and will only hydrate it.                                  If `false` (default), the component will be rendered from scratch and appended to `el`. |

**Example**  
```js
import { Component, Model } from 'rasti';

const Button = Component.create`
    <button class="${({ props }) => props.className}">
        ${({ props }) => props.label}
    </button>
`;

// Normal mount: render and append to DOM.
const button = Button.mount({
    label: 'Click me'
}, document.body);

// Create without mounting (mount later).
const button2 = Button.mount({ className : 'secondary', label : 'Save' });
// Later, render and append it to the DOM.
document.body.appendChild(button2.render().el);

// Hydration mode: hydrate existing server-rendered HTML
// Assuming document.body already contains the HTML structure of the button.
const hydratedButton = Button.mount({
    className : 'primary',
    label : 'Click me'
}, document.body, true);
```
<a name="module_component_create" id="module_component_create" class="anchor"></a>
### Component.create(strings, ...expressions) ⇒ <code>Component</code>
Takes a tagged template string or a function that returns another component, and returns a new `Component` class.
- The template outer tag and attributes will be used to create the view's root element.
- The template inner HTML will be used as the view's template.
  ```javascript
  const Button = Component.create`<button class="button">Click me</button>`;
  ```
- Template interpolations that are functions will be evaluated during the render process, receiving the view instance as an argument and being bound to it. If the function returns `null`, `undefined`, `false`, or an empty string, the interpolation won't render any content.
  ```javascript
  const Button = Component.create`
      <button class="${({ props }) => props.className}">
          ${({ props }) => props.renderChildren()}
      </button>
  `;
  ```
- Attach DOM event handlers per element using camel-cased attributes.
  Event handlers are automatically bound to the component instance (`this`).
  Internally, Rasti uses event delegation to the component's root element for performance.
  
  **Attribute Quoting:**
  - **Quoted attributes** (`onClick="${handler}"`) evaluate the expression first, useful for dynamic values
  - **Unquoted attributes** (`onClick=${handler}`) pass the function reference directly
  
  **Listener Signature:** `(event, component, matched)`
  - `event`: The native DOM event object
  - `component`: The component instance (same as `this`)
  - `matched`: The element that matched the event (useful for delegation)
  
  ```javascript
  const Button = Component.create`
      <button 
          onClick=${function(event, component, matched) {
              // this === component
              console.log('Button clicked:', matched);
          }}
          onMouseOver="${({ model }) => () => model.isHovered = true}"
          onMouseOut="${({ model }) => () => model.isHovered = false}"
      >
          Click me
      </button>
  `;
  ```
  
  If you need custom delegation (e.g., `{'click .selector': 'handler'}`), 
  you may override the `events` property as described in [View.delegateEvents](#module_view__delegateevents).
- Boolean attributes should be passed in the format `attribute="${() => true}"`. `false` attributes won't be rendered. `true` attributes will be rendered without a value.
  ```javascript
  const Input = Component.create`
      <input type="text" disabled=${({ props }) => props.disabled} />
  `;
  ```
- If the interpolated function returns a component instance, it will be added as a child component.
- If the interpolated function returns an array, each item will be evaluated as above.
  ```javascript
  // Create a button component.
  const Button = Component.create`
      <button class="button">
          ${({ props }) => props.renderChildren()}
      </button>
  `;
  // Create a navigation component. Add buttons as children. Iterate over items.
  const Navigation = Component.create`
      <nav>
          ${({ props }) => props.items.map(
              item => Button.mount({ renderChildren : () => item.label })
          )}
      </nav>
  `;
  // Create a header component. Add navigation as a child.
  const Header = Component.create`
      <header>
          ${({ props }) => Navigation.mount({ items : props.items})}
      </header>
  `;
  ```
- Child components can be added using a component tag.
  ```javascript
  // Create a button component.
  const Button = Component.create`
      <button class="button">
           ${({ props }) => props.renderChildren()}
      </button>
  `;
  // Create a navigation component. Add buttons as children. Iterate over items.
  const Navigation = Component.create`
      <nav>
          ${({ props, partial }) => props.items.map(
              item => partial`<${Button}>${item.label}</${Button}>`
          )}
      </nav>
  `;
  // Create a header component. Add navigation as a child.
  const Header = Component.create`
      <header>
          <${Navigation} items="${({ props }) => props.items}" />
      </header>
  `;
  ```
- If the tagged template contains only one expression that mounts a component, or the tags are references to a component, the component will be considered a <b>container</b>. It will render a single component as a child. `this.el` will be a reference to that child component's element.
  ```javascript
  // Create a button component.
  const Button = Component.create`
      <button class="${({ props }) => props.className}">
          ${({ props }) => props.renderChildren()}
      </button>
  `;
  // Create a container that renders a Button component.
  const ButtonOk = Component.create`
      <${Button} className="ok">Ok</${Button}>
  `;
  // Create a container that renders a Button component, using a function.
  const ButtonCancel = Component.create(() => Button.mount({
      className : 'cancel',
      renderChildren : () => 'Cancel'
  }));
  ```

**Kind**: static method of [<code>Component</code>](#module_component)  
**Returns**: <code>Component</code> - The newly created component class.  

| Param | Type | Description |
| --- | --- | --- |
| strings | <code>string</code> \| <code>function</code> | HTML template for the component or a function that mounts a sub component. |
| ...expressions | <code>\*</code> | The expressions to be interpolated within the template. |

<a name="module_emitter" id="module_emitter" class="anchor"></a>
## Emitter
`Emitter` is a class that provides an easy way to implement the observer pattern 
in your applications.  
It can be extended to create new classes that have the ability to emit and bind custom named events.   
Emitter is used by `Model` and `View` classes, which inherit from it to implement 
event-driven functionality.

## Inverse of Control Pattern

The Emitter class includes "inverse of control" methods (`listenTo`, `listenToOnce`, `stopListening`) 
that allow an object to manage its own listening relationships. Instead of:

```javascript
// Traditional approach - harder to clean up
otherObject.on('change', this.myHandler);
otherObject.on('destroy', this.cleanup);
// Later you need to remember to clean up each listener
otherObject.off('change', this.myHandler);
otherObject.off('destroy', this.cleanup);
```

You can use:

```javascript
// Inverse of control - easier cleanup
this.listenTo(otherObject, 'change', this.myHandler);
this.listenTo(otherObject, 'destroy', this.cleanup);
// Later, clean up ALL listeners at once
this.stopListening(); // Removes all listening relationships
```

This pattern is particularly useful for preventing memory leaks and simplifying cleanup
in component lifecycle management.

**Example**  
```js
import { Emitter } from 'rasti';
// Custom cart
class ShoppingCart extends Emitter {
    constructor() {
        super();
        this.items = [];
    }

    addItem(item) {
        this.items.push(item);
        // Emit a custom event called `itemAdded`.
        // Pass the added item as an argument to the event listener.
        this.emit('itemAdded', item);
    }
}
// Create an instance of ShoppingCart and Logger
const cart = new ShoppingCart();
// Listen to the `itemAdded` event and log the added item using the logger.
cart.on('itemAdded', (item) => {
    console.log(`Item added to cart: ${item.name} - Price: $${item.price}`);
});
// Simulate adding items to the cart
const item1 = { name : 'Smartphone', price : 1000 };
const item2 = { name : 'Headphones', price : 150 };

cart.addItem(item1); // Output: "Item added to cart: Smartphone - Price: $1000"
cart.addItem(item2); // Output: "Item added to cart: Headphones - Price: $150"
```

* [Emitter](#module_emitter)
    * [.on(type, listener)](#module_emitter__on) ⇒ <code>function</code>
    * [.once(type, listener)](#module_emitter__once) ⇒ <code>function</code>
    * [.off([type], [listener])](#module_emitter__off)
    * [.emit(type, [...args])](#module_emitter__emit)
    * [.listenTo(emitter, type, listener)](#module_emitter__listento) ⇒ <code>function</code>
    * [.listenToOnce(emitter, type, listener)](#module_emitter__listentoonce) ⇒ <code>function</code>
    * [.stopListening([emitter], [type], [listener])](#module_emitter__stoplistening)

<a name="module_emitter__on" id="module_emitter__on" class="anchor"></a>
### emitter.on(type, listener) ⇒ <code>function</code>
Adds event listener.

**Kind**: instance method of [<code>Emitter</code>](#module_emitter)  
**Returns**: <code>function</code> - A function to remove the listener.  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | Type of the event (e.g. `change`). |
| listener | <code>function</code> | Callback function to be called when the event is emitted. |

**Example**  
```js
// Re render when model changes.
this.model.on('change', this.render.bind(this));
```
<a name="module_emitter__once" id="module_emitter__once" class="anchor"></a>
### emitter.once(type, listener) ⇒ <code>function</code>
Adds event listener that executes once.

**Kind**: instance method of [<code>Emitter</code>](#module_emitter)  
**Returns**: <code>function</code> - A function to remove the listener.  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | Type of the event (e.g. `change`). |
| listener | <code>function</code> | Callback function to be called when the event is emitted. |

**Example**  
```js
// Log a message once when model changes.
this.model.once('change', () => console.log('This will happen once'));
```
<a name="module_emitter__off" id="module_emitter__off" class="anchor"></a>
### emitter.off([type], [listener])
Removes event listeners with flexible parameter combinations.

**Kind**: instance method of [<code>Emitter</code>](#module_emitter)  

| Param | Type | Description |
| --- | --- | --- |
| [type] | <code>string</code> | Type of the event (e.g. `change`). If not provided, removes ALL listeners from this emitter. |
| [listener] | <code>function</code> | Specific callback function to remove. If not provided, removes all listeners for the specified type. **Behavior based on parameters:** - `off()` - Removes ALL listeners from this emitter - `off(type)` - Removes all listeners for the specified event type - `off(type, listener)` - Removes the specific listener for the specified event type |

**Example**  
```js
// Remove all listeners from this emitter
this.model.off();
```
**Example**  
```js
// Remove all 'change' event listeners
this.model.off('change');
```
**Example**  
```js
// Remove specific listener for 'change' events
const myListener = () => console.log('changed');
this.model.on('change', myListener);
this.model.off('change', myListener);
```
<a name="module_emitter__emit" id="module_emitter__emit" class="anchor"></a>
### emitter.emit(type, [...args])
Emits event of specified type. Listeners will receive specified arguments.

**Kind**: instance method of [<code>Emitter</code>](#module_emitter)  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | Type of the event (e.g. `change`). |
| [...args] | <code>any</code> | Optional arguments to be passed to listeners. |

**Example**  
```js
// Emit validation error event with no arguments
this.emit('invalid');
```
**Example**  
```js
// Emit change event with data
this.emit('change', { field : 'name', value : 'John' });
```
<a name="module_emitter__listento" id="module_emitter__listento" class="anchor"></a>
### emitter.listenTo(emitter, type, listener) ⇒ <code>function</code>
Listen to an event of another emitter (Inverse of Control pattern).

This method allows this object to manage its own listening relationships,
making cleanup easier and preventing memory leaks. Instead of calling
`otherEmitter.on()`, you call `this.listenTo(otherEmitter, ...)` which
allows this object to track and clean up all its listeners at once.

**Kind**: instance method of [<code>Emitter</code>](#module_emitter)  
**Returns**: <code>function</code> - A function to stop listening to the event.  

| Param | Type | Description |
| --- | --- | --- |
| emitter | <code>Emitter</code> | The emitter to listen to. |
| type | <code>string</code> | The type of the event to listen to. |
| listener | <code>function</code> | The listener to call when the event is emitted. |

**Example**  
```js
// Instead of: otherModel.on('change', this.render.bind(this));
// Use: this.listenTo(otherModel, 'change', this.render.bind(this));
// This way you can later call this.stopListening() to clean up all listeners
```
<a name="module_emitter__listentoonce" id="module_emitter__listentoonce" class="anchor"></a>
### emitter.listenToOnce(emitter, type, listener) ⇒ <code>function</code>
Listen to an event of another emitter and remove the listener after it is called (Inverse of Control pattern).

Similar to `listenTo()` but automatically removes the listener after the first execution,
like `once()` but with the inverse of control benefits for cleanup management.

**Kind**: instance method of [<code>Emitter</code>](#module_emitter)  
**Returns**: <code>function</code> - A function to stop listening to the event.  

| Param | Type | Description |
| --- | --- | --- |
| emitter | <code>Emitter</code> | The emitter to listen to. |
| type | <code>string</code> | The type of the event to listen to. |
| listener | <code>function</code> | The listener to call when the event is emitted. |

**Example**  
```js
// Listen once to another emitter's initialization event
this.listenToOnce(otherModel, 'initialized', () => {
    console.log('Other model initialized');
});
```
<a name="module_emitter__stoplistening" id="module_emitter__stoplistening" class="anchor"></a>
### emitter.stopListening([emitter], [type], [listener])
Stop listening to events from other emitters (Inverse of Control pattern).

This method provides flexible cleanup of listening relationships established with `listenTo()`.
All parameters are optional, allowing different levels of cleanup granularity.

**Kind**: instance method of [<code>Emitter</code>](#module_emitter)  

| Param | Type | Description |
| --- | --- | --- |
| [emitter] | <code>Emitter</code> | The emitter to stop listening to. If not provided, stops listening to ALL emitters. |
| [type] | <code>string</code> | The type of event to stop listening to. If not provided, stops listening to all event types from the specified emitter. |
| [listener] | <code>function</code> | The specific listener to remove. If not provided, removes all listeners for the specified event type from the specified emitter. **Behavior based on parameters:** - `stopListening()` - Stops listening to ALL events from ALL emitters - `stopListening(emitter)` - Stops listening to all events from the specified emitter - `stopListening(emitter, type)` - Stops listening to the specified event type from the specified emitter - `stopListening(emitter, type, listener)` - Stops listening to the specific listener for the specific event from the specific emitter |

**Example**  
```js
// Stop listening to all events from all emitters (complete cleanup)
this.stopListening();
```
**Example**  
```js
// Stop listening to all events from a specific emitter
this.stopListening(otherModel);
```
**Example**  
```js
// Stop listening to 'change' events from a specific emitter
this.stopListening(otherModel, 'change');
```
**Example**  
```js
// Stop listening to a specific listener
const myListener = () => console.log('changed');
this.listenTo(otherModel, 'change', myListener);
this.stopListening(otherModel, 'change', myListener);
```
<a name="module_model" id="module_model" class="anchor"></a>
## Model ⇐ <code>Emitter</code>
- Orchestrates data and business logic.
- Emits events when data changes.

A `Model` manages an internal table of data attributes and triggers change events when any of its data is modified.  
Models may handle syncing data with a persistence layer. To design your models, create atomic, reusable objects 
that contain all the necessary functions for manipulating their specific data.  
Models should be easily passed throughout your app and used anywhere the corresponding data is needed.

## Construction Flow
1. `preinitialize()` is called with all constructor arguments
2. `this.defaults` are resolved (if function, it's called and bound to the model)
3. `parse()` is called with all constructor arguments to process the data
4. `this.attributes` is built by merging defaults and parsed data
5. Getters/setters are generated for each attribute to emit change events

**Extends**: <code>Emitter</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [attributes] | <code>object</code> | <code>{}</code> | Primary data object containing model attributes |
| [...args] | <code>\*</code> |  | Additional arguments passed to `preinitialize` and `parse` methods |

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| defaults | <code>object</code> \| <code>function</code> | Default attributes for the model. If a function, it's called bound to the model instance to get defaults. |
| previous | <code>object</code> | Object containing previous attributes when a change occurs. |
| attributePrefix | <code>string</code> | Static property that defines a prefix for generated getters/setters. Defaults to empty string. |

**Example**  
```js
import { Model } from 'rasti';

// User model
class User extends Model {
    preinitialize() {
        this.defaults = { name : '', email : '', role : 'user' };
    }
}
// Order model with nested User and custom methods
class Order extends Model {
    preinitialize(attributes, options = {}) {
        this.defaults = {
            id : null,
            total : 0,
            status : 'pending',
            user : null
        };

        this.apiUrl = options.apiUrl || '/api/orders';
    }

    parse(data, options = {}) {
        const parsed = { ...data };
        
        // Convert user object to User model instance
        if (data.user && !(data.user instanceof User)) {
            parsed.user = new User(data.user);
        }

        return parsed;
    }

    toJSON() {
        const result = {};
        for (const [key, value] of Object.entries(this.attributes)) {
            if (value instanceof Model) {
                result[key] = value.toJSON();
            } else {
                result[key] = value;
            }
        }
        return result;
    }

    async fetch() {
        try {
            const response = await fetch(`${this.apiUrl}/${this.id}`);
            const data = await response.json();
            
            // Parse the fetched data and update model
            const parsed = this.parse(data);
            this.set(parsed, { source : 'fetch' });

            return this;
        } catch (error) {
            console.error('Failed to fetch order:', error);
            throw error;
        }
    }
}

// Create order with nested user data
const order = new Order({
    id : 123,
    total : 99.99,
    user : { name : 'Alice', email : 'alice@example.com' }
});

console.log(order.user instanceof User); // true
// Serialize with nested models
const json = order.toJSON();
console.log(json); // { id: 123, total: 99.99, status: 'pending', user: { name: 'Alice', email: 'alice@example.com', role: 'user' } }

// Listen to fetch updates
order.on('change', (model, changed, options) => {
    if (options?.source === 'fetch') {
        console.log('Order updated from server:', changed);
    }
});

// Fetch latest data from server
await order.fetch();
```

* [Model](#module_model) ⇐ <code>Emitter</code>
    * [.preinitialize([attributes], [...args])](#module_model__preinitialize)
    * [.defineAttribute(key)](#module_model__defineattribute)
    * [.get(key)](#module_model__get) ⇒ <code>any</code>
    * [.set(key, [value], [...args])](#module_model__set) ⇒ <code>Model</code>
    * [.parse([data], [...args])](#module_model__parse) ⇒ <code>object</code>
    * [.toJSON()](#module_model__tojson) ⇒ <code>object</code>

<a name="module_model__preinitialize" id="module_model__preinitialize" class="anchor"></a>
### model.preinitialize([attributes], [...args])
Called before any instantiation logic runs for the Model.
Receives all constructor arguments, allowing for flexible initialization patterns.
Use this to set up `defaults`, configure the model, or handle custom constructor arguments.

**Kind**: instance method of [<code>Model</code>](#module_model)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [attributes] | <code>object</code> | <code>{}</code> | Primary data object containing model attributes |
| [...args] | <code>\*</code> |  | Additional arguments passed from the constructor |

**Example**  
```js
class User extends Model {
    preinitialize(attributes, options = {}) {
        this.defaults = { name : '', role : options.defaultRole || 'user' };
        this.apiEndpoint = options.apiEndpoint || '/users';
    }
}
const user = new User({ name : 'Alice' }, { defaultRole : 'admin', apiEndpoint : '/api/users' });
```
<a name="module_model__defineattribute" id="module_model__defineattribute" class="anchor"></a>
### model.defineAttribute(key)
Generate getter/setter for the given attribute key to emit `change` events.
The property name uses `attributePrefix` + key (e.g., with prefix 'attr_', key 'name' becomes 'attr_name').
Called internally by the constructor for each key in `this.attributes`.
Override with an empty method if you don't want automatic getters/setters.

**Kind**: instance method of [<code>Model</code>](#module_model)  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | Attribute key from `this.attributes` |

**Example**  
```js
// Custom prefix for all attributes
class PrefixedModel extends Model {
    static attributePrefix = 'attr_';
}
const model = new PrefixedModel({ name: 'Alice' });
console.log(model.attr_name); // 'Alice'

// Disable automatic getters/setters
class ManualModel extends Model {
    defineAttribute() {
        // Empty - no getters/setters generated
    }
    
    getName() {
        return this.get('name'); // Manual getter
    }
}
```
<a name="module_model__get" id="module_model__get" class="anchor"></a>
### model.get(key) ⇒ <code>any</code>
Get an attribute from `this.attributes`.
This method is called internally by generated getters.

**Kind**: instance method of [<code>Model</code>](#module_model)  
**Returns**: <code>any</code> - The attribute value.  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | Attribute key. |

<a name="module_model__set" id="module_model__set" class="anchor"></a>
### model.set(key, [value], [...args]) ⇒ <code>Model</code>
Set one or more attributes into `this.attributes` and emit change events.
Supports two call signatures: `set(key, value, ...args)` or `set(object, ...args)`.
Additional arguments are passed to change event listeners, enabling custom behavior.

**Kind**: instance method of [<code>Model</code>](#module_model)  
**Returns**: <code>Model</code> - This model instance for chaining  
**Emits**: <code>change Emitted when any attribute changes. Listeners receive &#x60;(model, changedAttributes, ...event:args)&#x60;</code>, <code>change:attribute Emitted for each changed attribute. Listeners receive &#x60;(model, newValue, ...event:args)&#x60;</code>  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> \| <code>object</code> | Attribute key (string) or object containing key-value pairs |
| [value] | <code>\*</code> | Attribute value (when key is string) |
| [...args] | <code>\*</code> | Additional arguments passed to event listeners |

**Example**  
```js
// Basic usage
model.set('name', 'Alice');
model.set({ name : 'Alice', age : 30 });

// With options for listeners
model.set('name', 'Bob', { silent : false, validate : true });
model.on('change:name', (model, value, options) => {
    if (options?.validate) {
        // Custom validation logic
    }
});
```
<a name="module_model__parse" id="module_model__parse" class="anchor"></a>
### model.parse([data], [...args]) ⇒ <code>object</code>
Transforms and validates data before it becomes model attributes.
Called during construction with all constructor arguments, allowing flexible data processing.
Override this method to transform incoming data, create nested models, or handle different data formats.

**Kind**: instance method of [<code>Model</code>](#module_model)  
**Returns**: <code>object</code> - Processed data that will become the model's attributes  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [data] | <code>object</code> | <code>{}</code> | Primary data object to be parsed into attributes |
| [...args] | <code>\*</code> |  | Additional arguments from constructor, useful for parsing options |

**Example**  
```js
// Transform nested objects into models
class User extends Model {}
class Order extends Model {
    parse(data, options = {}) {
        // Skip parsing if requested
        if (options.raw) return data;
        // Transform user data into User model
        const parsed = { ...data };
        if (data.user && !(data.user instanceof User)) {
            parsed.user = new User(data.user);
        }
        return parsed;
    }
}

// Usage with parsing options
const order1 = new Order({ id : 1, user : { name : 'Alice' } }); // user becomes User model
const order2 = new Order({ id : 2, user : { name : 'Bob' } }, { raw : true }); // user stays plain object
```
<a name="module_model__tojson" id="module_model__tojson" class="anchor"></a>
### model.toJSON() ⇒ <code>object</code>
Return object representation of the model to be used for JSON serialization.
By default returns a copy of `this.attributes`.
You can override this method to customize serialization behavior, such as calling `toJSON` recursively on nested Model instances.

**Kind**: instance method of [<code>Model</code>](#module_model)  
**Returns**: <code>object</code> - Object representation of the model to be used for JSON serialization.  
**Example**  
```js
// Basic usage - returns a copy of model attributes:
const user = new Model({ name : 'Alice', age : 30 });
const json = user.toJSON();
console.log(json); // { name : 'Alice', age : 30 }

// Override toJSON for recursive serialization of nested models:
class User extends Model {}
class Order extends Model {
    parse(data) {
        // Ensure user is always a User model
        return { ...data, user : data.user instanceof User ? data.user : new User(data.user) };
    }

    toJSON() {
        const result = {};
        for (const [key, value] of Object.entries(this.attributes)) {
            if (value instanceof Model) {
                result[key] = value.toJSON();
            } else {
                result[key] = value;
            }
        }
        return result;
    }
}
const order = new Order({ id : 1, user : { name : 'Alice' } });
const json = order.toJSON();
console.log(json); // { id : 1, user : { name : 'Alice' } }
```
<a name="module_view" id="module_view" class="anchor"></a>
## View ⇐ <code>Emitter</code>
- Listens for changes and renders the UI.
- Handles user input and interactivity.
- Sends captured input to the model.

A `View` is an atomic unit of the user interface that can render data from a specific model or multiple models.
However, views can also be independent and have no associated data.  
Models must be unaware of views. Views, on the other hand, may render model data and listen to the change events 
emitted by the models to re-render themselves based on changes.  
Each `View` has a root element, `this.el`, which is used for event delegation.  
All element lookups are scoped to this element, and any rendering or DOM manipulations should be done inside it. 
If `this.el` is not present, an element will be created using `this.tag` (defaulting to `div`) and `this.attributes`.

**Extends**: <code>Emitter</code>  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | Object containing options. The following keys will be merged into the view instance: `el`, `tag`, `attributes`, `events`, `model`, `template`, `onDestroy`. |

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| el | <code>node</code> \| <code>function</code> | Every view has a root DOM element stored at `this.el`. If not present, it will be created. If `this.el` is a function, it will be called to get the element at `this.ensureElement`, bound to the view instance. See [View.ensureElement](module_view__ensureelement). |
| tag | <code>string</code> \| <code>function</code> | If `this.el` is not present, an element will be created using `this.tag` and `this.attributes`. Default is `div`. If it is a function, it will be called to get the tag, bound to the view instance. See [View.ensureElement](module_view__ensureelement). |
| attributes | <code>object</code> \| <code>function</code> | If `this.el` is not present, an element will be created using `this.tag` and `this.attributes`. If it is a function, it will be called to get the attributes object, bound to the view instance. See [View.ensureElement](module_view__ensureelement). |
| events | <code>object</code> \| <code>function</code> | Object in the format `{'event selector' : 'listener'}`. It will be used to bind delegated event listeners to the root element. If it is a function, it will be called to get the events object, bound to the view instance. See [View.delegateEvents](module_view_delegateevents). |
| model | <code>object</code> | A model or any object containing data and business logic. |
| template | <code>function</code> | A function that returns a string with the view's inner HTML. See [View.render](module_view__render). |
| uid | <code>number</code> | Unique identifier for the view instance. This can be used to generate unique IDs for elements within the view. It is automatically generated and should not be set manually. |

**Example**  
```js
import { View, Model } from 'rasti';

class Timer extends View {
    constructor(options) {
        super(options);
        // Create model to store internal state. Set `seconds` attribute to 0.
        this.model = new Model({ seconds : 0 });
        // Listen to changes in model `seconds` attribute and re-render.
        this.model.on('change:seconds', this.render.bind(this));
        // Increment model `seconds` attribute every 1000 milliseconds.
        this.interval = setInterval(() => this.model.seconds++, 1000);
    }

    template(model) {
        return `Seconds: <span>${View.sanitize(model.seconds)}</span>`;
    }

    render() {
        if (this.template) {
            this.el.innerHTML = this.template(this.model);
        }
        return this;
    }
}
// Render view and append view's element into the body.
document.body.appendChild(new Timer().render().el);
```

* [View](#module_view) ⇐ <code>Emitter</code>
    * _instance_
        * [.preinitialize(options)](#module_view__preinitialize)
        * [.$(selector)](#module_view__$) ⇒ <code>node</code>
        * [.$$(selector)](#module_view__$$) ⇒ <code>Array.&lt;node&gt;</code>
        * [.destroy(options)](#module_view__destroy) ⇒ <code>View</code>
        * [.onDestroy(options)](#module_view__ondestroy)
        * [.addChild(child)](#module_view__addchild) ⇒ <code>View</code>
        * [.destroyChildren()](#module_view__destroychildren)
        * [.ensureUid()](#module_view__ensureuid)
        * [.ensureElement()](#module_view__ensureelement)
        * [.createElement(tag, attributes)](#module_view__createelement) ⇒ <code>node</code>
        * [.removeElement()](#module_view__removeelement) ⇒ <code>View</code>
        * [.delegateEvents([events])](#module_view__delegateevents) ⇒ <code>View</code>
        * [.undelegateEvents()](#module_view__undelegateevents) ⇒ <code>View</code>
        * [.render()](#module_view__render) ⇒ <code>View</code>
    * _static_
        * [.sanitize(value)](#module_view_sanitize) ⇒ <code>string</code>
        * [.resetUid()](#module_view_resetuid)

<a name="module_view__preinitialize" id="module_view__preinitialize" class="anchor"></a>
### view.preinitialize(options)
If you define a preinitialize method, it will be invoked when the view is first created, before any instantiation logic is run.

**Kind**: instance method of [<code>View</code>](#module_view)  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | The view options. |

<a name="module_view__$" id="module_view__$" class="anchor"></a>
### view.$(selector) ⇒ <code>node</code>
Returns the first element that matches the selector, 
scoped to DOM elements within the current view's root element (`this.el`).

**Kind**: instance method of [<code>View</code>](#module_view)  
**Returns**: <code>node</code> - Element matching selector within the view's root element (`this.el`).  

| Param | Type | Description |
| --- | --- | --- |
| selector | <code>string</code> | CSS selector. |

<a name="module_view__$$" id="module_view__$$" class="anchor"></a>
### view.$$(selector) ⇒ <code>Array.&lt;node&gt;</code>
Returns a list of elements that match the selector, 
scoped to DOM elements within the current view's root element (`this.el`).

**Kind**: instance method of [<code>View</code>](#module_view)  
**Returns**: <code>Array.&lt;node&gt;</code> - List of elements matching selector within the view's root element (`this.el`).  

| Param | Type | Description |
| --- | --- | --- |
| selector | <code>string</code> | CSS selector. |

<a name="module_view__destroy" id="module_view__destroy" class="anchor"></a>
### view.destroy(options) ⇒ <code>View</code>
Destroy the view.
Destroy children views if any, undelegate events, stop listening to events, call `onDestroy` lifecycle method.

**Kind**: instance method of [<code>View</code>](#module_view)  
**Returns**: <code>View</code> - Return `this` for chaining.  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | Options object or any arguments passed to `destroy` method will be passed to `onDestroy` method. |

<a name="module_view__ondestroy" id="module_view__ondestroy" class="anchor"></a>
### view.onDestroy(options)
`onDestroy` lifecycle method is called after the view is destroyed.
Override with your code. Useful to stop listening to model's events.

**Kind**: instance method of [<code>View</code>](#module_view)  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | Options object or any arguments passed to `destroy` method. |

<a name="module_view__addchild" id="module_view__addchild" class="anchor"></a>
### view.addChild(child) ⇒ <code>View</code>
Add a view as a child.
Children views are stored at `this.children`, and destroyed when the parent is destroyed.
Returns the child for chaining.

**Kind**: instance method of [<code>View</code>](#module_view)  

| Param | Type |
| --- | --- |
| child | <code>View</code> | 

<a name="module_view__destroychildren" id="module_view__destroychildren" class="anchor"></a>
### view.destroyChildren()
Call destroy method on children views.

**Kind**: instance method of [<code>View</code>](#module_view)  
<a name="module_view__ensureuid" id="module_view__ensureuid" class="anchor"></a>
### view.ensureUid()
Ensure that the view has a unique id at `this.uid`.

**Kind**: instance method of [<code>View</code>](#module_view)  
<a name="module_view__ensureelement" id="module_view__ensureelement" class="anchor"></a>
### view.ensureElement()
Ensure that the view has a root element at `this.el`.
You shouldn't call this method directly. It's called from the constructor.
You may override it if you want to use a different logic or to 
postpone element creation.

**Kind**: instance method of [<code>View</code>](#module_view)  
<a name="module_view__createelement" id="module_view__createelement" class="anchor"></a>
### view.createElement(tag, attributes) ⇒ <code>node</code>
Create an element.
Called from the constructor if `this.el` is undefined, to ensure
the view has a root element.

**Kind**: instance method of [<code>View</code>](#module_view)  
**Returns**: <code>node</code> - The created element.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| tag | <code>string</code> | <code>&quot;div&quot;</code> | Tag for the element. Default to `div` |
| attributes | <code>object</code> |  | Attributes for the element. |

<a name="module_view__removeelement" id="module_view__removeelement" class="anchor"></a>
### view.removeElement() ⇒ <code>View</code>
Remove `this.el` from the DOM.

**Kind**: instance method of [<code>View</code>](#module_view)  
**Returns**: <code>View</code> - Return `this` for chaining.  
<a name="module_view__delegateevents" id="module_view__delegateevents" class="anchor"></a>
### view.delegateEvents([events]) ⇒ <code>View</code>
Provide declarative listeners for DOM events within a view. If an events object is not provided, 
it defaults to using `this.events`. If `this.events` is a function, it will be called to get the events object.

The events object should follow the format `{'event selector': 'listener'}`:
- `event`: The type of event (e.g., 'click').
- `selector`: A CSS selector to match the event target. If omitted, the event is bound to the root element.
- `listener`: A function or a string representing a method name on the view. The method will be called with `this` bound to the view instance.

By default, `delegateEvents` is called within the View's constructor. If you have a simple events object, 
all of your DOM events will be connected automatically, and you will not need to call this function manually.

All attached listeners are bound to the view, ensuring that `this` refers to the view object when the listeners are invoked.
When `delegateEvents` is called again, possibly with a different events object, all previous listeners are removed and delegated afresh.

**Listener signature:** `(event, view, matched)`
- `event`:   The native DOM event object.
- `view`:    The current view instance (`this`).
- `matched`: The element that satisfies the selector. If no selector is provided, it will be the view's root element (`this.el`).

If more than one ancestor between `event.target` and the view's root element matches the selector, the listener will be
invoked **once for each matched element** (from inner to outer).

**Kind**: instance method of [<code>View</code>](#module_view)  
**Returns**: <code>View</code> - Returns `this` for chaining.  

| Param | Type | Description |
| --- | --- | --- |
| [events] | <code>object</code> | Object in the format `{'event selector' : 'listener'}`. Used to bind delegated event listeners to the root element. |

**Example**  
```js
// Using prototype (recommended for static events)
class Modal extends View {
    onClickOk(event, view, matched) {
        // matched === the button.ok element that was clicked
        this.close();
    }
    
    onClickCancel() {
        this.destroy();
    }
}
Modal.prototype.events = {
    'click button.ok': 'onClickOk',
    'click button.cancel': 'onClickCancel',
    'submit form': 'onSubmit'
};

// Using a function for dynamic events
class DynamicView extends View {
    events() {
        return {
            [`click .${this.model.buttonClass}`]: 'onButtonClick',
            'click': 'onRootClick'
        };
    }
}
```
<a name="module_view__undelegateevents" id="module_view__undelegateevents" class="anchor"></a>
### view.undelegateEvents() ⇒ <code>View</code>
Removes all of the view's delegated events. 
Useful if you want to disable or remove a view from the DOM temporarily. 
Called automatically when the view is destroyed and when `delegateEvents` is called again.

**Kind**: instance method of [<code>View</code>](#module_view)  
**Returns**: <code>View</code> - Return `this` for chaining.  
<a name="module_view__render" id="module_view__render" class="anchor"></a>
### view.render() ⇒ <code>View</code>
`render` is the core function that your view should override, in order to populate its element (`this.el`), with the appropriate HTML. The convention is for `render` to always return `this`.  
Views are low-level building blocks for creating user interfaces. For most use cases, we recommend using [Component](#module_component) instead, which provides a more declarative template syntax, automatic DOM updates, and a more efficient render pipeline.  
If you add any child views, you should call `this.destroyChildren` before re-rendering.

**Kind**: instance method of [<code>View</code>](#module_view)  
**Returns**: <code>View</code> - Returns `this` for chaining.  
**Example**  
```js
class UserView extends View {
    render() {
        if (this.template) {
            const model = this.model;
            // Sanitize model attributes to prevent XSS attacks.
            const safeData = {
                name : View.sanitize(model.name),
                email : View.sanitize(model.email),
                bio : View.sanitize(model.bio)
            };
            this.el.innerHTML = this.template(safeData);
        }
        return this;
    }
}
```
<a name="module_view_sanitize" id="module_view_sanitize" class="anchor"></a>
### View.sanitize(value) ⇒ <code>string</code>
Escape HTML entities in a string.
Use this method to sanitize user-generated content before inserting it into the DOM.
Override this method to provide a custom escape function.
This method is inherited by [Component](#module_component) and used to escape template interpolations.

**Kind**: static method of [<code>View</code>](#module_view)  
**Returns**: <code>string</code> - Escaped string.  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>string</code> | String to escape. |

<a name="module_view_resetuid" id="module_view_resetuid" class="anchor"></a>
### View.resetUid()
Reset the unique ID counter to 0.
This is useful for server-side rendering scenarios where you want to ensure that
the generated unique IDs match those on the client, enabling seamless hydration of components.
This method is inherited by [Component](#module_component).

**Kind**: static method of [<code>View</code>](#module_view)  
