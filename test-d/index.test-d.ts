import { expectType, expectError } from 'tsd';
import {
    Emitter,
    Model,
    View,
    Component,
    EventHandler,
    RenderExpression,
    ModelAttrs,
    ComponentProps,
    ComponentState,
    ComponentModel,
    ComponentPartial,
    Resolvable,
} from '../types/index.js';

/*
 * Emitter: typed events via the event map
 */
type Events = {
    greet: (name: string) => void;
    count: (n: number, meta: { source: string }) => void;
};

const e = new Emitter<Events>();

expectType<() => void>(e.on('greet', (name) => expectType<string>(name)));
e.emit('greet', 'Alice');
e.emit('count', 1, { source: 'test' });

expectError(e.on('greet', (name: number) => {}));
expectError(e.emit('unknown'));
expectError(e.emit('greet', 123));

const any = new Emitter();
any.on('whatever', (...args: any[]) => {});
any.emit('whatever', 1, 2, 3);

expectType<Array<{ emitter: Emitter<any>; type: string; listener: (...args: any[]) => void }> | undefined>(any.listeningTo);

// `listenTo` / `listenToOnce` / `stopListening` are typed against the target emitter's event map
const listener = new Emitter<Events>();
const source = new Emitter<Events>();
listener.listenTo(source, 'greet', (name) => expectType<string>(name));
listener.listenToOnce(source, 'count', (n, meta) => {
    expectType<number>(n);
    expectType<{ source: string }>(meta);
});
listener.stopListening(source, 'greet');
listener.stopListening(source);
listener.stopListening();
expectError(listener.listenTo(source, 'greet', (name: number) => {}));

/*
 * Model: typed attributes, get/set, change events and defaults
 */
interface UserAttrs {
    name: string;
    age: number;
}

const u = new Model<UserAttrs>({ name: 'Alice', age: 30 });

expectType<UserAttrs>(u.attributes);

// The constructor writes `attributes`, so a getter throws when it is assigned. The accessor
// form is rejected (TS2611), unlike on `defaults`, which is only read
class GetterAttributes extends Model<UserAttrs> {
    // @ts-expect-error
    get attributes() { return { name: '', age: 0 }; }
}
new GetterAttributes();
expectType<Partial<UserAttrs>>(u.previous);
expectType<string>(u.get('name'));
expectType<number>(u.get('age'));

const chained: Model<UserAttrs> = u.set('name', 'Bob');
expectType<Model<UserAttrs>>(chained);
u.set({ name: 'Bob', age: 40 });

expectError(u.set({ name: 123 }));

// `change:<key>` events typed
u.on('change:name', (m, value) => expectType<string>(value));
u.on('change:age', (m, value) => expectType<number>(value));

// `listenTo` against a Model infers the synthesized `change` / `change:<key>` events
const u2 = new Model<UserAttrs>({ name: 'x', age: 0 });
u.listenTo(u2, 'change', (m, changed) => expectType<Partial<UserAttrs>>(changed));
u.listenTo(u2, 'change:name', (m, value) => expectType<string>(value));
u.stopListening(u2, 'change');

// `defaults` takes an object or a function, on the prototype or in `preinitialize`
class WithObjectDefaults extends Model<UserAttrs> {
    preinitialize() {
        this.defaults = { name: '', age: 0 };
    }
}
new WithObjectDefaults();

class WithFnDefaults extends Model<UserAttrs> {
    preinitialize() {
        this.defaults = () => ({ name: '', age: 0 });
    }
}
new WithFnDefaults();

WithObjectDefaults.prototype.defaults = { name: '', age: 0 };
WithObjectDefaults.prototype.defaults = () => ({ name: '', age: 0 });

// A method in the class body does not compile, since the member is declared as a value or
// a function (TS2425). `expectError` does not cover that code, so the directive asserts it
class WithMethodDefaults extends Model<UserAttrs> {
    // @ts-expect-error
    defaults() { return { name: '', age: 0 }; }
}
new WithMethodDefaults();

// A getter lives on the prototype, so it is in place when the constructor reads the member
class WithGetterDefaults extends Model<UserAttrs> {
    override get defaults() { return { name: '', age: 0 }; }
}
new WithGetterDefaults();

/*
 * View: model, root element and merged options
 */
const v = new View<Model<UserAttrs>>({ model: new Model<UserAttrs>({ name: 'Alice', age: 1 }) });
// `model` is optional
expectType<Model<UserAttrs> | undefined>(v.model);

// `el` reads as the element `ensureElement` resolved it to. The function form is carried by
// the option, which is where the runtime resolves it from
expectType<HTMLElement>(v.el);
new View({ el: () => document.createElement('section') });
class ElOnPrototype extends View {}
ElOnPrototype.prototype.el = document.createElement('section');

