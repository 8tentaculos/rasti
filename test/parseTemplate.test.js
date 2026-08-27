import { expect } from 'chai';
import parseTemplate from '../src/core/parseTemplate.js';
import SafeHTML from '../src/core/SafeHTML.js';
import ElementDescriptor from '../src/core/ElementDescriptor.js';
import InterpolationDescriptor from '../src/core/InterpolationDescriptor.js';
import ComponentDescriptor from '../src/core/ComponentDescriptor.js';
import Attribute from '../src/core/Attribute.js';
import ExpressionIndex from '../src/core/ExpressionIndex.js';

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

// Assert a parsed key or value: a number expects a reference to that expression,
// anything else a literal parsed from the template.
const expectPart = (part, expected) => {
    if (typeof expected === 'number') {
        expect(part).to.be.instanceOf(ExpressionIndex);
        expect(part.index).to.equal(expected);
        return;
    }
    expect(part).to.equal(expected);
};

// Assert an Attribute's key/value (expression or literal) and quoted flag.
const expectAttr = (attr, key, value, quoted) => {
    expect(attr).to.be.instanceOf(Attribute);
    expectPart(attr.key, key);
    expectPart(attr.value, value);
    if (typeof quoted !== 'undefined') expect(attr.quoted).to.equal(quoted);
};

// The skeleton keeps a single list, so the dynamic parts of a given kind are read
// back by filtering it. `ComponentDescriptor` extends `InterpolationDescriptor`, so
// interpolations include component tags.
const dynamicParts = (parts, Descriptor) => parts.filter(part => part instanceof Descriptor);
const elementsOf = parts => dynamicParts(parts, ElementDescriptor);
const interpolationsOf = parts => dynamicParts(parts, InterpolationDescriptor);

