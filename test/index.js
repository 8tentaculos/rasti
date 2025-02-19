import { expect } from 'chai';
import * as Rasti from '../src/index.js';
import Emitter from '../src/Emitter.js';
import Model from '../src/Model.js';
import View from '../src/View.js';
import Component from '../src/Component.js';

describe('Rasti', () => {

    it('must exists', () => {
        expect(Rasti).to.exist;
    });

    describe('Emitter', () => {
        it('must exists', () => {
            expect(Emitter).to.exist;
        });

        it('must instantiate', () => {
            const e = new Emitter();

            expect(e).to.exist;
            expect(e).to.be.an.instanceof(Emitter);
        });

        it('must add listener', () => {
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

        it('must emit event', (done) => {
            const e = new Emitter();

            e.on('myEvent', done);

            e.emit('myEvent');
        });

        it('must stop listening', () => {
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
            expect(e.listeners['myEventB']).to.not.exist;

            // Remove all listeners.
            e.off();
            expect(e.listeners).to.not.exist;
        });

        it('must emit once', () => {
            const e = new Emitter();
            let count = 0;

            e.once('myEvent', () => { count++; });

            // Emit event 2 times.
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

        it('must set attribute and have previous value', () => {
            const m = new Model({ test : true });
            m.test = false;
            expect(m.previous.test).to.be.true;
        });

        it('must habe toJSON method', () => {
            const m = new Model({ test : true });
            expect(m.toJSON()).to.be.deep.equal({ test : true });
            expect(JSON.stringify(m)).to.be.equal('{"test":true}');
            expect(m.attributes).to.not.be.equal(m.toJSON());
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
        });

        it('must create element with tag name', () => {
            const v = new View({ tag : 'section' });
            expect(v.el.tagName.toLowerCase()).to.be.equal('section');
        });

        it('must create element with attributes', () => {
            const v = new View({ attributes : { id : 'test-node' } });
            expect(v.el.id).to.be.equal('test-node');
        });

        it('must create element with tag as function', () => {
            const v = new View({ tag : () => 'section' });
            expect(v.el.tagName.toLowerCase()).to.be.equal('section');
        });

        it('must create element with attributes as function', () => {
            const v = new View({ attributes : () => ({ id : 'test-node' }) });
            expect(v.el.id).to.be.equal('test-node');
        });

        it('must provide element', () => {
            const el = document.createElement('div');
            const v = new View({ el });
            expect(v.el).to.be.equal(el);
        });

        it('must provide element as function', () => {
            const el = document.createElement('div');
            const v = new View({ el : () => el });
            expect(v.el).to.be.equal(el);
        });

        it('must call onDestroy', (done) => {
            const v = new View({ onDestroy : done });
            v.destroy();
        });

        it('must be destroyed and removed from dom', () => {
            const v = new View({ attributes : { id : 'test-node' } });
            document.body.appendChild(v.render().el);
            expect(document.getElementById('test-node')).to.exist;
            v.destroy().removeElement();
            expect(document.getElementById('test-node')).to.not.exist;
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

        it('must return this from chainable methods', () => {
            const v = new View();

            document.body.appendChild(v.render().el);

            expect(v.render()).to.be.equal(v);
            expect(v.delegateEvents()).to.be.equal(v);
            expect(v.undelegateEvents()).to.be.equal(v);
            expect(v.destroy()).to.be.equal(v);
            expect(v.removeElement()).to.be.equal(v);
        });
    });

    describe('Component', () => {
        beforeEach(() => {
            document.body.innerHTML = '';
            View.uid = 0;
        });

        it('must exists', () => {
            expect(Component).to.exist;
        });

        it('must mount on dom', () => {
            Component.create`<div id="test-node"></div>`.mount({}, document.body);
            expect(document.getElementById('test-node')).to.exist;
        });

        it('must be created with a self enclosed tag', () => {
            const c = Component.create`<input id="test-node" type="text" />`.mount({}, document.body);
            expect(c.toString()).to.be.equal(`<input ${Component.DATA_ATTRIBUTE_UID}="uid1" id="test-node" type="text" />`);
            expect(document.getElementById('test-node')).to.exist;
        });

        it('must be created with a function tag', () => {
            const c = Component.create`<${() => 'div'} id="test-node"><span></span></${() => 'div'}>`.mount({}, document.body);
            expect(c.toString()).to.be.equal(`<div ${Component.DATA_ATTRIBUTE_UID}="uid1" id="test-node"><span></span></div>`);
            expect(document.getElementById('test-node')).to.exist;
        });

        it('must be created with a function tag with self enclosed tag', () => {
            const c = Component.create`<${() => 'input'} id="test-node" type="text" />`.mount({}, document.body);
            expect(c.toString()).to.be.equal(`<input ${Component.DATA_ATTRIBUTE_UID}="uid1" id="test-node" type="text" />`);
            expect(document.getElementById('test-node')).to.exist;
        });

        it('must support header tags', () => {
            Component.create`<h1 id="test-node"></h1>`.mount({}, document.body);
            expect(document.getElementById('test-node')).to.exist;
        });

        it('must be instantiated with new', () => {
            const c = new Component();
            expect(c.render().el.tagName.toLowerCase()).to.be.equal('div');
        });

        it('must be instantiated with new on existing element', () => {
            document.body.innerHTML = '<div id="test-node"></div>';
            const c = new Component({ el : document.getElementById('test-node') });
            expect(c.render().el.id).to.be.equal('test-node');
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

        it('must mount child component using tag component', () => {
            const Button = Component.create`<button>click me</button>`;
            const Main = Component.create`
                <div id="test-node">
                    <${Button} color="primary" disabled=${() => true} />
                    <${Button} color="secondary" disabled=${() => false} />
                </div>`;

            const c = Main.mount({}, document.body);

            expect(c.children[0].options.color).to.be.equal('primary');
            expect(c.children[0].options.disabled).to.be.true;
            expect(document.querySelector('button')).to.be.equal(c.children[0].el);

            expect(c.children[1].options.color).to.be.equal('secondary');
            expect(c.children[1].options.disabled).to.be.false;
            expect(document.querySelectorAll('button')[1]).to.be.equal(c.children[1].el);
        });

        it('must mount child component using tag component with children', () => {
            const Button = Component.create`<button>${({ options }) => options.renderChildren()}</button>`;

            const Main = Component.create`
                <div id="test-node">
                    <${Button} color="primary">${() => 'click me'}</${Button}>
                </div>`;

            const c = Main.mount({}, document.body);

            expect(c.children[0].options.color).to.be.equal('primary');
            expect(document.querySelector('button').innerHTML).to.be.equal('click me');
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
                    data-custom="my-data"
                />
            `.mount({ model : new Model({ disabled : false }) }, document.body);

            const el = document.getElementById('test-node');

            expect(el.className).to.be.equal('test-class-1 test-class-2');
            expect(el.hasAttribute('readonly')).to.be.true;
            expect(el.disabled).to.be.false;
            expect(el.getAttribute('data-custom')).to.be.equal('my-data');

            c.render();

            expect(el.className).to.be.equal('test-class-1 test-class-2');
            expect(el.hasAttribute('readonly')).to.be.true;
            expect(el.disabled).to.be.false;
            expect(el.getAttribute('data-custom')).to.be.equal('my-data');
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

        it('must render true and false attributes', () => {
            expect(
                Component.create`<input id="test-node" disabled="${() => false}" />`.mount().toString()
            ).to.be.equal(`<input ${Component.DATA_ATTRIBUTE_UID}="uid1" id="test-node" />`);

            expect(
                Component.create`<input id="test-node" disabled="${() => true}" />`.mount().toString()
            ).to.be.equal(`<input ${Component.DATA_ATTRIBUTE_UID}="uid2" id="test-node" disabled />`);
        });

        it('must remove true and false placeholders', () => {
            expect(
                Component.create`<div id="test-node">${() => true}</div>`.mount().toString()
            ).to.be.equal(`<div ${Component.DATA_ATTRIBUTE_UID}="uid1" id="test-node"></div>`);

            expect(
                Component.create`<div id="test-node">${() => false}</div>`.mount().toString()
            ).to.be.equal(`<div ${Component.DATA_ATTRIBUTE_UID}="uid2" id="test-node"></div>`);
        });

        it('must re render and destroy children', () => {
            const Button = Component.create`<button>click me</button>`;
            const Main = Component.create`<div id="test-node">${() => Button.mount()}</div>`;

            const c = Main.mount({ model : new Model({ count : 0 }) }, document.body);

            const child = c.children[0];

            c.model.count = 1;

            expect(c.children[0]).not.to.be.equal(child);
        });

        it('must re render and recycle children with key', () => {
            const Button = Component.create`<button>click me</button>`;
            const Main = Component.create`<div id="test-node">${() => Button.mount({ key : 'btn' })}</div>`;

            const c = Main.mount({ model: new Model({ count: 0 }) }, document.body);

            const child = c.children[0];

            c.model.count = 1;

            expect(c.children[0]).to.be.equal(child);
            expect(document.querySelector('button')).to.be.equal(child.el);
        });

        it('must hydrate existing dom', () => {
            document.body.innerHTML = `<div ${Component.DATA_ATTRIBUTE_UID}="uid1"><button ${Component.DATA_ATTRIBUTE_UID}="uid2">click me</button></div>`;

            const Button = Component.create`<button>click me</button>`;
            const Main = Component.create`<div>${() => Button.mount()}</div>`;

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

        it('must return this from chainable methods', () => {
            const c = new Component();

            document.body.appendChild(c.render().el);

            expect(c.render()).to.be.equal(c);
            expect(c.delegateEvents()).to.be.equal(c);
            expect(c.undelegateEvents()).to.be.equal(c);
            expect(c.destroy()).to.be.equal(c);
            expect(c.removeElement()).to.be.equal(c);
        });

        it('must create container', () => {
            const Child = Component.create`<button>click me</button>`;
            const Container = Component.create`${() => Child.mount()}`;

            expect(Container).to.exist;

            const c = Container.mount({}, document.body);

            expect(document.querySelector('button')).to.exist;
            expect(c.el).to.be.equal(c.children[0].el);
            c.render();
            expect(document.querySelector('button')).to.exist;
            expect(c.el).to.be.equal(c.children[0].el);
        });

        it('must create nested container', () => {
            const Child = Component.create`<button>click me</button>`;
            const Container = Component.create`${() => Child.mount()}`;
            const Main = Component.create`${() => Container.mount()}`;

            const c = Main.mount({}, document.body);

            expect(document.querySelector('button')).to.exist;
            expect(c.el).to.be.equal(c.children[0].el);
            expect(c.el).to.be.equal(c.children[0].children[0].el);
            c.render();
            expect(document.querySelector('button')).to.exist;
            expect(c.el).to.be.equal(c.children[0].el);
            expect(c.el).to.be.equal(c.children[0].children[0].el);
        });

        it('must create container inside component', () => {
            const Child = Component.create`<button>click me</button>`;
            const Container = Component.create`${() => Child.mount()}`;
            const Main = Component.create`<div id="test-node">${() => Container.mount()}</div>`;

            const c = Main.mount({}, document.body);

            expect(document.querySelector('button')).to.exist;
            expect(c.children[0].el).to.be.equal(c.children[0].children[0].el);
            c.render();
            expect(document.querySelector('button')).to.exist;
            expect(c.children[0].el).to.be.equal(c.children[0].children[0].el);
        });

        it('must create container inside component with key', () => {
            const Button = Component.create`<button>click me</button>`;
            const Span = Component.create`<span>hello world</span>`;

            const ContainerButton = Component.create`${() => Button.mount()}`;
            const ContainerSpan = Component.create`${() => Span.mount({ key : 'span' })}`;

            const Main = Component.create`
                <div id="test-node">
                    ${() => [ContainerButton.mount({ key : 'btn' }), ContainerSpan.mount({ key : 'span' })]}
                </div>
            `;

            const c = Main.mount({}, document.body);

            const buttonEl = c.children[0].children[0].el;
            const spanEl = c.children[1].children[0].el;

            c.render();
            expect(document.querySelector('button')).to.be.equal(buttonEl);
            expect(document.querySelector('span')).to.be.equal(spanEl);
            c.children[0].render();
            c.children[1].render();
            expect(document.querySelector('button')).to.exist;
            expect(document.querySelector('span')).to.exist;
            expect(document.querySelector('button')).not.to.be.equal(buttonEl);
            expect(document.querySelector('span')).to.be.equal(spanEl);
        });

        it('must mount container using render', () => {
            const Child = Component.create`<button>click me</button>`;
            const Container = Component.create`${() => Child.mount()}`;


            expect(Container).to.exist;

            const c = new Container({});
            document.body.appendChild(c.render().el);

            expect(document.querySelector('button')).to.exist;
            expect(c.el).to.be.equal(c.children[0].el);
            c.render();
            expect(document.querySelector('button')).to.exist;
            expect(c.el).to.be.equal(c.children[0].el);
        });

        it('must create container using a function', () => {
            const Child = Component.create`<button>click me</button>`;
            const Container = Component.create(() => Child.mount());

            expect(Container).to.exist;

            const c = Container.mount({}, document.body);

            expect(document.querySelector('button')).to.exist;
            expect(c.el).to.be.equal(c.children[0].el);
            c.render();
            expect(document.querySelector('button')).to.exist;
            expect(c.el).to.be.equal(c.children[0].el);
        });

        it('must create container using tag', () => {
            const Child = Component.create`<button>click me</button>`;
            const Container = Component.create`<${Child} />`;
    
            expect(Container).to.exist;
    
            const c = Container.mount({}, document.body);
    
            expect(document.querySelector('button')).to.exist;
            expect(c.el).to.be.equal(c.children[0].el);
            c.render();
            expect(document.querySelector('button')).to.exist;
            expect(c.el).to.be.equal(c.children[0].el);
        });

        it('must create container with children using tag', () => {
            const Button = Component.create`<button>${({ options }) => options.renderChildren()}</button>`;
            const OkButton = Component.create`<${Button} color="primary">ok</${Button}>`;

            expect(OkButton).to.exist;

            const c = OkButton.mount({}, document.body);

            expect(document.querySelector('button').innerHTML).to.be.equal('ok');
            expect(c.el).to.be.equal(c.children[0].el);
            expect(c.children[0].options.color).to.be.equal('primary');
            c.render();
            expect(document.querySelector('button').innerHTML).to.be.equal('ok');
            expect(c.el).to.be.equal(c.children[0].el);
        });

        it('must create container with children using tag and key', () => {
            const Button = Component.create`<button>${({ options }) => options.renderChildren()}</button>`;
            const OkButton = Component.create`
                <${Button} color="primary" key="ok">ok</${Button}>
            `;

            expect(OkButton).to.exist;

            const c = OkButton.mount({}, document.body);

            const child = c.children[0];

            expect(c.el).to.be.equal(c.children[0].el);
            c.render();
            expect(c.el).to.be.equal(c.children[0].el);
            expect(child.el).to.be.equal(c.children[0].el);
        });

        it('must create container with children component using tag and key', () => {
            const Button = Component.create`<button>${({ options }) => options.renderChildren()}</button>`;
            const Icon = Component.create`<span class="icon"></span>`;
            const IconButton = Component.create`<${Button} color="primary" key="ok"><${Icon} /></${Button}>`;

            expect(IconButton).to.exist;

            const c = IconButton.mount({}, document.body);

            const child = c.children[0];

            expect(c.el).to.be.equal(c.children[0].el);
            c.render();
            expect(c.el).to.be.equal(c.children[0].el);
            expect(child.el).to.be.equal(c.children[0].el);
            expect(child.children[0].el).to.be.equal(c.children[0].children[0].el);
        });
    });
});
