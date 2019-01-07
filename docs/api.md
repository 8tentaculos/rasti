<a name="module_Emitter" id="module_Emitter"></a>
## Emitter
Emitter is a class that can be extended giving the subclass the ability to emit 
and bind custom named events. Model and View inherits from it.

**Example**  
```js
import { Emitter } from 'rasti';
// Define App class, inherits from Emitter.
class App extends Emitter {
    constructor() {
        super()
        // Fetch data and emit `ready` event.
        fetch('/api/init').then(() => this.emit('ready')); 
    }
}
// Instantiate App.
const app = new App();
// Add event listener to ready event.
app.on('ready', () => console.log('app is ready!'));
```

* [Emitter](#module_Emitter)
    * [.on(type, listener)](#module_Emitter__on)
    * [.once(type, listener)](#module_Emitter__once)
    * [.off([type], [listener])](#module_Emitter__off)
    * [.emit(type)](#module_Emitter__emit)

<a name="module_Emitter__on" id="module_Emitter__on"></a>
### emitter.on(type, listener)
Adds event listener.

**Kind**: instance method of [<code>Emitter</code>](#module_Emitter)  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | Type of the event (e.g. `change`). |
| listener | <code>function</code> | Callback function to be called when the event is emited. |

**Example**  
```js
this.model.on('change', this.render.bind(this)); // Re render when model changes.
```
<a name="module_Emitter__once" id="module_Emitter__once"></a>
### emitter.once(type, listener)
Adds event listener that executes once.

**Kind**: instance method of [<code>Emitter</code>](#module_Emitter)  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | Type of the event (e.g. `change`). |
| listener | <code>function</code> | Callback function to be called when the event is emited. |

**Example**  
```js
this.model.once('change', () => console.log('This will happen once'));
```
<a name="module_Emitter__off" id="module_Emitter__off"></a>
### emitter.off([type], [listener])
Removes event listeners.

**Kind**: instance method of [<code>Emitter</code>](#module_Emitter)  

| Param | Type | Description |
| --- | --- | --- |
| [type] | <code>string</code> | Type of the event (e.g. `change`). If is not provided, it removes all listeners. |
| [listener] | <code>function</code> | Callback function to be called when the event is emited. If listener is not provided, it removes all listeners for specified type. |

**Example**  
```js
this.model.off('change'); // Stop listening to changes.
```
<a name="module_Emitter__emit" id="module_Emitter__emit"></a>
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
<a name="module_Model" id="module_Model"></a>
## Model
- Orchestrates data and business logic.
- Emits events when data changes.

A Model manages an internal table of data attributes, and triggers "change" events 
when any of its data is modified.<br />
Models may handle syncing data with a persistence layer.<br />
Design your models as the atomic reusable objects containing all of the helpful functions for 
manipulating their particular bit of data.<br /> 
Models should be able to be passed around throughout your app, and used anywhere that bit of data is needed.<br />
Rasti Models stores its attributes in `this.attributes`, which is extended from `this.defaults` and constructor `attrs` parameter.
For every attribute, a getter is generated, which retrieve the model property from `this.attributes`.
And a setter, which sets the model property in `this.attributes` and emits `change` and `change:attribute` events.


| Param | Type | Description |
| --- | --- | --- |
| attrs | <code>object</code> | Object containing model attributes to extend `this.attributes`. Getters and setters are generated for `this.attributtes`, in order to emit `change` events. |

**Example**  
```js
// Todo model
class TodoModel extends Rasti.Model {
    toggle() {
        // Set completed property. This will call a setter that will set `completed` 
        // in this.attributes, and emit `change` and `change:completed` events.
        this.completed = !this.completed; 
    }
}
// Todo model has `title` and `completed` default attributes. `defaults` will extend `this.attributes`. Getters and setters are generated for `this.attributtes`, in order to emit `change` events.
TodoModel.prototype.defaults = {
    title : '',
    completed : false
};
// Create todo. Pass `title` attribute as argument.
const todo = new TodoModel({ title : 'Learn Rasti' });
// Listen to `change:completed` event.
todo.on('change:completed', () => console.log('Completed:', todo.completed));
// Complete todo.
todo.toggle(); // Completed: true
```

* [Model](#module_Model)
    * [.defineAttribute(key)](#module_Model__defineAttribute)
    * [.get(key)](#module_Model__get) ⇒ <code>any</code>
    * [.set(key, [value])](#module_Model__set) ⇒ <code>this</code>
    * [.toJSON()](#module_Model__toJSON) ⇒ <code>object</code>

<a name="module_Model__defineAttribute" id="module_Model__defineAttribute"></a>
### model.defineAttribute(key)
Generate getter/setter for the given key. In order to emit `change` events.
This method is called internally by the constructor
for `this.attributes`.

**Kind**: instance method of [<code>Model</code>](#module_Model)  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | Attribute key. |

<a name="module_Model__get" id="module_Model__get"></a>
### model.get(key) ⇒ <code>any</code>
Get an attribute from `this.attributes`.
This method is called internally by generated getters.

**Kind**: instance method of [<code>Model</code>](#module_Model)  
**Returns**: <code>any</code> - The attribute value.  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | Attribute key. |

<a name="module_Model__set" id="module_Model__set"></a>
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

<a name="module_Model__toJSON" id="module_Model__toJSON"></a>
### model.toJSON() ⇒ <code>object</code>
Return object representation of the model to be used for JSON serialization.
By default returns `this.attributes`.

**Kind**: instance method of [<code>Model</code>](#module_Model)  
**Returns**: <code>object</code> - Object representation of the model to be used for JSON serialization.  
<a name="module_View" id="module_View"></a>
## View
- Listens for changes and renders UI.
- Handles user input and interactivity.
- Sends captured input to the model.

A View is an atomic chunk of user interface. It often renders the data from a specific model, 
or number of models, but views can also be data-less chunks of UI that stand alone.<br /> 
Models must be unaware of views. Instead, views listen to the model "change" events, 
and react or re-render themselves appropriately.<br />
Views has a root element, `this.el`. That element is used for event delegation. Elements lookups are scoped to that element. And render and dom manipulations should be done inside that element. 
If `this.el` is not present, an element will be created using `this.tag` (or `div` as default), and `this.attributes`.<br />


| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | Object containing options. The following keys will be merged to `this`: el, tag, attributes, events, model, template, onDestroy. |

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| el | <code>node</code> | Every view has a root element, `this.el`. If not present it will be created. |
| tag | <code>string</code> | If `this.el` is not present, an element will be created using `this.tag`. Default is `div`. |
| attributes | <code>object</code> | If `this.el` is not present, an element will be created using `this.attributes`. |
| events | <code>object</code> | Object in the format `{'event selector' : 'listener"'}`. Used to bind delegated event listeners to root element. |
| model | <code>object</code> | A `Rasti.Model` or any object containing data and business logic. |
| template | <code>function</code> | A function that receives data and returns a markup string (html for example). |

**Example**  
```js
// Counter view.
class CounterView extends View {
    constructor(options) {
        super(options);
        // Bind method to `this`, to be called as listener.
        this.render = this.render.bind(this);
        // Listen to model change and re render.
        this.model.on('change:count', this.render);
    }
    onDestroy() {
        // Unbind events when destroyed.
        this.model.off('change:count', this.render);
    }
    // Listener method. Called when button is clicked.
    onClickIncrement() {
        // Increment count on model.
        this.model.count++;
    }
}
Object.assign(CounterView.prototype, {
    // Set delegated events.
    // Call `onClickIncrement` when button is clicked.
    events : {
        'click button' : 'onClickIncrement'
    },
    // View's template.
    template : (model) => `
        <div>The count is: ${model.count}</div>
        <button>Increment</button>
    `
});
// Model.
const model = new Model({ count : 0 });
// Instantiate CounterView.
const counterView = new CounterView({ model });
// Add to DOM.
document.body.appendChild(counterView.render().el);
```

* [View](#module_View)
    * [.$(selector)](#module_View__$) ⇒ <code>node</code>
    * [.$$(selector)](#module_View__$$) ⇒ <code>Array.&lt;node&gt;</code>
    * [.destroy()](#module_View__destroy)
    * [.onDestroy()](#module_View__onDestroy)
    * [.addChild(child)](#module_View__addChild) ⇒ <code>Rasti.View</code>
    * [.destroyChildren()](#module_View__destroyChildren)
    * [.ensureElement()](#module_View__ensureElement)
    * [.createElement(tag, attrs)](#module_View__createElement) ⇒ <code>node</code>
    * [.removeElement()](#module_View__removeElement)
    * [.delegateEvents([events])](#module_View__delegateEvents)
    * [.undelegateEvents()](#module_View__undelegateEvents)
    * [.render()](#module_View__render) ⇒ <code>Rasti.View</code>

<a name="module_View__$" id="module_View__$"></a>
### view.$(selector) ⇒ <code>node</code>
Returns the first element that match the selector, 
scoped to DOM elements within the current view's root element (`this.el`).

**Kind**: instance method of [<code>View</code>](#module_View)  
**Returns**: <code>node</code> - Element matching selector within the view's root element (`this.el`).  

| Param | Type | Description |
| --- | --- | --- |
| selector | <code>string</code> | CSS selector. |

<a name="module_View__$$" id="module_View__$$"></a>
### view.$$(selector) ⇒ <code>Array.&lt;node&gt;</code>
Returns a list of elements that match the selector, 
scoped to DOM elements within the current view's root element (`this.el`).

**Kind**: instance method of [<code>View</code>](#module_View)  
**Returns**: <code>Array.&lt;node&gt;</code> - List of elements matching selector within the view's root element (`this.el`).  

| Param | Type | Description |
| --- | --- | --- |
| selector | <code>string</code> | CSS selector. |

<a name="module_View__destroy" id="module_View__destroy"></a>
### view.destroy()
Destroy the view.
Destroy children views if any, undelegate events, stop listening to events, call `onDestroy` lifecycle method.
Pass options.remove as true to remove the view's root element (`this.el`) from the DOM.

**Kind**: instance method of [<code>View</code>](#module_View)  

| Param | Type | Description |
| --- | --- | --- |
| options.remove | <code>object</code> | Remove the view's root element (`this.el`) from the DOM. |

<a name="module_View__onDestroy" id="module_View__onDestroy"></a>
### view.onDestroy()
`onDestroy` lifecycle method is called after view is destroyed.
Override with your code. Useful to stop listening to model's events.

**Kind**: instance method of [<code>View</code>](#module_View)  
<a name="module_View__addChild" id="module_View__addChild"></a>
### view.addChild(child) ⇒ <code>Rasti.View</code>
Add a view as a child.
Children views are stored at `this.children`, and destroyed when the parent is destroyed.
Returns the child for chaining.

**Kind**: instance method of [<code>View</code>](#module_View)  

| Param | Type |
| --- | --- |
| child | <code>Rasti.View</code> | 

<a name="module_View__destroyChildren" id="module_View__destroyChildren"></a>
### view.destroyChildren()
Call destroy method on children views.

**Kind**: instance method of [<code>View</code>](#module_View)  
<a name="module_View__ensureElement" id="module_View__ensureElement"></a>
### view.ensureElement()
Ensure that the view has a root element at `this.el`.
You shouldn't call this method directly. It's called from constructor.
You may override it if you want to use a different logic or to 
postpone element creation.

**Kind**: instance method of [<code>View</code>](#module_View)  
<a name="module_View__createElement" id="module_View__createElement"></a>
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

<a name="module_View__removeElement" id="module_View__removeElement"></a>
### view.removeElement()
Remove `this.el` from DOM.

**Kind**: instance method of [<code>View</code>](#module_View)  
<a name="module_View__delegateEvents" id="module_View__delegateEvents"></a>
### view.delegateEvents([events])
Delegate event listeners. Called at the constructor.
Parse `events` parameter or `this.events`, and bind event listeners to `this.el`.<br />
Events are written in the format `{'event selector': 'listener'}`.
The listener may be either the name of a method on the view,
or a direct function body.
Omitting the selector causes the event to be bound to `this.el`.

**Kind**: instance method of [<code>View</code>](#module_View)  

| Param | Type | Description |
| --- | --- | --- |
| [events] | <code>object</code> | Object in the format `{'event selector' : 'listener"'}`. Used to bind delegated event listeners to root element. |

**Example**  
```js
model.prototype.events = {
     'click button.ok' : 'onClickOkButton'
};
```
<a name="module_View__undelegateEvents" id="module_View__undelegateEvents"></a>
### view.undelegateEvents()
Undelegate event listeners. Called when the view is destroyed.

**Kind**: instance method of [<code>View</code>](#module_View)  
<a name="module_View__render" id="module_View__render"></a>
### view.render() ⇒ <code>Rasti.View</code>
Render the view.
This method should be overriden with custom logic.
The default implementation sets innerHTML of `this.el` with `this.template`.
Conventions are to only manipulate the dom in the scope of `this.el`, 
and to return `this` for chaining.
If you added any child view, you must call `this.destroyChildren`.

**Kind**: instance method of [<code>View</code>](#module_View)  
**Returns**: <code>Rasti.View</code> - Return `this` for chaining.  
