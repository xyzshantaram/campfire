/**
 * Tests specifically for the builder-style render function in NuBuilder
 */

import * as chai from 'chai';
import chaiDom from 'chai-dom';
import sinon from 'sinon';
import { describe, it } from 'mocha';
import { nu, store } from '../campfire.ts';

// Setup chai
chai.use(chaiDom);
const expect = chai.expect;

describe('Builder-style render function tests', () => {
  // Basic functionality tests
  describe('Basic functionality', () => {
    it('should accept a render function that returns a string', () => {
      const count = store({ value: 0 });
      const [div] = nu('div', {
        deps: { count },
        render: ({ count }) => `Count: ${count}`
      }).done();

      expect(div.innerHTML).to.equal('Count: 0');

      count.update(1);
      expect(div.innerHTML).to.equal('Count: 1');
    });

    it('should accept a render function that returns a builder', () => {
      const count = store({ value: 0 });
      const [div] = nu('div', {
        deps: { count },
        render: ({ count }, { builder }) => {
          return builder.html(`Count: ${count}`);
        }
      }).done();

      expect(div.innerHTML).to.equal('Count: 0');

      count.update(1);
      expect(div.innerHTML).to.equal('Count: 1');
    });

    it('should escape content unless render function returns NuBuilder', () => {
      const [div] = nu('div', {
        render: () => `<span>Hello</span>`
      }).done();

      expect(div.innerHTML).to.equal('&lt;span&gt;Hello&lt;/span&gt;');
    });
  });

  // Property reconciliation tests
  describe('Property reconciliation', () => {
    it('should reconcile style properties from builder', () => {
      const color = store({ value: 'red' });
      const [div] = nu('div', {
        deps: { color },
        render: ({ color }, { builder }) => {
          return builder
            .content('Styled text')
            .style('color', color)
            .style('fontWeight', 'bold');
        }
      }).done();

      expect(div.style.color).to.equal('red');
      expect(div.style.fontWeight).to.equal('bold');

      color.update('blue');
      expect(div.style.color).to.equal('blue');
      expect(div.style.fontWeight).to.equal('bold'); // Should still be preserved
    });

    it('should clear a style when empty string is provided', () => {
      const useStyle = store({ value: true });
      const [div] = nu('div', {
        style: { color: 'red', fontSize: '20px', fontWeight: 'bold' },
        deps: { useStyle },
        render: ({ useStyle }, { builder }) => {
          const b = builder.content('Style clearing test');

          if (!useStyle) {
            // Set empty string to clear styles
            b.style('color', '');
            b.style('fontSize', '');
          }

          return b;
        }
      }).done();

      // Initial state - all styles set
      expect(div.style.color).to.equal('red');
      expect(div.style.fontSize).to.equal('20px');
      expect(div.style.fontWeight).to.equal('bold');

      // Update to clear some styles
      useStyle.update(false);

      // Color and fontSize should be cleared but fontWeight should remain
      expect(div.style.color).to.equal('');
      expect(div.style.fontSize).to.equal('');
      expect(div.style.fontWeight).to.equal('bold');
    });

    it('should reconcile attributes from builder', () => {
      const disabled = store({ value: false });
      const [button] = nu('button', {
        deps: { isDisabled: disabled },
        render: ({ isDisabled }, { builder }) => {
          const b = builder.content('Click me');
          if (isDisabled) {
            return b.attr('disabled', 'disabled')
              .attr('aria-disabled', 'true');
          }
          return b;
        }
      }).done();

      expect(button).to.not.have.attr('disabled');
      expect(button).to.not.have.attr('aria-disabled');

      // Set to disabled
      disabled.update(true);
      expect(button).to.have.attr('disabled', 'disabled');
      expect(button).to.have.attr('aria-disabled', 'true');
    });

    it('should clear an attribute when empty string is provided', () => {
      const showAttr = store({ value: true });

      const [div] = nu('div', {
        attrs: {
          'data-test': 'value',
          'aria-hidden': 'false',
          'data-persist': 'always-here'
        },
        deps: { showAttr },
        render: ({ showAttr }, { builder }) => {
          const b = builder.content('Attribute clearing test');

          if (!showAttr) {
            b.attr('data-test', '');
            b.attr('aria-hidden', '');
          }

          return b;
        }
      }).done();

      // Initial state - all attributes set
      expect(div).to.have.attr('data-test', 'value');
      expect(div).to.have.attr('aria-hidden', 'false');
      expect(div).to.have.attr('data-persist', 'always-here');

      showAttr.update(false);

      expect(div).to.not.have.attr('data-test');
      expect(div).to.not.have.attr('aria-hidden');
      expect(div).to.have.attr('data-persist', 'always-here');
    });

    it('should reconcile misc properties from builder', () => {
      const isChecked = store({ value: false });
      const [checkbox] = nu('input', {
        attrs: { type: 'checkbox' },
        deps: { isChecked },
        render: ({ isChecked }, { builder }) => {
          return builder
            .content('')
            .misc('checked', isChecked);
        }
      }).done();

      expect(checkbox.checked).to.be.false;

      isChecked.update(true);
      expect(checkbox.checked).to.be.true;

      isChecked.update(false);
      expect(checkbox.checked).to.be.false;
    });
  });

  // Multiple re-renders and updates
  describe('Multiple re-renders', () => {
    it('should handle multiple store updates correctly', () => {
      const count = store({ value: 0 });
      const color = store({ value: 'red' });
      const size = store({ value: '12px' });

      const [div] = nu('div', {
        deps: { count, color, size },
        render: ({ count, color, size }, { builder }) => {
          return builder
            .content(`Count: ${count}`)
            .style('color', color)
            .style('fontSize', size);
        }
      }).done();

      expect(div.innerHTML).to.equal('Count: 0');
      expect(div.style.color).to.equal('red');
      expect(div.style.fontSize).to.equal('12px');

      // Update one store
      count.update(1);
      expect(div.innerHTML).to.equal('Count: 1');
      expect(div.style.color).to.equal('red'); // Should preserve
      expect(div.style.fontSize).to.equal('12px'); // Should preserve

      // Update another store
      color.update('blue');
      expect(div.innerHTML).to.equal('Count: 1'); // Should preserve
      expect(div.style.color).to.equal('blue');
      expect(div.style.fontSize).to.equal('12px'); // Should preserve

      // Update third store
      size.update('16px');
      expect(div.innerHTML).to.equal('Count: 1'); // Should preserve
      expect(div.style.color).to.equal('blue'); // Should preserve
      expect(div.style.fontSize).to.equal('16px');

      // Update multiple stores in sequence
      count.update(2);
      color.update('green');
      size.update('20px');
      expect(div.innerHTML).to.equal('Count: 2');
      expect(div.style.color).to.equal('green');
      expect(div.style.fontSize).to.equal('20px');
    });

    it('should properly update content and properties based on conditions', () => {
      const mode = store({ value: 'normal' }); // Can be 'normal', 'warning', 'error'

      const [div] = nu('div', {
        deps: { mode },
        render: ({ mode }, { builder }) => {
          switch (mode) {
            case 'warning':
              return builder
                .content('Warning: Proceed with caution')
                .style('color', 'orange')
                .style('fontWeight', 'bold');
            case 'error':
              return builder
                .content('Error: Action could not be completed')
                .style('color', 'red')
                .style('fontWeight', 'bold')
                .style('textDecoration', 'underline');
            default:
              return builder
                .content('Normal operation')
                .style('fontWeight', '')
                .style('textDecoration', '')
                .style('color', 'green');
          }
        }
      }).done();

      expect(div.innerHTML).to.equal('Normal operation');
      expect(div.style.color).to.equal('green');

      // Change to warning
      mode.update('warning');
      expect(div.innerHTML).to.equal('Warning: Proceed with caution');
      expect(div.style.color).to.equal('orange');
      expect(div.style.fontWeight).to.equal('bold');

      // Change to error
      mode.update('error');
      expect(div.innerHTML).to.equal('Error: Action could not be completed');
      expect(div.style.color).to.equal('red');
      expect(div.style.fontWeight).to.equal('bold');
      expect(div.style.textDecoration).to.equal('underline');

      mode.update('normal');
      expect(div.innerHTML).to.equal('Normal operation');
      expect(div.style.color).to.equal('green');
      expect(div.style.fontWeight).to.equal('');
      expect(div.style.textDecoration).to.equal('');
    });
  });

  // Event handler behavior
  describe('Event handlers', () => {
    it('should not duplicate event handlers during re-renders', () => {
      const clickHandler = sinon.spy();
      const count = store({ value: 0 });

      // Create button with click handler outside the render function
      const [button] = nu('button', {
        on: { click: clickHandler },
        deps: { count },
        render: ({ count }) => `Count: ${count}`
      }).done();

      // First click
      button.click();
      expect(clickHandler.callCount).to.equal(1);

      // Update several times to trigger re-renders
      for (let i = 1; i <= 5; i++) {
        count.update(i);
      }

      // Click again - should only be called once more
      button.click();
      expect(clickHandler.callCount).to.equal(2);
    });
  });

  // Edge cases
  describe('Edge cases', () => {
    it('should handle falsy attribute values correctly', () => {
      // Create a simple element with various attribute values
      const [div] = nu('div')
        .content('Testing')
        .attr('data-empty', '')
        .attr('data-zero', 0)
        .attr('data-test', 'test')
        .done();

      // Empty string should not be preserved
      expect(div).to.not.have.attr('data-empty', '');

      // Zero should be preserved
      expect(div).to.have.attr('data-zero', '0');

      // Regular value should be set
      expect(div).to.have.attr('data-test', 'test');
    });

    it('should handle undefined/null results from render', () => {
      const attr = store({ value: 'something' });
      const [div] = nu('div')
        .content('Visible content')
        .deps({ attr })
        .render(({ attr }, { elt }) => {
          elt.setAttribute('some-attribute', attr);
        })
        .done();

      expect(div.hasAttribute('data-cf-fg-updates')).to.be.true;
    });
  });

  // Builder with existing element
  describe('Using builder with existing element', () => {
    it('should use builder with an existing element', () => {
      // First create an element
      const [existingDiv] = nu('div')
        .attr('id', 'existing-element')
        .style('padding', '10px')
        .content('Original content')
        .done();

      // Now use it with a new builder
      const count = store({ value: 0 });

      const [updatedDiv] = nu(existingDiv, {
        deps: { count },
        render: ({ count }, { builder }) => {
          return builder
            .content(`New content: ${count}`)
            .style('color', 'blue');
        }
      }).done();

      // Should be the same element
      expect(updatedDiv).to.equal(existingDiv);
      expect(updatedDiv.id).to.equal('existing-element');

      // Should have updated content
      expect(updatedDiv.innerHTML).to.equal('New content: 0');

      // Should have merged styles (both old and new)
      expect(updatedDiv.style.padding).to.equal('10px'); // Original style
      expect(updatedDiv.style.color).to.equal('blue'); // New style

      // Update the store
      count.update(1);
      expect(updatedDiv.innerHTML).to.equal('New content: 1');
      expect(updatedDiv.style.padding).to.equal('10px'); // Still preserved
      expect(updatedDiv.style.color).to.equal('blue'); // Still preserved
    });
  });
});