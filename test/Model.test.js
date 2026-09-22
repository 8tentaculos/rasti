import { expect } from 'chai';
import Model from '../src/Model.js';

describe('Model', () => {
    describe('Basic functionality', () => {
        it('must exists', () => {
            expect(Model).to.exist;
        });

        it('must run preinitialize', (done) => {
            class MyModel extends Model {
                preinitialize() {
                    done();
                }
            }

            new MyModel();
        });
    });

    describe('Initialization', () => {
        it('must initialize with defaults', () => {
            class MyModel extends Model {}

            MyModel.prototype.defaults = { test : true };

            const m = new MyModel();
            expect(m.get('test')).to.be.true;
        });

        it('must initialize with defaults as function', () => {
            class MyModel extends Model {
                defaults() {
                    return { test : true };
                }
            }

            const m = new MyModel();
            expect(m.get('test')).to.be.true;
        });

        it('must initialize with attributes', () => {
            const m = new Model({ test : true });
            expect(m.get('test')).to.be.true;
        });
    });

    describe('Attribute handling', () => {
        it('must set and get attribute as key/value', () => {
            const m = new Model();
            m.set('test', true);
            expect(m.get('test')).to.be.true;
        });

        it('must set and get attribute as object', () => {
            const m = new Model();
            m.set({ test : true });
            expect(m.get('test')).to.be.true;
        });

        it('must set and get attribute using setter', () => {
            const m = new Model({ test : false });
            m.test = true;
            expect(m.test).to.be.true;
            expect(m.get('test')).to.be.true;
        });

        it('must set attribute and have previous value', () => {
            const m = new Model({ test : true });
            m.test = false;
            expect(m.previous.test).to.be.true;
        });
    });

    describe('Event emission', () => {
        it('must set attribute and emit change event', (done) => {
            const m = new Model();
            m.on('change:test', () => done());
            m.set({ test : true });
        });

        it('must set attribute using setter and emit change:attribute event', (done) => {
            let m = new Model({ test : false });
            m.on('change:test', () => done());
            m.test = true;
        });

        it('must set attribute using setter and emit change event', (done) => {
            let m = new Model({ test : false });
            m.on('change', () => done());
            m.test = true;
        });

        it('must set attribute using setter and emit change event passing arguments', (done) => {
            let m = new Model();

            m.on('change', (model, changed, extra) => {
                expect(extra).to.be.true;
                done();
            });

            m.set('test', true, true);
        });

        it('must emit nested changes with the correct arguments', (done) => {
            let m = new Model();

            let arg1 = {};
            let arg2 = {};
            let arg3 = {};

            m.on('change', (model, changed, arg) => {
                switch (model.get('test')) {
                case 1:
                    expect(arg).to.be.equal(arg1);
                    model.set('test', 2, arg2);
                    break;
                case 2:
                    expect(arg).to.be.equal(arg2);
                    model.set('test', 3, arg3);
                    break;
                case 3:
                    expect(arg).to.be.equal(arg3);
                    done();
                }
            });

            m.set('test', 1, arg1);
        });

        it('must emit nested change and change:attribute events in the correct order', (done) => {
            let m = new Model();

            m.on('change:test', (model, value) => {
                if (value < 3) model.set('test', value + 1);
            });

            m.on('change', (model, changed) => {
                expect(model.get('test')).to.be.equal(3);
                expect(changed.test).to.be.equal(3);
                done();
            });

            m.set('test', 1);
        });
    });

    describe('Utility methods', () => {
        it('must habe toJSON method', () => {
            const m = new Model({ test : true });
            expect(m.toJSON()).to.be.deep.equal({ test : true });
            expect(JSON.stringify(m)).to.be.equal('{"test":true}');
            expect(m.attributes).to.not.be.equal(m.toJSON());
        });

        it('must call parse method during construction', () => {
            class MyModel extends Model {
                parse(data) {
                    return Object.assign({}, data, { parsed : true });
                }
            }

            const m = new MyModel({ test : 'value' });
            expect(m.get('test')).to.equal('value');
            expect(m.get('parsed')).to.be.true;
        });

        it('must pass additional arguments to parse method', () => {
            class MyModel extends Model {
                parse(data, options) {
                    options = options || {};
                    if (options.uppercase) {
                        return Object.assign({}, data, { name : data.name && data.name.toUpperCase() });
                    }
                    return data;
                }
            }

            const m = new MyModel({ name : 'alice' }, { uppercase : true });
            expect(m.get('name')).to.equal('ALICE');
        });

        it('must use attributePrefix for generated properties', () => {
            class PrefixedModel extends Model {}
            PrefixedModel.attributePrefix = 'attr_';

            const m = new PrefixedModel({ name : 'Alice', age : 30 });
            // Prefixed properties should exist
            expect(m.attr_name).to.equal('Alice');
            expect(m.attr_age).to.equal(30);
            // Original property names should not exist
            expect(m.name).to.be.undefined;
            expect(m.age).to.be.undefined;
            // get/set should still work without prefix
            expect(m.get('name')).to.equal('Alice');
            m.set('name', 'Bob');
            expect(m.attr_name).to.equal('Bob');
        });

        it('must emit change events when using prefixed properties', (done) => {
            class PrefixedModel extends Model {}
            PrefixedModel.attributePrefix = 'test_';

            const m = new PrefixedModel({ value : 10 });

            m.on('change:value', (model, newValue) => {
                expect(newValue).to.equal(20);
                done();
            });

            m.test_value = 20;
        });
    });

    describe('Generated accessors', () => {
        it('must generate a subclass\'s accessors on the class, shared by its models', () => {
            class Todo extends Model {}

            const a = new Todo({ title : 'Write docs' });
            const b = new Todo({ title : 'Ship it' });

            // Generated once for the class, so no model carries one of its own.
            expect(Object.prototype.hasOwnProperty.call(a, 'title')).to.be.false;
            expect('title' in a).to.be.true;
            expect(a.title).to.equal('Write docs');
            expect(b.title).to.equal('Ship it');
        });

        it('must share them when `Model` is used directly too', () => {
            const a = new Model({ title : 'a' });
            const b = new Model({ title : 'b' });

            expect(Object.getPrototypeOf(a)).to.equal(Object.getPrototypeOf(b));
            expect(Object.prototype.hasOwnProperty.call(a, 'title')).to.be.false;
            expect(a.title).to.equal('a');
            expect(b.title).to.equal('b');
        });

        it('must give models of one class holding different attributes different prototypes', () => {
            class Todo extends Model {}

            const a = new Todo({ title : 'a' });
            const b = new Todo({ title : 'b', done : true });

            expect(Object.getPrototypeOf(a)).to.not.equal(Object.getPrototypeOf(b));
            expect(a.title).to.equal('a');
            expect(b.done).to.be.true;
        });

        it('must leave the class chain intact', () => {
            class Todo extends Model {}
            class Urgent extends Todo { shout() { return this.title.toUpperCase(); } }

            const urgent = new Urgent({ title : 'a' });

            expect(urgent).to.be.instanceOf(Urgent);
            expect(urgent).to.be.instanceOf(Todo);
            expect(urgent).to.be.instanceOf(Model);
            expect(urgent.constructor).to.equal(Urgent);
            expect(urgent.shout()).to.equal('A');
            expect(typeof urgent.toJSON).to.equal('function');
        });

        it('must share a key that only turns up in a later model', () => {
            class Todo extends Model {}

            const first = new Todo({ title : 'a' });
            const second = new Todo({ title : 'b', done : true });
            const third = new Todo({ title : 'c', done : false });

            expect(second.done).to.be.true;
            expect(third.done).to.be.false;
            expect(Object.prototype.hasOwnProperty.call(third, 'done')).to.be.false;
            // The one built before the key appeared reads it as the absent attribute it is.
            expect(first.done).to.be.undefined;
        });

        it('must keep the models of one class apart', () => {
            class Todo extends Model {}

            const a = new Todo({ title : 'a' });
            const b = new Todo({ title : 'b' });

            a.title = 'changed';
            expect(b.title).to.equal('b');
            expect(a.get('title')).to.equal('changed');
        });

        it('must emit change events through a generated accessor', (done) => {
            class Todo extends Model {}
            const todo = new Todo({ title : 'a' });

            todo.on('change:title', (model, value) => {
                expect(value).to.equal('b');
                done();
            });

            todo.title = 'b';
        });

        it('must apply attributePrefix', () => {
            class Todo extends Model {}
            Todo.attributePrefix = 'attr_';

            const todo = new Todo({ title : 'a' });

            expect(todo.attr_title).to.equal('a');
            expect(todo.title).to.be.undefined;
        });

        it('must keep a subclass\'s models off its parent\'s prototype', () => {
            class Todo extends Model {}
            class Urgent extends Todo {}

            const todo = new Todo({ title : 'a' });
            const urgent = new Urgent({ title : 'b' });

            // Same attributes, different classes: the chain below each one differs.
            expect(Object.getPrototypeOf(todo)).to.not.equal(Object.getPrototypeOf(urgent));
            expect(todo.title).to.equal('a');
            expect(urgent.title).to.equal('b');
        });

        it('must generate its own when a subclass names its properties differently', () => {
            class Todo extends Model {}
            class Prefixed extends Todo {}
            Prefixed.attributePrefix = 'attr_';

            new Todo({ title : 'a' });
            const prefixed = new Prefixed({ title : 'b' });

            expect(prefixed.attr_title).to.equal('b');
            expect(prefixed.title).to.be.undefined;
        });

        it('must leave a field the constructor wrote alone', () => {
            const warn = console.warn;
            console.warn = () => {};
            class Todo extends Model {}

            // An accessor named after `attributes` would catch the next model's
            // `this.attributes = ...` in its setter and never return.
            const first = new Todo({ attributes : 1, title : 'a' });
            const second = new Todo({ attributes : 2, title : 'b' });
            console.warn = warn;

            expect(first.attributes).to.be.an('object');
            expect(first.get('attributes')).to.equal(1);
            expect(second.get('attributes')).to.equal(2);
            expect(second.title).to.equal('b');
        });

        it('must let an override generate the properties on each model', () => {
            class ReadOnly extends Model {
                defineAttribute(key) {
                    Object.defineProperty(this, `ro_${key}`, { get() { return this.get(key); } });
                }
            }

            const a = new ReadOnly({ title : 'a' });
            const b = new ReadOnly({ title : 'b' });

            expect(a.ro_title).to.equal('a');
            expect(b.ro_title).to.equal('b');
            expect(a.title).to.be.undefined;
        });
    });
});
