/**
 * @jest-environment jsdom
 */

const { describe, test, expect } = require("@jest/globals");
import { describe, test, expect } from "@jest/globals";
import cf, { escape, unescape, mustache, template, nu, extend, html, r, seq } from '../dist/testing/campfire.cjs';


describe('Tests for nu', () => {
    test('should create a div when no args are passed', () => {
        expect(nu().done()[0].tagName).toBe('DIV');
    })

    test('the new div must be empty', () => {
        expect(nu().done()[0]).toBeEmptyDOMElement();
    })

    test('should parse element string correctly', () => {
        const [elt] = nu('button#click-me.btn.cls').done();
        expect(elt).toHaveClass('btn', 'cls');
        expect(elt.id).toBe('click-me');
        expect(elt.tagName).toBe('BUTTON');
    })
})

describe('Tests for extend', () => {
    test('should work properly with nu', () => {
        const [elt] = nu('#id', { style: { textAlign: 'center' }, attrs: { 'data-an-attribute': 32 } }).done();
        expect(elt.id).toBe('id');
        expect(elt.tagName).toBe('DIV');
        expect(elt).toHaveAttribute('style', 'text-align: center;');
        expect(elt).toHaveAttribute('data-an-attribute', '32');
    })

    test('should add styles', () => {
        const [elt] = nu().done();
        extend(elt, { style: { margin: 0 } });
        expect(elt).toHaveAttribute('style', 'margin: 0px;');
    })

    test('should escape and set contents', () => {
        const [elt] = nu().done();
        extend(elt, { contents: "<b> bold </b>" });
        expect(elt.innerHTML).toBe('&lt;b&gt; bold &lt;/b&gt;');
    })

    test('should not escape contents with raw flag', () => {
        const [elt] = nu().done();
        extend(elt, { contents: "<b> bold </b>", raw: true });
        expect(elt.innerHTML).toBe('<b> bold </b>');
    })

    test('should return elements passed in gimme param', () => {
        const [elt, span] = nu(`div#container`, {
            raw: true,
            contents: html`
            <span class=some-span>42</span>
            `,
            gimme: ['span.some-span']
        }).done();
        expect(elt.id).toBe('container');
        expect(span.tagName).toBe('SPAN');
        expect(span).toHaveClass('some-span');
        expect(span.innerHTML).toBe('42');
    })
})

describe('tests for escape() and unescape()', () => {
    let escaped = '&amp;&lt;&gt;&quot;&#39;/';
    let unescaped = '&<>"\'/';

    escaped += escaped;
    unescaped += unescaped;

    test('should escape values', () => {
        expect(escape(unescaped)).toStrictEqual(escaped);
    })

    test('should handle strings with nothing to escape', () => {
        expect(escape('abc')).toStrictEqual('abc');
    });

    test('should escape the same characters unescaped by `unescape`', () => {
        expect(escape(unescape(escaped))).toStrictEqual(escaped);
    });

    test('should unescape entities in order', () => {
        expect(unescape("&amp;lt;")).toStrictEqual("&lt;");
    });

    test('should unescape the proper entities', () => {
        expect(unescape(escaped)).toStrictEqual(unescaped);
    });

    test('should handle strings with nothing to unescape', () => {
        expect(unescape('abc')).toStrictEqual('abc');
    });

    test('should unescape the same characters escaped by `escape`', () => {
        expect(unescape(escape(unescaped))).toBe(unescaped);
    });

    test('should handle leading zeros in html entities', () => {
        expect(unescape('&#39;')).toStrictEqual("'");
        expect(unescape('&#039;')).toStrictEqual("'");
        expect(unescape('&#000039;')).toStrictEqual("'");
    });

})

describe('tests for html``', () => {
    test('should escape parameters', () => {
        expect(mustache(html`<div>${"<script> alert('xss') </script>"}</div>`))
            .toBe("<div>&lt;script&gt; alert(&#39;xss&#39;) &lt;/script&gt;</div>")
    })

    test('should not escape r() values', () => {
        expect(mustache(html`<div>${r("<script> alert('xss') </script>")}</div>`))
            .toBe("<div><script> alert('xss') </script></div>")
    })

    test('should join arrays together', () => {
        const transform = itm => html`<li>${itm.toString()}</li>`;
        const list = html`<ul> ${r(seq(3).map(transform))} </ul>`;

        expect(list).toStrictEqual('<ul> <li>0</li> <li>1</li> <li>2</li> </ul>')
    })

    test('should enable custom joiners', () => {
        const transform = itm => html`<span>${itm.toString()}</span>`;
        const spans = html`${r(seq(3).map(transform), { joiner: ', ' })}`;

        expect(spans).toStrictEqual('<span>0</span>, <span>1</span>, <span>2</span>')
    })

    test('should allow empty custom joiner', () => {
        const transform = itm => itm.toString();
        const num = html`${r(seq(3).map(transform), { joiner: '' })}`;

        expect(num).toStrictEqual('012');
    })
})