// `ensureElement` writes `el`, so the accessor form is rejected here too (TS2611)
class GetterEl extends View {
    // @ts-expect-error
    get el() { return document.createElement('section'); }
}
new GetterEl();

expectType<Array<() => void>>(v.destroyQueue);
v.destroyQueue.push(() => {});

// `tag`, `attributes` and `events` take a value or a function returning one
expectType<Resolvable<Record<string, any>> | undefined>(v.attributes);
expectType<Resolvable<string> | undefined>(v.tag);
expectType<Resolvable<Record<string, string | Function>> | undefined>(v.events);

// Either form, on the prototype or in `preinitialize`
class DynamicView extends View<Model<UserAttrs>> {
    preinitialize() {
        this.tag = 'section';
        this.attributes = () => ({ class: 'dynamic' });
        this.events = () => ({ [`click .${this.model!.get('name')}`]: 'onClick' });
    }
    onClick() {}
}
new DynamicView();

DynamicView.prototype.tag = 'section';
DynamicView.prototype.tag = () => 'section';
DynamicView.prototype.attributes = { class: 'dynamic' };
DynamicView.prototype.attributes = () => ({ class: 'dynamic' });
DynamicView.prototype.events = { click: 'onRootClick' };
DynamicView.prototype.events = function() { return { click: 'onRootClick' }; };

// The getter form, for the same reason it works on a model's `defaults`
class GetterView extends View<Model<UserAttrs>> {
    override get tag() { return 'section'; }
    override get attributes() { return { class: 'dynamic' }; }
    override get events() { return { 'click .ok': 'onOk' }; }
    onOk() {}
}
new GetterView();

// Narrowing through a merged interface leaves the getter available to further subclasses,
// which redeclaring the member in the class body would not
class NarrowedView extends View {}
interface NarrowedView { events: { 'click .ok': string }; }
expectType<{ 'click .ok': string }>(new NarrowedView().events);

class NarrowedViewChild extends NarrowedView {
    override get events() { return { 'click .ok': 'onOk' }; }
    onOk() {}
}
new NarrowedViewChild();

// As with `defaults`, a method in the class body does not compile (TS2425)
class MethodAttributes extends View {
    // @ts-expect-error
    attributes() { return { class: 'dynamic' }; }
}
new MethodAttributes();

// A plain object still reaches the instance through the options
new View({ tag: 'section', attributes: { class: 'dynamic' }, events: { click: 'onRootClick' } });

// Rasti calls the option's function form with the view as `this`, so a `function` sees the
// instance. Arrows and plain values keep compiling
new View({ attributes: function() { return { 'data-uid': this.uid }; } });
new View({ tag: function() { return this.uid ? 'section' : 'div'; } });
new View({ template: function() { return this.uid; } });
new View({ onDestroy: function() { this.destroyChildren(); } });
new View({ attributes: () => ({ class: 'dynamic' }) });

// `$` / `$$` default to HTMLElement, mirror querySelector nullability, and are narrowable
expectType<HTMLElement | null>(v.$('div'));
expectType<HTMLInputElement | null>(v.$<HTMLInputElement>('input'));
expectType<NodeListOf<HTMLElement>>(v.$$('div'));
expectType<NodeListOf<HTMLInputElement>>(v.$$<HTMLInputElement>('input'));

// addChild preserves the child subtype; static uid is exposed for SSR
class SubView extends View {
    subMethod() {}
}
v.addChild(new SubView()).subMethod();
expectType<number>(View.uid);
expectType<boolean | undefined>(v.destroyed);

new View<Model<UserAttrs>>({
    model: new Model<UserAttrs>({ name: 'x', age: 0 }),
    tag: 'section',
    onDestroy: () => {},
});

expectError(new View<Model<UserAttrs>>({ model: 'not-a-model' }));

// `template` is declared as a method, so every authoring form typechecks
class TemplateAsMethod extends View<Model<UserAttrs>> {
    template(model: Model<UserAttrs>) { return `<h1>${model.get('name')}</h1>`; }
}
class TemplateAsField extends View<Model<UserAttrs>> {
    template = (model: Model<UserAttrs>) => `<h1>${model.get('name')}</h1>`;
}
class TemplateInPreinitialize extends View<Model<UserAttrs>> {
    preinitialize() { this.template = (model: Model<UserAttrs>) => `<h1>${model.get('name')}</h1>`; }
}
TemplateAsMethod.prototype.template = (model: Model<UserAttrs>) => `<h1>${model.get('name')}</h1>`;
new View<Model<UserAttrs>>({ template: (model: Model<UserAttrs>) => `<h1>${model.get('name')}</h1>` });
expectType<string>(new TemplateAsMethod().template(new Model<UserAttrs>({ name: 'x', age: 0 })));
void TemplateAsField; void TemplateInPreinitialize;

