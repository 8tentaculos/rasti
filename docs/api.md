## Modules

<dl>
<dt><a href="#module_Emitter">Emitter</a></dt>
<dd><p>Emitter is a class that can be extended giving the subclass the ability to bind and emit custom named events. Model and View inherits from it.</p>
</dd>
<dt><a href="#module_Model">Model</a></dt>
<dd><p>Orchestrates data and business logic.
Emits events when data changes.
A Model manages an internal table of data attributes, and triggers &quot;change&quot; events when any of its data is modified. Models may handle syncing data with a persistence layer. Design your models as the atomic reusable objects containing all of the helpful functions for manipulating their particular bit of data. Models should be able to be passed around throughout your app, and used anywhere that bit of data is needed.</p>
</dd>
<dt><a href="#module_View">View</a></dt>
<dd><p>Listens for changes and renders UI.
Handles user input and interactivity.
Sends captured input to the model.
A View is an atomic chunk of user interface. It often renders the data from a specific model, or number of models, but views can also be data-less chunks of UI that stand alone. Models must be unaware of views. Instead, views listen to the model &quot;change&quot; events, and react or re-render themselves appropriately.</p>
</dd>
</dl>

<a name="module_Emitter"></a>

## Emitter
Emitter is a class that can be extended giving the subclass the ability to bind and emit custom named events. Model and View inherits from it.

**Example**  
```js
import Emitter from 'rasti';

class Model extends Emitter {

}

const model = new Model();

model.on('hello', () => console.log('world!'));
model.emit('hello'); // world!
```

