# Rasti Model API

Models hold application data. Components subscribe to `model`, `state` and `props`, which are all models, and re-render when they change.

## Model Creation

```js
import { Model } from 'rasti';

class AppModel extends Model {
    addTodo(attrs) {
        const todo = this.createTodo(attrs);
        this.todos = this.todos.concat(todo);
    }
    removeCompleted() {
        this.completed.forEach(todo => this.removeTodo(todo));
    }
}

AppModel.prototype.defaults = {
    todos: [],
    filter: 'all'
};
```

`defaults` may also be a function, or a getter, returning the object. An object assigned to the prototype is shared by every instance, and so is any array or object inside it: the example above stays safe only because it always assigns new arrays (see below). Return fresh values to give each instance its own:

```js
class AppModel extends Model {
    get defaults() {
        return { todos : [], filter : 'all' };
    }
}
```

**Related:** [`Model`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.2.1/docs/api.md#module_model)

## Attributes & Change Events

A model gets a getter/setter for every attribute it holds when it is constructed: the keys of `defaults` plus those of the data passed to the constructor (after `parse`). Setting a property emits `change` and `change:key`:

```js
model.count = 1; // emits 'change' and 'change:count'
model.set({ a: 1, b : 2 }); // batched, emits one 'change' with { a, b }

// Listen to any change
model.on('change', (model, changed) => console.log(changed));

// Listen to specific attribute
model.on('change:filter', (model, value) => console.log(value));
```

`model.previous` holds the attributes as they were before the current change, so a listener can compare against them.

**Declare every attribute in `defaults`.** A key that was not there at construction has no accessor: `model.foo = 1` writes a plain property and emits nothing. `model.set('foo', 1)` and `model.get('foo')` still work.

**Assign new values, don't mutate.** Changes are detected by identity (`!==`), so `model.todos.push(todo)` emits nothing. Assign a new array or object instead: `model.todos = model.todos.concat(todo)`.

**Attribute names that shadow a member.** An attribute named like a member of the model (`on`, `set`, `get`, `toJSON`, `attributes`, `previous`, …) hides it, and development builds warn. Rename the attribute, or prefix the generated properties:

```js
class Reminder extends Model {
    static attributePrefix = 'attr_';
}

const reminder = new Reminder({ on : 'monday' });
reminder.attr_on; // 'monday' — `reminder.on()` still subscribes
```

## Parsing & Serialization

`parse()` is called during construction to transform raw data (e.g. from localStorage or API):

```js
class AppModel extends Model {
    parse(data) {
        if (!data || !Object.keys(data).length) return {};
        return {
            todos : (data.todos || []).map(attrs => this.createTodo(attrs)),
            filter : data.filter
        };
    }
    toJSON() {
        return {
            todos : this.todos.map(t => t.toJSON()),
            filter : this.filter
        };
    }
}

// Persist to localStorage
model.on('change', () => {
    localStorage.setItem('todos', JSON.stringify(model));
});
```

## Inter-model Subscriptions

Use `listenTo` / `stopListening` to manage subscriptions between models:

```js
createTodo(attrs) {
    const todo = new TodoModel(attrs);
    // Listen to child model — bubbles change up
    this.listenTo(todo, 'change', (...args) => this.emit('change', ...args));
    return todo;
}

removeTodo(todo) {
    this.todos = this.todos.filter(t => t !== todo);
    this.stopListening(todo); // clean up listener
}
```

**Related:** [`Emitter.listenTo`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.2.1/docs/api.md#module_emitter__listento) · [`Emitter.stopListening`](https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v4.2.1/docs/api.md#module_emitter__stoplistening)