describe('tests for seq', () => {
    test('should use args[0] as stop if only one param provided', () => {
        expect(seq(3)).toStrictEqual([0, 1, 2]);
    })

    test('should work for ranges', () => {
        expect(seq(1, 4)).toStrictEqual([1, 2, 3]);
    })

    test('should return empty list if start is negative', () => {
        expect(seq(-1)).toStrictEqual([]);
    })

    test('should work for negative ranges', () => {
        expect(seq(-4, -1)).toStrictEqual([-4, -3, -2]);
    })

    test('should work for ranges with a step', () => {
        expect(seq(0, 7, 2)).toStrictEqual([0, 2, 4, 6]);
    })

    test('should work for negative ranges with a step', () => {
        expect(seq(-8, -4, 2)).toStrictEqual([-8, -6]);
    })
})

describe('Tests for mustache', () => {
    test('should substitute data that is present', () => {
        expect(mustache("Welcome to {{ location }}, {{ name }}.", { name: "John", location: "Mars" })).toBe("Welcome to Mars, John.");
    })
    test('should ignore spaces surrounding mustache names', () => {
        expect(mustache("{{ name }} {{name}} {{  name  }} {{    name    }}", { name: "John" })).toBe("John John John John");
    })

    test('should ignore escaped mustaches', () => {
        expect(mustache("\\{{ name }}", { name: "John" })).toBe("{{ name }}");
    })

    test('should ignore absent mustaches', () => {
        expect(mustache("{{ nonexistent }}", { name: "John" })).toBe("{{ nonexistent }}");
    })

    test('should perform replacements at once', () => {
        expect(mustache("Welcome to {{ location }}, {{ name }}.", { location: "{{ name }}", name: "John", })).toBe("Welcome to {{ name }}, John.");
    })

    test('should escape substituted text', () => {
        expect(mustache("Welcome to {{ location }}, {{ name }}.", { name: "John", location: "<script> alert('xss') </script>" })).not.toBe("Welcome to <script> alert('xss') </script>, John.")
    })

    test("should not escape when esc flag is false", () => {
        expect(mustache("Welcome to {{ location }}, {{ name }}.", { location: "Mars", name: "<b>John</b>" }, false)).toBe("Welcome to Mars, <b>John</b>.")
    })
})

describe('Tests for template', () => {
    const t = template("Welcome to {{ location }}, {{ name }}.");

    test('should work', () => { // TODO: Better test name.
        expect(t({ name: "John", location: "Mars" })).toBe("Welcome to Mars, John.");
        expect(t({ name: "Joseph", location: "Mars" })).toBe("Welcome to Mars, Joseph.");
    })
})

