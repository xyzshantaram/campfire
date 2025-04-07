/**
 * Campfire.js tests using Mocha + JSDOM
 */

import * as chai from 'chai';
import chaiDom from 'chai-dom';
import sinon from 'sinon';
import { describe, it } from 'mocha';
import cf, { escape, unescape, mustache, template, nu, extend, html, r, seq } from '../src/campfire.ts';

// Setup chai
chai.use(chaiDom);
const expect = chai.expect;

describe('Tests for nu', () => {
    it('should create a div when no args are passed', () => {
        expect(nu().done()[0].tagName).to.equal('DIV');
    });

    it('the new div must be empty', () => {
        expect(nu().done()[0]).to.be.empty;
    });

    it('should parse element string correctly', () => {
        const [elt] = nu('button#click-me.btn.cls').done();
        expect(elt).to.have.class('btn');
        expect(elt).to.have.class('cls');
        expect(elt.id).to.equal('click-me');
        expect(elt.tagName).to.equal('BUTTON');
    });
});

describe('Tests for extend', () => {
    it('should work properly with nu', () => {
        const [elt] = nu('#id', { style: { textAlign: 'center' }, attrs: { 'data-an-attribute': 32 } }).done();
        expect(elt.id).to.equal('id');
        expect(elt.tagName).to.equal('DIV');
        expect(elt).to.have.attr('style', 'text-align: center;');
        expect(elt).to.have.attr('data-an-attribute', '32');
    });

    it('should add styles', () => {
        const [elt] = nu().done();
        extend(elt, { style: { margin: 0 } });
        expect(elt).to.have.attr('style', 'margin: 0px;');
    });

    it('should escape and set contents', () => {
        const [elt] = nu().done();
        extend(elt, { contents: "<b> bold </b>" });
        expect(elt.innerHTML).to.equal('&lt;b&gt; bold &lt;/b&gt;');
    });

    it('should not escape contents with raw flag', () => {
        const [elt] = nu().done();
        extend(elt, { contents: "<b> bold </b>", raw: true });
        expect(elt.innerHTML).to.equal('<b> bold </b>');
    });

    it('should return elements passed in gimme param', () => {
        const [elt, span] = nu(`div#container`, {
            raw: true,
            contents: html`
            <span class=some-span>42</span>
            `,
            gimme: ['span.some-span']
        }).done();
        expect(elt.id).to.equal('container');
        expect(span.tagName).to.equal('SPAN');
        expect(span).to.have.class('some-span');
        expect(span.innerHTML).to.equal('42');
    });
});

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

