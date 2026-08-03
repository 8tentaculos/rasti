import { expect } from 'chai';
import parseTemplate from '../src/core/template/parseTemplate.js';
import SafeHTML from '../src/core/SafeHTML.js';
import ElementDescriptor from '../src/core/template/ElementDescriptor.js';
import InterpolationDescriptor from '../src/core/template/InterpolationDescriptor.js';
import ComponentDescriptor from '../src/core/template/ComponentDescriptor.js';
import Attribute from '../src/core/template/Attribute.js';

// Capture a real tagged-template `strings` array (frozen, stable identity per
// call site) alongside its expressions.
const tag = (strings, ...expressions) => ({ strings, expressions });

// Stand-in for a component class plus the injected predicate, so parsing can
// detect component tags without importing Component.
const makeComponent = () => {
    const Comp = function() {};
    Comp.isStubComponent = true;
    return Comp;
};
const isComponentClass = x => !!(x && x.isStubComponent);

// Assert an Attribute's key/value (index or literal) and quoted flag.
const expectAttr = (attr, key, value, quoted) => {
    expect(attr).to.be.instanceOf(Attribute);
    expect(attr.key).to.equal(key);
    expect(attr.value).to.equal(value);
    if (typeof quoted !== 'undefined') expect(attr.quoted).to.equal(quoted);
};

