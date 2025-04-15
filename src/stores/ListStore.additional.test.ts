/**
 * Additional tests for ListStore
 */

import * as chai from 'chai';
import sinon from 'sinon';
import { describe, it } from 'mocha';
import { ListStore } from './ListStore.ts';

const expect = chai.expect;

describe('Additional ListStore Tests', () => {
  it('should silently ignore remove() with negative index', () => {
    const store = new ListStore([1, 2, 3]);
    const spy = sinon.spy();
    store.on('deletion', spy);
    
    // Should not throw and should silently ignore
    store.remove(-1);
    
    // Verify store was not modified
    expect(store.current()).to.deep.equal([1, 2, 3]);
    expect(spy.called).to.be.false;
  });
  
  it('should be iterable with for-of loop', () => {
    const store = new ListStore(['a', 'b', 'c']);
    const values: string[] = [];
    
    for (const item of store) {
      values.push(item);
    }
    
    expect(values).to.deep.equal(['a', 'b', 'c']);
  });
  
  it('should support map() method', () => {
    const store = new ListStore([1, 2, 3]);
    const doubled = store.map(x => x * 2);
    
    expect(doubled).to.deep.equal([2, 4, 6]);
  });
  
  it('should support forEach() method', () => {
    const store = new ListStore([1, 2, 3]);
    const values: number[] = [];
    
    store.forEach(value => values.push(value));
    
    expect(values).to.deep.equal([1, 2, 3]);
  });
  
  it('should support findIndex() method', () => {
    const store = new ListStore([10, 20, 30]);
    
    const index = store.findIndex(value => value > 15);
    
    expect(index).to.equal(1);
  });
});