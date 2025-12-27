# Rasti API Reference for AI Agents

This document provides a comprehensive reference for AI agents working with the Rasti library. It covers the core API patterns, lifecycle methods, and best practices.

For detailed API documentation, see: [API Documentation](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.0.0/docs/api.md)

## 🔧 Component API

### Component Creation

Components are created using `Component.create` with tagged template literals. Use `.extend()` to add methods and lifecycle hooks.

```js
import { Component, Model } from 'rasti';

const MyComponent = Component.create`
    <div class="${({ props }) => props.className}">
        <button onClick=${handleClick}>Click me</button>
        ${({ props }) => props.renderChildren()}
    </div>
`;

// Add methods and properties with .extend()
const ExtendedComponent = Component.create`...`.extend({
    // Lifecycle methods
    onCreate() { /* ... */ },
    onChange(model, changed) { /* ... */ },
    
    // Custom methods
    customMethod() {
        return this.props.value * 2;
    },
    
    // Helper render methods
    renderHeader() {
        return this.partial`<header>...</header>`;
    }
});
```

**Key Methods:**
- [`Component.create`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.0.0/docs/api.md#module_component_create) - Creates a new component class from a template
- [`Component.mount`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.0.0/docs/api.md#module_component_mount) - Creates and mounts a component instance
- [`Component.extend`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.0.0/docs/api.md#module_component_extend) - Extends a component with additional methods

### Event Handling

Events are automatically delegated to the component's root element. Handlers are bound to `this`.

**Handler signature:** `(event, component, matched)`
- `event`: Native DOM event object
- `component`: Component instance (same as `this`)
- `matched`: Element that matched the event

```js
// ✅ Inline function (most common pattern)
const Counter = Component.create`
    <div>
        <span>${({ model }) => model.count}</span>
        <button onClick=${function(event, component, matched) { 
            this.model.count++ 
        }}>+</button>
        <button onClick=${function() { this.model.count-- }}>-</button>
    </div>
`;

// ✅ String method name (uses this.handleClick)
const Form = Component.create`
    <form onSubmit="handleSubmit">
        <input type="text" onChange="handleInputChange" />
        <button type="submit">Submit</button>
    </form>
`.extend({
    handleSubmit(event, component, matched) {
        event.preventDefault();
        // Handle form submission
    },
    handleInputChange(event, component, matched) {
        this.model.inputValue = event.target.value;
    }
});

// ✅ Arrow function with quotes (useful for passing handlers to child components)
const Parent = Component.create`
    <div>
        <${ChildComponent} 
            onSave="${({ model }) => () => model.save()}"
            onDelete="${({ model, props }) => () => model.delete(props.itemId)}"
        />
    </div>
`;
```

### Component Tags & Props

When using component tags `<${MyComponent} />`, attributes become component options. Non-standard options are automatically converted to `props`.

```js
// ✅ Parent passes values as component options
const Parent = Component.create`
    <div>
        <${ChildComponent} 
            title="${({ model }) => model.title}"
            onSave=${handleSave}
            onSubmit="${({ model }) => () => model.submit()}"
        />
    </div>
`;

// ✅ Child receives them as props (auto-generated from options)
const ChildComponent = Component.create`
    <div>
        <h2>${({ props }) => props.title}</h2>
        <button onClick="${({ props }) => props.onSave}">Save</button>
        <button onClick="${({ props }) => props.onSubmit}">Submit</button>
    </div>
`;
```

**Key Properties:**
- `this.props` - [Model](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.0.0/docs/api.md#module_model) containing props passed from parent
- `this.model` - [Model](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.0.0/docs/api.md#module_model) for application data
- `this.state` - [Model](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.0.0/docs/api.md#module_model) for internal component state

### Container Components

Components that render a single child component are **containers**. In containers, `this.el` references the child's element directly (not a wrapper).

```js
// Container wrapping a Button with preset props
const PrimaryButton = Component.create`
    <${Button} className="primary" variant="solid" />
`;

// Container using function form
const SecondaryButton = Component.create(() => 
    Button.mount({ className : 'secondary', variant : 'outlined' })
);

// Note: this.el references the Button's <button> element, not a wrapper div
```

### Template Interpolations

Interpolations in templates and partials are evaluated during each render:
- Non-function values (strings, numbers, booleans) are passed directly
- Functions are executed, receiving the component instance as argument and bound to `this`, then the returned value is used

```js
const MyComponent = Component.create`
    <div>
        <!-- Arrow function (most common) - implicit return -->
        ${({ model }) => model.title}
        
        <!-- Regular function with explicit return -->
        ${function() { return this.model.title; }}
        
        <!-- Destructure what you need from the instance -->
        ${({ model, props, state }) => model.count + props.offset}
        
        <!-- Or use the full instance as parameter -->
        ${(self) => self.model.title}
    </div>
`;
```

### Quoted vs Unquoted Attributes

For attribute values, you can use unquoted syntax to pass a function or value reference directly instead of executing it. This is especially useful for event handlers and component options.

```js
// Standard attributes - evaluated during render
<button class="${({ props }) => props.className}">Button</button>
<div id="${({ props }) => `item-${props.id}`}">Content</div>

// Boolean attributes
<input type="checkbox" checked="${({ props }) => props.isChecked}" />
<button disabled="${({ model }) => model.loading}">Submit</button>
// Returns false = attribute not rendered | Returns true = rendered without value

// Event handlers - QUOTED executes the function to get the handler
<button onClick="${({ props }) => props.onSave}">Save</button>
<input onChange="${function(e) { this.model.value = e.target.value; }}">

// Event handlers - UNQUOTED passes function reference directly
<button onClick=${handleClick}>Click</button>
<input onChange=${function() { this.handleChange(); }}>
```

**Component Tags**

When using `<${Component} />`, attributes become component options. These options follow the same interpolation rules:

- **Quoted**: Functions execute in the parent's render context, the result is passed to the child as an option
- **Unquoted**: Function references are passed directly to the child without execution

```js
const Parent = Component.create`
    <div>
        <!-- Quoted = execute in parent context, pass result to child -->
        <${Child} 
            title="${({ model }) => model.title}"
            onSave="${({ model }) => () => model.save()}"
        />
        
        <!-- Unquoted = pass function to child, child can execute it later -->
        <${Child}
            title=${({ model }) => model.title}
            onSave=${handleSave}
            onDelete=${function(id) { deleteItem(id); }}
        />
    </div>
`;

// Child receives options as props
const Child = Component.create`
    <button onClick="${({ props }) => props.onSave}">Save</button>
`;
```

### Component Recycling

Rasti recycles components during re-renders to preserve state and improve performance.

**How components are matched for recycling:**
- **Keyed components**: Recycled if a previous child with the same `key` exists (use for arrays)
- **Unkeyed components**: Recycled if they have the same type and position in the template or partial

**Rendering behavior:**
- **Recreation**: New component instance created (constructor runs) when no match is found
- **Recycling**: Same instance reused. Lifecycle: `onBeforeRecycle()` → props updated → `onRecycle()`

```js
// Keyed components: recycled by matching key (use for arrays)
${({ props }) => props.items.map(item => 
    partial`<${Item} key="${item.id}">${item.name}</${Item}>`
)}

// Unkeyed components: recycled by type and position
${({ props }) => props.showHeader ? 
    partial`<${Header} />` : null
}
```

### Using Partial

The [`partial`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.0.0/docs/api.md#module_component__partial) method creates sub-templates that preserve DOM structure for efficient recycling.

```js
const MyComponent = Component.create`
    <div>
        ${(self) => self.renderContent()}
    </div>
`.extend({
    // Use this.partial within component methods
    renderContent() {
        return this.partial`
            <header>
                <${Title}>My Title</${Title}>
            </header>
            <main>
                ${this.props.items.map(item => 
                    this.partial`<${Item} key="${item.id}">${item.name}</${Item}>`
                )}
            </main>
        `;
    }
});

// In template interpolations, use destructured `partial` for inline sub-templates
const Container = Component.create`
    <div>
        ${({ props, partial }) => props.showHeader ? partial`
            <header>
                <h1>${props.title}</h1>
            </header>
        ` : null}
    </div>
`;
```

### Rendering Raw HTML

Use only when absolutely necessary and the HTML is safe:

```js
${({ props }) => Component.markAsSafeHTML(props.trustedHTML)}
// ⚠️ Only use with trusted, sanitized HTML
```

**Related:** [`Component.markAsSafeHTML`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.0.0/docs/api.md#module_component_markassafehtml)

### Lifecycle Hooks

Components have a complete lifecycle with hooks for different stages:

```js
const MyComponent = Component.create`...`.extend({
    onCreate(...args) {
        // Called at end of constructor, before any render
        // Receives the same arguments passed to the constructor
        // Executes both on client and server
        // Use for: initializing state, subscribing to external events
        this.destroyQueue.push(
            this.options.externalModel.on('change', this.onModelChange.bind(this))
        );
    },
    
    onHydrate() {
        // Called after the first render in the DOM
        // Does NOT run during server-side rendering
        // Use for: setup that requires the component to be present in the DOM,
        // making API requests, setting up browser-specific functionality
    },
    
    onChange(model, changed, ...args) {
        // Called when subscribed model/state/props emit 'change' event
        // By default calls render() - override for conditional rendering
        // Use for: conditional rendering based on specific changes
        if ('relevantKey' in changed) this.render();
    },
    
    onBeforeUpdate() {
        // Called at the beginning of render() when this.el is present (update render)
        // Only executes during updates, not during the initial render
        // Use for: saving previous state or preparing for the update
    },
    
    onUpdate() {
        // Called after component re-renders (after onChange triggers render)
        // Use for: DOM operations after update
    },
    
    onBeforeRecycle() {
        // Called when the component is about to be recycled (reused between renders)
        // Called at the beginning of the recycle method, before any recycling operations occur
        // Use for: storing previous state or preparing for the recycling
    },
    
    onRecycle() {
        // Called when the component is recycled (reused with the same key or position and type)
        // Called after props are updated
        // Use for: operations after component is recycled and props are updated
    },
    
    onDestroy(...args) {
        // Called when component is destroyed
        // Receives options object or any arguments passed to destroy method
        // Note: destroyQueue is automatically cleaned, subscriptions are auto-removed
        // Use for: custom cleanup logic
    }
});
```

**Lifecycle Flow:**
1. **Creation**: `onCreate()` - called at end of constructor
2. **First Render**: `onHydrate()` - called after first render in DOM
3. **Updates**: `onBeforeUpdate()` → render → `onUpdate()` - called on subsequent renders
4. **Recycling**: `onBeforeRecycle()` → props update → `onRecycle()` - called when component is reused
5. **Destruction**: `onDestroy()` - called when component is destroyed

**Related API:**
- [`component.onCreate`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.0.0/docs/api.md#module_component__oncreate)
- [`component.onChange`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.0.0/docs/api.md#module_component__onchange)
- [`component.onHydrate`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.0.0/docs/api.md#module_component__onhydrate)
- [`component.onBeforeUpdate`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.0.0/docs/api.md#module_component__onbeforeupdate)
- [`component.onUpdate`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.0.0/docs/api.md#module_component__onupdate)
- [`component.onBeforeRecycle`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.0.0/docs/api.md#module_component__onbeforerecycle)
- [`component.onRecycle`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.0.0/docs/api.md#module_component__onrecycle)
- [`component.onDestroy`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.0.0/docs/api.md#module_component__ondestroy)

### Model Integration

Components automatically subscribe to `this.model`, `this.state`, and `this.props` if they exist. Changes trigger `onChange()` which by default calls `render()`.

```js
const model = new Model({ count : 0 });

const Counter = Component.create`
    <div>
        <span>${({ model }) => model.count}</span>
        <button onClick=${function() { this.model.count++; }}>+</button>
    </div>
`;

// Auto-subscribes to model changes and calls onChange()
Counter.mount({ model }, document.body);
```

**Manual subscriptions for additional models:**

```js
const Dashboard = Component.create`...`.extend({
    onHydrate() {
        // Runs when first hydrated (after component is in the DOM, does NOT run server-side)
        
        // Subscribe to external model's 'change' event → calls onChange()
        this.subscribe(this.props.externalModel);
        
        // Subscribe to custom events → calls specific handler
        this.listenTo(this.props.externalModel, 'custom_event', this.onExternalCustomEvent);
        
        // Both are auto-cleaned on destroy
    },
    
    onExternalCustomEvent(model) {
        // Custom event handler
        this.render();
    }
});
```

**Related API:**
- [`component.subscribe`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.0.0/docs/api.md#module_component__subscribe) - Subscribe to model 'change' events
- [`Emitter.listenTo`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.0.0/docs/api.md#module_emitter__listento) - Subscribe to custom events
- [`Model`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.0.0/docs/api.md#module_model) - Data model class

### Rendering

The [`render()`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.0.0/docs/api.md#module_component__render) method handles both initial render and updates:

**First render (when `this.el` is not present):**
- Renders component as string inside a `DocumentFragment` and hydrates it
- Makes `this.el` available (the root DOM element)
- Calls `onHydrate()` lifecycle method
- Typically handled by `Component.mount()` automatically

**Update render (when `this.el` is present):**
- Updates only attributes of root element and child elements
- Updates only content of interpolations (dynamic parts)
- For container components, updates the single interpolation
- Calls `onBeforeUpdate()` at the beginning, `onUpdate()` at the end
- Typically called from default `onChange()` lifecycle method that is triggered by model changes

**Child component handling:**
- Components can be recreated (new instance, constructor runs) or recycled (same instance, props updated)
- Recycled components call `onBeforeRecycle()` then `onRecycle()` after props update

---

## ⚠️ Rasti Best Practices

### Component Structure
- Use `Component.create` with valid, semantic HTML
- Use `props.renderChildren()` for rendering child content
- Use `partial` for creating subcomponents and sub-templates
- Use Component tags `<${Component} />` for rendering child components instead of using `Component.mount()`
- Return `null` in interpolations when nothing should render
- Use `key` attribute when rendering arrays to enable proper component recycling
- Document all components and methods with JSDoc

### Event Management
- Use `this.subscribe()` for subscribing to model 'change' events
- Use `this.listenTo()` for subscribing to custom events
- Use `this.destroyQueue` for managing custom subscriptions that need manual cleanup

### Lifecycle Usage
- Subscribe to external models in `onHydrate()` (runs after component is in the DOM)
- Perform DOM operations in `onHydrate()` (runs after hydration in the DOM)
- Use `onBeforeUpdate()` to save previous state before updates
- Use `onUpdate()` for DOM operations after component updates
- Use `onBeforeRecycle()` to prepare for component recycling
- Use `onRecycle()` for operations after component is recycled and props are updated
- Clean up resources in `onDestroy()`

### Performance
- Use `key` attributes for list items to enable efficient recycling when using arrays of components
- Avoid unnecessary re-renders by conditionally calling `render()` in `onChange()`

---

## Additional Resources

- **Full API Documentation**: [api.md](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.0.0/docs/api.md)
- **GitHub Repository**: [8tentaculos/rasti](https://github.com/8tentaculos/rasti)
- **Examples**: Check the `example/` folder in the repository
