<a name="module_component" id="module_component"></a>
## Component
Components are a special kind of view that is designed to be easily composable, 
making it simple to add child views and build complex user interfaces. 
Unlike views, which are render-agnostic, components have a specific set of rendering 
guidelines that allow for a more declarative development style.

**Example**  
```js
import { Component, Model } from 'rasti';
// Create Timer component.
const Timer = Component.create`
   <div>Seconds: <span>${({ model }) => model.seconds}</span></div>
`;
// Create model to store seconds.
const model = new Model({ seconds: 0 });
// Mount timer on body.
Timer.mount({ model }, document.body);
// Increment `model.seconds` every second.
setInterval(() => model.seconds++, 1000);
```

* [Component](#module_component)
    * _instance_
        * [.onCreate()](#module_component__oncreate)
        * [.onChange(model, key, value)](#module_component__onchange)
        * [.onRender()](#module_component__onrender)
        * [.onDestroy()](#module_component__ondestroy)
    * _static_
        * [.extend(object)](#module_component_extend)
        * [.mount(options, el, hydrate)](#module_component_mount) ⇒ <code>Rasti.View</code>
        * [.create()](#module_component_create)

<a name="module_component__oncreate" id="module_component__oncreate"></a>
### component.onCreate()
Lifecycle method. Called when the view is created.

**Kind**: instance method of [<code>Component</code>](#module_Component)  
<a name="module_component__onchange" id="module_component__onchange"></a>
### component.onChange(model, key, value)
Lifecycle method. Called when model emits `change` event.
By default calls render method.
This method should be extended with custom logic.
Maybe comparing new attributes with previous ones and calling
render when needed. Or doing some dom transformation.

**Kind**: instance method of [<code>Component</code>](#module_Component)  

| Param |
| --- |
| model | 
| key | 
| value | 

<a name="module_component__onrender" id="module_component__onrender"></a>
### component.onRender()
Lifecycle method. Called when the view is rendered.

**Kind**: instance method of [<code>Component</code>](#module_Component)  
<a name="module_component__ondestroy" id="module_component__ondestroy"></a>
### component.onDestroy()
Lifecycle method. Called when the view is destroyed.

**Kind**: instance method of [<code>Component</code>](#module_Component)  
<a name="module_component_extend" id="module_component_extend"></a>
### Component.extend(object)
Helper method to create a Component view subclass extending some methods.

**Kind**: static method of [<code>Component</code>](#module_Component)  

| Param | Type | Description |
| --- | --- | --- |
| object | <code>object</code> | Object containing methods to be added to the new view subclass. |

<a name="module_component_mount" id="module_component_mount"></a>
### Component.mount(options, el, hydrate) ⇒ <code>Rasti.View</code>
Mount the component into the dom.
It instantiate the Component view using options, 
appends its element into the DOM (if `el` is provided).
And returns the view instance.

**Kind**: static method of [<code>Component</code>](#module_Component)  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | The view options. |
| el | <code>node</code> | Dom element to append the view element. |
| hydrate | <code>boolean</code> | If true, the view will use existing html. |

<a name="module_component_create" id="module_component_create"></a>
### Component.create()
create is a tagged template that receives an HTML string, 
and returns a Component.

**Kind**: static method of [<code>Component</code>](#module_Component)  
<a name="module_emitter" id="module_emitter"></a>
## Emitter
`Emitter` is a class that provides an easy way to implement the observer pattern 
in your applications. It can be extended to create new classes that have the 
ability to emit and bind custom named events. 
Emitter is used by `Model` and `View` classes, which inherit from it to implement 
event-driven functionality.

**Example**  
```js
import { Emitter } from 'rasti';
class MyEmitter extends Emitter {
    constructor() {
        super();
        this.count = 0;
    }

    incrementCount() {
        this.count++;
        this.emit('countChanged', this.count);
    }
}

const myEmitter = new MyEmitter();

myEmitter.on('countChanged', (count) => {
    console.log(`Count changed to ${count}`);
});

myEmitter.incrementCount(); // Output: "Count changed to 1"
myEmitter.incrementCount(); // Output: "Count changed to 2"
```

* [Emitter](#module_emitter)
    * [.on(type, listener)](#module_emitter__on)
    * [.once(type, listener)](#module_emitter__once)
    * [.off([type], [listener])](#module_emitter__off)
    * [.emit(type)](#module_emitter__emit)

<a name="module_emitter__on" id="module_emitter__on"></a>
### emitter.on(type, listener)
Adds event listener.

**Kind**: instance method of [<code>Emitter</code>](#module_Emitter)  

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

**Kind**: instance method of [<code>Emitter</code>](#module_Emitter)  

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

**Kind**: instance method of [<code>Emitter</code>](#module_Emitter)  

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

**Kind**: instance method of [<code>Emitter</code>](#module_Emitter)  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | Type of the event (e.g. `change`). |
| [...args] | <code>any</code> | Arguments to be passed to listener. |

**Example**  
```js
this.emit('invalid'); // Emit validation error event.
```
<a name="module_model" id="module_model"></a>
## Model
- Orchestrates data and business logic.
- Emits events when data changes.

A `Model` manages an internal table of data attributes and triggers change events when any of its data is modified. 
Models may handle syncing data with a persistence layer. To design your models, create atomic, reusable objects 
that contain all the necessary functions for manipulating their specific data. 
Models should be easily passed throughout your app and used anywhere the corresponding data is needed.
Rasti `Models` stores its attributes in `this.attributes`, which is extended from `this.defaults` and the 
constructor `attrs` parameter. For every attribute, a getter is generated to retrieve the model property 
from `this.attributes`, and a setter is created to set the model property in `this.attributes` and emit `change` 
and `change:attribute` events.


| Param | Type | Description |
| --- | --- | --- |
| attrs | <code>object</code> | Object containing model attributes to extend `this.attributes`. Getters and setters are generated for `this.attributtes`, in order to emit `change` events. |

**Example**  
```js
import { Model } from 'rasti';
// Todo model
class TodoModel extends Model {
    preinitialize() {
        // Todo model has `title` and `completed` default attributes. `defaults` will extend `this.attributes`. 
        // Getters and setters are generated for `this.attributtes`, in order to emit `change` events.
        this.defaults = {
            title : '',
            completed : false
        };
    }

    toggle() {
        // Set completed property. This will call a setter that will set `completed` 
        // in this.attributes, and emit `change` and `change:completed` events.
        this.completed = !this.completed; 
    }
}

// Create todo. Pass `title` attribute as argument.
const todo = new TodoModel({ title : 'Create Rasti app' });
// Listen to `change:completed` event.
todo.on('change:completed', () => console.log('Completed:', todo.completed));
// Complete todo.
todo.toggle(); // Output: "Completed: true"
```

* [Model](#module_model)
    * [.preinitialize(attrs)](#module_model__preinitialize)
    * [.defineAttribute(key)](#module_model__defineattribute)
    * [.get(key)](#module_model__get) ⇒ <code>any</code>
    * [.set(key, [value])](#module_model__set) ⇒ <code>this</code>
    * [.toJSON()](#module_model__tojson) ⇒ <code>object</code>

<a name="module_model__preinitialize" id="module_model__preinitialize"></a>
### model.preinitialize(attrs)
If you define a preinitialize method, it will be invoked when the Model is first created, before any instantiation logic is run for the Model.

**Kind**: instance method of [<code>Model</code>](#module_Model)  

| Param | Type | Description |
| --- | --- | --- |
| attrs | <code>object</code> | Object containing model attributes to extend `this.attributes`. |

<a name="module_model__defineattribute" id="module_model__defineattribute"></a>
### model.defineAttribute(key)
Generate getter/setter for the given key. In order to emit `change` events.
This method is called internally by the constructor
for `this.attributes`.

**Kind**: instance method of [<code>Model</code>](#module_Model)  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | Attribute key. |

<a name="module_model__get" id="module_model__get"></a>
### model.get(key) ⇒ <code>any</code>
Get an attribute from `this.attributes`.
This method is called internally by generated getters.

**Kind**: instance method of [<code>Model</code>](#module_Model)  
**Returns**: <code>any</code> - The attribute value.  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | Attribute key. |

<a name="module_model__set" id="module_model__set"></a>
### model.set(key, [value]) ⇒ <code>this</code>
Set an attribute into `this.attributes`.
Emit `change` and `change:attribute` if value change.
Could be called in two forms, `this.set('key', value)` and
`this.set({ key : value })`.
This method is called internally by generated setters.

**Kind**: instance method of [<code>Model</code>](#module_Model)  
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

**Kind**: instance method of [<code>Model</code>](#module_Model)  
**Returns**: <code>object</code> - Object representation of the model to be used for JSON serialization.  
<a name="module_view" id="module_view"></a>
## View
- Listens for changes and renders UI.
- Handles user input and interactivity.
- Sends captured input to the model.

A `View` is an atomic unit of the user interface that can render the data from a specific model or multiple models.
However, views can also be independent and have no associated data.
Models must be unaware of views. Views, on the other hand, may render model data and listen to the change events 
emitted by the models to re-render themselves based on changes.
Each `View` has a root element, `this.el`, which is used for event delegation. 
All element lookups are scoped to this element, and any rendering or DOM manipulations should be done inside it. 
If `this.el` is not present, an element will be created using `this.tag` (defaulting to div) and `this.attributes`.


| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | Object containing options. The following keys will be merged to `this`: el, tag, attributes, events, model, template, onDestroy. |

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| el | <code>node</code> | Every view has a root element, `this.el`. If not present it will be created. |
| tag | <code>string</code> | If `this.el` is not present, an element will be created using `this.tag`. Default is `div`. |
| attributes | <code>object</code> | If `this.el` is not present, an element will be created using `this.attributes`. |
| events | <code>object</code> | Object in the format `{'event selector' : 'listener'}`. Used to bind delegated event listeners to root element. |
| model | <code>object</code> | A `Rasti.Model` or any object containing data and business logic. |
| template | <code>function</code> | A function that receives data and returns a markup string (html for example). |

**Example**  
```js
import { View } from 'rasti';

class Timer extends View {
    constructor(options) {
        super(options);
        // Create model to store internal state. Set `seconds` attribute into 0.
        this.model = new Model({ seconds : 0 });
        // Listen to changes in model `seconds` attribute and re render.
        this.model.on('change:seconds', this.render.bind(this));
        // Increment model `seconds` attribute every 1000 milliseconds.
        this.interval = setInterval(() => this.model.seconds++, 1000);
    }

    template(model) {
        return `Seconds: <span>${model.seconds}</span>`;
    }
}
// Render view and append view's element into body.
document.body.appendChild(new Timer().render().el);
```

* [View](#module_view)
    * [.preinitialize(attrs)](#module_view__preinitialize)
    * [.$(selector)](#module_view__$) ⇒ <code>node</code>
    * [.$$(selector)](#module_view__$$) ⇒ <code>Array.&lt;node&gt;</code>
    * [.destroy()](#module_view__destroy)
    * [.onDestroy()](#module_view__ondestroy)
    * [.addChild(child)](#module_view__addchild) ⇒ <code>Rasti.View</code>
    * [.destroyChildren()](#module_view__destroychildren)
    * [.ensureElement()](#module_view__ensureelement)
    * [.createElement(tag, attrs)](#module_view__createelement) ⇒ <code>node</code>
    * [.removeElement()](#module_view__removeelement)
    * [.delegateEvents([events])](#module_view__delegateevents) ⇒ <code>Rasti.View</code>
    * [.undelegateEvents()](#module_view__undelegateevents) ⇒ <code>Rasti.View</code>
    * [.render()](#module_view__render) ⇒ <code>Rasti.View</code>

<a name="module_view__preinitialize" id="module_view__preinitialize"></a>
### view.preinitialize(attrs)
If you define a preinitialize method, it will be invoked when the view is first created, before any instantiation logic is run.

**Kind**: instance method of [<code>View</code>](#module_View)  

| Param | Type | Description |
| --- | --- | --- |
| attrs | <code>object</code> | Object containing model attributes to extend `this.attributes`. |

<a name="module_view__$" id="module_view__$"></a>
### view.$(selector) ⇒ <code>node</code>
Returns the first element that match the selector, 
scoped to DOM elements within the current view's root element (`this.el`).

**Kind**: instance method of [<code>View</code>](#module_View)  
**Returns**: <code>node</code> - Element matching selector within the view's root element (`this.el`).  

| Param | Type | Description |
| --- | --- | --- |
| selector | <code>string</code> | CSS selector. |

<a name="module_view__$$" id="module_view__$$"></a>
### view.$$(selector) ⇒ <code>Array.&lt;node&gt;</code>
Returns a list of elements that match the selector, 
scoped to DOM elements within the current view's root element (`this.el`).

**Kind**: instance method of [<code>View</code>](#module_View)  
**Returns**: <code>Array.&lt;node&gt;</code> - List of elements matching selector within the view's root element (`this.el`).  

| Param | Type | Description |
| --- | --- | --- |
| selector | <code>string</code> | CSS selector. |

<a name="module_view__destroy" id="module_view__destroy"></a>
### view.destroy()
Destroy the view.
Destroy children views if any, undelegate events, stop listening to events, call `onDestroy` lifecycle method.
Pass options.remove as true to remove the view's root element (`this.el`) from the DOM.

**Kind**: instance method of [<code>View</code>](#module_View)  

| Param | Type | Description |
| --- | --- | --- |
| options.remove | <code>object</code> | Remove the view's root element (`this.el`) from the DOM. |

<a name="module_view__ondestroy" id="module_view__ondestroy"></a>
### view.onDestroy()
`onDestroy` lifecycle method is called after view is destroyed.
Override with your code. Useful to stop listening to model's events.

**Kind**: instance method of [<code>View</code>](#module_View)  
<a name="module_view__addchild" id="module_view__addchild"></a>
### view.addChild(child) ⇒ <code>Rasti.View</code>
Add a view as a child.
Children views are stored at `this.children`, and destroyed when the parent is destroyed.
Returns the child for chaining.

**Kind**: instance method of [<code>View</code>](#module_View)  

| Param | Type |
| --- | --- |
| child | <code>Rasti.View</code> | 

<a name="module_view__destroychildren" id="module_view__destroychildren"></a>
### view.destroyChildren()
Call destroy method on children views.

**Kind**: instance method of [<code>View</code>](#module_View)  
<a name="module_view__ensureelement" id="module_view__ensureelement"></a>
### view.ensureElement()
Ensure that the view has a root element at `this.el`.
You shouldn't call this method directly. It's called from constructor.
You may override it if you want to use a different logic or to 
postpone element creation.

**Kind**: instance method of [<code>View</code>](#module_View)  
<a name="module_view__createelement" id="module_view__createelement"></a>
### view.createElement(tag, attrs) ⇒ <code>node</code>
Create an element.
Called from constructor if `this.el` is undefined, to ensure
the view to have a root element.

**Kind**: instance method of [<code>View</code>](#module_View)  
**Returns**: <code>node</code> - The created element.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| tag | <code>string</code> | <code>&quot;div&quot;</code> | Tag for the element. Default to `div` |
| attrs | <code>object</code> |  | Attributes for the element. |

<a name="module_view__removeelement" id="module_view__removeelement"></a>
### view.removeElement()
Remove `this.el` from DOM.

**Kind**: instance method of [<code>View</code>](#module_View)  
<a name="module_view__delegateevents" id="module_view__delegateevents"></a>
### view.delegateEvents([events]) ⇒ <code>Rasti.View</code>
Provide declarative listeners for DOM events within a view. If an events hash is not passed directly, uses `this.events` as the source.<br />
Events are written in the format `{'event selector' : 'listener'}`. The listener may be either the name of a method on the view, or a direct function body.
Omitting the selector causes the event to be bound to the view's root element (`this.el`).<br />
By default, `delegateEvents` is called within the View's constructor, 
so if you have a simple events hash, all of your DOM events will always already be connected, and you will never have to call this function yourself. <br />
All attached listeners are bound to the view automatically, so when the listeners are invoked, `this` continues to refer to the view object.<br />
When `delegateEvents` is run again, perhaps with a different events hash, all listeners are removed and delegated afresh.

**Kind**: instance method of [<code>View</code>](#module_View)  
**Returns**: <code>Rasti.View</code> - Return `this` for chaining.  

| Param | Type | Description |
| --- | --- | --- |
| [events] | <code>object</code> | Object in the format `{'event selector' : 'listener'}`. Used to bind delegated event listeners to root element. |

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

**Kind**: instance method of [<code>View</code>](#module_View)  
**Returns**: <code>Rasti.View</code> - Return `this` for chaining.  
<a name="module_view__render" id="module_view__render"></a>
### view.render() ⇒ <code>Rasti.View</code>
Render the view.
This method should be overridden with custom logic.
The default implementation sets innerHTML of `this.el` with `this.template`.
Conventions are to only manipulate the dom in the scope of `this.el`, 
and to return `this` for chaining.
If you added any child view, you must call `this.destroyChildren`.

**Kind**: instance method of [<code>View</code>](#module_View)  
**Returns**: <code>Rasti.View</code> - Return `this` for chaining.  
