/**
 * Tests specifically for classes functionality in NuBuilder and nu function
 */

import * as chai from 'chai';
import chaiDom from 'chai-dom';
import { describe, it } from 'mocha';
import { nu, store } from '../campfire.ts';

// Setup chai
chai.use(chaiDom);
const expect = chai.expect;

describe('Classes functionality tests', () => {
  // Basic cls method functionality tests
  describe('NuBuilder.cls method', () => {
    it('should add a class with cls method', () => {
      const [div] = nu('div')
        .cls('test-class')
        .done();

      expect(div.classList.contains('test-class')).to.be.true;
    });

    it('should add multiple classes with multiple cls calls', () => {
      const [div] = nu('div')
        .cls('first-class')
        .cls('second-class')
        .cls('third-class')
        .done();

      expect(div.classList.contains('first-class')).to.be.true;
      expect(div.classList.contains('second-class')).to.be.true;
      expect(div.classList.contains('third-class')).to.be.true;
    });

    it('should conditionally add a class with boolean value', () => {
      const [div1] = nu('div')
        .cls('enabled', true)
        .cls('disabled', false)
        .done();

      expect(div1.classList.contains('enabled')).to.be.true;
      expect(div1.classList.contains('disabled')).to.be.false;

      const [div2] = nu('div')
        .cls('enabled', false)
        .cls('disabled', true)
        .done();

      expect(div2.classList.contains('enabled')).to.be.false;
      expect(div2.classList.contains('disabled')).to.be.true;
    });

    it('should treat empty string as falsy for conditional classes', () => {
      const [div] = nu('div')
        .cls('empty-string-class', '')
        .done();

      expect(div.classList.contains('empty-string-class')).to.be.false;
    });

    it('should treat zero as falsy for conditional classes', () => {
      const [div] = nu('div')
        .cls('zero-class', 0)
        .done();

      expect(div.classList.contains('zero-class')).to.be.false;
    });

    it('should treat null and undefined as falsy for conditional classes', () => {
      const [div1] = nu('div')
        .cls('null-class', null)
        .done();

      expect(div1.classList.contains('null-class')).to.be.false;
    });

    it('should add classes correctly when combined with class in element string', () => {
      const [div] = nu('div.initial-class')
        .cls('added-class')
        .done();

      expect(div.classList.contains('initial-class')).to.be.true;
      expect(div.classList.contains('added-class')).to.be.true;
    });

    it('should work with element create syntax', () => {
      const [button] = nu('button#my-btn.primary')
        .cls('large')
        .cls('rounded', true)
        .cls('disabled', false)
        .done();

      expect(button.id).to.equal('my-btn');
      expect(button.classList.contains('primary')).to.be.true;
      expect(button.classList.contains('large')).to.be.true;
      expect(button.classList.contains('rounded')).to.be.true;
      expect(button.classList.contains('disabled')).to.be.false;
    });
  });

  // Classes in render function tests
  describe('Classes in reactive contexts', () => {
    it('should update classes based on store changes', () => {
      const isActive = store({ value: false });
      const isDisabled = store({ value: true });

      const [button] = nu('button', {
        deps: { isActive, isDisabled },
        render: ({ isActive, isDisabled }, { b }) => {
          return b
            .cls('active', isActive)
            .cls('disabled', isDisabled);
        }
      }).done();

      // Initial state
      expect(button.classList.contains('active')).to.be.false;
      expect(button.classList.contains('disabled')).to.be.true;

      // Update stores
      isActive.update(true);
      isDisabled.update(false);

      // Check updated classes
      expect(button.classList.contains('active')).to.be.true;
      expect(button.classList.contains('disabled')).to.be.false;
    });

    it('should handle multiple class changes in reactive contexts', () => {
      const state = store({ value: 'default' }); // Can be 'default', 'success', 'error', 'warning'

      const [div] = nu('div', {
        deps: { state },
        render: ({ state }, { b }) => {
          return b
            .cls('default', state === 'default')
            .cls('success', state === 'success')
            .cls('error', state === 'error')
            .cls('warning', state === 'warning');
        }
      }).done();

      // Initial state
      expect(div.classList.contains('default')).to.be.true;
      expect(div.classList.contains('success')).to.be.false;
      expect(div.classList.contains('error')).to.be.false;
      expect(div.classList.contains('warning')).to.be.false;

      // Change to success
      state.update('success');
      expect(div.classList.contains('default')).to.be.false;
      expect(div.classList.contains('success')).to.be.true;
      expect(div.classList.contains('error')).to.be.false;
      expect(div.classList.contains('warning')).to.be.false;

      // Change to error
      state.update('error');
      expect(div.classList.contains('default')).to.be.false;
      expect(div.classList.contains('success')).to.be.false;
      expect(div.classList.contains('error')).to.be.true;
      expect(div.classList.contains('warning')).to.be.false;

      // Change to warning
      state.update('warning');
      expect(div.classList.contains('default')).to.be.false;
      expect(div.classList.contains('success')).to.be.false;
      expect(div.classList.contains('error')).to.be.false;
      expect(div.classList.contains('warning')).to.be.true;

      // Back to default
      state.update('default');
      expect(div.classList.contains('default')).to.be.true;
      expect(div.classList.contains('success')).to.be.false;
      expect(div.classList.contains('error')).to.be.false;
      expect(div.classList.contains('warning')).to.be.false;
    });

    it('should maintain non-reactive classes through reactive updates', () => {
      const isActive = store({ value: false });

      const [div] = nu('div.static-class', {
        deps: { isActive },
        render: ({ isActive }, { b }) => {
          return b
            .cls('active', isActive);
        }
      }).done();

      // Initial state
      expect(div.classList.contains('static-class')).to.be.true;
      expect(div.classList.contains('active')).to.be.false;

      // Update reactive state
      isActive.update(true);

      // Static classes should be preserved
      expect(div.classList.contains('static-class')).to.be.true;
      expect(div.classList.contains('active')).to.be.true;

      // Update reactive state again
      isActive.update(false);

      // Static classes should still be preserved
      expect(div.classList.contains('static-class')).to.be.true;
      expect(div.classList.contains('active')).to.be.false;
    });
  });

  // Integration tests for classes with other properties
  describe('Class integration with other properties', () => {
    it('should combine classes with other element properties', () => {
      const [button] = nu('button')
        .content('Styled Button')
        .cls('primary')
        .cls('large')
        .attr('type', 'submit')
        .style('borderRadius', '4px')
        .style('padding', '8px 16px')
        .on('click', () => { })
        .done();

      expect(button.classList.contains('primary')).to.be.true;
      expect(button.classList.contains('large')).to.be.true;
      expect(button).to.have.attr('type', 'submit');
      expect(button.style.borderRadius).to.equal('4px');
      expect(button.style.padding).to.equal('8px 16px');
    });

    it('should work correctly with the "classes" property in nu element properties', () => {
      const [div] = nu('div', {
        classes: {
          'prop-class-1': true,
          'prop-class-2': false,
          'prop-class-3': true
        }
      })
        .cls('builder-class-1')
        .cls('builder-class-2', false)
        .cls('builder-class-3', true)
        .done();

      expect(div.classList.contains('prop-class-1')).to.be.true;
      expect(div.classList.contains('prop-class-2')).to.be.false;
      expect(div.classList.contains('prop-class-3')).to.be.true;
      expect(div.classList.contains('builder-class-1')).to.be.true;
      expect(div.classList.contains('builder-class-2')).to.be.false;
      expect(div.classList.contains('builder-class-3')).to.be.true;
    });
  });

  // Tests for classes reconciliation in nu()
  describe('Classes reconciliation', () => {
    it('should correctly reconcile classes in reactive contexts', () => {
      const toggleClass = store({ value: true });

      // Create element with initial class state
      const [div] = nu('div.permanent', {
        classes: {
          'initial': true,
          'removed-later': true
        },
        deps: { toggleClass },
        render: ({ toggleClass }, { b }) => {
          return b
            .cls('toggled', toggleClass)
            .cls('initial', false)  // Should remove the initial class
            .cls('added-later', true);
        }
      }).done();

      // Initial state
      expect(div.classList.contains('permanent')).to.be.true;
      expect(div.classList.contains('initial')).to.be.false;
      expect(div.classList.contains('removed-later')).to.be.true;
      expect(div.classList.contains('toggled')).to.be.true;
      expect(div.classList.contains('added-later')).to.be.true;

      // Toggle state
      toggleClass.update(false);

      // Check updated classes
      expect(div.classList.contains('permanent')).to.be.true;    // Should persist
      expect(div.classList.contains('initial')).to.be.false;     // Still removed
      expect(div.classList.contains('removed-later')).to.be.true; // Still preserved
      expect(div.classList.contains('toggled')).to.be.false;     // Should be removed
      expect(div.classList.contains('added-later')).to.be.true;  // Should persist
    });
  });

  // Issue with implementation
  describe('Implementation bug fixes', () => {
    it('should correctly apply classes to the element DOM', () => {
      // The issue is that the code tracks the classes in the internal `props` object,
      // but doesn't actually apply them to the element's classList

      const [div] = nu('div')
        .cls('test-class-1')
        .cls('test-class-2', true)
        .cls('test-class-3', false)
        .done();

      // This verifies the fix works as expected
      expect(div.classList.contains('test-class-1')).to.be.true;
      expect(div.classList.contains('test-class-2')).to.be.true;
      expect(div.classList.contains('test-class-3')).to.be.false;

      const arrayedClasses = Array.from(div.classList);
      expect(arrayedClasses).to.include('test-class-1');
      expect(arrayedClasses).to.include('test-class-2');
      expect(arrayedClasses).to.not.include('test-class-3');
    });
  });
});