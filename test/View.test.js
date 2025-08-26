import { expect } from 'chai';
import View from '../src/View.js';

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

    it('must be destroyed and removed from dom', () => {
        const v = new View({
            attributes : { id : 'test-node' },
            events : { 'click' : () => {} },
        });

        v.on('event', () => {});

        document.body.appendChild(v.render().el);
        expect(document.getElementById('test-node')).to.exist;

        expect(v.listeners).to.be.an('object');
        expect(v.listeners['event']).to.be.an('array');
        expect(v.delegatedEventListeners).to.be.an('array');
        expect(v.delegateEvents).to.have.lengthOf(1);

        v.destroy().removeElement();
        expect(document.getElementById('test-node')).to.not.exist;

        expect(v.listeners).to.not.exist;
        expect(v.delegatedEventListeners).to.have.lengthOf(0);
    });

    it('must call onDestroy', (done) => {
        const v = new View({ onDestroy : done });
        v.destroy();
    });

    it('must call destroy queue', (done) => {
        const v = new View();
        v.destroyQueue.push(done);
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
            new MouseEvent('click', { bubbles : true })
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
            new MouseEvent('click', { bubbles : true })
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
            new MouseEvent('click', { bubbles : true })
        );
    });

    it('must call handler for each ascendant match', (done) => {
        class MyView extends View {}

        MyView.prototype.template = () => `
            <section class="target">
                <div class="target"><button id="btn"></button></div>
            </section>
        `;

        const matches = [];

        MyView.prototype.events = {
            'click .target' : (e, view, el) => {
                matches.push(el);
                if (matches.length === 2) {
                    const v = view;
                    expect(matches[0]).to.equal(v.$('div.target'));
                    expect(matches[1]).to.equal(v.$('section.target'));
                    done();
                }
            }
        };

        const v = new MyView();
        document.body.appendChild(v.render().el);
        v.$('#btn').dispatchEvent(new MouseEvent('click', { bubbles : true }));
    });

    it('must not match elements outside the view', (done) => {
        class MyView extends View {}

        MyView.prototype.template = () => `
            <div class="target"><button id="btn-out"></button></div>
        `;

        const matches = [];

        MyView.prototype.events = {
            'click .target' : (e, view, el) => {
                matches.push(el);
                setTimeout(() => {
                    expect(matches).to.have.lengthOf(1);
                    expect(matches[0]).to.equal(view.$('div.target'));
                    done();
                }, 0);
            }
        };

        const wrapper = document.createElement('div');
        wrapper.className = 'target';

        const v = new MyView();
        wrapper.appendChild(v.render().el);
        document.body.appendChild(wrapper);

        v.$('#btn-out').dispatchEvent(new MouseEvent('click', { bubbles : true }));
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
