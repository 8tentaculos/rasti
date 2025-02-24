import { expect } from 'chai';
import Emitter from '../src/Emitter.js';

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

    it('must return a function to remove listener', () => {
        const e = new Emitter();
        let count = 0;

        const remove = e.on('myEvent', () => { count++; });

        // Emit event 2 times.
        e.emit('myEvent');
        e.emit('myEvent');

        expect(count).to.be.equal(2);

        // Remove listener.
        remove();

        // Emit event 2 times.
        e.emit('myEvent');
        e.emit('myEvent');

        expect(count).to.be.equal(2);
        expect(e.listeners).to.not.exist;
    });
});
