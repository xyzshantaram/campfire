/**
 * Tests for utility functions in Campfire.js
 */

import * as chai from 'chai';
import { describe, it } from 'mocha';
import { escape, unescape, seq } from './campfire.ts';

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