/*
 * Component: class extends pattern (props and state)
 */
interface CounterProps { initial: number; label: string; }
interface CounterState { count: number; }

class Counter extends Component<CounterProps, CounterState> {
    doStuff() {
        expectType<number>(this.props.initial);
        expectType<string>(this.props.label);
        expectType<number>(this.props.get('initial'));
    }
}

new Counter({ initial: 5, label: 'hello', tag: 'span', onDestroy: () => {} });
expectError(new Counter({ initial: 'not-a-number', label: 'x' }));

// `key` is merged from options onto the instance
expectType<string | undefined>(new Counter({ initial: 1, label: 'x', key: 'k' }).key);

// The exported name is also the instance type, as it is for a view or a model
const counterInstance: Component<CounterProps, CounterState> = new Counter({ initial: 1, label: 'x' });
expectType<number>(counterInstance.props.initial);

/*
 * Component.create<P, S, M>
 */
interface AppAttrs { todos: string[]; filter: string; }
class AppModel extends Model<AppAttrs> {}
interface AppModel extends AppAttrs {}

const App = Component.create<{}, any, AppModel>`<main></main>`;
const appInstance = App.mount({ model: new AppModel({ todos: [], filter: 'all' }) }, document.body);
expectType<AppModel | undefined>(appInstance.model);

interface HeaderProps { handleAddTodo: (title: string) => void; }
const Header = Component.create<HeaderProps>`<header></header>`;
new Header({ handleAddTodo: (t) => expectType<string>(t) });
expectError(new Header({ handleAddTodo: 'not-a-fn' }));

// Without generics the props are permissive (parity with JS), through `create` or a subclass
const Plain = Component.create`<div></div>`;
new Plain({ anything: 'goes', other: 123 });

class PlainClass extends Component {
    read() { return this.props.anything; }
}
new PlainClass({ anything: 'goes', other: 123 }).read();

// A component that receives inner content declares `renderChildren` in its props
class Card extends Component<{ title: string; renderChildren?: () => any }> {
    body() {
        return this.props.renderChildren?.();
    }
}
new Card({ title: 'x', renderChildren: () => 'hello' });
Card.mount({ title: 'x', renderChildren: () => 'hello' });

// Component.extend adds the object members to the instance type,
// types `this` inside its methods, and contextually types lifecycle overrides
const CounterExt = Counter.extend({
    extra() {
        expectType<number>(this.props.initial);
        return this.props.label;
    },
    onChange(model, changed) {
        expectType<object>(model);
        expectType<Record<string, any>>(changed);
    },
});
const counterExt = new CounterExt({ initial: 5, label: 'hello' });
expectType<string>(counterExt.extra());
expectType<ComponentPartial>(counterExt.partial`<div></div>`);
expectType<number>(counterExt.props.initial);
expectError(new CounterExt({ initial: 'not-a-number', label: 'x' }));

// mount() on an extended class returns the extended instance
const mountedExt = CounterExt.mount({ initial: 1, label: 'x' });
expectType<string>(mountedExt.extra());

// Chained extend and function form (receives parent prototype)
const CounterExt2 = CounterExt.extend((proto) => ({
    another() {
        expectType<string>(this.extra());
        void proto;
    },
}));
new CounterExt2({ initial: 1, label: 'x' }).another();

// create().extend() — the common pattern from the examples
const HeaderExt = Component.create<HeaderProps>`<header></header>`.extend({
    helper() {
        expectType<(title: string) => void>(this.props.handleAddTodo);
    },
});
new HeaderExt({ handleAddTodo: (t) => t }).helper();

// create() on a subclass returns that subclass, so its template can be typed with it
// and call its methods
class CounterBase extends Component<CounterProps, CounterState> {
    renderLabel() { return this.partial`<b>${this.props.label}</b>`; }
    increment() { this.state!.count++; }
}
const CounterView = CounterBase.create`
    <div onClick=${(function() { this.increment(); }) satisfies EventHandler<CounterBase, MouseEvent>}>
        ${((self) => self.renderLabel()) satisfies RenderExpression<CounterBase>}
    </div>
`;
const counterView = CounterView.mount({ initial: 1, label: 'x' });
expectType<ComponentPartial>(counterView.renderLabel());
expectError(CounterView.mount({ initial: 'not-a-number', label: 'x' }));