describe('parseTemplate', () => {
    describe('skeleton shape', () => {
        it('must split a template into typed parts', () => {
            const { strings, expressions } = tag`<div class=${'a'}>${'b'}</div>`;
            const { parts, elements, interpolations } = parseTemplate(strings, expressions);

            expect(elements).to.have.lengthOf(1);
            expect(interpolations).to.have.lengthOf(1);

            expect(parts).to.have.lengthOf(5);
            expect(parts[0]).to.be.instanceOf(SafeHTML);
            expect(`${parts[0]}`).to.equal('<div ');
            expect(parts[1]).to.be.instanceOf(ElementDescriptor);
            expect(parts[2]).to.be.instanceOf(SafeHTML);
            expect(`${parts[2]}`).to.equal('>');
            expect(parts[3]).to.be.instanceOf(InterpolationDescriptor);
            expect(parts[4]).to.be.instanceOf(SafeHTML);
            expect(`${parts[4]}`).to.equal('</div>');
        });

        it('must reference the same descriptor instances in parts and tables', () => {
            const { strings, expressions } = tag`<div class=${'a'}>${'b'}</div>`;
            const { parts, elements, interpolations } = parseTemplate(strings, expressions);

            expect(parts[1]).to.equal(elements[0]);
            expect(parts[3]).to.equal(interpolations[0]);
        });

        it('must store expression indices, not values, in descriptors', () => {
            const { strings, expressions } = tag`<div class=${'a'}>${'b'}</div>`;
            const { elements, interpolations } = parseTemplate(strings, expressions);

            expect(elements[0].slotIndex).to.equal(0);
            expect(elements[0].attrs).to.have.lengthOf(1);
            expectAttr(elements[0].attrs[0], 'class', 0, false);

            expect(interpolations[0].slotIndex).to.equal(0);
            expect(interpolations[0].exprIndex).to.equal(1);
        });

        it('must produce no descriptors for a fully static template', () => {
            const { strings, expressions } = tag`<div>hello</div>`;
            const { parts, elements, interpolations } = parseTemplate(strings, expressions);

            expect(elements).to.be.empty;
            expect(interpolations).to.be.empty;
            expect(parts).to.have.lengthOf(1);
            expect(parts[0]).to.be.instanceOf(SafeHTML);
            expect(`${parts[0]}`).to.equal('<div>hello</div>');
        });
    });

    describe('attribute descriptors', () => {
        it('must parse unquoted, quoted, value-less and static attributes', () => {
            const { strings, expressions } = tag`<a href=${'/x'} title="${'t'}" hidden=${true} data-static="z"></a>`;
            const { elements } = parseTemplate(strings, expressions);

            expect(elements).to.have.lengthOf(1);
            const attrs = elements[0].attrs;
            expect(attrs).to.have.lengthOf(4);

            expectAttr(attrs[0], 'href', 0, false);
            expectAttr(attrs[1], 'title', 1, true);
            expectAttr(attrs[2], 'hidden', 2, false);
            expectAttr(attrs[3], 'data-static', 'z', true);
        });

        it('must parse a value-less placeholder attribute (object spread / boolean)', () => {
            const { strings, expressions } = tag`<input ${{ type : 'text' }}/>`;
            const { elements } = parseTemplate(strings, expressions);

            expect(elements[0].attrs).to.have.lengthOf(1);
            expectAttr(elements[0].attrs[0], 0, undefined, false);
        });
    });

    describe('multiple dynamic regions and ordering', () => {
        it('must index every element and interpolation table entry', () => {
            const { strings, expressions } = tag`<ul class=${'l'}><li>${'a'}</li><li id=${'x'}>${'b'}</li></ul>`;
            const { elements, interpolations } = parseTemplate(strings, expressions);

            expect(elements.map(e => e.slotIndex)).to.deep.equal([0, 1]);
            expectAttr(elements[0].attrs[0], 'class', 0);
            expectAttr(elements[1].attrs[0], 'id', 2);

            expect(interpolations.map(i => [i.slotIndex, i.exprIndex])).to.deep.equal([[0, 1], [1, 3]]);
        });

        it('must parse a multi-root fragment (role-agnostic, no single-root validation)', () => {
            const { strings, expressions } = tag`<span>${'a'}</span><span>${'b'}</span>`;
            const parse = () => parseTemplate(strings, expressions);

            expect(parse).to.not.throw();
            expect(parse().interpolations).to.have.lengthOf(2);
        });
    });

    describe('component tags', () => {
        it('must extract a self-closing component tag as a ComponentDescriptor', () => {
            const Comp = makeComponent();
            const { strings, expressions } = tag`<div><${Comp} className=${'x'}/></div>`;
            const { parts, elements, interpolations } = parseTemplate(strings, expressions, isComponentClass);

            expect(elements).to.be.empty;
            expect(interpolations).to.have.lengthOf(1);

            const desc = interpolations[0];
            expect(desc).to.be.instanceOf(ComponentDescriptor);
            expect(desc).to.be.instanceOf(InterpolationDescriptor);
            expect(desc.slotIndex).to.equal(0);
            expect(expressions[desc.tagIndex]).to.equal(Comp);
            expect(desc.inner).to.be.null;
            expectAttr(desc.attrs[0], 'className', 1);

            expect(parts).to.have.lengthOf(3);
            expect(parts[1]).to.equal(desc);
        });

        it('must parse inner content as a nested fragment skeleton sharing parent expressions', () => {
            const Comp = makeComponent();
            const { strings, expressions } = tag`<div><${Comp}>${'hi'}</${Comp}></div>`;
            const { interpolations } = parseTemplate(strings, expressions, isComponentClass);

            const desc = interpolations[0];
            expect(desc).to.be.instanceOf(ComponentDescriptor);
            expect(desc.inner.interpolations).to.have.lengthOf(1);
            expect(desc.inner.interpolations[0].exprIndex).to.equal(1);
        });

        it('must parse a lone component tag as a single-part container skeleton', () => {
            const Comp = makeComponent();
            const { strings, expressions } = tag`<${Comp} className=${'ok'}/>`;
            const { parts, elements, interpolations } = parseTemplate(strings, expressions, isComponentClass);

            expect(elements).to.be.empty;
            expect(interpolations).to.have.lengthOf(1);
            expect(parts).to.have.lengthOf(1);
            expect(parts[0]).to.equal(interpolations[0]);
            expect(parts[0]).to.be.instanceOf(ComponentDescriptor);
        });

        it('must parse nested component tags inside inner content', () => {
            const Outer = makeComponent();
            const Inner = makeComponent();
            const { strings, expressions } = tag`<div><${Outer}><${Inner}/></${Outer}></div>`;
            const { interpolations } = parseTemplate(strings, expressions, isComponentClass);

            const outer = interpolations[0];
            expect(outer).to.be.instanceOf(ComponentDescriptor);
            expect(outer.inner.interpolations).to.have.lengthOf(1);
            expect(outer.inner.interpolations[0]).to.be.instanceOf(ComponentDescriptor);
        });

        it('must coalesce open and close tag references to a single descriptor', () => {
            const Comp = makeComponent();
            const { strings, expressions } = tag`<${Comp}>${'a'}</${Comp}>`;
            const { interpolations } = parseTemplate(strings, expressions, isComponentClass);

            expect(interpolations).to.have.lengthOf(1);
            expect(interpolations[0]).to.be.instanceOf(ComponentDescriptor);
            expect(expressions[interpolations[0].tagIndex]).to.equal(Comp);
        });
    });

    it('must return fresh skeleton data on each call (no caching here)', () => {
        const { strings, expressions } = tag`<div>${'a'}</div>`;
        expect(parseTemplate(strings, expressions)).to.not.equal(parseTemplate(strings, expressions));
    });
});
