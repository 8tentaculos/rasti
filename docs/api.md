## Modules

* [Component](#module_component) ⇐ <code>Rasti.View</code>
* [Emitter](#module_emitter)
    * [.on(type, listener)](#module_emitter__on) ⇒ <code>function</code>
    * [.once(type, listener)](#module_emitter__once) ⇒ <code>function</code>
    * [.off([type], [listener])](#module_emitter__off)
    * [.emit(type)](#module_emitter__emit)
* [Model](#module_model) ⇐ <code>Rasti.Emitter</code>
    * [.preinitialize(attributes)](#module_model__preinitialize)
    * [.defineAttribute(key)](#module_model__defineattribute)
    * [.get(key)](#module_model__get) ⇒ <code>any</code>
    * [.set(key, [value])](#module_model__set) ⇒ <code>Model</code>
    * [.toJSON()](#module_model__tojson) ⇒ <code>object</code>
* [View](#module_view) ⇐ <code>Emitter</code>
    * _instance_
        * [.preinitialize(options)](#module_view__preinitialize)
        * [.$(selector)](#module_view__$) ⇒ <code>node</code>
        * [.$$(selector)](#module_view__$$) ⇒ <code>Array.&lt;node&gt;</code>
        * [.destroy(options)](#module_view__destroy) ⇒ <code>Rasti.View</code>
        * [.onDestroy(options)](#module_view__ondestroy)
        * [.addChild(child)](#module_view__addchild) ⇒ <code>Rasti.View</code>
        * [.destroyChildren()](#module_view__destroychildren)
        * [.ensureUid()](#module_view__ensureuid)
        * [.ensureElement()](#module_view__ensureelement)
        * [.createElement(tag, attributes)](#module_view__createelement) ⇒ <code>node</code>
        * [.removeElement()](#module_view__removeelement) ⇒ <code>Rasti.View</code>
        * [.delegateEvents([events])](#module_view__delegateevents) ⇒ <code>Rasti.View</code>
        * [.undelegateEvents()](#module_view__undelegateevents) ⇒ <code>Rasti.View</code>
        * [.render()](#module_view__render) ⇒ <code>Rasti.View</code>
    * _static_
        * [.sanitize(value)](#module_view_sanitize) ⇒ <code>string</code>

<a name="module_component" id="module_component" class="anchor"></a>
## Component ⇐ <code>Rasti.View</code>
Components are a special kind of `View` that is designed to be easily composable, 
making it simple to add child views and build complex user interfaces.  
Unlike views, which are render-agnostic, components have a specific set of rendering 
guidelines that allow for a more declarative development style.  
Components are defined with the [Component.create](#module_component_create) static method, which takes a tagged template string or a function that returns another component.

**Extends**: <code>Rasti.View</code>  
**See**: [Component.create](#module_component_create)  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | Object containing options. The following keys will be merged to `this`: model, state, key, onDestroy, onRender, onCreate, onChange. Any additional options not in the component or view options list will be automatically extracted as props and stored as `this.props`. |

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [key] | <code>string</code> | A unique key to identify the component. Used to recycle child components. |
| [model] | <code>Rasti.Model</code> | A `Rasti.Model` or any emitter object containing data and business logic. The component will listen to `change` events and call `onChange` lifecycle method. |
| [state] | <code>Rasti.Model</code> | A `Rasti.Model` or any emitter object containing data and business logic, to be used as internal state. The component will listen to `change` events and call `onChange` lifecycle method. |
| [props] | <code>Rasti.Model</code> | Automatically created from any options not merged to the component instance. Contains props passed from parent component as a `Rasti.Model`. The component will listen to `change` events on props and call `onChange` lifecycle method. When a component with a `key` is recycled during parent re-render, new props are automatically updated and any changes trigger a re-render. |

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
const model = new Model({ seconds: 0 });
// Mount timer on body.
Timer.mount({ model }, document.body);
// Increment `model.seconds` every second.
setInterval(() => model.seconds++, 1000);
```
<a name="module_emitter" id="module_emitter" class="anchor"></a>
## Emitter
`Emitter` is a class that provides an easy way to implement the observer pattern 
in your applications.  
It can be extended to create new classes that have the ability to emit and bind custom named events.   
Emitter is used by `Model` and `View` classes, which inherit from it to implement 
event-driven functionality.

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
    * [.emit(type)](#module_emitter__emit)

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
Removes event listeners.

**Kind**: instance method of [<code>Emitter</code>](#module_emitter)  

| Param | Type | Description |
| --- | --- | --- |
| [type] | <code>string</code> | Type of the event (e.g. `change`). If is not provided, it removes all listeners. |
| [listener] | <code>function</code> | Callback function to be called when the event is emitted. If listener is not provided, it removes all listeners for specified type. |

**Example**  
```js
// Stop listening to changes.
this.model.off('change');
```
<a name="module_emitter__emit" id="module_emitter__emit" class="anchor"></a>
### emitter.emit(type)
Emits event of specified type. Listeners will receive specified arguments.

**Kind**: instance method of [<code>Emitter</code>](#module_emitter)  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | Type of the event (e.g. `change`). |
| [...args] | <code>any</code> | Arguments to be passed to listener. |

**Example**  
```js
// Emit validation error event.
this.emit('invalid');
```
<a name="module_model" id="module_model" class="anchor"></a>
## Model ⇐ <code>Rasti.Emitter</code>
- Orchestrates data and business logic.
- Emits events when data changes.

A `Model` manages an internal table of data attributes and triggers change events when any of its data is modified.  
Models may handle syncing data with a persistence layer. To design your models, create atomic, reusable objects 
that contain all the necessary functions for manipulating their specific data.  
Models should be easily passed throughout your app and used anywhere the corresponding data is needed.  
Rasti models store their attributes in `this.attributes`, which is extended from `this.defaults` and the 
constructor `attributes` parameter. For every attribute, a getter is generated to retrieve the model property 
from `this.attributes`, and a setter is created to set the model property in `this.attributes` and emit `change` 
and `change:attribute` events.

**Extends**: <code>Rasti.Emitter</code>  

| Param | Type | Description |
| --- | --- | --- |
| attributes | <code>object</code> | Object containing model attributes to extend `this.attributes`. Getters and setters are generated for `this.attributes`, in order to emit `change` events. |

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| defaults | <code>object</code> \| <code>function</code> | Object containing default attributes for the model. It will extend `this.attributes`. If a function is passed, it will be called to get the defaults. It will be bound to the model instance. |
| previous | <code>object</code> | Object containing previous attributes when a change occurs. |

**Example**  
```js
import { Model } from 'rasti';
// Product model
class ProductModel extends Model {
    preinitialize() {
        // The Product model has `name` and `price` default attributes.
        // `defaults` will extend `this.attributes`.
        // Getters and setters are generated for `this.attributes`,
        // in order to emit `change` events.
        this.defaults = {
            name: '',
            price: 0
        };
    }

    setDiscount(discountPercentage) {
        // Apply a discount to the price property.
        // This will call a setter that will update `price` in `this.attributes`,
        // and emit `change` and `change:price` events.
        const discount = this.price * (discountPercentage / 100);
        this.price -= discount;
    }
}
// Create a product instance with a name and price.
const product = new ProductModel({ name: 'Smartphone', price: 1000 });
// Listen to the `change:price` event.
product.on('change:price', () => console.log('New Price:', product.price));
// Apply a 10% discount to the product.
product.setDiscount(10); // Output: "New Price: 900"
```

* [Model](#module_model) ⇐ <code>Rasti.Emitter</code>
    * [.preinitialize(attributes)](#module_model__preinitialize)
    * [.defineAttribute(key)](#module_model__defineattribute)
    * [.get(key)](#module_model__get) ⇒ <code>any</code>
    * [.set(key, [value])](#module_model__set) ⇒ <code>Model</code>
    * [.toJSON()](#module_model__tojson) ⇒ <code>object</code>

<a name="module_model__preinitialize" id="module_model__preinitialize" class="anchor"></a>
### model.preinitialize(attributes)
If you define a preinitialize method, it will be invoked when the Model is first created, before any instantiation logic is run for the Model.

**Kind**: instance method of [<code>Model</code>](#module_model)  

| Param | Type | Description |
| --- | --- | --- |
| attributes | <code>object</code> | Object containing model attributes to extend `this.attributes`. |

<a name="module_model__defineattribute" id="module_model__defineattribute" class="anchor"></a>
### model.defineAttribute(key)
Generate getter/setter for the given key. In order to emit `change` events.
This method is called internally by the constructor
for `this.attributes`.

**Kind**: instance method of [<code>Model</code>](#module_model)  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | Attribute key. |

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
### model.set(key, [value]) ⇒ <code>Model</code>
Set an attribute into `this.attributes`.  
Emit `change` and `change:attribute` if a value changes.  
Could be called in two forms, `this.set('key', value)` and
`this.set({ key : value })`.  
This method is called internally by generated setters.  
The `change` event listener will receive the model instance, an object containing the changed attributes, and the rest of the arguments passed to `set` method.  
The `change:attribute` event listener will receive the model instance, the new attribute value, and the rest of the arguments passed to `set` method.

**Kind**: instance method of [<code>Model</code>](#module_model)  
**Returns**: <code>Model</code> - This model.  
**Emits**: <code>event:change</code>, <code>change:attribute</code>  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | Attribute key or object containing keys/values. |
| [value] |  | Attribute value. |

<a name="module_model__tojson" id="module_model__tojson" class="anchor"></a>
### model.toJSON() ⇒ <code>object</code>
Return object representation of the model to be used for JSON serialization.
By default returns a copy of `this.attributes`.

**Kind**: instance method of [<code>Model</code>](#module_model)  
**Returns**: <code>object</code> - Object representation of the model to be used for JSON serialization.  
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
import { View } from 'rasti';

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
        return `Seconds: <span>${model.seconds}</span>`;
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
        * [.destroy(options)](#module_view__destroy) ⇒ <code>Rasti.View</code>
        * [.onDestroy(options)](#module_view__ondestroy)
        * [.addChild(child)](#module_view__addchild) ⇒ <code>Rasti.View</code>
        * [.destroyChildren()](#module_view__destroychildren)
        * [.ensureUid()](#module_view__ensureuid)
        * [.ensureElement()](#module_view__ensureelement)
        * [.createElement(tag, attributes)](#module_view__createelement) ⇒ <code>node</code>
        * [.removeElement()](#module_view__removeelement) ⇒ <code>Rasti.View</code>
        * [.delegateEvents([events])](#module_view__delegateevents) ⇒ <code>Rasti.View</code>
        * [.undelegateEvents()](#module_view__undelegateevents) ⇒ <code>Rasti.View</code>
        * [.render()](#module_view__render) ⇒ <code>Rasti.View</code>
    * _static_
        * [.sanitize(value)](#module_view_sanitize) ⇒ <code>string</code>

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
### view.destroy(options) ⇒ <code>Rasti.View</code>
Destroy the view.
Destroy children views if any, undelegate events, stop listening to events, call `onDestroy` lifecycle method.

**Kind**: instance method of [<code>View</code>](#module_view)  
**Returns**: <code>Rasti.View</code> - Return `this` for chaining.  

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
### view.addChild(child) ⇒ <code>Rasti.View</code>
Add a view as a child.
Children views are stored at `this.children`, and destroyed when the parent is destroyed.
Returns the child for chaining.

**Kind**: instance method of [<code>View</code>](#module_view)  

| Param | Type |
| --- | --- |
| child | <code>Rasti.View</code> | 

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
### view.removeElement() ⇒ <code>Rasti.View</code>
Remove `this.el` from the DOM.

**Kind**: instance method of [<code>View</code>](#module_view)  
**Returns**: <code>Rasti.View</code> - Return `this` for chaining.  
<a name="module_view__delegateevents" id="module_view__delegateevents" class="anchor"></a>
### view.delegateEvents([events]) ⇒ <code>Rasti.View</code>
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

Listener signature: `(event, view, matched)`
- `event`:   The native DOM event object.
- `view`:    The current view instance (`this`).
- `matched`: The element that satisfies the selector. If no selector is provided, it will be the view's root element (`this.el`).

If more than one ancestor between `event.target` and the view's root element matches the selector, the listener will be
invoked **once for each matched element** (from inner to outer).

**Kind**: instance method of [<code>View</code>](#module_view)  
**Returns**: <code>Rasti.View</code> - Returns `this` for chaining.  

| Param | Type | Description |
| --- | --- | --- |
| [events] | <code>object</code> | Object in the format `{'event selector' : 'listener'}`. Used to bind delegated event listeners to the root element. |

**Example**  
```js
// Using a function.
class Modal extends View {
    events() {
        return {
            'click button.ok': 'onClickOkButton',
            'click button.cancel': function() {}
        };
    }
}

// Using an object.
Modal.prototype.events = {
    'click button.ok' : 'onClickOkButton',
    'click button.cancel' : function() {}
};
```
<a name="module_view__undelegateevents" id="module_view__undelegateevents" class="anchor"></a>
### view.undelegateEvents() ⇒ <code>Rasti.View</code>
Removes all of the view's delegated events. 
Useful if you want to disable or remove a view from the DOM temporarily. 
Called automatically when the view is destroyed and when `delegateEvents` is called again.

**Kind**: instance method of [<code>View</code>](#module_view)  
**Returns**: <code>Rasti.View</code> - Return `this` for chaining.  
<a name="module_view__render" id="module_view__render" class="anchor"></a>
### view.render() ⇒ <code>Rasti.View</code>
Renders the view.  
This method should be overridden with custom logic.
The only convention is to manipulate the DOM within the scope of `this.el`,
and to return `this` for chaining.  
If you add any child views, you should call `this.destroyChildren` before re-rendering.  
The default implementation updates `this.el`'s innerHTML with the result
of calling `this.template`, passing `this.model` as the argument.
<br><br> &#9888; **Security Notice:** The default implementation utilizes `innerHTML`, which may introduce Cross-Site Scripting (XSS) risks.  
Ensure that any user-generated content is properly sanitized before inserting it into the DOM. 
You can use the [View.sanitize](#module_view_sanitize) static method to escape HTML entities in a string.  
For best practices on secure data handling, refer to the 
[OWASP's XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html).<br><br>

**Kind**: instance method of [<code>View</code>](#module_view)  
**Returns**: <code>Rasti.View</code> - Returns `this` for chaining.  
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