describe('tests for html``', () => {
    it('should escape parameters', () => {
        expect(mustache(html`<div>${"<script> alert('xss') </script>"}</div>`))
            .to.equal("<div>&lt;script&gt; alert(&#39;xss&#39;) &lt;/script&gt;</div>");
    });

    it('should not escape r() values', () => {
        expect(mustache(html`<div>${r("<script> alert('xss') </script>")}</div>`))
            .to.equal("<div><script> alert('xss') </script></div>");
    });

    it('should join arrays together', () => {
        const transform = itm => html`<li>${itm.toString()}</li>`;
        const list = html`<ul> ${r(seq(3).map(transform))} </ul>`;

        expect(list).to.equal('<ul> <li>0</li> <li>1</li> <li>2</li> </ul>');
    });

    it('should enable custom joiners', () => {
        const transform = itm => html`<span>${itm.toString()}</span>`;
        const spans = html`${r(seq(3).map(transform), { joiner: ', ' })}`;

        expect(spans).to.equal('<span>0</span>, <span>1</span>, <span>2</span>');
    });

    it('should allow empty custom joiner', () => {
        const transform = itm => itm.toString();
        const num = html`${r(seq(3).map(transform), { joiner: '' })}`;

        expect(num).to.equal('012');
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

describe('Tests for mustache', () => {
    it('should substitute data that is present', () => {
        expect(mustache("Welcome to {{ location }}, {{ name }}.", { name: "John", location: "Mars" }))
            .to.equal("Welcome to Mars, John.");
    });

    it('should ignore spaces surrounding mustache names', () => {
        expect(mustache("{{ name }} {{name}} {{  name  }} {{    name    }}", { name: "John" }))
            .to.equal("John John John John");
    });

    it('should ignore escaped mustaches', () => {
        expect(mustache("\\{{ name }}", { name: "John" })).to.equal("{{ name }}");
    });

    it('should ignore absent mustaches', () => {
        expect(mustache("{{ nonexistent }}", { name: "John" })).to.equal("{{ nonexistent }}");
    });

    it('should perform replacements at once', () => {
        expect(mustache("Welcome to {{ location }}, {{ name }}.", { location: "{{ name }}", name: "John", }))
            .to.equal("Welcome to {{ name }}, John.");
    });

    it('should escape substituted text', () => {
        expect(mustache("Welcome to {{ location }}, {{ name }}.", { name: "John", location: "<script> alert('xss') </script>" }))
            .to.not.equal("Welcome to <script> alert('xss') </script>, John.");
    });

    it("should not escape when esc flag is false", () => {
        expect(mustache("Welcome to {{ location }}, {{ name }}.", { location: "Mars", name: "<b>John</b>" }, false))
            .to.equal("Welcome to Mars, <b>John</b>.");
    });
});

describe('Tests for template', () => {
    const t = template("Welcome to {{ location }}, {{ name }}.");

    it('should work', () => {
        expect(t({ name: "John", location: "Mars" })).to.equal("Welcome to Mars, John.");
        expect(t({ name: "Joseph", location: "Mars" })).to.equal("Welcome to Mars, Joseph.");
    });
});

describe('Tests for NuBuilder', () => {
    it('should support fluent method chaining', () => {
        const [btn] = nu('button')
            .content('Click me')
            .attr('type', 'submit')
            .style('backgroundColor', 'blue')
            .style('color', 'white')
            .attr('data-test', 'test-button')
            .on('click', () => { })
            .done();

        expect(btn.tagName).to.equal('BUTTON');
        expect(btn.innerHTML).to.equal('Click me');
        expect(btn).to.have.attr('type', 'submit');
        expect(btn).to.have.attr('data-test', 'test-button');
        expect(btn.style.backgroundColor).to.equal('blue');
        expect(btn.style.color).to.equal('white');
    });

    it('should support multiple style setting via styles method', () => {
        const [div] = nu('div')
            .styles({
                color: 'red',
                fontWeight: 'bold',
                marginTop: '10px'
            })
            .done();

        expect(div.style.color).to.equal('red');
        expect(div.style.fontWeight).to.equal('bold');
        expect(div.style.marginTop).to.equal('10px');
    });

    it('should support multiple attribute setting via attrs method', () => {
        const [input] = nu('input')
            .attrs({
                type: 'text',
                placeholder: 'Enter your name',
                required: 'true'
            })
            .done();

        expect(input).to.have.attr('type', 'text');
        expect(input).to.have.attr('placeholder', 'Enter your name');
        expect(input).to.have.attr('required', 'true');
    });

    it('should support raw HTML content', () => {
        const [div] = nu('div')
            .content('<span>Hello</span>')
            .raw(true)
            .done();

        expect(div.innerHTML).to.equal('<span>Hello</span>');
        expect(div.firstChild.nodeName).to.equal('SPAN');
    });

    it('should support multiple event listeners', () => {
        const clickHandler = sinon.spy();
        const mouseoverHandler = sinon.spy();

        const [btn] = nu('button')
            .content('Interactive')
            .on('click', clickHandler)
            .on('mouseover', mouseoverHandler)
            .done();

        btn.click();
        btn.dispatchEvent(new MouseEvent('mouseover'));

        expect(clickHandler.calledOnce).to.be.true;
        expect(mouseoverHandler.calledOnce).to.be.true;
    });

    it('should support querying multiple elements with gimme', () => {
        const html = `
            <h2 class="title">Hello</h2>
            <p class="content">Paragraph 1</p>
            <p class="content">Paragraph 2</p>
        `;

        const [container, title, firstContent, secondContent] = nu('div')
            .content(html)
            .raw(true)
            .gimme(['.title', '.content:first-of-type', '.content:last-child'])
            .done();

        expect(title.innerHTML).to.equal('Hello');
        expect(firstContent.innerHTML).to.equal('Paragraph 1');
        expect(secondContent.innerHTML).to.equal('Paragraph 2');
    });

    it('should handle misc properties', () => {
        const checkbox = document.createElement('input');

        extend(checkbox, {
            misc: { type: 'checkbox', checked: true, disabled: false }
        });

        expect(checkbox.type).to.equal('checkbox');
        expect(checkbox.checked).to.be.true;
        expect(checkbox.disabled).to.be.false;
    });
});

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
        s.on('change', mockFn);
        s.update('new value');
        expect(mockFn.calledWith({ type: 'change', value: 'new value' })).to.be.true;
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
        const ms = cf.store({ type: 'map', value: { name: 'John' } });
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
        const nameStore = cf.store({ value: 'John' });

        const renderGreeting = (data) => `Hello, ${data.name}!`;

        const [div] = nu('div', {
            contents: renderGreeting,
            deps: { name: nameStore }
        }).done();

        expect(div.innerHTML).to.equal('Hello, John!');

        nameStore.update('Alice');
        expect(div.innerHTML).to.equal('Hello, Alice!');
    });

    it('Multiple stores should update element content independently', () => {
        const firstNameStore = cf.store({ value: 'John' });
        const lastNameStore = cf.store({ value: 'Doe' });

        const renderFullName = (data) => `${data.firstName} ${data.lastName}`;

        const [span] = nu('span', {
            contents: renderFullName,
            deps: {
                firstName: firstNameStore,
                lastName: lastNameStore
            }
        }).done();

        expect(span.innerHTML).to.equal('John Doe');

        firstNameStore.update('Jane');
        expect(span.innerHTML).to.equal('Jane Doe');

        lastNameStore.update('Smith');
        expect(span.innerHTML).to.equal('Jane Smith');
    });

    it('ListStore should update collection rendering', () => {
        const itemsStore = cf.store({
            type: 'list',
            value: ['Apple', 'Banana', 'Cherry']
        });

        const renderList = (data) => {
            return `<ul>${data.items.map(item => `<li>${item}</li>`).join('')}</ul>`;
        };

        const [div] = nu('div', {
            contents: renderList,
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

        const [container, h2, first, second] = nu('')
            .deps({ user })
            .content(({ user }) => {
                return `
                <div class="user">
                    <h2>${user.name}</h2>
                    <p>Age: ${user.age}</p>
                    <p>Role: ${user.isAdmin ? 'Admin' : 'User'}</p>
                </div>
            `;
            })
            .raw(true)
            .gimme(['h2', 'p:nth-child(2)', 'p:nth-child(3)'])
            .done();

        expect(h2.textContent).to.equal('John');
        expect(first.textContent).to.equal('Age: 30');
        expect(second.textContent).to.equal('Role: User');

        user.set('name', 'Jane');
        expect(container.querySelector('h2').textContent).to.equal('Jane');

        user.set('age', 28);
        expect(container.querySelector('p:nth-child(2)').textContent).to.equal('Age: 28');

        user.set('isAdmin', true);
        expect(container.querySelector('p:nth-child(3)').textContent).to.equal('Role: Admin');
    });

    it('Should handle complex nested reactivity', () => {
        const count = cf.store({ value: 0 });
        const message = cf.store({ value: 'Click to increment' });
        const color = cf.store({ value: 'blue' });

        const [counter] = nu('div', {
            contents: (data, opts) => {
                // Add event info to demonstrate full reactive system capabilities
                const eventDetail = opts.event ? ` (triggered by ${opts.event.triggeredBy})` : '';
                return `<div style="color: ${data.color}">
                    <h3>${data.message}${eventDetail}</h3>
                    <p>Count: ${data.count}</p>
                </div>`;
            },
            raw: true,
            deps: {
                count: count,
                message: message,
                color: color
            }
        }).done();

        expect(counter.querySelector('p').textContent).to.equal('Count: 0');
        expect(counter.querySelector('h3').textContent).to.equal('Click to increment');
        expect(counter.querySelector('div').style.color).to.equal('blue');

        // Update values and verify DOM updates
        count.update(1);
        expect(counter.querySelector('p').textContent).to.equal('Count: 1');
        expect(counter.querySelector('h3').textContent).to.contain('triggered by count');

        message.update('Counter was clicked');
        expect(counter.querySelector('h3').textContent).to.contain('Counter was clicked');
        expect(counter.querySelector('h3').textContent).to.contain('triggered by message');

        color.update('red');
        expect(counter.querySelector('div').style.color).to.equal('red');
        expect(counter.querySelector('h3').textContent).to.contain('triggered by color');
    });

    it('Should properly clean up subscriptions when element is disposed', () => {
        const countStore = cf.store({ value: 0 });

        const renderValue = (data) => {
            return `Value: ${data.count}`;
        }

        const [div] = nu('div', {
            contents: renderValue,
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