describe('parseTemplate', () => {
    describe('skeleton shape', () => {
        it('must split a template into typed parts', () => {
            const { strings, expressions } = tag`<div class=${'a'}>${'b'}</div>`;
            const { parts } = parseTemplate(strings, expressions);

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

        it('must keep a dynamic tag name as an expression part', () => {
            const { strings, expressions } = tag`<${'section'}>${'a'}</${'section'}>`;
            const { parts } = parseTemplate(strings, expressions);

            // The tag names are parts of their own, and the element still gets a
            // descriptor, since the root always does.
            expect(elementsOf(parts)).to.have.lengthOf(1);
            expect(parts[0]).to.be.instanceOf(SafeHTML);
            expect(`${parts[0]}`).to.equal('<');
            expect(parts[1]).to.be.instanceOf(ExpressionIndex);
            expect(parts[1].index).to.equal(0);
            expect(parts[parts.length - 2]).to.be.instanceOf(ExpressionIndex);
            expect(parts[parts.length - 2].index).to.equal(2);
        });

        it('must store expression indices, not values, in descriptors', () => {
            const { strings, expressions } = tag`<div class=${'a'}>${'b'}</div>`;
            const { parts } = parseTemplate(strings, expressions);

            expect(parts[1].attributes).to.have.lengthOf(1);
            expectAttr(parts[1].attributes[0], 'class', 0, false);

            expect(parts[3].expressionIndex).to.equal(1);
        });

        it('must give the root element a descriptor even when otherwise static', () => {
            const { strings, expressions } = tag`<div>hello</div>`;
            const { parts } = parseTemplate(strings, expressions);

            // The first (root) element always gets a descriptor so it can be
            // adopted as a component's element and located on hydration.
            expect(parts).to.have.lengthOf(3);
            expect(parts[1]).to.be.instanceOf(ElementDescriptor);
            expect(parts[1].attributes).to.be.empty;
            expect(interpolationsOf(parts)).to.be.empty;
        });
    });

    describe('attribute descriptors', () => {
        it('must parse unquoted, quoted, value-less and static attributes', () => {
            const { strings, expressions } = tag`<a href=${'/x'} title="${'t'}" hidden=${true} data-static="z"></a>`;
            const elements = elementsOf(parseTemplate(strings, expressions).parts);

            expect(elements).to.have.lengthOf(1);
            const attributes = elements[0].attributes;
            expect(attributes).to.have.lengthOf(4);

            expectAttr(attributes[0], 'href', 0, false);
            expectAttr(attributes[1], 'title', 1, true);
            expectAttr(attributes[2], 'hidden', 2, false);
            expectAttr(attributes[3], 'data-static', 'z', true);
        });

        it('must parse a value-less placeholder attribute (object spread / boolean)', () => {
            const { strings, expressions } = tag`<input ${{ type : 'text' }}/>`;
            const elements = elementsOf(parseTemplate(strings, expressions).parts);

            expect(elements[0].attributes).to.have.lengthOf(1);
            expectAttr(elements[0].attributes[0], 0, undefined, false);
        });
    });

    describe('multiple dynamic regions and ordering', () => {
        it('must give every element and interpolation its own descriptor', () => {
            const { strings, expressions } = tag`<ul class=${'l'}><li>${'a'}</li><li id=${'x'}>${'b'}</li></ul>`;
            const { parts } = parseTemplate(strings, expressions);

            const elements = elementsOf(parts);
            expect(elements).to.have.lengthOf(2);
            expectAttr(elements[0].attributes[0], 'class', 0);
            expectAttr(elements[1].attributes[0], 'id', 2);

            expect(interpolationsOf(parts).map(i => i.expressionIndex)).to.deep.equal([1, 3]);
        });

        it('must place component tags in document order among the other parts', () => {
            const Comp = makeComponent();
            const { strings, expressions } = tag`<div><input value=${'v'}><p>${'t'}</p><${Comp}/></div>`;
            const { parts } = parseTemplate(strings, expressions, isComponentClass);

            // Component tags are extracted before text interpolations, so `parts` is
            // what puts them back where the template wrote them.
            const interpolations = interpolationsOf(parts);
            expect(interpolations).to.have.lengthOf(2);
            expect(interpolations[0]).to.not.be.instanceOf(ComponentDescriptor);
            expect(interpolations[0].expressionIndex).to.equal(1);
            expect(interpolations[1]).to.be.instanceOf(ComponentDescriptor);
        });

        it('must parse a multi-root fragment (role-agnostic, no single-root validation)', () => {
            const { strings, expressions } = tag`<span>${'a'}</span><span>${'b'}</span>`;
            const parse = () => parseTemplate(strings, expressions);

            expect(parse).to.not.throw();
            expect(interpolationsOf(parse().parts)).to.have.lengthOf(2);
        });
    });

    describe('component tags', () => {
        it('must extract a self-closing component tag as a ComponentDescriptor', () => {
            const Comp = makeComponent();
            const { strings, expressions } = tag`<div><${Comp} className=${'x'}/></div>`;
            const { parts } = parseTemplate(strings, expressions, isComponentClass);

            // The wrapping `<div>` is the forced root element.
            expect(elementsOf(parts)).to.have.lengthOf(1);
            expect(parts).to.have.lengthOf(5);

            const desc = parts[3];
            expect(desc).to.be.instanceOf(ComponentDescriptor);
            expect(desc).to.be.instanceOf(InterpolationDescriptor);
            expect(expressions[desc.expressionIndex]).to.equal(Comp);
            expect(desc.inner).to.be.null;
            expectAttr(desc.attributes[0], 'className', 1);
        });

        it('must parse inner content as a nested fragment skeleton sharing parent expressions', () => {
            const Comp = makeComponent();
            const { strings, expressions } = tag`<div><${Comp}>${'hi'}</${Comp}></div>`;
            const { parts } = parseTemplate(strings, expressions, isComponentClass);

            const desc = interpolationsOf(parts)[0];
            expect(desc).to.be.instanceOf(ComponentDescriptor);
            const inner = interpolationsOf(desc.inner.parts);
            expect(inner).to.have.lengthOf(1);
            expect(inner[0].expressionIndex).to.equal(1);
        });

        it('must parse a lone component tag as a single-part container skeleton', () => {
            const Comp = makeComponent();
            const { strings, expressions } = tag`<${Comp} className=${'ok'}/>`;
            const { parts } = parseTemplate(strings, expressions, isComponentClass);

            expect(parts).to.have.lengthOf(1);
            expect(parts[0]).to.be.instanceOf(ComponentDescriptor);
        });

        it('must parse nested component tags inside inner content', () => {
            const Outer = makeComponent();
            const Inner = makeComponent();
            const { strings, expressions } = tag`<div><${Outer}><${Inner}/></${Outer}></div>`;
            const { parts } = parseTemplate(strings, expressions, isComponentClass);

            const outer = interpolationsOf(parts)[0];
            expect(outer).to.be.instanceOf(ComponentDescriptor);
            const inner = interpolationsOf(outer.inner.parts);
            expect(inner).to.have.lengthOf(1);
            expect(inner[0]).to.be.instanceOf(ComponentDescriptor);
        });

        it('must coalesce open and close tag references to a single descriptor', () => {
            const Comp = makeComponent();
            const { strings, expressions } = tag`<${Comp}>${'a'}</${Comp}>`;
            const { parts } = parseTemplate(strings, expressions, isComponentClass);

            const interpolations = interpolationsOf(parts);
            expect(interpolations).to.have.lengthOf(1);
            expect(interpolations[0]).to.be.instanceOf(ComponentDescriptor);
            expect(expressions[interpolations[0].expressionIndex]).to.equal(Comp);
        });
    });

    it('must return fresh skeleton data on each call (no caching here)', () => {
        const { strings, expressions } = tag`<div>${'a'}</div>`;
        expect(parseTemplate(strings, expressions)).to.not.equal(parseTemplate(strings, expressions));
    });
});
