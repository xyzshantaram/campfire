/**
 * Additional tests for Store class
 */

import * as chai from 'chai';
import sinon from 'sinon';
import { describe, it } from 'mocha';
import { Store } from './Store.ts';
import type { StoreEvent } from '../types.ts';

const expect = chai.expect;

describe('Additional Store Tests', () => {
  it('should support any() to subscribe to all event types', () => {
    const store = new Store({ foo: 'bar' });
    const spy = sinon.spy();
    
    store.any(spy);
    
    // Trigger update event
    store.update({ foo: 'baz' });
    
    // The spy should have been called once with the update event
    expect(spy.calledOnce).to.be.true;
    expect(spy.firstCall.args[0]).to.deep.include({
      type: 'update',
      value: { foo: 'baz' }
    });
    
    // Reset the spy to test other event types
    spy.resetHistory();
    
    // Mock _sendEvent for other event types since we can't trigger them directly
    store._sendEvent({ type: 'append', value: 'test', idx: 0 } as any);
    expect(spy.calledOnce).to.be.true;
    
    spy.resetHistory();
    store._sendEvent({ type: 'change', value: 'test', key: 'someKey' } as any);
    expect(spy.calledOnce).to.be.true;
    
    spy.resetHistory();
    store._sendEvent({ type: 'clear' } as any);
    expect(spy.calledOnce).to.be.true;
    
    spy.resetHistory();
    store._sendEvent({ type: 'deletion', value: 'test', key: 'someKey' } as any);
    expect(spy.calledOnce).to.be.true;
  });
  
  it('should not send events after dispose() is called', () => {
    const store = new Store<string>('test');
    const spy = sinon.spy();
    
    store.on('update', spy);
    store.dispose();
    
    store.update('new value');
    expect(spy.called).to.be.false;
    
    // Also verify that manually sending an event doesn't work
    store._sendEvent({ type: 'update', value: 'another value' } as StoreEvent<typeof store>);
    expect(spy.called).to.be.false;
  });
});