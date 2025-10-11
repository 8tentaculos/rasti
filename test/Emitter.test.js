import { expect } from 'chai';
import Emitter from '../src/Emitter.js';

describe('Emitter', () => {
    describe('Basic functionality', () => {
        it('must exists', () => {
            expect(Emitter).to.exist;
        });

        it('must instantiate', () => {
            const e = new Emitter();

            expect(e).to.exist;
            expect(e).to.be.an.instanceof(Emitter);
        });
    });

    describe('Event handling', () => {
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

        it('must return a function to remove listener from once', () => {
            const e = new Emitter();
            let count = 0;

            const remove = e.once('myEvent', () => { count++; });

            // Remove listener before emitting.
            remove();

            // Emit event 2 times.
            e.emit('myEvent');
            e.emit('myEvent');

            expect(count).to.be.equal(0);
            expect(e.listeners).to.not.exist;
        });

        it('must pass arguments to listeners', () => {
            const e = new Emitter();
            let receivedArgs = null;

            e.on('myEvent', (...args) => {
                receivedArgs = args;
            });

            // Emit with no arguments.
            e.emit('myEvent');
            expect(receivedArgs).to.deep.equal([]);

            // Emit with single argument.
            e.emit('myEvent', 'test');
            expect(receivedArgs).to.deep.equal(['test']);

            // Emit with multiple arguments.
            e.emit('myEvent', 'arg1', 42, { key : 'value' });
            expect(receivedArgs).to.deep.equal(['arg1', 42, { key : 'value' }]);
        });

        it('must throw error if listener is not a function', () => {
            const e = new Emitter();

            expect(() => e.on('myEvent', 'not a function')).to.throw(TypeError, 'Listener must be a function');
            expect(() => e.on('myEvent', 123)).to.throw(TypeError, 'Listener must be a function');
            expect(() => e.on('myEvent', null)).to.throw(TypeError, 'Listener must be a function');
            expect(() => e.on('myEvent', undefined)).to.throw(TypeError, 'Listener must be a function');

            expect(() => e.once('myEvent', 'not a function')).to.throw(TypeError, 'Listener must be a function');
        });

        it('must handle repeated off calls gracefully', () => {
            const e = new Emitter();
            const listener = () => {};

            e.on('myEvent', listener);

            // Remove listener multiple times - should not throw errors.
            expect(() => {
                e.off('myEvent', listener);
                e.off('myEvent', listener);
                e.off('myEvent', listener);
            }).to.not.throw();

            // Remove from non-existent event type.
            expect(() => {
                e.off('nonExistentEvent', listener);
            }).to.not.throw();

            // Remove all listeners multiple times.
            expect(() => {
                e.off();
                e.off();
                e.off();
            }).to.not.throw();
        });

        it('must emit to correct listeners only', () => {
            const e = new Emitter();
            let countA = 0;
            let countB = 0;

            e.on('eventA', () => { countA++; });
            e.on('eventB', () => { countB++; });

            e.emit('eventA');
            expect(countA).to.equal(1);
            expect(countB).to.equal(0);

            e.emit('eventB');
            expect(countA).to.equal(1);
            expect(countB).to.equal(1);

            e.emit('nonExistentEvent');
            expect(countA).to.equal(1);
            expect(countB).to.equal(1);
        });
    });

    describe('Inverse of Control methods', () => {
        it('must listen to another emitter with listenTo', () => {
            const e1 = new Emitter();
            const e2 = new Emitter();
            let count = 0;

            const listener = () => { count++; };
            const remove = e1.listenTo(e2, 'myEvent', listener);

            // Emit from e2, should trigger listener on e1.
            e2.emit('myEvent');
            expect(count).to.equal(1);

            // Check that listeningTo array was created.
            expect(e1.listeningTo).to.exist;
            expect(e1.listeningTo).to.have.lengthOf(1);
            expect(e1.listeningTo[0].emitter).to.equal(e2);
            expect(e1.listeningTo[0].type).to.equal('myEvent');
            expect(e1.listeningTo[0].listener).to.equal(listener);

            // Test remove function.
            remove();
            e2.emit('myEvent');
            expect(count).to.equal(1); // Should not increase.
            expect(e1.listeningTo).to.not.exist;
        });

        it('must listen once to another emitter with listenToOnce', () => {
            const e1 = new Emitter();
            const e2 = new Emitter();
            let count = 0;

            const listener = () => { count++; };
            e1.listenToOnce(e2, 'myEvent', listener);

            // First emission should work.
            e2.emit('myEvent');
            expect(count).to.equal(1);

            // Second emission should not trigger listener.
            e2.emit('myEvent');
            expect(count).to.equal(1);

            // listeningTo should be cleaned up.
            expect(e1.listeningTo).to.not.exist;
        });

        it('must throw error if listenTo listener is not a function', () => {
            const e1 = new Emitter();
            const e2 = new Emitter();

            expect(() => e1.listenToOnce(e2, 'myEvent', 'not a function')).to.throw(TypeError, 'Listener must be a function');
        });

        it('must stop listening with all parameter combinations', () => {
            const e1 = new Emitter();
            const e2 = new Emitter();
            const e3 = new Emitter();
            
            const l1 = () => {};
            const l2 = () => {};
            const l3 = () => {};

            // Setup multiple listening relationships.
            e1.listenTo(e2, 'eventA', l1);
            e1.listenTo(e2, 'eventA', l2);
            e1.listenTo(e2, 'eventB', l3);
            e1.listenTo(e3, 'eventA', l1);

            expect(e1.listeningTo).to.have.lengthOf(4);

            // Test stopListening(emitter, type, listener) - remove specific listener.
            e1.stopListening(e2, 'eventA', l1);
            expect(e1.listeningTo).to.have.lengthOf(3);

            // Test stopListening(emitter, type) - remove all listeners for type from emitter.
            e1.stopListening(e2, 'eventA');
            expect(e1.listeningTo).to.have.lengthOf(2);

            // Test stopListening(emitter) - remove all listeners from emitter.
            e1.stopListening(e2);
            expect(e1.listeningTo).to.have.lengthOf(1);
            expect(e1.listeningTo[0].emitter).to.equal(e3);

            // Test stopListening() - remove all listeners.
            e1.stopListening();
            expect(e1.listeningTo).to.not.exist;
        });

        it('must handle stopListening with non-existent relationships', () => {
            const e1 = new Emitter();
            const e2 = new Emitter();
            const e3 = new Emitter();
            const listener = () => {};

            // Add one relationship.
            e1.listenTo(e2, 'myEvent', listener);

            // Try to stop listening to non-existent relationships - should not throw.
            expect(() => {
                e1.stopListening(e3, 'myEvent', listener); // Different emitter
                e1.stopListening(e2, 'otherEvent', listener); // Different event
                e1.stopListening(e2, 'myEvent', () => {}); // Different listener
            }).to.not.throw();

            // Original relationship should still exist.
            expect(e1.listeningTo).to.have.lengthOf(1);
        });

        it('must handle multiple listenTo calls to same event', () => {
            const e1 = new Emitter();
            const e2 = new Emitter();
            let count1 = 0;
            let count2 = 0;

            const listener1 = () => { count1++; };
            const listener2 = () => { count2++; };

            e1.listenTo(e2, 'myEvent', listener1);
            e1.listenTo(e2, 'myEvent', listener2);

            e2.emit('myEvent');
            expect(count1).to.equal(1);
            expect(count2).to.equal(1);
            expect(e1.listeningTo).to.have.lengthOf(2);

            // Stop listening to one specific listener.
            e1.stopListening(e2, 'myEvent', listener1);
            
            e2.emit('myEvent');
            expect(count1).to.equal(1); // Should not increase
            expect(count2).to.equal(2); // Should increase
            expect(e1.listeningTo).to.have.lengthOf(1);
        });

        it('must clean up listeners when emitter is destroyed', () => {
            const e1 = new Emitter();
            const e2 = new Emitter();
            let count = 0;

            const listener = () => { count++; };
            e1.listenTo(e2, 'myEvent', listener);

            // Verify listener is working.
            e2.emit('myEvent');
            expect(count).to.equal(1);

            // Clean up all listeners from e1.
            e1.stopListening();

            // Should not respond to e2 events anymore.
            e2.emit('myEvent');
            expect(count).to.equal(1);
            expect(e1.listeningTo).to.not.exist;
        });

        it('must return remove function from listenTo methods', () => {
            const e1 = new Emitter();
            const e2 = new Emitter();
            let count = 0;

            const listener = () => { count++; };
            
            // Test listenTo remove function.
            const remove1 = e1.listenTo(e2, 'event1', listener);
            expect(remove1).to.be.a('function');
            
            // Test listenToOnce remove function.
            const remove2 = e1.listenToOnce(e2, 'event2', listener);
            expect(remove2).to.be.a('function');

            e2.emit('event1');
            e2.emit('event2');
            expect(count).to.equal(2);

            remove1();
            remove2(); // Should work even though listenToOnce already removed itself

            e2.emit('event1');
            e2.emit('event2');
            expect(count).to.equal(2); // Should not increase
        });
    });
});
