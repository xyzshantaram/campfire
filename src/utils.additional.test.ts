/**
 * Additional tests for utility functions in Campfire.js
 */

import * as chai from 'chai';
import { describe, it } from 'mocha';
import { escape, unescape, seq } from './utils.ts';

const expect = chai.expect;

// Testing fmtNode and initMutationObserver requires a DOM environment
// We'll use mocking to test these functions

describe('Additional tests for utility functions', () => {
  describe('escape and unescape edge cases', () => {
    it('should handle null or undefined input for escape', () => {
      expect(escape(null as any)).to.equal('');
      expect(escape(undefined as any)).to.equal('');
    });

    it('should handle null or undefined input for unescape', () => {
      expect(unescape(null as any)).to.equal('');
      expect(unescape(undefined as any)).to.equal('');
    });

    it('should handle empty string', () => {
      expect(escape('')).to.equal('');
      expect(unescape('')).to.equal('');
    });
  });

  describe('additional seq tests', () => {
    it('should handle 0 length sequences', () => {
      expect(seq(0)).to.deep.equal([]);
      expect(seq(5, 5)).to.deep.equal([]);
    });

    it('should handle step values with direction opposite to range', () => {
      // In the implementation, for loop doesn't run when step is in opposite direction
      const result = seq(10, 0, 1);
      expect(result).to.deep.equal([]);
    });

    it('should handle floating point values', () => {
      expect(seq(0, 3, 0.5)).to.deep.equal([0, 0.5, 1, 1.5, 2, 2.5]);
    });

    it('should return correct result for large ranges', () => {
      expect(seq(0, 1000, 250)).to.deep.equal([0, 250, 500, 750]);
    });
  });
});