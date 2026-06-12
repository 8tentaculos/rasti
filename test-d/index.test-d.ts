import { expectType, expectError } from 'tsd';
import {
    Emitter,
    Model,
    View,
    Component,
    EventHandler,
    RenderExpression,
    Attrs,
    Props,
    State,
    ComponentModel,
} from '../types/index.js';

// Emitter ---------------------------------------------------------------

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

// Model -----------------------------------------------------------------

interface UserAttrs {
    name: string;
    age: number;
}

const u = new Model<UserAttrs>({ name: 'Alice', age: 30 });

expectType<UserAttrs>(u.attributes);
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

// `defaults` accepts both runtime forms: a plain object, or a function returning the defaults
class WithObjectDefaults extends Model<UserAttrs> {
    defaults = { name: '', age: 0 };
}
new WithObjectDefaults();

class WithFnDefaults extends Model<UserAttrs> {
    defaults = () => ({ name: '', age: 0 });
}
new WithFnDefaults();

// Assigning on the prototype / inside preinitialize is allowed too
WithObjectDefaults.prototype.defaults = { name: '', age: 0 };

// View ------------------------------------------------------------------

const v = new View<Model<UserAttrs>>({ model: new Model<UserAttrs>({ name: 'Alice', age: 1 }) });
// `model` is optional
expectType<Model<UserAttrs> | undefined>(v.model);
expectType<HTMLElement>(v.el);

expectType<Array<() => void>>(v.destroyQueue);
v.destroyQueue.push(() => {});

// Merged view options are optional instance props
expectType<(Record<string, any> | (() => Record<string, any>)) | undefined>(v.attributes);
expectType<(string | (() => string)) | undefined>(v.tag);
expectType<(Record<string, string | Function> | (() => Record<string, string | Function>)) | undefined>(v.events);

// `$` / `$$` default to HTMLElement, mirror querySelector nullability, and are narrowable
expectType<HTMLElement | null>(v.$('div'));
expectType<HTMLInputElement | null>(v.$<HTMLInputElement>('input'));
expectType<NodeListOf<HTMLElement>>(v.$$('div'));
expectType<NodeListOf<HTMLInputElement>>(v.$$<HTMLInputElement>('input'));

new View<Model<UserAttrs>>({
    model: new Model<UserAttrs>({ name: 'x', age: 0 }),
    tag: 'section',
    onDestroy: () => {},
});

expectError(new View<Model<UserAttrs>>({ model: 'not-a-model' }));

// Component (class extends pattern) -------------------------------------

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

// Component.create<P, S, M> overload -----------------------------------

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

// `Component.create` without generics — permissive (parity with JS)
const Plain = Component.create`<div></div>`;
new Plain({ anything: 'goes', other: 123 });

// Component.extend preserves subclass identity
const CounterExt = Counter.extend({ extra() {} });
expectType<typeof Counter>(CounterExt);

// Helpers --------------------------------------------------------------

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

const attrs: Attrs<AppModel> = { todos: [] as string[], filter: 'all' };
expectType<AppAttrs>(attrs);

const props: Props<Counter> = { initial: 1, label: 'a' };
expectType<CounterProps>(props);

const state: State<Counter> = { count: 0 };
expectType<CounterState>(state);

class WithModel extends Component<{}, any, AppModel> {}
const model: ComponentModel<WithModel> = new AppModel({ todos: [], filter: 'all' });
expectType<AppModel>(model);

// Declaration merging pattern: direct attribute access on Model subclass

class TodoAttrsModel extends Model<{ title: string; completed: boolean }> {}
interface TodoAttrsModel { title: string; completed: boolean; }
const todo = new TodoAttrsModel({ title: 'x', completed: false });
expectType<string>(todo.title);
todo.completed = true;