// Type arguments belong to `Component.create`. On a subclass the call is rejected:
// declare the props on the class and call `create` with none.
class IdBase extends Component<{ id: string }> {
    renderItems() { return this.props.id; }
}
const IdList = IdBase.create`<ul></ul>`;
expectType<string>(new IdList({ id: 'a' }).renderItems());
expectError(IdBase.create<{ items: string[] }>`<ul></ul>`);
expectError(new IdList({ items: ['a'] }));

// create() on an extended class keeps the members extend added
const HeaderAgain = HeaderExt.create`<header></header>`;
new HeaderAgain({ handleAddTodo: (t) => t }).helper();

// `events` builds the delegation of the template's handlers. An override goes on the
// prototype, and merging the inherited handlers needs a cast to its function form
class WithMergedEvents extends Component<CounterProps> {
    onOk() {}
}
WithMergedEvents.prototype.events = function() {
    const inherited = Component.prototype.events as () => Record<string, string | Function>;
    return Object.assign({}, inherited.call(this), { 'click .ok': 'onOk' });
};
new WithMergedEvents({ initial: 1, label: 'x' });

// From a getter, the inherited member is reachable through `super`
class WithSuperEvents extends Component<CounterProps> {
    override get events() {
        const inherited = super.events as () => Record<string, string | Function>;
        return Object.assign({}, inherited.call(this), { 'click .ok': 'onOk' });
    }
    onOk() {}
}
new WithSuperEvents({ initial: 1, label: 'x' });

// As on a view, a method in the class body does not compile (TS2425)
class WithEvents extends Component<CounterProps> {
    // @ts-expect-error
    events() { return { 'click .ok': 'onOk' }; }
    onOk() {}
}
new WithEvents({ initial: 1, label: 'x' });

// `extend` takes either form, since its members are added to the instance type
Component.extend({ events() { return { 'click .ok': 'onOk' }; }, onOk() {} });
Component.extend({ events: { 'click .ok': 'onOk' }, onOk() {} });

// A component reads `attributes` at render, so an arrow class field reaches it in time
class WithFieldAttributes extends Component<CounterProps> {
    attributes = () => ({ 'data-label': this.props.label });
}
new WithFieldAttributes({ initial: 1, label: 'x' });

// Lifecycle hooks passed as options are called with the component as `this`
Component.mount({ onCreate() { this.render(); }, onHydrate() { this.render(); } });
Component.mount({ onCreate: () => {} });

// So are the options inherited from `View`: `this` is the component, not a bare view.
// `this.props` is `P` and `this.state` is `S`.
new Counter({
    initial: 1,
    label: 'x',
    attributes() {
        expectType<string>(this.props.label);
        return { 'data-label': this.props.label };
    },
    events() { return { click: this.props.label }; },
    onCreate() {
        expectType<number>(this.props.initial);
        expectType<string>(this.props.label);
        // @ts-expect-error
        void this.props.lable;
    },
    onDestroy() { expectType<CounterState | undefined>(this.state); },
    tag() { return this.state ? 'section' : 'div'; },
});

// `template` is internal on a component: it holds the parsed structure, not a function
expectType<any>(new WithEvents({ initial: 1, label: 'x' }).template);

// The instance holds that structure because `ensureElement` writes it, so a getter is
// rejected (TS2611)
class GetterTemplate extends Component<CounterProps> {
    // @ts-expect-error
    get template() { return () => 'x'; }
}
new GetterTemplate({ initial: 1, label: 'x' });

/*
 * Helper types: EventHandler, RenderExpression, ModelAttrs, ComponentProps, ComponentState, ComponentModel
 */
const onClick: EventHandler<Counter, MouseEvent> = function(ev) {
    expectType<Counter>(this);
    expectType<MouseEvent>(ev);
};
void onClick;

const renderLabelArrow: RenderExpression<Counter> = ({ props }) => props.label;
const renderLabelFn: RenderExpression<Counter> = function() {
    expectType<Counter>(this);
    return this.props.label;
};
void renderLabelArrow;
void renderLabelFn;

const attrs: ModelAttrs<AppModel> = { todos: [] as string[], filter: 'all' };
expectType<AppAttrs>(attrs);

const props: ComponentProps<Counter> = { initial: 1, label: 'a' };
expectType<CounterProps>(props);

const state: ComponentState<Counter> = { count: 0 };
expectType<CounterState>(state);

class WithModel extends Component<{}, any, AppModel> {}
const model: ComponentModel<WithModel> = new AppModel({ todos: [], filter: 'all' });
expectType<AppModel>(model);

/*
 * Declaration merging: direct attribute access on a Model subclass
 */
class TodoAttrsModel extends Model<{ title: string; completed: boolean }> {}
interface TodoAttrsModel { title: string; completed: boolean; }
const todo = new TodoAttrsModel({ title: 'x', completed: false });
expectType<string>(todo.title);
todo.completed = true;