describe('Tests for NuBuilder', () => {
    test('should support fluent method chaining', () => {
        const [btn] = nu('button')
            .content('Click me')
            .attr('type', 'submit')
            .style('backgroundColor', 'blue')
            .style('color', 'white')
            .attr('data-test', 'test-button')
            .on('click', () => { })
            .done();

        expect(btn.tagName).toBe('BUTTON');
        expect(btn.innerHTML).toBe('Click me');
        expect(btn).toHaveAttribute('type', 'submit');
        expect(btn).toHaveAttribute('data-test', 'test-button');
        expect(btn.style.backgroundColor).toBe('blue');
        expect(btn.style.color).toBe('white');
    });

    test('should support multiple style setting via styles method', () => {
        const [div] = nu('div')
            .styles({
                color: 'red',
                fontWeight: 'bold',
                marginTop: '10px'
            })
            .done();

        expect(div.style.color).toBe('red');
        expect(div.style.fontWeight).toBe('bold');
        expect(div.style.marginTop).toBe('10px');
    });

    test('should support multiple attribute setting via attrs method', () => {
        const [input] = nu('input')
            .attrs({
                type: 'text',
                placeholder: 'Enter your name',
                required: 'true'
            })
            .done();

        expect(input).toHaveAttribute('type', 'text');
        expect(input).toHaveAttribute('placeholder', 'Enter your name');
        expect(input).toHaveAttribute('required', 'true');
    });

    test('should support raw HTML content', () => {
        const [div] = nu('div')
            .content('<span>Hello</span>')
            .raw(true)
            .done();

        expect(div.innerHTML).toBe('<span>Hello</span>');
        expect(div.firstChild.nodeName).toBe('SPAN');
    });

    test('should support multiple event listeners', () => {
        const clickHandler = jest.fn();
        const mouseoverHandler = jest.fn();

        const [btn] = nu('button')
            .content('Interactive')
            .on('click', clickHandler)
            .on('mouseover', mouseoverHandler)
            .done();

        btn.click();
        btn.dispatchEvent(new MouseEvent('mouseover'));

        expect(clickHandler).toHaveBeenCalledTimes(1);
        expect(mouseoverHandler).toHaveBeenCalledTimes(1);
    });

    test('should support querying multiple elements with gimme', () => {
        const html = `
            <h2 class="title">Hello</h2>
            <p class="content">Paragraph 1</p>
            <p class="content">Paragraph 2</p>
        `;

        const [container, title, firstContent, secondContent] = nu('div')
            .content(html)
            .raw(true)
            .gimme(['.title', '.content:first-child', '.content:last-child'])
            .done();

        expect(title.innerHTML).toBe('Hello');
        expect(firstContent.innerHTML).toBe('Paragraph 1');
        expect(secondContent.innerHTML).toBe('Paragraph 2');
    });

    test('should handle misc properties', () => {
        const checkbox = document.createElement('input');

        extend(checkbox, {
            misc: { type: 'checkbox', checked: true, disabled: false }
        });

        expect(checkbox.type).toBe('checkbox');
        expect(checkbox.checked).toBe(true);
        expect(checkbox.disabled).toBe(false);
    });
});

describe('Tests for Store', () => {
    test('Store should store and update values', () => {
        const s = cf.store({ value: 'test' });
        expect(s.value).toBe('test');
        s.update('new value');
        expect(s.value).toBe('new value');
    });

    test('Store should notify subscribers of changes', () => {
        const s = cf.store({ value: 'test' });
        const mockFn = jest.fn();
        s.on('change', mockFn);
        s.update('new value');
        expect(mockFn).toHaveBeenCalledWith({ type: 'change', value: 'new value' });
    });

    test('ListStore should handle array operations', () => {
        const ls = cf.store({ type: 'list', value: [1, 2, 3] });
        expect(ls.value).toEqual([1, 2, 3]);
        const mockFn = jest.fn();
        ls.on('append', mockFn);
        ls.push(4);
        expect(ls.value).toEqual([1, 2, 3, 4]);
        expect(mockFn).toHaveBeenCalledWith({ type: 'append', value: 4, idx: 3 });
    });

    test('MapStore should handle object operations', () => {
        const ms = cf.store({ type: 'map', value: { name: 'John' } });
        expect(ms.value).toEqual({ name: 'John' });
        const mockFn = jest.fn();
        ms.on('change', mockFn);
        ms.set('age', 30);
        expect(ms.value).toEqual({ name: 'John', age: 30 });
        expect(mockFn).toHaveBeenCalledWith({
            type: 'change', value: 30, key: 'age'
        });
    });
});

