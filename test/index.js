import { expect } from 'chai';
import * as Rasti from '../src/index';
import Emitter from '../src/Emitter';
import Model from '../src/Model';
import View from '../src/View';
import Component from '../src/Component';

describe('Rasti', () => {

    it('must exists', () => {
        expect(Rasti).to.exist;
    });

    describe('Emitter', () => {

        it('should exists', () => {
            expect(Emitter).to.exist;
        });

        it('should instantiate', () => {
            const e = new Emitter();

            expect(e).to.exist;
            expect(e).to.be.an.instanceof(Emitter);
        });

        it('should add listener', () => {
            const e = new Emitter();

            const l1 = () => {};
            const l2 = () => {};
            const l3 = () => {};
            const l4 = () => {};

            // Add listeners for two events and check listeners object.
            e.on('myEventA', l1);
            e.on('myEventA', l2);
            e.on('myEventB', l3);
            e.on('myEventB', l4);

            // Check listeners for myEventA.
            expect(e.listeners).to.exist;
            expect(e.listeners['myEventA']).to.exist;
            expect(e.listeners['myEventA'][0]).to.be.a('function');
            expect(e.listeners['myEventA'][0]).to.be.equal(l1);
            expect(e.listeners['myEventA'][1]).to.be.a('function');
            expect(e.listeners['myEventA'][1]).to.be.equal(l2);

            // Check listeners for myEventB.
            expect(e.listeners['myEventB']).to.include(l3);
            expect(e.listeners['myEventB']).to.include(l4);
        });

        it('should emit event', (done) => {
            const e = new Emitter();

            e.on('myEvent', done);

            e.emit('myEvent');
        });

        it('should stop listening', () => {
            const e = new Emitter();

            const l1 = () => {};
            const l2 = () => {};
            const l3 = () => {};
            const l4 = () => {};

            e.on('myEventA', l1);
            e.on('myEventA', l2);
            e.on('myEventB', l3);
            e.on('myEventB', l4);

            // Remove l1 listener from myEventA.
            e.off('myEventA', l1);

            expect(e.listeners['myEventA']).to.have.lengthOf(1);
            expect(e.listeners['myEventA'][0]).to.be.equal(l2);

            // Remove all listeners from myEventB.
            e.off('myEventB');

            expect(e.listeners['myEventB']).to.not.be.ok;

            // Remove all listeners
            e.off();

            expect(e.listeners).to.be.empty;
        });

        it('should emit once', () => {
            const e = new Emitter();
            let count = 0;

            e.once('myEvent', () => { count++; });

            // Emit event 2 times. Remember that default events are sync.
            e.emit('myEvent');
            e.emit('myEvent');

            expect(count).to.be.equal(1);
        });
    });

    describe('Model', () => {
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
        });

        it('must set attribute and emit change event', (done) => {
            const m = new Model();
            m.on('change:test', () => done());
            m.set({ test : true });
            m.set({ test : false });
        });

        it('must set attribute using setter and emit change event', (done) => {
            const m = new Model({ test : true });
            m.on('change:test', () => done());
            m.test = false;
        });

        it('must set attribute and have previous value', () => {
            const m = new Model({ test : true });
            m.test = false;
            expect(m.previous.test).to.be.true;
        });
    });

    describe('View', () => {
        beforeEach(() => document.body.innerHTML = '');

        it('must exists', () => {
            expect(View).to.exist;
        });

        it('must run preinitialize', (done) => {
            class MyView extends View {
                preinitialize() {
                    done();
                }
            }

            new MyView();
        });

        it('must have element', () => {
            const v = new View();
            expect(v.el).to.exist;
            v.destroy();
        });

        it('must call onDestroy', (done) => {
            const v = new View({ onDestroy : done });
            v.destroy();
        });

        it('must addChild', () => {
            const v = new View();
            const c = v.addChild(new View());
            expect(c).to.equal(v.children[0]);
        });

        it('must call onDestroy on children', (done) => {
            const v = new View();
            v.addChild(new View({ onDestroy : done }));
            v.destroyChildren();
        });

        it('must have unique uid', () => {
            class MyView extends View {}

            const v1 = new View();
            const v2 = new MyView();
            const v3 = new View();

            expect(v1.uid).not.to.be.equal(v2.uid);
            expect(v2.uid).not.to.be.equal(v3.uid);
        });
        
        it('must delegate events', (done) => {
            class MyView extends View {}

            MyView.prototype.template = () => '<section><button>click me</button></section>';

            MyView.prototype.events = {
                'click section button' : () => done()
            };
            
            const v = new MyView();

            document.body.appendChild(v.render().el);

            v.$('section button').dispatchEvent(
                new MouseEvent('click', { bubbles: true })
            );
        });

        it('must undelegate and delegate events', (done) => {
            class MyView extends View {}

            MyView.prototype.template = () => '<section><button>click me</button></section>';

            MyView.prototype.events = {
                'click section button' : () => done(new Error('Failed undelegating event listener'))
            };
            
            const v = new MyView();

            document.body.appendChild(
                v.delegateEvents({
                    'click section button' : () => done()
                }).render().el
            );

            v.$('section button').dispatchEvent(
                new MouseEvent('click', { bubbles: true })
            );
        });

        it('must delegate events on root element', (done) => {
            class MyView extends View {}

            MyView.prototype.template = () => '<section><button>click me</button></section>';

            MyView.prototype.events = {
                'click' : () => done()
            };
            
            let v = new MyView();

            document.body.appendChild(v.render().el);

            v.$('section button').dispatchEvent(
                new MouseEvent('click', { bubbles: true })
            );
        });

    });

    describe('Component', () => {
        beforeEach(() => document.body.innerHTML = '');

        it('must exists', () => {
            expect(Component).to.exist;
        });

        it('must mount on dom', () => {
            Component.create`<div id="test-node"></div>`.mount({}, document.body);
            expect(document.getElementById('test-node')).to.exist;
        });

        it('must be created with a self enclosed tag', () => {
            Component.create`<input id="test-node" type="text" />`.mount({}, document.body);
            expect(document.getElementById('test-node')).to.exist;
        });

        it('must mount outside document', () => {
            const el = document.createElement('div');
            expect(el.childNodes.length).to.be.equal(0);
            Component.create`<div></div>`.mount({}, el);

            expect(el.childNodes.length).to.be.equal(1);
        });

        it('must mount child component', () => {
            const Button = Component.create`<button>click me</button>`;
            const Main = Component.create`<div id="test-node">${() => Button.mount()}</div>`;

            const c = Main.mount({}, document.body);

            expect(document.querySelector('button')).to.be.equal(c.children[0].el);
        });

        it('must re render on model change', () => {
            const c = Component.create`<div id="test-node">${({ model }) => model.count}</div>`.mount({
                model : new Model({ count : 0 }),
            }, document.body);

            expect(document.getElementById('test-node').innerHTML).to.be.equal('0');

            c.model.count = 1;

            expect(document.getElementById('test-node').innerHTML).to.be.equal('1');
        });

        it('must parse attributes', () => {
            const c = Component.create`
                <input
                    id="test-node"
                    class="test-class-1 test-class-2"
                    type="text"
                    readonly
                    disabled="${({ model }) => model.disabled}"
                />
            `.mount({ model : new Model({ disabled : false }) }, document.body);

            const el = document.getElementById('test-node');

            expect(el.className).to.be.equal('test-class-1 test-class-2');
            expect(el.hasAttribute('readonly')).to.be.true;
            expect(el.disabled).to.be.false;

            c.render();

            expect(c.attributes.readonly).to.be.true;

            expect(el.className).to.be.equal('test-class-1 test-class-2');
            expect(el.hasAttribute('readonly')).to.be.true;
            expect(el.disabled).to.be.false;
        });

        it('must re render and change attributes', () => {
            const c = Component.create`
                <input
                    id="test-node"
                    type="text"
                    disabled="${({ model }) => model.disabled}"
                />
            `.mount({ model : new Model({ disabled : false }) }, document.body);

            expect(document.getElementById('test-node').disabled).to.be.false;

            c.model.disabled = true;

            expect(document.getElementById('test-node').disabled).to.be.true;
        });

        it('must re render and destroy children', () => {
            const Button = Component.create`<button>click me</button>`;
            const Main = Component.create`<div id="test-node">${() => Button.mount()}</div>`;

            const c = Main.mount({ model : new Model({ count : 0 }) }, document.body);

            const child = c.children[0];

            c.model.count = 1;

            expect(c.children[0]).not.to.be.equal(child);
        });

        it('must re render and recycle children', () => {
            const Button = Component.create`<button>click me</button>`;
            const Main = Component.create`<div id="test-node">${() => Button.mount({ key : 'btn' })}</div>`;

            const c = Main.mount({ model: new Model({ count: 0 }) }, document.body);

            const child = c.children[0];

            c.model.count = 1;

            expect(c.children[0]).to.be.equal(child);
            expect(document.querySelector('button')).to.be.equal(child.el);
        });

        it('must hydrate existing dom', () => {
            View.uid = 0;

            document.body.innerHTML = '<div id="test-node"><button id="rasti-component-uid2">click me</button></div>';

            const Button = Component.create`<button>click me</button>`;
            const Main = Component.create`<div id="test-node">${() => Button.mount()}</div>`;

            const c = Main.mount({}, document.body, true);

            expect(document.querySelector('button')).to.be.equal(c.children[0].el);
        });

        it('must delegate events', (done) => {
            const c = Component.create`
                <section onClick=${{ 'button' : () => done() }}>
                    <button>click me</button>
                </section>
            `.mount({}, document.body);

            c.$('section button').dispatchEvent(
                new MouseEvent('click', { bubbles: true })
            );
        });

        it('must delegate events on root element', (done) => {
            const c = Component.create`
                <button onClick=${{ '&': () => done() }}>click me</button>
            `.mount({}, document.body);

            c.el.dispatchEvent(
                new MouseEvent('click', { bubbles: true })
            );
        });

        it('must be extended', () => {
            const c = Component.create`<div id="test-node"></div>`.extend({
                foo : function() {},
            }).mount();

            expect(c.foo).to.be.a('function');
        });

        it('must be extended twice', () => {
            const C1 = Component.create`<div id="test-node"></div>`.extend({
                foo : function () { },
            });

            const c2 = C1.extend({
                bar : function () { },
            }).mount();

            expect(c2.foo).to.be.a('function');
            expect(c2.bar).to.be.a('function');
        });

    });
});
