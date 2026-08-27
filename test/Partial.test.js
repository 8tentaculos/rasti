import { expect } from 'chai';
import Partial from '../src/core/Partial.js';

// Capture a real tagged-template `strings` array plus its expressions.
const tag = (strings, ...expressions) => ({ strings, expressions });

// Owner handlers with real emission counters, so ids in the output are deterministic.
const makeOwner = (uid = 'r1') => {
    let elId = 0;
    let mkId = 0;
    const listeners = [];
    return {
        listeners,
        evaluate : expr => typeof expr === 'function' ? expr() : expr,
        registerListener : (fn, type) => {
            listeners.push({ fn, type });
            return { attribute : `data-rst-on-${type}-${uid}`, index : listeners.length - 1 };
        },
        nextElementId : () => `${uid}-${++elId}`,
        nextMarkerId : () => `${uid}-${++mkId}`,
        isChild : () => false,
        addChild : child => child,
        sanitize : value => `${value}`
    };
};

const makePartial = ({ strings, expressions }, owner = makeOwner()) =>
    new (Partial.create(strings, expressions))(expressions, owner);

describe('Partial', () => {
    describe('create', () => {
        it('must cache one subclass per strings identity', () => {
            let strings;
            const build = value => {
                const captured = tag`<div>${value}</div>`;
                strings = captured.strings;
                return Partial.create(captured.strings, captured.expressions);
            };
            const first = build('a');
            const second = Partial.create(strings, ['b']);

            expect(second).to.equal(first);
            expect(first.prototype).to.be.instanceOf(Partial);
        });

        it('must give partials from different call sites different constructors', () => {
            const a = makePartial(tag`<div>${'a'}</div>`);
            const b = makePartial(tag`<span>${'b'}</span>`);

            expect(a.constructor).to.not.equal(b.constructor);
            expect(a).to.be.instanceOf(Partial);
            expect(b).to.be.instanceOf(Partial);
        });
    });

    describe('toString', () => {
        it('must render elements with ids and interpolations with markers', () => {
            const partial = makePartial(tag`<div class="${'btn'}">${'hi'}</div>`);

            expect(partial.toString()).to.equal(
                '<div class="btn" data-rst-el="r1-1"><!--rst-s-r1-1-->hi<!--rst-e-r1-1--></div>'
            );
        });

        it('must create slot state lazily on first render, parallel to the parts', () => {
            const partial = makePartial(tag`<div class="${'btn'}">${'hi'}</div>`);

            expect(partial.slots).to.be.undefined;

            partial.toString();

            // `<div `, element, `>`, interpolation, `</div>`: only the two dynamic
            // parts get a slot, the literals hold `null`.
            expect(partial.slots).to.have.lengthOf(5);
            expect(partial.slots.map(slot => slot != null)).to.deep.equal([false, true, false, true, false]);
        });

        it('must render a nested partial recursively, sharing the owner emission counters', () => {
            const owner = makeOwner();
            const inner = makePartial(tag`<span class="${'i'}">${'x'}</span>`, owner);
            const outer = makePartial(tag`<div>${inner}</div>`, owner);

            expect(outer.toString()).to.equal(
                '<div data-rst-el="r1-1"><!--rst-s-r1-1-->' +
                    '<span class="i" data-rst-el="r1-2"><!--rst-s-r1-2-->x<!--rst-e-r1-2--></span>' +
                '<!--rst-e-r1-1--></div>'
            );
        });

        it('must render arrays by flattening each item', () => {
            const partial = makePartial(tag`<ul>${['a', 'b']}</ul>`);

            expect(partial.toString()).to.equal('<ul data-rst-el="r1-1"><!--rst-s-r1-1-->ab<!--rst-e-r1-1--></ul>');
        });

        it('must skip null and boolean values, keeping their markers empty', () => {
            const partial = makePartial(tag`<div>${null}${false}${true}</div>`);

            expect(partial.toString()).to.equal(
                '<div data-rst-el="r1-1">' +
                    '<!--rst-s-r1-1--><!--rst-e-r1-1-->' +
                    '<!--rst-s-r1-2--><!--rst-e-r1-2-->' +
                    '<!--rst-s-r1-3--><!--rst-e-r1-3-->' +
                '</div>'
            );
        });
    });

    describe('container', () => {
        it('must render a single-interpolation partial without markers', () => {
            const partial = makePartial(tag`${'solo'}`);

            expect(partial.isContainer()).to.be.true;
            expect(partial.toString()).to.equal('solo');
        });
    });

    describe('hydrate', () => {
        it('must attach element and interpolation refs from the rendered DOM', () => {
            const partial = makePartial(tag`<div class="${'btn'}">${'hi'}</div>`);
            document.body.innerHTML = partial.toString();

            // Elements are located by unique id anywhere under the parent (including
            // the root); markers are then located within the root.
            partial.hydrate(document.body);

            expect(partial.slots[1].ref).to.equal(document.querySelector('[data-rst-el="r1-1"]'));
            const [start, end] = partial.slots[3].ref;
            expect(start.data).to.equal('rst-s-r1-1');
            expect(end.data).to.equal('rst-e-r1-1');
        });
    });

    describe('update', () => {
        it('must patch element attributes against swapped expressions', () => {
            const partial = makePartial(tag`<div class="${'a'}"></div>`);
            document.body.innerHTML = partial.toString();
            partial.hydrate(document.body);

            expect(partial.slots[1].ref.getAttribute('class')).to.equal('a');

            partial.update(['b']);
            expect(partial.slots[1].ref.getAttribute('class')).to.equal('b');
        });
    });
});