describe('Tests for Reactivity', () => {
    test('Element content should update when store changes', () => {
        const nameStore = cf.store({ value: 'John' });

        const renderGreeting = (data) => `Hello, ${data.name}!`;

        const [div] = nu('div', {
            contents: renderGreeting,
            deps: { name: nameStore }
        }).done();

        expect(div.innerHTML).toBe('Hello, John!');

        nameStore.update('Alice');
        expect(div.innerHTML).toBe('Hello, Alice!');
    });

    test('Multiple stores should update element content independently', () => {
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

        expect(span.innerHTML).toBe('John Doe');

        firstNameStore.update('Jane');
        expect(span.innerHTML).toBe('Jane Doe');

        lastNameStore.update('Smith');
        expect(span.innerHTML).toBe('Jane Smith');
    });

    test('ListStore should update collection rendering', () => {
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

        expect(div.innerHTML).toBe('<ul><li>Apple</li><li>Banana</li><li>Cherry</li></ul>');

        itemsStore.push('Durian');
        expect(div.innerHTML).toBe('<ul><li>Apple</li><li>Banana</li><li>Cherry</li><li>Durian</li></ul>');

        itemsStore.remove(1); // Remove Banana
        expect(div.innerHTML).toBe('<ul><li>Apple</li><li>Cherry</li><li>Durian</li></ul>');
    });

    test('MapStore should update object rendering', () => {
        const userStore = cf.store({
            type: 'map',
            value: {
                name: 'John',
                age: 30,
                isAdmin: false
            }
        });

        const renderUser = (data) => {
            const user = data.user;
            return `
                <div class="user">
                    <h2>${user.name}</h2>
                    <p>Age: ${user.age}</p>
                    <p>Role: ${user.isAdmin ? 'Admin' : 'User'}</p>
                </div>
            `;
        };

        const [container] = nu('div', {
            contents: renderUser,
            raw: true,
            deps: { user: userStore }
        }).done();

        expect(container.querySelector('h2').textContent).toBe('John');
        expect(container.querySelector('p:nth-child(2)').textContent).toBe('Age: 30');
        expect(container.querySelector('p:nth-child(3)').textContent).toBe('Role: User');

        userStore.set('name', 'Jane');
        expect(container.querySelector('h2').textContent).toBe('Jane');

        userStore.set('age', 28);
        expect(container.querySelector('p:nth-child(2)').textContent).toBe('Age: 28');

        userStore.set('isAdmin', true);
        expect(container.querySelector('p:nth-child(3)').textContent).toBe('Role: Admin');
    });

    test('Should handle complex nested reactivity', () => {
        const countStore = cf.store({ value: 0 });
        const messageStore = cf.store({ value: 'Click to increment' });
        const colorStore = cf.store({ value: 'blue' });

        const renderCounter = (data, opts) => {
            // Add event info to demonstrate full reactive system capabilities
            const eventDetail = opts.event ? ` (triggered by ${opts.event.triggeredBy})` : '';
            return `
                <div style="color: ${data.color}">
                    <h3>${data.message}${eventDetail}</h3>
                    <p>Count: ${data.count}</p>
                </div>
            `;
        };

        const [counter] = nu('div', {
            contents: renderCounter,
            raw: true,
            deps: {
                count: countStore,
                message: messageStore,
                color: colorStore
            }
        }).done();

        expect(counter.querySelector('p').textContent).toBe('Count: 0');
        expect(counter.querySelector('h3').textContent).toBe('Click to increment');
        expect(counter.querySelector('div').style.color).toBe('blue');

        // Update values and verify DOM updates
        countStore.update(1);
        expect(counter.querySelector('p').textContent).toBe('Count: 1');
        expect(counter.querySelector('h3').textContent).includes('triggered by count');

        messageStore.update('Counter was clicked');
        expect(counter.querySelector('h3').textContent).includes('Counter was clicked');
        expect(counter.querySelector('h3').textContent).includes('triggered by message');

        colorStore.update('red');
        expect(counter.querySelector('div').style.color).toBe('red');
        expect(counter.querySelector('h3').textContent).includes('triggered by color');
    });

    test('Should properly clean up subscriptions when element is disposed', () => {
        // This test verifies that store subscriptions are properly managed
        // to prevent memory leaks 
        const countStore = cf.store({ value: 0 });
        const mockFn = jest.fn();

        // Add a spy to track subscription calls
        const originalOn = countStore.on;
        countStore.on = function (...args) {
            mockFn();
            return originalOn.apply(this, args);
        };

        const renderValue = (data) => `Value: ${data.count}`;

        const [div] = nu('div', {
            contents: renderValue,
            deps: { count: countStore }
        }).done();

        expect(div.innerHTML).toBe('Value: 0');

        // Update should trigger the callback
        countStore.update(1);
        expect(div.innerHTML).toBe('Value: 1');

        // Simulate element disposal
        countStore.dispose();

        // Updates after disposal should not affect the element
        countStore.update(2);
        expect(div.innerHTML).toBe('Value: 1'); // Still shows the old value

        // The mock should have been called exactly once for the subscription
        expect(mockFn).toHaveBeenCalledTimes(1);
    });
});