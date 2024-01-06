/**
 * @jest-environment jsdom
 */

const { describe, test, expect } = require("@jest/globals");
// @ts-ignore
const { escape, unescape, mustache, template, nu, extend, html, r, seq } = require('../dist/testing/campfire.cjs');

describe('Tests for nu', () => {
    test('should create a div when no args are passed', () => {
        expect(nu()[0].tagName).toBe('DIV');
    })

    test('the new div must be empty', () => {
        expect(nu()[0]).toBeEmptyDOMElement();
    })

    test('should parse element string correctly', () => {
        const [elt] = nu('button#click-me.btn.cls');
        expect(elt).toHaveClass('btn', 'cls');
        expect(elt.id).toBe('click-me');
        expect(elt.tagName).toBe('BUTTON');
    })
})

describe('Tests for extend', () => {
    test('should work properly with nu', () => {
        const [elt] = nu('#id', { style: { textAlign: 'center' }, attrs: { 'data-an-attribute': 32 } });
        expect(elt.id).toBe('id');
        expect(elt.tagName).toBe('DIV');
        expect(elt).toHaveAttribute('style', 'text-align: center;');
        expect(elt).toHaveAttribute('data-an-attribute', '32');
    })

    test('should add styles', () => {
        const [elt] = nu();
        extend(elt, { style: { margin: 0 } });
        expect(elt).toHaveAttribute('style', 'margin: 0px;');
    })

    test('should escape and set contents', () => {
        const [elt] = nu();
        extend(elt, { contents: "<b> bold </b>" });
        expect(elt.innerHTML).toBe('&lt;b&gt; bold &lt;/b&gt;');
    })

    test('should not escape contents with raw flag', () => {
        const [elt] = nu();
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
        });
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