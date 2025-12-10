import { expect } from 'chai';
import Model from '../src/Model.js';
import View from '../src/View.js';
import Component from '../src/Component.js';

describe('Component', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        View.uid = 0;
    });

    describe('Basic functionality', () => {
        it('must exists', () => {
            expect(Component).to.exist;
        });

        it('must be instantiated with new', () => {
            const c = new Component();
            expect(c.render().el.tagName.toLowerCase()).to.be.equal('div');
        });

        it('must be instantiated with new on existing element', () => {
            document.body.innerHTML = `<div id="test-node" ${Component.ATTRIBUTE_ELEMENT}="r1-1"></div>`;
            const c = new Component({ el : document.getElementById('test-node') });
            expect(c.render().el.id).to.be.equal('test-node');
        });

        it('must mount on dom', () => {
            Component.create`<div id="test-node"></div>`.mount({}, document.body);
            expect(document.getElementById('test-node')).to.exist;
        });

        it('must mount outside document', () => {
            const el = document.createElement('div');
            expect(el.childNodes.length).to.be.equal(0);

            Component.create`<div></div>`.mount({}, el);
            expect(el.childNodes.length).to.be.equal(1);
        });
    });

    describe('Template creation', () => {
        it('must be created with a self enclosed tag', () => {
            const c = Component.create`<input id="test-node" type="text" />`.mount({}, document.body);
            expect(c.toString()).to.be.equal(`<input id="test-node" type="text" ${Component.ATTRIBUTE_ELEMENT}="r1-1">`);
            expect(document.getElementById('test-node')).to.exist;
        });

        it('must be created with a function tag', () => {
            const c = Component.create`<${() => 'div'} id="test-node"><span></span></${() => 'div'}>`.mount({}, document.body);
            expect(c.toString()).to.be.equal(`<div id="test-node" ${Component.ATTRIBUTE_ELEMENT}="r1-1"><span></span></div>`);
            expect(document.getElementById('test-node')).to.exist;
        });

        it('must be created with a function tag with self enclosed tag', () => {
            const c = Component.create`<${() => 'input'} id="test-node" type="text" />`.mount({}, document.body);
            expect(c.toString()).to.be.equal(`<input id="test-node" type="text" ${Component.ATTRIBUTE_ELEMENT}="r1-1">`);
            expect(document.getElementById('test-node')).to.exist;
        });

        it('must support header tags', () => {
            Component.create`<h1 id="test-node"></h1>`.mount({}, document.body);
            expect(document.getElementById('test-node')).to.exist;
        });
    });

    describe('Child components', () => {
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
                    <${Button} color="primary" disabled="${() => true}" />
                    <${Button} color="secondary" disabled="${() => false}" />
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
            const Button = Component.create`<button>${({ props }) => props.renderChildren()}</button>`;

            const Main = Component.create`
                <div id="test-node">
                    <${Button} color="primary">${() => 'click me'}</${Button}>
                </div>`;

            const c = Main.mount({}, document.body);

            expect(c.children[0].options.color).to.be.equal('primary');
            expect(document.querySelector('button').innerHTML).to.be.equal(`<!--${Component.MARKER_START('r2-1')}-->click me<!--${Component.MARKER_END('r2-1')}-->`);
        });

        it('must mount nested component tags with opening and closing tags', () => {
            const Surface = Component.create`<div class="${({ props }) => props.className}">${({ props }) => props.renderChildren()}</div>`;
            const Table = Component.create`<table class="${({ props }) => props.className}">${({ props }) => props.renderChildren()}</table>`;
            const LoadingRow = Component.create`<tr><td>Loading...</td></tr>`;

            const LoadingTable = Component.create`
                <${Surface} className="surface">
                    <${Table} className="table">
                        <${LoadingRow} />
                        <${LoadingRow} />
                    </${Table}>
                </${Surface}>
            `;

            LoadingTable.mount({}, document.body);

            expect(document.querySelector('.surface')).to.exist;
            expect(document.querySelector('.table')).to.exist;
            expect(document.querySelectorAll('tr').length).to.be.equal(2);
        });

        it('must mount sibling component tags with opening and closing tags', () => {
            const Surface = Component.create`<div class="${({ props }) => props.className}">${({ props }) => props.renderChildren()}</div>`;
            const Table = Component.create`<table class="${({ props }) => props.className}">${({ props }) => props.renderChildren()}</table>`;
            const LoadingRow = Component.create`<tr><td>Loading...</td></tr>`;

            const LoadingTables = Component.create`
                <${Surface} className="surface">
                    <${Table} className="table-1">
                        <${LoadingRow} />
                    </${Table}>
                    <${Table} className="table-2">
                        <${LoadingRow} />
                        <${LoadingRow} />
                    </${Table}>
                </${Surface}>
            `;

            LoadingTables.mount({}, document.body);

            expect(document.querySelector('.surface')).to.exist;
            expect(document.querySelector('.table-1')).to.exist;
            expect(document.querySelector('.table-2')).to.exist;
            expect(document.querySelector('.table-1 tr')).to.exist;
            expect(document.querySelectorAll('.table-2 tr').length).to.be.equal(2);
        });

        it('must mount mixed self-closing and non-void component tags of same type', () => {
            const Button = Component.create`<button>${({ props }) => props.renderChildren ? props.renderChildren() : props.label}</button>`;

            const Main = Component.create`
                <div class="root">
                    <ul>
                        <li>
                            <${Button} label="hello" />
                        </li>
                        <li>
                            <${Button}>
                                bye
                            </${Button}>
                        </li>
                    </ul>
                </div>
            `;

            const c = Main.mount({}, document.body);

            expect(c.children.length).to.be.equal(2);
            expect(document.querySelectorAll('button').length).to.be.equal(2);
            expect(document.querySelectorAll('button')[0].textContent.trim()).to.be.equal('hello');
            expect(document.querySelectorAll('button')[1].textContent.trim()).to.be.equal('bye');
        });
    });

    describe('Rendering and attributes', () => {
        it('must re render on model change', () => {
            const c = Component.create`<div id="test-node">${({ model }) => model.count}</div>`.mount({
                model : new Model({ count : 0 }),
            }, document.body);

            expect(document.getElementById('test-node').innerHTML).to.be.equal(`<!--${Component.MARKER_START('r1-1')}-->0<!--${Component.MARKER_END('r1-1')}-->`);

            c.model.count = 1;

            expect(document.getElementById('test-node').innerHTML).to.be.equal(`<!--${Component.MARKER_START('r1-1')}-->1<!--${Component.MARKER_END('r1-1')}-->`);
        });

        it('must handle attributes', () => {
            // Test root element attributes.
            const RootComponent = Component.create`
                <input
                    id="test-root"
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

            const rootEl = document.getElementById('test-root');
            // Verify initial root attributes.
            expect(rootEl.className).to.be.equal('test-class-1 test-class-2');
            expect(rootEl.hasAttribute('readonly')).to.be.true;
            expect(rootEl.disabled).to.be.false;
            expect(rootEl.getAttribute('data-custom')).to.be.equal('my-data');
            expect(rootEl.hasAttribute('required')).to.be.true;
            expect(rootEl.getAttribute('minlength')).to.be.equal('5');
            expect(rootEl.getAttribute('placeholder')).to.be.equal('my placeholder');
            expect(rootEl.getAttribute('aria-label')).to.be.equal('my-label');
            // Test reactive root attribute updates.
            RootComponent.model.disabled = true;
            expect(rootEl.disabled).to.be.true;
            // Test inner element attributes.
            const InnerComponent = Component.create`
                <div id="test-inner">
                    <span 
                        class="${({ model }) => model.className}" 
                        data-value="${({ model }) => model.value}"
                        data-status="${({ model }) => model.status}"
                        ${({ model }) => model.required && 'required'}
                    >${({ model }) => model.text}</span>
                </div>
            `.mount({ model : new Model({ className : 'initial-class', value : '1', status : 'active', required : false, text : 'Hello World' }) }, document.body);

            const innerDiv = document.getElementById('test-inner');
            const innerSpan = innerDiv.querySelector('span');
            // Verify initial inner attributes.
            expect(innerSpan.className).to.be.equal('initial-class');
            expect(innerSpan.getAttribute('data-value')).to.be.equal('1');
            expect(innerSpan.getAttribute('data-status')).to.be.equal('active');
            expect(innerSpan.hasAttribute('required')).to.be.false;
            expect(innerSpan.textContent.trim()).to.be.equal('Hello World');
            // Test reactive inner attribute updates.
            InnerComponent.model.className = 'updated-class';
            InnerComponent.model.value = '2';
            InnerComponent.model.status = 'inactive';
            InnerComponent.model.required = true;
            InnerComponent.model.text = 'Updated World';
            // Verify the same element is updated, not replaced.
            expect(innerDiv.querySelector('span')).to.be.equal(innerSpan);
            expect(innerSpan.className).to.be.equal('updated-class');
            expect(innerSpan.getAttribute('data-value')).to.be.equal('2');
            expect(innerSpan.getAttribute('data-status')).to.be.equal('inactive');
            expect(innerSpan.hasAttribute('required')).to.be.true;
            expect(innerSpan.textContent.trim()).to.be.equal('Updated World');
            // Test re-render preserves attributes.
            RootComponent.render();
            expect(rootEl.className).to.be.equal('test-class-1 test-class-2');
            expect(rootEl.hasAttribute('readonly')).to.be.true;
            // Should remain true from previous update.
            expect(rootEl.disabled).to.be.true;
            expect(rootEl.getAttribute('data-custom')).to.be.equal('my-data');
            expect(rootEl.hasAttribute('required')).to.be.true;
            expect(rootEl.getAttribute('minlength')).to.be.equal('5');
            expect(rootEl.getAttribute('placeholder')).to.be.equal('my placeholder');
            expect(rootEl.getAttribute('aria-label')).to.be.equal('my-label');
        });

        it('must render true and false attributes', () => {
            expect(
                Component.create`<input id="test-node" disabled="${() => false}" />`.mount().toString()
            ).to.be.equal(`<input id="test-node" ${Component.ATTRIBUTE_ELEMENT}="r1-1">`);

            expect(
                Component.create`<input id="test-node" disabled="${() => true}" />`.mount().toString()
            ).to.be.equal(`<input id="test-node" disabled ${Component.ATTRIBUTE_ELEMENT}="r2-1">`);
        });

        it('must remove true and false placeholders', () => {
            expect(
                Component.create`<div id="test-node">${() => true}</div>`.mount().toString()
            ).to.be.equal(`<div id="test-node" ${Component.ATTRIBUTE_ELEMENT}="r1-1"><!--${Component.MARKER_START('r1-1')}--><!--${Component.MARKER_END('r1-1')}--></div>`);

            expect(
                Component.create`<div id="test-node">${() => false}</div>`.mount().toString()
            ).to.be.equal(`<div id="test-node" ${Component.ATTRIBUTE_ELEMENT}="r2-1"><!--${Component.MARKER_START('r2-1')}--><!--${Component.MARKER_END('r2-1')}--></div>`);
        });
    });

    describe('Component lifecycle and destruction', () => {
        it('must call onCreate', (done) => {
            Component.create`<div></div>`.extend({
                onCreate() {
                    done();
                }
            }).mount();
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

            expect(document.getElementById('test-node').innerHTML).to.be.equal(`<!--${Component.MARKER_START('r1-1')}-->0<!--${Component.MARKER_END('r1-1')}--><!--${Component.MARKER_START('r1-2')}-->0<!--${Component.MARKER_END('r1-2')}-->`);

            c.model.count = 1;
            c.state.count = 1;
            expect(document.getElementById('test-node').innerHTML).to.be.equal(`<!--${Component.MARKER_START('r1-1')}-->1<!--${Component.MARKER_END('r1-1')}--><!--${Component.MARKER_START('r1-2')}-->1<!--${Component.MARKER_END('r1-2')}-->`);

            c.destroy();
            c.model.count = 2;
            c.state.count = 2;
            expect(document.getElementById('test-node').innerHTML).to.be.equal(`<!--${Component.MARKER_START('r1-1')}-->1<!--${Component.MARKER_END('r1-1')}--><!--${Component.MARKER_START('r1-2')}-->1<!--${Component.MARKER_END('r1-2')}-->`);
        });

        it('must re render and destroy children', () => {
            const Button = Component.create`<button>click me</button>`;
            const Main = Component.create`<div id="test-node">${({ model }) => [Button.mount({ model })]}</div>`;

            const c = Main.mount({ model : new Model({ count : 0 }) }, document.body);

            const child = c.children[0];
            expect(document.querySelector('button')).to.be.equal(c.children[0].el);
            expect(document.getElementById('test-node').innerHTML).to.be.equal(`<!--${Component.MARKER_START('r1-1')}--><button ${Component.ATTRIBUTE_ELEMENT}="r2-1">click me</button><!--${Component.MARKER_END('r1-1')}-->`);

            c.model.count = 1;

            expect(c.children[0]).not.to.be.equal(child);
            expect(document.querySelector('button')).to.be.equal(c.children[0].el);
            expect(document.getElementById('test-node').innerHTML).to.be.equal(`<!--${Component.MARKER_START('r1-1')}--><button ${Component.ATTRIBUTE_ELEMENT}="r3-1">click me</button><!--${Component.MARKER_END('r1-1')}-->`);
        });

        it('must re render and recycle children with key', () => {
            const Button = Component.create`<button>click me</button>`;
            const Main = Component.create`<div id="test-node">${() => Button.mount({ key : 'btn' })}</div>`;

            const c = Main.mount({ model : new Model({ count : 0 }) }, document.body);

            const child = c.children[0];

            c.model.count = 1;

            expect(c.children[0]).to.be.equal(child);
            expect(document.querySelector('button')).to.be.equal(child.el);
        });

        it('must hydrate existing dom', () => {
            document.body.innerHTML = `<div ${Component.ATTRIBUTE_ELEMENT}="r1-1"><button ${Component.ATTRIBUTE_ELEMENT}="r2-1">click me</button></div>`;

            const Button = Component.create`<button>click me</button>`;
            const Main = Component.create`<div>${() => Button.mount()}</div>`;

            const c = Main.mount({}, document.body, true);

            expect(document.querySelector('button')).to.be.equal(c.children[0].el);
        });
    });

    describe('Event handling', () => {
        it('must delegate events', (done) => {
            const c = Component.create`
            <section>
                <button onClick=${() => done()}>click me</button>
            </section>
        `.mount({}, document.body);

            c.$('section button').dispatchEvent(
                new MouseEvent('click', { bubbles : true })
            );
        });

        it('must delegate events on root element', (done) => {
            const c = Component.create`
                <button onClick=${() => done()}>click me</button>
            `.mount({}, document.body);

            c.el.dispatchEvent(
                new MouseEvent('click', { bubbles : true })
            );
        });

        it('must delegate multiple event types', (done) => {
            let eventsCalled = [];
            const expectedEvents = ['click', 'mouseover', 'keydown'];

            const checkComplete = () => {
                if (eventsCalled.length === expectedEvents.length) {
                    // Verify all events were called.
                    expect(eventsCalled).to.include.members(expectedEvents);
                    done();
                }
            };

            const c = Component.create`
                <div>
                    <button 
                        onClick=${() => { eventsCalled.push('click'); checkComplete(); }}
                        onMouseOver=${() => { eventsCalled.push('mouseover'); checkComplete(); }}
                        onKeyDown=${() => { eventsCalled.push('keydown'); checkComplete(); }}
                    >
                        multi events
                    </button>
                </div>
            `.mount({}, document.body);

            const button = c.$('button');
            // Dispatch different event types.
            button.dispatchEvent(new MouseEvent('click', { bubbles : true }));
            button.dispatchEvent(new MouseEvent('mouseover', { bubbles : true }));
            button.dispatchEvent(new KeyboardEvent('keydown', { bubbles : true, key : 'Enter' }));
        });

        it('must handle event bubbling from child to parent', (done) => {
            let eventsOrder = [];

            const c = Component.create`
                <div onClick=${() => { eventsOrder.push('parent'); }}>
                    <span onClick=${() => { eventsOrder.push('child'); }}>
                        <button onClick=${() => { eventsOrder.push('button'); }}>
                            click me
                        </button>
                    </span>
                </div>
            `.mount({}, document.body);

            const button = c.$('button');

            button.dispatchEvent(new MouseEvent('click', { bubbles : true }));

            // Wait for event handling to complete.
            setTimeout(() => {
                expect(eventsOrder).to.deep.equal(['button', 'child', 'parent']);
                done();
            }, 0);
        });

        it('must handle keyboard events properly', (done) => {
            let keyboardEvents = [];

            const c = Component.create`
                <div>
                    <input 
                        onKeyDown=${(e) => { keyboardEvents.push('keydown-' + e.key); }}
                        onKeyUp=${(e) => { keyboardEvents.push('keyup-' + e.key); }}
                        placeholder="Type here"
                    />
                </div>
            `.mount({}, document.body);

            const input = c.$('input');

            input.dispatchEvent(new KeyboardEvent('keydown', { bubbles : true, key : 'a' }));
            input.dispatchEvent(new KeyboardEvent('keyup', { bubbles : true, key : 'a' }));
            input.dispatchEvent(new KeyboardEvent('keydown', { bubbles : true, key : 'Enter' }));

            setTimeout(() => {
                expect(keyboardEvents).to.deep.equal(['keydown-a', 'keyup-a', 'keydown-Enter']);
                done();
            }, 0);
        });

        it('must handle mouse events with coordinates', (done) => {
            let mouseEvents = [];

            const c = Component.create`
                <div>
                    <div 
                        onMouseDown=${() => { mouseEvents.push('mousedown'); }}
                        onMouseUp=${() => { mouseEvents.push('mouseup'); }}
                        onMouseMove=${() => { mouseEvents.push('mousemove'); }}
                        style="width: 100px; height: 100px;"
                    >
                        mouse area
                    </div>
                </div>
            `.mount({}, document.body);

            const mouseArea = c.$('div div');

            mouseArea.dispatchEvent(new MouseEvent('mousedown', {
                bubbles : true,
                clientX : 50,
                clientY : 50
            }));
            mouseArea.dispatchEvent(new MouseEvent('mousemove', {
                bubbles : true,
                clientX : 60,
                clientY : 60
            }));
            mouseArea.dispatchEvent(new MouseEvent('mouseup', {
                bubbles : true,
                clientX : 60,
                clientY : 60
            }));

            setTimeout(() => {
                expect(mouseEvents).to.deep.equal(['mousedown', 'mousemove', 'mouseup']);
                done();
            }, 0);
        });

        it('must handle all event attribute types: unquoted, quoted, and method names', (done) => {
            let eventsCalled = [];
            let model = { hovered : false };

            const TestComponent = Component.create`
                <div>
                    <button 
                        onClick="handleClick"
                        onMouseover="${({ model }) => () => { model.hovered = true; eventsCalled.push('quoted-hover'); }}"
                        onMouseout=${function() { eventsCalled.push('unquoted-out'); }}
                    >
                        mixed events
                    </button>
                </div>
            `.extend({ handleClick() { eventsCalled.push('method-click'); }});

            const c = TestComponent.mount({ model }, document.body);
            const button = c.$('button');
            // Test method name (string).
            button.dispatchEvent(new MouseEvent('click', { bubbles : true }));
            expect(eventsCalled).to.deep.equal(['method-click']);
            // Test quoted attribute.
            button.dispatchEvent(new MouseEvent('mouseover', { bubbles : true }));
            expect(eventsCalled).to.deep.equal(['method-click', 'quoted-hover']);
            expect(model.hovered).to.be.true;
            // Test unquoted attribute.
            button.dispatchEvent(new MouseEvent('mouseout', { bubbles : true }));
            expect(eventsCalled).to.deep.equal(['method-click', 'quoted-hover', 'unquoted-out']);

            done();
        });

        it('must delegate events dynamically with partials and re-renders', (done) => {
            let eventsOrder = [];
            let currentStep = 0;

            const checkStep = (eventName) => {
                eventsOrder.push(eventName);
                if (eventsOrder.length === 2 && currentStep === 0) {
                    // First click completed, now change model to trigger re-render.
                    expect(eventsOrder).to.deep.equal(['partial-click', 'div-click']);
                    eventsOrder = []; // Reset for next test.
                    currentStep = 1;
                    c.model.eventType = 'mouseover';
                    // Wait for re-render, then test mouseover.
                    setTimeout(() => {
                        const partialButton = c.$('button');
                        partialButton.dispatchEvent(new MouseEvent('mouseover', { bubbles : true }));
                    }, 10);
                } else if (eventsOrder.length === 2 && currentStep === 1) {
                    // Second event test completed.
                    expect(eventsOrder).to.deep.equal(['partial-mouseover', 'div-mouseover']);
                    done();
                }
            };

            const c = Component.create`
                <div ${({ model }) => model.eventType === 'click' ? { onClick : () => checkStep('div-click') } : { onMouseOver : () => checkStep('div-mouseover') }}}>
                    ${({ partial, model }) => model.eventType === 'click' ? partial`<button onClick=${() => checkStep('partial-click')}>Click me</button>` : partial`<button onMouseOver=${() => checkStep('partial-mouseover')}>Hover me</button>`}}
                </div>
            `.mount({ model : new Model({ eventType : 'click' }) }, document.body);

            // Start test by clicking the button.
            setTimeout(() => {
                const button = c.$('button');
                button.dispatchEvent(new MouseEvent('click', { bubbles : true }));
            }, 10);
        });

        it('must not trigger parent internal node onClick when child component has onClick', (done) => {
            let parentInternalExecuted = false;
            let childExecuted = false;

            const Child = Component.create`
                <button onClick=${() => { childExecuted = true; }}>Child Button</button>
            `;

            const Parent = Component.create`
                <div>
                    <button onClick=${() => { parentInternalExecuted = true; }}>Parent Internal Button</button>
                    <${Child} />
                </div>
            `;

            const parent = Parent.mount({}, document.body);
            // Test 1: Click the parent internal button - should execute parent internal.
            // Click the parent internal button - should execute parent internal.
            const parentInternalButton = parent.$('button:first-child');
            parentInternalButton.dispatchEvent(new MouseEvent('click', { bubbles : true }));

            setTimeout(() => {
                expect(parentInternalExecuted).to.be.true;
                expect(childExecuted).to.be.false;
                // Reset for test 2.
                parentInternalExecuted = false;
                childExecuted = false;
                // Click the child button - should execute child, NOT parent internal.
                const childButton = parent.$('button:last-child');
                childButton.dispatchEvent(new MouseEvent('click', { bubbles : true }));

                setTimeout(() => {
                    expect(childExecuted).to.be.true;
                    expect(parentInternalExecuted).to.be.false;
                    done();
                }, 10);
            }, 10);
        });

        it('must support event.stopPropagation() to prevent parent execution', (done) => {
            let parentExecuted = false;
            let childExecuted = false;

            const Child = Component.create`
                <button onClick=${(event) => { childExecuted = true; event.stopPropagation(); }}>Child Button with stopPropagation</button>
            `;

            const Parent = Component.create`
                <div onClick=${() => { parentExecuted = true; }}>
                    <${Child} />
                </div>
            `;

            const parent = Parent.mount({}, document.body);

            // Click the child button - should execute child but NOT parent due to stopPropagation.
            const childButton = parent.$('button');
            childButton.dispatchEvent(new MouseEvent('click', { bubbles : true }));

            setTimeout(() => {
                expect(childExecuted).to.be.true;
                expect(parentExecuted).to.be.false;
                done();
            }, 10);
        });

        it('must allow event bubbling when stopPropagation is not called', (done) => {
            let parentExecuted = false;
            let childExecuted = false;

            const Child = Component.create`
                <button onClick=${() => { childExecuted = true; }}>Child Button without stopPropagation</button>
            `;

            const Parent = Component.create`
                <div onClick=${() => { parentExecuted = true; }}>
                    <${Child} />
                </div>
            `;

            const parent = Parent.mount({}, document.body);

            // Click the child button - should execute both child AND parent due to bubbling.
            const childButton = parent.$('button');
            childButton.dispatchEvent(new MouseEvent('click', { bubbles : true }));

            setTimeout(() => {
                expect(childExecuted).to.be.true;
                expect(parentExecuted).to.be.true;
                done();
            }, 10);
        });
    });

    describe('Extension and chainable methods', () => {
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

        it('must inherit resetUid static method from View', () => {
            View.uid = 5;
            const c1 = Component.create`<div></div>`.mount();
            expect(c1.uid).to.be.equal('r6');

            Component.resetUid();
            expect(View.uid).to.be.equal(0);

            const c2 = Component.create`<div></div>`.mount();
            expect(c2.uid).to.be.equal('r1');
        });

    });

    describe('Containers', () => {
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

        it('must create nested containers with component sharing same model', () => {
            const model = new Model({ count : 0 });
            const Child = Component.create`<button>${({ model }) => model.count}</button>`;
            const MiddleContainer = Component.create`${({ model }) => Child.mount({ model })}`;
            const TopContainer = Component.create`${({ model }) => MiddleContainer.mount({ model })}`;

            const c = TopContainer.mount({ model }, document.body);

            expect(document.querySelector('button')).to.exist;
            expect(document.querySelector('button').textContent.trim()).to.be.equal('0');
            expect(c.el).to.be.equal(c.children[0].el);
            expect(c.el).to.be.equal(c.children[0].children[0].el);
            expect(c.model).to.be.equal(model);
            expect(c.children[0].model).to.be.equal(model);
            expect(c.children[0].children[0].model).to.be.equal(model);

            model.count = 1;
            expect(document.querySelector('button').textContent.trim()).to.be.equal('1');

            c.render();
            expect(document.querySelector('button')).to.exist;
            expect(c.el).to.be.equal(c.children[0].el);
            expect(c.el).to.be.equal(c.children[0].children[0].el);
        });

        it('must create nested containers with props and component sharing same model', () => {
            const model = new Model({ count : 0, label : 'Count' });
            const Child = Component.create`<button>${({ model, props }) => `${props.label}: ${model.count}`}</button>`;
            const MiddleContainer = Component.create`${({ model, props }) => Child.mount({ model, label : props.label })}`;
            const TopContainer = Component.create`${({ model }) => MiddleContainer.mount({ model, label : model.label })}`;

            const c = TopContainer.mount({ model }, document.body);

            expect(document.querySelector('button')).to.exist;
            expect(document.querySelector('button').textContent.trim()).to.be.equal('Count: 0');
            expect(c.el).to.be.equal(c.children[0].el);
            expect(c.el).to.be.equal(c.children[0].children[0].el);
            expect(c.model).to.be.equal(model);
            expect(c.children[0].model).to.be.equal(model);
            expect(c.children[0].children[0].model).to.be.equal(model);
            expect(c.children[0].props.label).to.be.equal('Count');
            expect(c.children[0].children[0].props.label).to.be.equal('Count');

            model.count = 1;
            expect(document.querySelector('button').textContent.trim()).to.be.equal('Count: 1');

            model.label = 'Total';
            expect(document.querySelector('button').textContent.trim()).to.be.equal('Total: 1');

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

            const ContainerButton = Component.create`${() => [Button.mount()]}`;
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
            document.body.append(c.render().el);

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
            const Button = Component.create`<button>${({ props }) => props.renderChildren()}</button>`;
            const OkButton = Component.create`<${Button} color="primary">ok</${Button}>`;
            const CancelButton = Component.create`<${Button} color="secondary">${({ props }) => props.cancel && 'cancel'}</${Button}>`;

            expect(OkButton).to.exist;

            const c1 = OkButton.mount({}, document.body);
            const c2 = CancelButton.mount({ cancel : true }, document.body);

            expect(document.querySelectorAll('button')[0].innerHTML).to.be.equal(`<!--${Component.MARKER_START('r2-1')}-->ok<!--${Component.MARKER_END('r2-1')}-->`);
            expect(c1.el).to.be.equal(c1.children[0].el);
            expect(c1.children[0].options.color).to.be.equal('primary');

            expect(document.querySelectorAll('button')[1].innerHTML).to.be.equal(`<!--${Component.MARKER_START('r4-1')}-->cancel<!--${Component.MARKER_END('r4-1')}-->`);
            expect(c2.el).to.be.equal(c2.children[0].el);
            expect(c2.children[0].options.color).to.be.equal('secondary');

            c1.render();
            c2.render();

            expect(document.querySelectorAll('button')[0].innerHTML).to.be.equal(`<!--${Component.MARKER_START('r2-1')}-->ok<!--${Component.MARKER_END('r2-1')}-->`);
            expect(c1.el).to.be.equal(c1.children[0].el);

            expect(document.querySelectorAll('button')[1].innerHTML).to.be.equal(`<!--${Component.MARKER_START('r4-1')}-->cancel<!--${Component.MARKER_END('r4-1')}-->`);
            expect(c2.el).to.be.equal(c2.children[0].el);
        });

        it('must create container with children using tag and key', () => {
            const Button = Component.create`<button>${({ props }) => props.renderChildren()}</button>`;
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
            const Button = Component.create`<button>${({ props }) => props.renderChildren()}</button>`;
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

    describe('Lifecycle methods', () => {
        it('must call onHydrate lifecycle method', () => {
            let calls = 0;
            const onHydrate = function() {
                calls++;
            };

            const Child = Component.create`<div></div>`.extend({ onHydrate });
            const ChildContainer = Component.create`${() => Child.mount()}`.extend({ onHydrate });
            const Main = Component.create`<div>${() => ChildContainer.mount()}</div>`.extend({ onHydrate });

            expect(calls).to.be.equal(0);

            Main.mount({}, document.body);

            expect(calls).to.be.equal(3);
        });

        it('must call onHydrate and onUpdate lifecycle methods', () => {
            let hydrateCalls = 0;
            let updateCalls = 0;

            const onHydrate = function() {
                hydrateCalls++;
            };

            const onUpdate = function() {
                updateCalls++;
            };

            const Child = Component.create`<div></div>`.extend({ onHydrate, onUpdate });
            const ChildContainer = Component.create`${() => Child.mount()}`.extend({ onHydrate, onUpdate });
            const Main = Component.create`<div>${() => ChildContainer.mount()}</div>`.extend({ onHydrate, onUpdate });

            expect(hydrateCalls).to.be.equal(0);
            expect(updateCalls).to.be.equal(0);

            const main = Main.mount({}, document.body);

            expect(hydrateCalls).to.be.equal(3);
            expect(updateCalls).to.be.equal(0);

            hydrateCalls = 0;
            updateCalls = 0;

            main.render();

            expect(updateCalls).to.be.equal(1);
            expect(hydrateCalls).to.be.equal(0);
        });

        it('must call onHydrate, onUpdate and onRecycle lifecycle methods', () => {
            let hydrateCalls = 0;
            let updateCalls = 0;
            let recycleCalls = 0;

            const onHydrate = function() {
                hydrateCalls++;
            };

            const onUpdate = function() {
                updateCalls++;
            };

            const onRecycle = function() {
                recycleCalls++;
            };

            const Child = Component.create`<div></div>`.extend({ onHydrate, onUpdate, onRecycle });
            const ChildContainer = Component.create`${() => Child.mount()}`.extend({ onHydrate, onUpdate, onRecycle, key : 'child' });
            const Main = Component.create`<div>${() => ChildContainer.mount()}</div>`.extend({ onHydrate, onUpdate, onRecycle });

            expect(hydrateCalls).to.be.equal(0);
            expect(updateCalls).to.be.equal(0);
            expect(recycleCalls).to.be.equal(0);

            const main = Main.mount({}, document.body);

            expect(hydrateCalls).to.be.equal(3);
            expect(updateCalls).to.be.equal(0);
            expect(recycleCalls).to.be.equal(0);

            hydrateCalls = 0;
            updateCalls = 0;
            recycleCalls = 0;

            main.render();

            expect(updateCalls).to.be.equal(1);
            expect(recycleCalls).to.be.equal(1);
            expect(hydrateCalls).to.be.equal(0);
        });
    });

    describe('Partials and component recycling', () => {
        it('must render partial', () => {
            const Button = Component.create`<button>click me</button>`;

            const c1 = Component.create`
                <div id="test-node-1">${self => self.partial`<div>${({ options }) => options && Button.mount()}</div>`}</div>
            `.mount({}, document.body);

            expect(document.getElementById('test-node-1').innerHTML).to.be.equal(`<!--${Component.MARKER_START('r1-1')}--><div><button ${Component.ATTRIBUTE_ELEMENT}="r2-1">click me</button></div><!--${Component.MARKER_END('r1-1')}-->`);
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

            const ButtonWithChildren = Component.create`<button>${({ props }) => props.renderChildren()}</button>`;

            const c4 = Component.create`
                <div id="test-node-4">${({ partial }) => partial`<div><${ButtonWithChildren}>${({ options }) => options.ok && 'ok'}</${ButtonWithChildren}>`}</div>
            `.mount({ ok : true }, document.body);

            expect(c4.children.length).to.be.equal(1);
            expect(c4.children[0].el).to.be.equal(document.querySelector('#test-node-4 div button'));
            expect(document.querySelector('#test-node-4 div button').innerHTML).to.be.equal(`<!--${Component.MARKER_START('r10-1')}-->ok<!--${Component.MARKER_END('r10-1')}-->`);
        });

        it('must render partial with nested component tags with opening and closing tags', () => {
            const Surface = Component.create`<div class="${({ props }) => props.className}">${({ props }) => props.renderChildren()}</div>`;
            const Table = Component.create`<table class="${({ props }) => props.className}">${({ props }) => props.renderChildren()}</table>`;
            const LoadingRow = Component.create`<tr><td>Loading...</td></tr>`;

            const Main = Component.create`
                <div id="test-node">
                    ${({ partial }) => partial`
                        <${Surface} className="surface">
                            <${Table} className="table">
                                <${LoadingRow} />
                                <${LoadingRow} />
                            </${Table}>
                        </${Surface}>
                    `}
                </div>
            `;

            Main.mount({}, document.body);

            expect(document.querySelector('.surface')).to.exist;
            expect(document.querySelector('.table')).to.exist;
            expect(document.querySelectorAll('tr').length).to.be.equal(2);
        });

        it('must sync interpolation first element using partial', () => {
            const PartialComponent = Component.create`
                <div id="test-node">
                    <div>${({ partial, model }) => partial`<span class="${model.className}" data-value="${model.value}">${model.text}</span>`}</div>
                </div>
            `.mount({ model : new Model({ className : 'initial-class', value : '1', text : 'Hello World'}) }, document.body);

            const originalDiv = document.getElementById('test-node');
            const originalSpan = originalDiv.querySelector('span');

            expect(originalSpan.className).to.be.equal('initial-class');
            expect(originalSpan.getAttribute('data-value')).to.be.equal('1');
            expect(originalSpan.textContent.trim()).to.be.equal('Hello World');
            // Update the model to trigger re-render.
            PartialComponent.model.className = 'updated-class';
            PartialComponent.model.value = '2';
            PartialComponent.model.text = 'Updated World';
            // The same span element should be synced, not replaced.
            const updatedSpan = originalDiv.querySelector('span');
            expect(updatedSpan).to.be.equal(originalSpan);
            expect(updatedSpan.className).to.be.equal('updated-class');
            expect(updatedSpan.getAttribute('data-value')).to.be.equal('2');
            expect(updatedSpan.textContent.trim()).to.be.equal('Updated World');
        });

        it('must update text content of inner element', () => {
            const ContentComponent = Component.create`
                <div id="test-node">
                    <span>${({ model }) => model.text}</span>
                </div>
            `.mount({ model : new Model({ text : 'Hello' }) }, document.body);

            const originalDiv = document.getElementById('test-node');
            const originalSpan = originalDiv.querySelector('span');

            expect(originalSpan.textContent.trim()).to.be.equal('Hello');

            ContentComponent.model.text = 'World';
            // The same span element should be updated, not replaced.
            expect(originalDiv.querySelector('span')).to.be.equal(originalSpan);
            expect(originalSpan.textContent.trim()).to.be.equal('World');
        });

        it('must recycle child component with key and keep same element', () => {
            const ChildComponent = Component.create`<button>${({ model }) => model.text}</button>`;
            const ParentComponent = Component.create`
                <div id="test-node">
                    <div>${({ model }) => ChildComponent.mount({ model, key : 'child' })}</div>
                </div>
            `.mount({ model : new Model({ text : 'Hello' }) }, document.body);

            const originalDiv = document.getElementById('test-node');
            const originalButton = originalDiv.querySelector('button');

            expect(originalButton.textContent.trim()).to.be.equal('Hello');
            // Change the model to trigger re-render.
            ParentComponent.model.text = 'World';
            // The same button element should be recycled and updated.
            const updatedButton = originalDiv.querySelector('button');
            expect(updatedButton).to.be.equal(originalButton);
            expect(updatedButton.textContent.trim()).to.be.equal('World');
        });

        it('must recycle child component without key in same position', () => {
            const ChildComponent = Component.create`<button>${({ model }) => model.text}</button>`;
            const ParentComponent = Component.create`
                <div id="test-node">
                    <div>${({ model }) => ChildComponent.mount({ model })}</div>
                </div>
            `.mount({ model : new Model({ text : 'Hello' }) }, document.body);

            const originalDiv = document.getElementById('test-node');
            const originalButton = originalDiv.querySelector('button');

            expect(originalButton.textContent.trim()).to.be.equal('Hello');
            // Change the model to trigger re-render.
            ParentComponent.model.text = 'World';
            // The same button element should be recycled because it's in the same position.
            const newButton = originalDiv.querySelector('button');
            expect(newButton).to.be.equal(originalButton);
            expect(newButton.textContent.trim()).to.be.equal('World');
        });

        it('must recycle child component with key and update props', () => {
            // Create a child component that uses props from options.
            const ChildComponent = Component.create`
                <button 
                    class="${({ props }) => props.className}" 
                    data-color="${({ props }) => props.color}"
                    data-size="${({ props }) => props.size}"
                >
                    ${({ props }) => props.text}
                </button>
            `;
            // Create a parent component that passes props to child.
            const ParentComponent = Component.create`
                <div id="test-node">
                    <div>${({ model }) => ChildComponent.mount({ key : 'child', className : model.className, color : model.color, size : model.size, text : model.text })}</div>
                </div>
            `.mount({ model : new Model({ className : 'btn-primary', color : 'blue', size : 'medium', text : 'Hello' }) }, document.body);

            const originalDiv = document.getElementById('test-node');
            const originalButton = originalDiv.querySelector('button');
            // Verify initial props.
            expect(originalButton.className).to.be.equal('btn-primary');
            expect(originalButton.getAttribute('data-color')).to.be.equal('blue');
            expect(originalButton.getAttribute('data-size')).to.be.equal('medium');
            expect(originalButton.textContent.trim()).to.be.equal('Hello');
            // Store the child component reference.
            const originalChild = ParentComponent.children[0];
            // Update the model to trigger re-render with new props.
            ParentComponent.model.className = 'btn-secondary';
            ParentComponent.model.color = 'red';
            ParentComponent.model.size = 'large';
            ParentComponent.model.text = 'World';
            // The same button element should be recycled and updated with new props.
            const updatedButton = originalDiv.querySelector('button');
            expect(updatedButton).to.be.equal(originalButton);
            // Verify the child component instance is recycled.
            expect(ParentComponent.children[0]).to.be.equal(originalChild);
            // Verify new props are applied.
            expect(updatedButton.className).to.be.equal('btn-secondary');
            expect(updatedButton.getAttribute('data-color')).to.be.equal('red');
            expect(updatedButton.getAttribute('data-size')).to.be.equal('large');
            expect(updatedButton.textContent.trim()).to.be.equal('World');
        });

        it('must recycle components in partial by position', () => {
            const Button = Component.create`<button>${({ props }) => props.text}</button>`;
            const ParentComponent = Component.create`
                <div id="test-node">
                    ${({ model, partial }) => partial`
                        <${Button} text="${model.text1}" />
                        <${Button} text="${model.text2}" />
                    `}
                </div>
            `.mount({ model : new Model({ text1 : 'First', text2 : 'Second' }) }, document.body);

            const buttons = document.querySelectorAll('button');
            const firstButton = buttons[0];
            const secondButton = buttons[1];

            expect(firstButton.textContent.trim()).to.be.equal('First');
            expect(secondButton.textContent.trim()).to.be.equal('Second');
            // Re-render with updated text.
            ParentComponent.model.text1 = 'Updated First';
            ParentComponent.model.text2 = 'Updated Second';

            const updatedButtons = document.querySelectorAll('button');
            // Same button elements should be recycled.
            expect(updatedButtons[0]).to.be.equal(firstButton);
            expect(updatedButtons[1]).to.be.equal(secondButton);
            expect(updatedButtons[0].textContent.trim()).to.be.equal('Updated First');
            expect(updatedButtons[1].textContent.trim()).to.be.equal('Updated Second');
        });

        it('must recycle components in nested partial by position', () => {
            const Button = Component.create`<button>${({ props }) => props.text}</button>`;
            const ParentComponent = Component.create`
                <div id="test-node">
                    ${({ model, partial }) => partial`
                        <div>
                            ${partial`
                                <${Button} text="${model.text}" />
                            `}
                        </div>
                    `}
                </div>
            `.mount({ model : new Model({ text : 'Nested' }) }, document.body);

            const originalButton = document.querySelector('button');
            expect(originalButton.textContent.trim()).to.be.equal('Nested');
            // Re-render with updated text.
            ParentComponent.model.text = 'Updated Nested';

            const updatedButton = document.querySelector('button');
            // Same button element should be recycled.
            expect(updatedButton).to.be.equal(originalButton);
            expect(updatedButton.textContent.trim()).to.be.equal('Updated Nested');
        });

        it('must NOT recycle components in arrays (without keys)', () => {
            const Button = Component.create`<button>${({ props }) => props.text}</button>`;
            const ParentComponent = Component.create`
                <div id="test-node">
                    ${({ model }) => model.items.map(item => Button.mount({ text : item }))}
                </div>
            `.mount({ model : new Model({ items : ['A', 'B', 'C'] }) }, document.body);

            const originalButtons = Array.from(document.querySelectorAll('button'));
            expect(originalButtons.length).to.be.equal(3);
            // Re-render with same items (same length).
            ParentComponent.model.items = ['A', 'B', 'C'];

            const newButtons = Array.from(document.querySelectorAll('button'));
            // New button elements should be created (no recycling without keys in arrays).
            expect(newButtons[0]).not.to.be.equal(originalButtons[0]);
            expect(newButtons[1]).not.to.be.equal(originalButtons[1]);
            expect(newButtons[2]).not.to.be.equal(originalButtons[2]);
        });

        it('must recycle components in arrays WITH keys', () => {
            const Button = Component.create`<button>${({ props }) => props.text}</button>`;
            const ParentComponent = Component.create`
                <div id="test-node">
                    ${({ model }) => model.items.map(item => Button.mount({ key : item.id, text : item.text }))}
                </div>
            `.mount({ model : new Model({ items : [{ id : '1', text : 'A' }, { id : '2', text : 'B' }, { id : '3', text : 'C' }] }) }, document.body);

            const originalButtons = Array.from(document.querySelectorAll('button'));
            expect(originalButtons.length).to.be.equal(3);
            // Re-render with reordered items.
            ParentComponent.model.items = [
                { id : '3', text : 'C-updated' },
                { id : '1', text : 'A-updated' },
                { id : '2', text : 'B-updated' }
            ];

            const newButtons = Array.from(document.querySelectorAll('button'));
            // Buttons should be recycled by key.
            expect(newButtons[0]).to.be.equal(originalButtons[2]); // id '3'
            expect(newButtons[1]).to.be.equal(originalButtons[0]); // id '1'
            expect(newButtons[2]).to.be.equal(originalButtons[1]); // id '2'
            expect(newButtons[0].textContent.trim()).to.be.equal('C-updated');
            expect(newButtons[1].textContent.trim()).to.be.equal('A-updated');
            expect(newButtons[2].textContent.trim()).to.be.equal('B-updated');
        });

        it('must recycle components in partial with array map using keys', () => {
            const Button = Component.create`<button>${({ props }) => props.text}</button>`;
            const ParentComponent = Component.create`
                <div id="test-node">
                    ${({ model, partial }) => partial`
                        <div>
                            ${model.items.map(item => partial`<${Button} key="${item.id}" text="${item.text}" />`)}
                        </div>
                    `}
                </div>
            `.mount({ model : new Model({ items : [{ id : '1', text : 'A' }, { id : '2', text : 'B' }] }) }, document.body);

            const originalButtons = Array.from(document.querySelectorAll('button'));
            expect(originalButtons.length).to.be.equal(2);
            // Re-render with reordered items.
            ParentComponent.model.items = [
                { id : '2', text : 'B-updated' },
                { id : '1', text : 'A-updated' }
            ];

            const newButtons = Array.from(document.querySelectorAll('button'));
            // Buttons should be recycled by key.
            expect(newButtons[0]).to.be.equal(originalButtons[1]);
            expect(newButtons[1]).to.be.equal(originalButtons[0]);
            expect(newButtons[0].textContent.trim()).to.be.equal('B-updated');
            expect(newButtons[1].textContent.trim()).to.be.equal('A-updated');
        });

        it('must update props of recycled positioned components', () => {
            const Button = Component.create`
                <button class="${({ props }) => props.className}">
                    ${({ props }) => props.text}
                </button>
            `;
            const ParentComponent = Component.create`
                <div id="test-node">
                    ${({ model, partial }) => partial`
                        <${Button} className="${model.class1}" text="${model.text1}" />
                        <${Button} className="${model.class2}" text="${model.text2}" />
                    `}
                </div>
            `.mount({ model : new Model({ class1 : 'btn-primary', text1 : 'First', class2 : 'btn-secondary', text2 : 'Second' }) }, document.body);

            const buttons = document.querySelectorAll('button');
            const firstButton = buttons[0];
            const secondButton = buttons[1];

            expect(firstButton.className).to.be.equal('btn-primary');
            expect(firstButton.textContent.trim()).to.be.equal('First');
            expect(secondButton.className).to.be.equal('btn-secondary');
            expect(secondButton.textContent.trim()).to.be.equal('Second');
            // Update props.
            ParentComponent.model.class1 = 'btn-success';
            ParentComponent.model.text1 = 'Updated First';
            ParentComponent.model.class2 = 'btn-danger';
            ParentComponent.model.text2 = 'Updated Second';

            const updatedButtons = document.querySelectorAll('button');
            // Same elements should be recycled with updated props.
            expect(updatedButtons[0]).to.be.equal(firstButton);
            expect(updatedButtons[1]).to.be.equal(secondButton);
            expect(updatedButtons[0].className).to.be.equal('btn-success');
            expect(updatedButtons[0].textContent.trim()).to.be.equal('Updated First');
            expect(updatedButtons[1].className).to.be.equal('btn-danger');
            expect(updatedButtons[1].textContent.trim()).to.be.equal('Updated Second');
        });

        it('must recycle different component types in same position by constructor', () => {
            const Button = Component.create`<button>Button</button>`;
            const Link = Component.create`<a>Link</a>`;

            const ParentComponent = Component.create`
                <div id="test-node">
                    ${({ model }) => model.showButton ? Button.mount() : Link.mount()}
                </div>
            `.mount({ model : new Model({ showButton : true }) }, document.body);

            const originalButton = document.querySelector('button');
            expect(originalButton).to.exist;
            // Switch to Link.
            ParentComponent.model.showButton = false;

            const link = document.querySelector('a');
            expect(link).to.exist;
            expect(document.querySelector('button')).not.to.exist;
            // Switch back to Button.
            ParentComponent.model.showButton = true;

            const newButton = document.querySelector('button');
            expect(newButton).to.exist;
            // Should be a different element (different component type).
            expect(newButton).not.to.be.equal(originalButton);
        });

        it('must render conditional component inside partial', () => {
            const Child = Component.create`<span class="child">child</span>`;

            const Parent = Component.create`
                <div class="parent">
                    ${({ model, partial }) => partial`
                        ${() => model.show ? partial`<${Child} />` : null}
                    `}
                </div>
            `;

            const parent = Parent.mount({ model : new Model({ show : false }) }, document.body);
            // Initially no child element.
            expect(document.querySelector('.child')).to.not.exist;
            // Toggle to show child.
            parent.model.show = true;
            expect(document.querySelectorAll('.child').length).to.equal(1);
            // Toggle to hide child.
            parent.model.show = false;
            expect(document.querySelector('.child')).to.not.exist;
            // Toggle to show child again – must not throw and still render only one child.
            parent.model.show = true;
            expect(document.querySelectorAll('.child').length).to.equal(1);
        });
    });

    describe('Recycling behaviors', () => {
        it('must recycle single component without moving', () => {
            let recycleCalls = 0;
            let originalElement = null;
            let originalParent = null;

            const Child = Component.create`<div>${({ props }) => props.text}</div>`.extend({
                onRecycle() {
                    recycleCalls++;
                }
            });

            const Main = Component.create`
                <div id="test-node">
                    <${Child} text="${({ model }) => model.text}" />
                </div>
            `.mount({ model : new Model({ text : 'Hello' }) }, document.body);
            // Store original element and parent.
            originalElement = document.querySelector('#test-node div');
            originalParent = originalElement.parentNode;
            expect(originalElement.textContent.trim()).to.be.equal('Hello');
            // Re-render with same component (should recycle without moving).
            Main.model.text = 'World';
            // Verify same element is reused and stayed in same position (same parent).
            const updatedElement = document.querySelector('#test-node div');
            expect(updatedElement).to.be.equal(originalElement);
            expect(updatedElement.parentNode).to.be.equal(originalParent);
            expect(updatedElement.parentNode.parentNode).to.be.equal(originalParent.parentNode);
            expect(updatedElement.textContent.trim()).to.be.equal('World');
            expect(recycleCalls).to.be.equal(1); // onRecycle was called.
        });

        it('must recycle component with movement when using partial', () => {
            let recycleCalls = 0;
            let originalChildElement = null;
            let originalInnerSpan = null;

            const Child = Component.create`<div>${({ props }) => props.text}</div>`.extend({
                onRecycle() {
                    recycleCalls++;
                }
            });

            const Main = Component.create`
                <div id="test-node">
                    ${({ model, partial }) => partial`<span class="outer"><span class="inner"><${Child} text="${model.text}" /></span></span>`}
                </div>
            `.mount({ model : new Model({ text : 'Hello' }) }, document.body);
            // Store original elements.
            originalChildElement = document.querySelector('#test-node .inner div');
            originalInnerSpan = document.querySelector('#test-node .inner');
            expect(originalChildElement.textContent.trim()).to.be.equal('Hello');
            // Re-render with same component (should recycle with movement due to partial).
            Main.model.text = 'World';
            // Verify child element is reused (same reference) and inner span is new (recreated).
            const updatedChildElement = document.querySelector('#test-node .inner div');
            const updatedInnerSpan = document.querySelector('#test-node .inner');

            expect(updatedChildElement).to.be.equal(originalChildElement); // Same child element object.
            expect(updatedInnerSpan).not.to.be.equal(originalInnerSpan); // New inner span element (recreated).
            expect(updatedChildElement.textContent.trim()).to.be.equal('World');
            expect(recycleCalls).to.be.equal(1); // onRecycle was called.
        });
    });
});
