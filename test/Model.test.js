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
});
