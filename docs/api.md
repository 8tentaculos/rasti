<a name="module_component" id="module_component"></a>
## Component ⇐ <code>Rasti.View</code>
Components are a special kind of `View` that is designed to be easily composable, 
making it simple to add child views and build complex user interfaces.  
Unlike views, which are render-agnostic, components have a specific set of rendering 
guidelines that allow for a more declarative development style.  
Components are defined with the `create` static method, which takes a tagged template.

**Extends**: <code>Rasti.View</code>  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | Object containing options. The following keys will be merged to `this`: model, state, key, onDestroy, onRender, onCreate, onChange. |

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | A unique key to identify the component. Used to recycle child components. |
| model | <code>object</code> | A `Rasti.Model` or any emitter object containing data and business logic. |
| state | <code>object</code> | A `Rasti.Model` or any emitter object containing data and business logic, to be used as internal state. |

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

* [Component](#module_component) ⇐ <code>Rasti.View</code>
    * _instance_
        * [.onCreate(options)](#module_component__oncreate)
        * [.onChange(model, changed)](#module_component__onchange)
        * [.onRender(type)](#module_component__onrender)
        * [.onDestroy(options)](#module_component__ondestroy)
    * _static_
        * [.extend(object)](#module_component_extend)
        * [.mount(options, el, hydrate)](#module_component_mount) ⇒ <code>Rasti.Component</code>
        * [.create(HTML)](#module_component_create) ⇒ <code>Rasti.Component</code>

<a name="module_component__oncreate" id="module_component__oncreate"></a>
### component.onCreate(options)
Lifecycle method. Called when the view is created at the end of the constructor.

**Kind**: instance method of [<code>Component</code>](#module_component)  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | The view options. |

<a name="module_component__onchange" id="module_component__onchange"></a>
### component.onChange(model, changed)
Lifecycle method. Called when model emits `change` event.
By default calls render method.
This method should be extended with custom logic.
Maybe comparing new attributes with previous ones and calling
render when needed. Or doing some dom transformation.

**Kind**: instance method of [<code>Component</code>](#module_component)  

| Param | Type | Description |
| --- | --- | --- |
| model | <code>Rasti.Model</code> | The model that emitted the event. |
| changed | <code>object</code> | Object containing keys and values that has changed. |
| [...args] | <code>any</code> | Any extra arguments passed to set method. |

<a name="module_component__onrender" id="module_component__onrender"></a>
### component.onRender(type)
Lifecycle method. Called when the view is rendered.

**Kind**: instance method of [<code>Component</code>](#module_component)  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | The render type. Can be `render`, `hydrate` or `recycle`. |

<a name="module_component__ondestroy" id="module_component__ondestroy"></a>
### component.onDestroy(options)
Lifecycle method. Called when the view is destroyed.

**Kind**: instance method of [<code>Component</code>](#module_component)  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | Options object or any arguments passed to `destroy` method. |

<a name="module_component_extend" id="module_component_extend"></a>
### Component.extend(object)
Helper method used to extend a `Component`, creating a subclass.

**Kind**: static method of [<code>Component</code>](#module_component)  

| Param | Type | Description |
| --- | --- | --- |
| object | <code>object</code> | Object containing methods to be added to the new `Component` subclass. Also can be a function that receives the parent prototype and returns an object. |

<a name="module_component_mount" id="module_component_mount"></a>
### Component.mount(options, el, hydrate) ⇒ <code>Rasti.Component</code>
Mount the component into the dom.
It instantiate the Component view using options, 
appends its element into the DOM (if `el` is provided).
And returns the view instance.
<br><br> ⚠️ **Security Notice:** Component utilizes `innerHTML` on a document fragment for rendering, which may introduce Cross - Site Scripting (XSS) risks. Ensure that any user-generated content is properly sanitized before inserting it into the DOM. For best practices on secure data handling, refer to the[OWASP's XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html).<br><br>

**Kind**: static method of [<code>Component</code>](#module_component)  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | The view options. |
| el | <code>node</code> | Dom element to append the view element. |
| hydrate | <code>boolean</code> | If true, the view will use existing html. |

<a name="module_component_create" id="module_component_create"></a>
### Component.create(HTML) ⇒ <code>Rasti.Component</code>
Takes a tagged template containing an HTML string, 
and returns a new `Component` class.
- The template outer tag and attributes will be used to create the view's root element.
- Boolean attributes should be passed in the form of `attribute="${() => true}"`.
- Event handlers should be passed, at the root element, in the form of `onEventName=${{'selector' : listener }}`. Where `selector` is a css selector. The event will be delegated to the view's root element.
- The template inner HTML will be used as the view's template.
- Template interpolations that are functions will be evaluated on the render process. Receiving the view instance as argument. And being bound to it.
- If the function returns `null`, `undefined`, `false` or empty string, the interpolation won't render any content.
- If the function returns a component instance, it will be added as a child component.
- If the function returns an array, each item will be evaluated as above.

**Kind**: static method of [<code>Component</code>](#module_component)  

| Param | Type | Description |
| --- | --- | --- |
| HTML | <code>string</code> | template for the component. |

<a name="module_emitter" id="module_emitter"></a>
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
    * [.on(type, listener)](#module_emitter__on)
    * [.once(type, listener)](#module_emitter__once)
    * [.off([type], [listener])](#module_emitter__off)
    * [.emit(type)](#module_emitter__emit)

<a name="module_emitter__on" id="module_emitter__on"></a>
### emitter.on(type, listener)
Adds event listener.

**Kind**: instance method of [<code>Emitter</code>](#module_emitter)  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | Type of the event (e.g. `change`). |
| listener | <code>function</code> | Callback function to be called when the event is emitted. |

**Example**  
```js
this.model.on('change', this.render.bind(this)); // Re render when model changes.
```
<a name="module_emitter__once" id="module_emitter__once"></a>
### emitter.once(type, listener)
Adds event listener that executes once.

**Kind**: instance method of [<code>Emitter</code>](#module_emitter)  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | Type of the event (e.g. `change`). |
| listener | <code>function</code> | Callback function to be called when the event is emitted. |

**Example**  
```js
this.model.once('change', () => console.log('This will happen once'));
```
<a name="module_emitter__off" id="module_emitter__off"></a>
### emitter.off([type], [listener])
Removes event listeners.

**Kind**: instance method of [<code>Emitter</code>](#module_emitter)  

| Param | Type | Description |
| --- | --- | --- |
| [type] | <code>string</code> | Type of the event (e.g. `change`). If is not provided, it removes all listeners. |
| [listener] | <code>function</code> | Callback function to be called when the event is emitted. If listener is not provided, it removes all listeners for specified type. |

**Example**  
```js
this.model.off('change'); // Stop listening to changes.
```
<a name="module_emitter__emit" id="module_emitter__emit"></a>
### emitter.emit(type)
Emits event of specified type. Listeners will receive specified arguments.

**Kind**: instance method of [<code>Emitter</code>](#module_emitter)  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | Type of the event (e.g. `change`). |
| [...args] | <code>any</code> | Arguments to be passed to listener. |

**Example**  
```js
this.emit('invalid'); // Emit validation error event.
```
<a name="module_model" id="module_model"></a>
## Model ⇐ <code>Rasti.Emitter</code>
- Orchestrates data and business logic.
- Emits events when data changes.

A `Model` manages an internal table of data attributes and triggers change events when any of its data is modified.  
Models may handle syncing data with a persistence layer. To design your models, create atomic, reusable objects 
that contain all the necessary functions for manipulating their specific data.  
Models should be easily passed throughout your app and used anywhere the corresponding data is needed.  
Rasti models store their attributes in `this.attributes`, which is extended from `this.defaults` and the 
constructor `attrs` parameter. For every attribute, a getter is generated to retrieve the model property 
from `this.attributes`, and a setter is created to set the model property in `this.attributes` and emit `change` 
and `change:attribute` events.

**Extends**: <code>Rasti.Emitter</code>  

| Param | Type | Description |
| --- | --- | --- |
| attrs | <code>object</code> | Object containing model attributes to extend `this.attributes`. Getters and setters are generated for `this.attributes`, in order to emit `change` events. |

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
    * [.preinitialize(attrs)](#module_model__preinitialize)
    * [.defineAttribute(key)](#module_model__defineattribute)
    * [.get(key)](#module_model__get) ⇒ <code>any</code>
    * [.set(key, [value])](#module_model__set) ⇒ <code>this</code>
    * [.toJSON()](#module_model__tojson) ⇒ <code>object</code>

<a name="module_model__preinitialize" id="module_model__preinitialize"></a>
### model.preinitialize(attrs)
If you define a preinitialize method, it will be invoked when the Model is first created, before any instantiation logic is run for the Model.

**Kind**: instance method of [<code>Model</code>](#module_model)  

| Param | Type | Description |
| --- | --- | --- |
| attrs | <code>object</code> | Object containing model attributes to extend `this.attributes`. |

<a name="module_model__defineattribute" id="module_model__defineattribute"></a>
### model.defineAttribute(key)
Generate getter/setter for the given key. In order to emit `change` events.
This method is called internally by the constructor
for `this.attributes`.

**Kind**: instance method of [<code>Model</code>](#module_model)  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | Attribute key. |

<a name="module_model__get" id="module_model__get"></a>
### model.get(key) ⇒ <code>any</code>
Get an attribute from `this.attributes`.
This method is called internally by generated getters.

**Kind**: instance method of [<code>Model</code>](#module_model)  
**Returns**: <code>any</code> - The attribute value.  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | Attribute key. |

<a name="module_model__set" id="module_model__set"></a>
### model.set(key, [value]) ⇒ <code>this</code>
Set an attribute into `this.attributes`.  
Emit `change` and `change:attribute` if a value changes.  
Could be called in two forms, `this.set('key', value)` and
`this.set({ key : value })`.  
This method is called internally by generated setters.  
The `change` event listener will receive the model instance, an object containing the changed attributes, and the rest of the arguments passed to `set` method.  
The `change:attribute` event listener will receive the model instance, the new attribute value, and the rest of the arguments passed to `set` method.

**Kind**: instance method of [<code>Model</code>](#module_model)  
**Returns**: <code>this</code> - This model.  
**Emits**: <code>event:change</code>, <code>change:attribute</code>  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | Attribute key or object containing keys/values. |
| [value] |  | Attribute value. |

<a name="module_model__tojson" id="module_model__tojson"></a>
### model.toJSON() ⇒ <code>object</code>
Return object representation of the model to be used for JSON serialization.
By default returns `this.attributes`.

**Kind**: instance method of [<code>Model</code>](#module_model)  
**Returns**: <code>object</code> - Object representation of the model to be used for JSON serialization.  
<a name="module_view" id="module_view"></a>
## View ⇐ <code>Rasti.Emitter</code>
- Listens for changes and renders UI.
- Handles user input and interactivity.
- Sends captured input to the model.

A `View` is an atomic unit of the user interface that can render data from a specific model or multiple models.
However, views can also be independent and have no associated data.  
Models must be unaware of views. Views, on the other hand, may render model data and listen to the change events 
emitted by the models to re-render themselves based on changes.  
Each `View` has a root element, `this.el`, which is used for event delegation.  
All element lookups are scoped to this element, and any rendering or DOM manipulations should be done inside it. 
If `this.el` is not present, an element will be created using `this.tag` (defaulting to div) and `this.attributes`.

**Extends**: <code>Rasti.Emitter</code>  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | Object containing options. The following keys will be merged to `this`: el, tag, attributes, events, model, template, onDestroy. |

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| el | <code>node</code> | Every view has a root element, `this.el`. If not present it will be created. |
| tag | <code>string</code> | If `this.el` is not present, an element will be created using `this.tag`. Default is `div`. |
| attributes | <code>object</code> | If `this.el` is not present, an element will be created using `this.attributes`. |
| events | <code>object</code> | Object in the format `{'event selector' : 'listener'}`. Used to bind delegated event listeners to the root element. |
| model | <code>object</code> | A `Rasti.Model` or any object containing data and business logic. |
| template | <code>function</code> | A function that receives data and returns a markup string (e.g., HTML). |

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

* [View](#module_view) ⇐ <code>Rasti.Emitter</code>
    * [.preinitialize(attrs)](#module_view__preinitialize)
    * [.$(selector)](#module_view__$) ⇒ <code>node</code>
    * [.$$(selector)](#module_view__$$) ⇒ <code>Array.&lt;node&gt;</code>
    * [.destroy()](#module_view__destroy) ⇒ <code>Rasti.View</code>
    * [.onDestroy(options)](#module_view__ondestroy)
    * [.addChild(child)](#module_view__addchild) ⇒ <code>Rasti.View</code>
    * [.destroyChildren()](#module_view__destroychildren)
    * [.ensureElement()](#module_view__ensureelement)
    * [.createElement(tag, attrs)](#module_view__createelement) ⇒ <code>node</code>
    * [.removeElement()](#module_view__removeelement) ⇒ <code>Rasti.View</code>
    * [.delegateEvents([events])](#module_view__delegateevents) ⇒ <code>Rasti.View</code>
    * [.undelegateEvents()](#module_view__undelegateevents) ⇒ <code>Rasti.View</code>
    * [.render()](#module_view__render) ⇒ <code>Rasti.View</code>

<a name="module_view__preinitialize" id="module_view__preinitialize"></a>
### view.preinitialize(attrs)
If you define a preinitialize method, it will be invoked when the view is first created, before any instantiation logic is run.

**Kind**: instance method of [<code>View</code>](#module_view)  

| Param | Type | Description |
| --- | --- | --- |
| attrs | <code>object</code> | Object containing model attributes to extend `this.attributes`. |

<a name="module_view__$" id="module_view__$"></a>
### view.$(selector) ⇒ <code>node</code>
Returns the first element that matches the selector, 
scoped to DOM elements within the current view's root element (`this.el`).

**Kind**: instance method of [<code>View</code>](#module_view)  
**Returns**: <code>node</code> - Element matching selector within the view's root element (`this.el`).  

| Param | Type | Description |
| --- | --- | --- |
| selector | <code>string</code> | CSS selector. |

<a name="module_view__$$" id="module_view__$$"></a>
### view.$$(selector) ⇒ <code>Array.&lt;node&gt;</code>
Returns a list of elements that match the selector, 
scoped to DOM elements within the current view's root element (`this.el`).

**Kind**: instance method of [<code>View</code>](#module_view)  
**Returns**: <code>Array.&lt;node&gt;</code> - List of elements matching selector within the view's root element (`this.el`).  

| Param | Type | Description |
| --- | --- | --- |
| selector | <code>string</code> | CSS selector. |

<a name="module_view__destroy" id="module_view__destroy"></a>
### view.destroy() ⇒ <code>Rasti.View</code>
Destroy the view.
Destroy children views if any, undelegate events, stop listening to events, call `onDestroy` lifecycle method.

**Kind**: instance method of [<code>View</code>](#module_view)  
**Returns**: <code>Rasti.View</code> - Return `this` for chaining.  
<a name="module_view__ondestroy" id="module_view__ondestroy"></a>
### view.onDestroy(options)
`onDestroy` lifecycle method is called after the view is destroyed.
Override with your code. Useful to stop listening to model's events.

**Kind**: instance method of [<code>View</code>](#module_view)  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | Options object or any arguments passed to `destroy` method. |

<a name="module_view__addchild" id="module_view__addchild"></a>
### view.addChild(child) ⇒ <code>Rasti.View</code>
Add a view as a child.
Children views are stored at `this.children`, and destroyed when the parent is destroyed.
Returns the child for chaining.

**Kind**: instance method of [<code>View</code>](#module_view)  

| Param | Type |
| --- | --- |
| child | <code>Rasti.View</code> | 

<a name="module_view__destroychildren" id="module_view__destroychildren"></a>
### view.destroyChildren()
Call destroy method on children views.

**Kind**: instance method of [<code>View</code>](#module_view)  
<a name="module_view__ensureelement" id="module_view__ensureelement"></a>
### view.ensureElement()
Ensure that the view has a root element at `this.el`.
You shouldn't call this method directly. It's called from the constructor.
You may override it if you want to use a different logic or to 
postpone element creation.

**Kind**: instance method of [<code>View</code>](#module_view)  
<a name="module_view__createelement" id="module_view__createelement"></a>
### view.createElement(tag, attrs) ⇒ <code>node</code>
Create an element.
Called from the constructor if `this.el` is undefined, to ensure
the view has a root element.

**Kind**: instance method of [<code>View</code>](#module_view)  
**Returns**: <code>node</code> - The created element.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| tag | <code>string</code> | <code>&quot;div&quot;</code> | Tag for the element. Default to `div` |
| attrs | <code>object</code> |  | Attributes for the element. |

<a name="module_view__removeelement" id="module_view__removeelement"></a>
### view.removeElement() ⇒ <code>Rasti.View</code>
Remove `this.el` from the DOM.

**Kind**: instance method of [<code>View</code>](#module_view)  
**Returns**: <code>Rasti.View</code> - Return `this` for chaining.  
<a name="module_view__delegateevents" id="module_view__delegateevents"></a>
### view.delegateEvents([events]) ⇒ <code>Rasti.View</code>
Provide declarative listeners for DOM events within a view. If an events hash is not passed directly, uses `this.events` as the source.  
Events are written in the format `{'event selector' : 'listener'}`. The listener may be either the name of a method on the view, or a direct function body.
Omitting the selector causes the event to be bound to the view's root element (`this.el`).  
By default, `delegateEvents` is called within the View's constructor, 
so if you have a simple events hash, all of your DOM events will always already be connected, and you will never have to call this function yourself.   
All attached listeners are bound to the view automatically, so when the listeners are invoked, `this` continues to refer to the view object.  
When `delegateEvents` is run again, perhaps with a different events hash, all listeners are removed and delegated afresh.

**Kind**: instance method of [<code>View</code>](#module_view)  
**Returns**: <code>Rasti.View</code> - Return `this` for chaining.  

| Param | Type | Description |
| --- | --- | --- |
| [events] | <code>object</code> | Object in the format `{'event selector' : 'listener'}`. Used to bind delegated event listeners to the root element. |

**Example**  
```js
MyView.prototype.events = {
     'click button.ok' : 'onClickOkButton',
     'click button.cancel' : function() {}
};
```
<a name="module_view__undelegateevents" id="module_view__undelegateevents"></a>
### view.undelegateEvents() ⇒ <code>Rasti.View</code>
Removes all of the view's delegated events. Useful if you want to disable or remove a view from the DOM temporarily. Called automatically when the view is destroyed.

**Kind**: instance method of [<code>View</code>](#module_view)  
**Returns**: <code>Rasti.View</code> - Return `this` for chaining.  
<a name="module_view__render" id="module_view__render"></a>
### view.render() ⇒ <code>Rasti.View</code>
Render the view.
This method should be overridden with custom logic.
The default implementation sets innerHTML of `this.el` with `this.template`.
Conventions are to only manipulate the DOM in the scope of `this.el`, 
and to return `this` for chaining.
If you added any child view, you must call `this.destroyChildren`.
<br><br> ⚠️ **Security Notice:** The default implementation utilizes `innerHTML` on the root elementfor rendering, which may introduce Cross - Site Scripting (XSS) risks. Ensure that any user-generated content is properly sanitized before inserting it into the DOM. For best practices on secure data handling, refer to the[OWASP's XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html).<br><br>

**Kind**: instance method of [<code>View</code>](#module_view)  
**Returns**: <code>Rasti.View</code> - Return `this` for chaining.  