* [Emitter](#module_Emitter)
    * [.on(type, listener)](#module_Emitter+on)
    * [.once(type, listener)](#module_Emitter+once)
    * [.off([type], [listener])](#module_Emitter+off)
    * [.emit(type, ...args)](#module_Emitter+emit)
    * [.emitAsync(type, ...args)](#module_Emitter+emitAsync)

<a name="module_Emitter+on"></a>

### emitter.on(type, listener)
Add event listener.

**Kind**: instance method of [<code>Emitter</code>](#module_Emitter)  

| Param | Type |
| --- | --- |
| type | <code>string</code> | 
| listener | <code>function</code> | 

<a name="module_Emitter+once"></a>

### emitter.once(type, listener)
Add event listener that executes once.

**Kind**: instance method of [<code>Emitter</code>](#module_Emitter)  

| Param | Type |
| --- | --- |
| type | <code>string</code> | 
| listener | <code>function</code> | 

<a name="module_Emitter+off"></a>

### emitter.off([type], [listener])
Removes event listeners.
If is not provided, it removes all listeners.
If listener is not provided, it removes all listeners for specified type.

**Kind**: instance method of [<code>Emitter</code>](#module_Emitter)  

| Param | Type |
| --- | --- |
| [type] | <code>string</code> | 
| [listener] | <code>function</code> | 

<a name="module_Emitter+emit"></a>

### emitter.emit(type, ...args)
Emits event of specified type. Listeners will receive specified arguments.

**Kind**: instance method of [<code>Emitter</code>](#module_Emitter)  

| Param | Type |
| --- | --- |
| type | <code>string</code> | 
| ...args |  | 

<a name="module_Emitter+emitAsync"></a>

### emitter.emitAsync(type, ...args)
Emits event of specified type asynchronously. Listeners will receive specified arguments.

**Kind**: instance method of [<code>Emitter</code>](#module_Emitter)  

| Param | Type |
| --- | --- |
| type | <code>string</code> | 
| ...args |  | 

<a name="module_Model"></a>

## Model
Orchestrates data and business logic.
Emits events when data changes.
A Model manages an internal table of data attributes, and triggers "change" events when any of its data is modified. Models may handle syncing data with a persistence layer. Design your models as the atomic reusable objects containing all of the helpful functions for manipulating their particular bit of data. Models should be able to be passed around throughout your app, and used anywhere that bit of data is needed.


* [Model](#module_Model)
    * [.defineAttribute(key)](#module_Model+defineAttribute)
    * [.get(key)](#module_Model+get)
    * [.set(key, value)](#module_Model+set)

<a name="module_Model+defineAttribute"></a>

### model.defineAttribute(key)
Generate getter/setter for the given key.
This method is called internally by the constructor
for this.attributes.

**Kind**: instance method of [<code>Model</code>](#module_Model)  

| Param | Type |
| --- | --- |
| key | <code>string</code> | 

<a name="module_Model+get"></a>

### model.get(key)
Get an attribute from "this.attributes".
This method is called internally by generated getters.

**Kind**: instance method of [<code>Model</code>](#module_Model)  

| Param | Type |
| --- | --- |
| key | <code>string</code> | 

<a name="module_Model+set"></a>

### model.set(key, value)
Set an attribute into "this.attrs".
Emit "change" and "change:key" if value change.
Could be called in two forms, "this.set('key', value)" and
"this.set({ key : value })".
 This method is called internally by generated setters.

**Kind**: instance method of [<code>Model</code>](#module_Model)  

| Param | Type |
| --- | --- |
| key | <code>string</code> \| <code>object</code> | 
| value |  | 

<a name="module_View"></a>

## View
Listens for changes and renders UI.
Handles user input and interactivity.
Sends captured input to the model.
A View is an atomic chunk of user interface. It often renders the data from a specific model, or number of models, but views can also be data-less chunks of UI that stand alone. Models must be unaware of views. Instead, views listen to the model "change" events, and react or re-render themselves appropriately.


* [View](#module_View)
    * [.$(selector)](#module_View+$) ⇒ <code>node</code>
    * [.$$(selector)](#module_View+$$) ⇒ <code>nodeList</code>
    * [.destroy(options)](#module_View+destroy)
    * [.onDestroy(options)](#module_View+onDestroy)
    * [.addChild(child)](#module_View+addChild) ⇒ <code>Rasti.View</code>
    * [.destroyChildren()](#module_View+destroyChildren)
    * [.createElement(tag, attrs)](#module_View+createElement) ⇒ <code>node</code>
    * [.removeElement()](#module_View+removeElement)
    * [.delegateEvents(events)](#module_View+delegateEvents)
    * [.undelegateEvents()](#module_View+undelegateEvents)
    * [.render()](#module_View+render) ⇒ <code>Rasti.View</code>

<a name="module_View+$"></a>

### view.$(selector) ⇒ <code>node</code>
Element lookup, scoped to DOM elements within the
current view's root element ("this.element").

**Kind**: instance method of [<code>View</code>](#module_View)  

| Param | Type | Description |
| --- | --- | --- |
| selector | <code>string</code> | css selector |

<a name="module_View+$$"></a>

### view.$$(selector) ⇒ <code>nodeList</code>
Element lookup, scoped to DOM elements within the
current view's root element ("this.element").

**Kind**: instance method of [<code>View</code>](#module_View)  

| Param | Type | Description |
| --- | --- | --- |
| selector | <code>string</code> | css selector |

<a name="module_View+destroy"></a>

### view.destroy(options)
Destroy the view.
Pass options.remove as true to remove element.

**Kind**: instance method of [<code>View</code>](#module_View)  

| Param | Type |
| --- | --- |
| options | <code>object</code> | 

<a name="module_View+onDestroy"></a>

### view.onDestroy(options)
"onDestroy" lifecycle method.
Called after view is destroyed..

**Kind**: instance method of [<code>View</code>](#module_View)  

| Param | Type |
| --- | --- |
| options | <code>object</code> | 

<a name="module_View+addChild"></a>

### view.addChild(child) ⇒ <code>Rasti.View</code>
Add a view as a child.
Returns the child for chaining.

**Kind**: instance method of [<code>View</code>](#module_View)  

| Param | Type |
| --- | --- |
| child | <code>Rasti.View</code> | 

<a name="module_View+destroyChildren"></a>

### view.destroyChildren()
Call destroy on children views.

**Kind**: instance method of [<code>View</code>](#module_View)  
<a name="module_View+createElement"></a>

### view.createElement(tag, attrs) ⇒ <code>node</code>
Create an element.
Called from constructor if "this.el" is undefined, to ensure
the view to have a root element.

**Kind**: instance method of [<code>View</code>](#module_View)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| tag | <code>string</code> | <code>&quot;div&quot;</code> | default to "div" |
| attrs | <code>object</code> |  |  |

<a name="module_View+removeElement"></a>

### view.removeElement()
Remove the view element.

**Kind**: instance method of [<code>View</code>](#module_View)  
<a name="module_View+delegateEvents"></a>

### view.delegateEvents(events)
Delegate event listeners.
Parse "this.events" and bind event listeners to "this.el"
Events are written in the format {"event selector": "callback"}.
The callback may be either the name of a method on the view,
or a direct function body.
Omitting the selector causes the event to be bound to "this.el".
this.events = {
     'click button.ok' : 'onClickOkButton'
};

**Kind**: instance method of [<code>View</code>](#module_View)  

| Param | Type |
| --- | --- |
| events | <code>object</code> | 

<a name="module_View+undelegateEvents"></a>

### view.undelegateEvents()
Undelegate event listeners.

**Kind**: instance method of [<code>View</code>](#module_View)  
<a name="module_View+render"></a>

### view.render() ⇒ <code>Rasti.View</code>
Render the view.
Override if needed, but remember calling "this.destroyChildren"
and returning "this".

**Kind**: instance method of [<code>View</code>](#module_View)  
