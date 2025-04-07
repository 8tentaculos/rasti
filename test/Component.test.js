import { expect } from 'chai';
import Model from '../src/Model.js';
import View from '../src/View.js';
import Component from '../src/Component.js';


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
        expect(c.toString()).to.be.equal(`<input ${Component.DATA_ATTRIBUTE_UID}="rasti-1" id="test-node" type="text" />`);
        expect(document.getElementById('test-node')).to.exist;
    });

    it('must be created with a function tag', () => {
        const c = Component.create`<${() => 'div'} id="test-node"><span></span></${() => 'div'}>`.mount({}, document.body);
        expect(c.toString()).to.be.equal(`<div ${Component.DATA_ATTRIBUTE_UID}="rasti-1" id="test-node"><span></span></div>`);
        expect(document.getElementById('test-node')).to.exist;
    });

    it('must be created with a function tag with self enclosed tag', () => {
        const c = Component.create`<${() => 'input'} id="test-node" type="text" />`.mount({}, document.body);
        expect(c.toString()).to.be.equal(`<input ${Component.DATA_ATTRIBUTE_UID}="rasti-1" id="test-node" type="text" />`);
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
                ${() => 'required'}
                disabled="${({ model }) => model.disabled}"
                data-custom="my-data"
                aria-label="my-label"
                ${() => ({ minlength : 5, placeholder : 'my placeholder' })}
            />
        `.mount({ model : new Model({ disabled : false }) }, document.body);

        const el = document.getElementById('test-node');

        expect(el.className).to.be.equal('test-class-1 test-class-2');
        expect(el.hasAttribute('readonly')).to.be.true;
        expect(el.disabled).to.be.false;
        expect(el.getAttribute('data-custom')).to.be.equal('my-data');
        expect(el.hasAttribute('required')).to.be.true;
        expect(el.getAttribute('minlength')).to.be.equal('5');
        expect(el.getAttribute('placeholder')).to.be.equal('my placeholder');
        expect(el.getAttribute('aria-label')).to.be.equal('my-label');

        c.render();

        expect(el.className).to.be.equal('test-class-1 test-class-2');
        expect(el.hasAttribute('readonly')).to.be.true;
        expect(el.disabled).to.be.false;
        expect(el.getAttribute('data-custom')).to.be.equal('my-data');
        expect(el.hasAttribute('required')).to.be.true;
        expect(el.getAttribute('minlength')).to.be.equal('5');
        expect(el.getAttribute('placeholder')).to.be.equal('my placeholder');
        expect(el.getAttribute('aria-label')).to.be.equal('my-label');
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
        ).to.be.equal(`<input ${Component.DATA_ATTRIBUTE_UID}="rasti-1" id="test-node" />`);

        expect(
            Component.create`<input id="test-node" disabled="${() => true}" />`.mount().toString()
        ).to.be.equal(`<input ${Component.DATA_ATTRIBUTE_UID}="rasti-2" id="test-node" disabled />`);
    });

    it('must remove true and false placeholders', () => {
        expect(
            Component.create`<div id="test-node">${() => true}</div>`.mount().toString()
        ).to.be.equal(`<div ${Component.DATA_ATTRIBUTE_UID}="rasti-1" id="test-node"></div>`);

        expect(
            Component.create`<div id="test-node">${() => false}</div>`.mount().toString()
        ).to.be.equal(`<div ${Component.DATA_ATTRIBUTE_UID}="rasti-2" id="test-node"></div>`);
    });

    it('must be destroyed and stop listening', () => {
        // Mock a model that returns the model instance from `on` method.
        class CustomModel extends Model {
            on(...args) {
                super.on(...args);
                return this;
            }
        }

        const c = Component.create`
            <div id="test-node">${({ model }) => model.count}${({ state }) => state.count}</div>
        `.mount({ model : new Model({ count : 0 }), state : new CustomModel({ count : 0 }) }, document.body);

        expect(document.getElementById('test-node').innerHTML).to.be.equal('00');

        c.model.count = 1;
        c.state.count = 1;
        expect(document.getElementById('test-node').innerHTML).to.be.equal('11');

        c.destroy();
        c.model.count = 2;
        c.state.count = 2;
        expect(document.getElementById('test-node').innerHTML).to.be.equal('11');
    });

    it('must re render and destroy children', () => {
        const Button = Component.create`<button>click me</button>`;
        const Main = Component.create`<div id="test-node">${({ model }) => Button.mount({ model })}</div>`;

        const c = Main.mount({ model : new Model({ count : 0 }) }, document.body);

        const child = c.children[0];
        expect(document.querySelector('button')).to.be.equal(c.children[0].el);
        expect(document.getElementById('test-node').innerHTML).to.be.equal('<button data-rasti-uid="rasti-2">click me</button>');

        c.model.count = 1;

        expect(c.children[0]).not.to.be.equal(child);
        expect(document.querySelector('button')).to.be.equal(c.children[0].el);
        expect(document.getElementById('test-node').innerHTML).to.be.equal('<button data-rasti-uid="rasti-3">click me</button>');
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
        document.body.innerHTML = `<div ${Component.DATA_ATTRIBUTE_UID}="rasti-1"><button ${Component.DATA_ATTRIBUTE_UID}="rasti-2">click me</button></div>`;

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
        const m = new Model();
        const c = new Component();

        document.body.appendChild(c.render().el);

        expect(c.subscribe(m)).to.be.equal(c);
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
        const CancelButton = Component.create`<${Button} color="secondary">${({ options }) => options.cancel && 'cancel'}</${Button}>`;

        expect(OkButton).to.exist;

        const c1 = OkButton.mount({}, document.body);
        const c2 = CancelButton.mount({ cancel : true }, document.body);

        expect(document.querySelectorAll('button')[0].innerHTML).to.be.equal('ok');
        expect(c1.el).to.be.equal(c1.children[0].el);
        expect(c1.children[0].options.color).to.be.equal('primary');

        expect(document.querySelectorAll('button')[1].innerHTML).to.be.equal('cancel');
        expect(c2.el).to.be.equal(c2.children[0].el);
        expect(c2.children[0].options.color).to.be.equal('secondary');

        c1.render();
        c2.render();

        expect(document.querySelectorAll('button')[0].innerHTML).to.be.equal('ok');
        expect(c1.el).to.be.equal(c1.children[0].el);

        expect(document.querySelectorAll('button')[1].innerHTML).to.be.equal('cancel');
        expect(c2.el).to.be.equal(c2.children[0].el);
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

    it('must render partial', () => {
        const Button = Component.create`<button>click me</button>`;

        const c1 = Component.create`
            <div id="test-node-1">${self => self.partial`<div>${({ options }) => options && Button.mount()}</div>`}</div>
        `.mount({}, document.body);

        expect(document.getElementById('test-node-1').innerHTML).to.be.equal('<div><button data-rasti-uid="rasti-2">click me</button></div>');
        expect(c1.children[0].el).to.be.equal(document.querySelector('button'));

        const c2 = Component.create`
            <div id="test-node-2">${({ partial, options }) => partial`<div><${Button} /><span>${options && Button.mount()}</span></div>`}</div>
        `.mount({}, document.body);

        expect(c2.children.length).to.be.equal(2);
        expect(c2.children[0].el).to.be.equal(document.querySelector('#test-node-2 button'));
        expect(c2.children[1].el).to.be.equal(document.querySelector('#test-node-2 span button'));
        
        const c3 = Component.create`
            <div id="test-node-3">${({ partial }) => partial`<div><${Button} /><span>${({ partial, options }) => options.ok && partial`<${Button} />`}</span></div>`}</div>
        `.mount({ ok : true }, document.body);

        expect(c3.children.length).to.be.equal(2);
        expect(c3.children[0].el).to.be.equal(document.querySelector('#test-node-3 button'));
        expect(c3.children[1].el).to.be.equal(document.querySelector('#test-node-3 span button'));

        const ButtonWithChildren = Component.create`<button>${({ options }) => options.renderChildren()}</button>`;

        const c4 = Component.create`
            <div id="test-node-4">${({ partial }) => partial`<div><${ButtonWithChildren}>${({ options }) => options.ok && 'ok'}</${ButtonWithChildren}>`}</div>
        `.mount({ ok : true }, document.body);

        expect(c4.children.length).to.be.equal(1);
        expect(c4.children[0].el).to.be.equal(document.querySelector('#test-node-4 div button'));
        expect(document.querySelector('#test-node-4 div button').innerHTML).to.be.equal('ok');
    });
});

