/**
 * Comprehensive tests for ListStore
 */

import * as chai from 'chai';
import sinon from 'sinon';
import { describe, it } from 'mocha';
import { ListStore } from './ListStore.ts';

const expect = chai.expect;

describe('ListStore Tests', () => {
  it('should initialize with empty array when no input is provided', () => {
    const store = new ListStore();
    expect(store.current()).to.be.an('array').that.is.empty;
    expect(store.length).to.equal(0);
  });

  it('should initialize with provided array', () => {
    const store = new ListStore([1, 2, 3]);
    expect(store.current()).to.deep.equal([1, 2, 3]);
    expect(store.length).to.equal(3);
  });

  it('should push values and emit append event', () => {
    const store = new ListStore<number>([1, 2]);
    const spy = sinon.spy();
    store.on('append', spy);

    const length = store.push(3);

    expect(length).to.equal(3);
    expect(store.current()).to.deep.equal([1, 2, 3]);
    expect(spy.calledOnce).to.be.true;
    expect(spy.firstCall.args[0]).to.deep.include({
      type: 'append',
      value: 3,
      idx: 2
    });
  });

  it('should remove values at index and emit deletion event', () => {
    const store = new ListStore(['a', 'b', 'c']);
    const spy = sinon.spy();
    store.on('deletion', spy);

    store.remove(1);

    expect(store.current()).to.deep.equal(['a', 'c']);
    expect(spy.calledOnce).to.be.true;
    expect(spy.firstCall.args[0]).to.deep.include({
      type: 'deletion',
      idx: 1,
      value: 'b'
    });
  });

  it('should throw RangeError when removing with invalid index', () => {
    const store = new ListStore([1, 2, 3]);

    expect(() => store.remove(3)).to.throw(RangeError);

    // Verify the store wasn't modified
    expect(store.current()).to.deep.equal([1, 2, 3]);
  });

  it('should get value at specified index', () => {
    const store = new ListStore(['a', 'b', 'c']);

    expect(store.get(0)).to.equal('a');
    expect(store.get(1)).to.equal('b');
    expect(store.get(2)).to.equal('c');
  });

  it('should throw RangeError when getting with invalid index', () => {
    const store = new ListStore([1, 2, 3]);

    expect(() => store.get(-1)).to.throw(RangeError);
    expect(() => store.get(3)).to.throw(RangeError);
  });

  it('should set value at specified index and emit change event', () => {
    const store = new ListStore(['a', 'b', 'c']);
    const spy = sinon.spy();
    store.on('change', spy);

    store.set(1, 'X');

    expect(store.current()).to.deep.equal(['a', 'X', 'c']);
    expect(spy.calledOnce).to.be.true;
    expect(spy.firstCall.args[0]).to.deep.include({
      type: 'change',
      value: 'X',
      idx: 1
    });
  });

  it('should throw RangeError when setting with invalid index', () => {
    const store = new ListStore([1, 2, 3]);

    expect(() => store.set(-1, 0)).to.throw(RangeError);
    expect(() => store.set(3, 4)).to.throw(RangeError);

    // Verify the store wasn't modified
    expect(store.current()).to.deep.equal([1, 2, 3]);
  });

  it('should clear all values and emit clear event', () => {
    const store = new ListStore([1, 2, 3]);
    const spy = sinon.spy();
    store.on('clear', spy);

    store.clear();

    expect(store.current()).to.be.an('array').that.is.empty;
    expect(store.length).to.equal(0);
    expect(spy.calledOnce).to.be.true;
    expect(spy.firstCall.args[0]).to.deep.include({
      type: 'clear'
    });
  });

  it('should access length property correctly', () => {
    const store = new ListStore<number>();
    expect(store.length).to.equal(0);

    store.push(1);
    expect(store.length).to.equal(1);

    store.push(2);
    expect(store.length).to.equal(2);

    store.remove(0);
    expect(store.length).to.equal(1);

    store.clear();
    expect(store.length).to.equal(0);
  });
});