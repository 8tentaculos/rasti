import { expect } from 'chai';
import * as Rasti from '../src/index';
import Emitter from '../src/Emitter';
import Model from '../src/Model';
import View from '../src/View';

describe('Rasti', () => {

    it('must exists', () => {
        expect(Rasti).to.exist;
    });

    describe('Emitter', () => {

        it('should exists', () => {
            expect(Emitter).to.exist;
        });

        it('should instantiate', () => {
            let e = new Emitter();

            expect(e).to.exist;
            expect(e).to.be.an.instanceof(Emitter);
        });

        it('should add listener', () => {
            let e = new Emitter();

            let l1 = () => {};
            let l2 = () => {};
            let l3 = () => {};
            let l4 = () => {};

            // Add listeners for two events and check listeners object
            e.on('myEventA', l1);
            e.on('myEventA', l2);
            e.on('myEventB', l3);
            e.on('myEventB', l4);

            // Check listeners for myEventA
            expect(e.listeners).to.exist;
            expect(e.listeners['myEventA']).to.exist;
            expect(e.listeners['myEventA'][0]).to.be.a('function');
            expect(e.listeners['myEventA'][0]).to.be.equal(l1);
            expect(e.listeners['myEventA'][1]).to.be.a('function');
            expect(e.listeners['myEventA'][1]).to.be.equal(l2);

            // Check listeners for myEventB
            expect(e.listeners['myEventB']).to.include(l3);
            expect(e.listeners['myEventB']).to.include(l4);
        });

        it('should emit event', (done) => {
            let e = new Emitter();

            e.on('myEvent', done);

            e.emit('myEvent');
        });

        it('should stop listening', () => {
            let e = new Emitter();

            let l1 = () => {};
            let l2 = () => {};
            let l3 = () => {};
            let l4 = () => {};

            e.on('myEventA', l1);
            e.on('myEventA', l2);
            e.on('myEventB', l3);
            e.on('myEventB', l4);

            // Remove l1 listener from myEventA
            e.off('myEventA', l1);

            expect(e.listeners['myEventA']).to.have.lengthOf(1);
            expect(e.listeners['myEventA'][0]).to.be.equal(l2);

            // Remove all listeners from myEventB
            e.off('myEventB');

            expect(e.listeners['myEventB']).to.not.be.ok;

            // Remove all listeners
            e.off();

            expect(e.listeners).to.be.empty;
        });

        it('should emit once', () => {
            let e = new Emitter();
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

        it('must set and get attribute as key/value', () => {
            let m = new Model();
            m.set('test', true);
            expect(m.get('test')).to.be.true;
        });

        it('must set and get attribute as object', () => {
            let m = new Model();
            m.set({test : true});
            expect(m.get('test')).to.be.true;
        });

        it('must set attribute and emit change event', (done) => {
            let m = new Model();
            m.on('change:test', () => done());
            m.set({test : true});
            m.set({test : false});
        });

        it('must set attribute using setter and emit change event', (done) => {
            let m = new Model({ test : true });
            m.on('change:test', () => done());
            m.test = false;
        });
        
        it('must set attribute and have previous value', () => {
            let m = new Model({ test : true });
            m.test = false;
            expect(m.previous.test).to.be.true;
        });
    });

    describe('View', () => {
        it('must exists', () => {
            expect(View).to.exist;
        });

        it('must have element', () => {
            let v = new View();
            expect(v.el).to.exist;
            v.destroy();
        });

        it('must call onDestroy', (done) => {
            let v = new View({ onDestroy : done });
            v.destroy();
        });

        it('must addChild', () => {
            let v = new View();
            let c = v.addChild(new View());
            expect(c).to.equal(v.children[0]);
        });

        it('must destroyChildren on render', () => {
            let v = new View();
            v.addChild(new View());
            expect(v.children).to.have.lengthOf(1);
            v.render();
            expect(v.children).to.have.lengthOf(0);
        });

        it('must call onDestroy on children', (done) => {
            let v = new View();
            v.addChild(new View({ onDestroy : done }));
            v.destroyChildren();
        });
        
        it('must have unique uid', () => {
            let v1 = new View();
            let v2 = new View();
            
            expect(v1.uid).not.to.be.equal(v2.uid);
        });
    });
});
