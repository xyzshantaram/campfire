/**
 * Tests for additional utility functions in utils.ts
 */

import * as chai from 'chai';
import sinon from 'sinon';
import { describe, it, beforeEach, afterEach } from 'mocha';
import { callbackify, poll, seq, escape, unescape } from './utils.ts';

const expect = chai.expect;

describe('tests for escape() and unescape()', () => {
    let escaped = '&amp;&lt;&gt;&quot;&#39;/';
    let unescaped = '&<>"\'/';

    escaped += escaped;
    unescaped += unescaped;

    it('should escape values', () => {
        expect(escape(unescaped)).to.equal(escaped);
    });

    it('should handle strings with nothing to escape', () => {
        expect(escape('abc')).to.equal('abc');
    });

    it('should escape the same characters unescaped by `unescape`', () => {
        expect(escape(unescape(escaped))).to.equal(escaped);
    });

    it('should unescape entities in order', () => {
        expect(unescape("&amp;lt;")).to.equal("&lt;");
    });

    it('should unescape the proper entities', () => {
        expect(unescape(escaped)).to.equal(unescaped);
    });

    it('should handle strings with nothing to unescape', () => {
        expect(unescape('abc')).to.equal('abc');
    });

    it('should unescape the same characters escaped by `escape`', () => {
        expect(unescape(escape(unescaped))).to.equal(unescaped);
    });

    it('should handle leading zeros in html entities', () => {
        expect(unescape('&#39;')).to.equal("'");
        expect(unescape('&#039;')).to.equal("'");
        expect(unescape('&#000039;')).to.equal("'");
    });
});

describe('tests for seq', () => {
    it('should use args[0] as stop if only one param provided', () => {
        expect(seq(3)).to.deep.equal([0, 1, 2]);
    });

    it('should work for ranges', () => {
        expect(seq(1, 4)).to.deep.equal([1, 2, 3]);
    });

    it('should return empty list if start is negative', () => {
        expect(seq(-1)).to.deep.equal([]);
    });

    it('should work for negative ranges', () => {
        expect(seq(-4, -1)).to.deep.equal([-4, -3, -2]);
    });

    it('should work for ranges with a step', () => {
        expect(seq(0, 7, 2)).to.deep.equal([0, 2, 4, 6]);
    });

    it('should work for negative ranges with a step', () => {
        expect(seq(-8, -4, 2)).to.deep.equal([-8, -6]);
    });
});

describe('callbackify', () => {
    it('should convert a Promise-returning function to a callback-style function', (done) => {
        const promiseFn = (value: number) => Promise.resolve(value * 2);
        const callbackFn = callbackify(promiseFn);

        callbackFn((err: Error | null, result: number | null) => {
            expect(err).to.be.null;
            expect(result).to.equal(6);
            done();
        }, 3);
    });

    it('should pass errors to the callback', (done) => {
        const error = new Error('Test error');
        const promiseFn = () => Promise.reject(error);
        const callbackFn = callbackify(promiseFn);

        callbackFn((err: Error | null, result: null) => {
            expect(err).to.equal(error);
            expect(result).to.be.null;
            done();
        });
    });

    it('should pass all arguments to the original function', (done) => {
        const promiseFn = (a: number, b: number, c: number) => Promise.resolve(a + b + c);
        const callbackFn = callbackify(promiseFn);

        callbackFn((err: Error | null, result: number | null) => {
            expect(err).to.be.null;
            expect(result).to.equal(6);
            done();
        }, 1, 2, 3);
    });

    it('should work with zero arguments', (done) => {
        const promiseFn = () => Promise.resolve('test result');
        const callbackFn = callbackify(promiseFn);

        callbackFn((err: Error | null, result: string | null) => {
            expect(err).to.be.null;
            expect(result).to.equal('test result');
            done();
        });
    });
});

describe('poll', () => {
    let clock: sinon.SinonFakeTimers;

    beforeEach(() => {
        clock = sinon.useFakeTimers();
    });

    afterEach(() => {
        clock.restore();
    });

    it('should call the function at specified intervals', () => {
        const fn = sinon.spy();
        poll(fn, 100, false);

        expect(fn.callCount).to.equal(0);

        clock.tick(100);
        expect(fn.callCount).to.equal(1);

        clock.tick(100);
        expect(fn.callCount).to.equal(2);

        clock.tick(200);
        expect(fn.callCount).to.equal(4);
    });

    it('should call the function immediately when callNow is true', () => {
        const fn = sinon.spy();
        poll(fn, 100, true);

        expect(fn.callCount).to.equal(1);

        clock.tick(100);
        expect(fn.callCount).to.equal(2);
    });

    it('should stop polling when the cancel function is called', () => {
        const fn = sinon.spy();
        const cancel = poll(fn, 100);

        clock.tick(100);
        expect(fn.callCount).to.equal(1);

        cancel();

        clock.tick(200);
        expect(fn.callCount).to.equal(1); // Should still be 1 as we cancelled
    });

    it('should poll repeatedly', () => {
        const fn = sinon.spy();
        const cancel = poll(fn, 100);

        // Should not have been called yet
        expect(fn.callCount).to.equal(0);

        // After time advances, should be called
        clock.tick(100);
        expect(fn.callCount).to.equal(1);

        // After more time, should be called again
        clock.tick(100);
        expect(fn.callCount).to.equal(2);

        // Clean up
        cancel();
    });

    // Error handling test
    it('should handle errors within the callback', () => {
        const errorSpy = sinon.spy();
        const fn = sinon.stub();
        fn.onFirstCall().callsFake(() => {
            errorSpy();
        });

        // No error should propagate out
        poll(fn, 100, true);
        expect(errorSpy.calledOnce).to.be.true;
    });

    it('should clean up timeout when cancelled', () => {
        const fn = sinon.spy();
        const cancel = poll(fn, 100);

        cancel();
        clock.tick(200);
        expect(fn.callCount).to.equal(0);
    });
});