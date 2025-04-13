/**
 * Tests for Store functionality in Campfire.js
 */

import * as chai from 'chai';
import sinon from 'sinon';
import { describe, it } from 'mocha';
import chaiDom from 'chai-dom';
import cf, { nu } from '../campfire.ts';

// Setup chai
chai.use(chaiDom);
const expect = chai.expect;

describe('Tests for stores', () => {
    it('Store should store and update values', () => {
        const s = cf.store({ value: 'test' });
        expect(s.value).to.equal('test');
        s.update('new value');
        expect(s.value).to.equal('new value');
    });

    it('Store should notify subscribers of changes', () => {
        const s = cf.store({ value: 'test' });
        const mockFn = sinon.spy();
        s.on('update', mockFn);
        s.update('new value');
        expect(mockFn.calledWith({ type: 'update', value: 'new value' })).to.be.true;
    });

    it('ListStore should handle array operations', () => {
        const ls = cf.store({ type: 'list', value: [1, 2, 3] });
        expect(ls.value).to.deep.equal([1, 2, 3]);
        const mockFn = sinon.spy();
        ls.on('append', mockFn);
        ls.push(4);
        expect(ls.value).to.deep.equal([1, 2, 3, 4]);
        expect(mockFn.calledWith({ type: 'append', value: 4, idx: 3 })).to.be.true;
    });

    it('MapStore should handle object operations', () => {
        const ms = cf.store<string | number>({ type: 'map', value: { name: 'John' } });
        expect(ms.get('name')).to.deep.equal('John');

        const mockFn = sinon.spy();
        ms.on('change', mockFn);

        ms.set('age', 30);
        expect(ms.get('age')).to.deep.equal(30);

        expect(mockFn.calledWith({
            type: 'change', value: 30, key: 'age'
        })).to.be.true;
    });
});

describe('Tests for Reactivity', () => {
    it('Element content should update when store changes', () => {
        const name = cf.store({ value: 'John' });
        const [div] = nu('div', {
            deps: { name },
            render: ({ name }) => `Hello, ${name}!`
        }).done();

        expect(div.innerHTML).to.equal('Hello, John!');

        name.update('Alice');
        expect(div.innerHTML).to.equal('Hello, Alice!');
    });

    it('Multiple stores should update element content independently', () => {
        const first = cf.store({ value: 'John' });
        const last = cf.store({ value: 'Doe' });

        const [span] = nu('span')
            .deps({ first, last })
            .render(({ first, last }, { builder }) => builder.content(`${first} ${last}`))
            .done();

        expect(span.innerHTML).to.equal('John Doe');

        first.update('Jane');
        expect(span.innerHTML).to.equal('Jane Doe');

        last.update('Smith');
        expect(span.innerHTML).to.equal('Jane Smith');
    });

    it('ListStore should update collection rendering', () => {
        const itemsStore = cf.store({
            type: 'list',
            value: ['Apple', 'Banana', 'Cherry']
        });

        const [div] = nu('div', {
            render: ({ items }) => {
                return `<ul>${items.map(item => `<li>${item}</li>`).join('')}</ul>`;
            },
            raw: true,
            deps: { items: itemsStore }
        }).done();

        expect(div.innerHTML).to.equal('<ul><li>Apple</li><li>Banana</li><li>Cherry</li></ul>');

        itemsStore.push('Durian');
        expect(div.innerHTML).to.equal('<ul><li>Apple</li><li>Banana</li><li>Cherry</li><li>Durian</li></ul>');

        itemsStore.remove(1); // Remove Banana
        expect(div.innerHTML).to.equal('<ul><li>Apple</li><li>Cherry</li><li>Durian</li></ul>');
    });

    it('MapStore should update object rendering', () => {
        const user = cf.store({
            type: 'map',
            value: {
                name: 'John',
                age: 30,
                isAdmin: false
            }
        });

        const [container, h2, first, second] = nu('', {
            raw: true,
            deps: { user },
            render: ({ user }) => `
        <div class="user">
            <h2>${user.name}</h2>
            <p>Age: ${user.age}</p>
            <p>Role: ${user.isAdmin ? 'Admin' : 'User'}</p>
        </div>
    `,
            gimme: ['h2', 'p:nth-child(2)', 'p:nth-child(3)']
        }).done();

        expect(h2.textContent).to.equal('John');
        expect(first.textContent).to.equal('Age: 30');
        expect(second.textContent).to.equal('Role: User');

        user.set('name', 'Jane');
        expect(container.querySelector('h2')?.textContent).to.equal('Jane');

        user.set('age', 28);
        expect(container.querySelector('p:nth-child(2)')?.textContent).to.equal('Age: 28');

        user.set('isAdmin', true);
        expect(container.querySelector('p:nth-child(3)')?.textContent).to.equal('Role: Admin');
    });

    it('Should handle complex nested reactivity', () => {
        const count = cf.store({ value: 0 });
        const message = cf.store({ value: 'Click to increment' });
        const color = cf.store({ value: 'blue' });

        const [counter] = nu('div', {
            raw: true,
            render: (data, opts) => {
                // Add event info to demonstrate full reactive system capabilities
                const eventDetail = opts.event ? ` (triggered by ${opts.event.triggeredBy})` : '';
                return `<div style="color: ${data.color}">
                    <h3>${data.message}${eventDetail}</h3>
                    <p>Count: ${data.count}</p>
                </div>`;
            },
            deps: {
                count: count,
                message: message,
                color: color
            }
        }).done();

        expect(counter.querySelector('p')?.textContent).to.equal('Count: 0');
        expect(counter.querySelector('h3')?.textContent).to.equal('Click to increment');
        expect(counter.querySelector('div')?.style.color).to.equal('blue');

        // Update values and verify DOM updates
        count.update(1);
        expect(counter.querySelector('p')?.textContent).to.equal('Count: 1');
        expect(counter.querySelector('h3')?.textContent).to.contain('triggered by count');

        message.update('Counter was clicked');
        expect(counter.querySelector('h3')?.textContent).to.contain('Counter was clicked');
        expect(counter.querySelector('h3')?.textContent).to.contain('triggered by message');

        color.update('red');
        expect(counter.querySelector('div')?.style.color).to.equal('red');
        expect(counter.querySelector('h3')?.textContent).to.contain('triggered by color');
    });

    it('Should properly clean up subscriptions when element is disposed', () => {
        const countStore = cf.store({ value: 0 });
        const [div] = nu('div', {
            render: (data) => {
                return `Value: ${data.count}`;
            },
            deps: { count: countStore }
        }).done();

        expect(div.innerHTML).to.equal('Value: 0');

        // Update should trigger the callback
        countStore.update(1);
        expect(div.innerHTML).to.equal('Value: 1');

        // Simulate element disposal
        countStore.dispose();

        // Updates after disposal should not affect the element
        countStore.update(2);
        expect(div.innerHTML).to.equal('Value: 1'); // Still shows the old value
    });
});