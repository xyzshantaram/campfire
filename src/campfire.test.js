/**
 * @jest-environment jsdom
 */

const { describe, test, expect } = require("@jest/globals");
// @ts-ignore
const { escape, unescape, mustache, template, nu, extend } = require('../dist/testing/campfire.cjs');

describe('Tests for nu', () => {
    test('should create a div when no args are passed', () => {
        expect(nu().tagName).toBe('DIV');
    })

    test('the new div must be empty', () => {
        expect(nu()).toBeEmptyDOMElement();
    })

    test('should parse element string correctly', () => {
        const elt = nu('button#click-me.btn.cls');
        expect(elt).toHaveClass('btn', 'cls');
        expect(elt.id).toBe('click-me');
        expect(elt.tagName).toBe('BUTTON');
    })
})

describe('Tests for extend', () => {
    test('should work properly with nu', () => {
        const elt = nu('#id', { style: { textAlign: 'center' }, attrs: { 'data-an-attribute': 32 } });
        expect(elt.id).toBe('id');
        expect(elt.tagName).toBe('DIV');
        expect(elt).toHaveAttribute('style', 'text-align: center;');
        expect(elt).toHaveAttribute('data-an-attribute', '32');
    })

    test('should add styles', () => {
        const elt = nu();
        extend(elt, { style: { margin: 0 } });
        expect(elt).toHaveAttribute('style', 'margin: 0px;');
    })

    test('should escape and set contents', () => {
        const elt = nu();
        extend(elt, { contents: "<b> bold </b>" });
        expect(elt.innerHTML).toBe('&lt;b&gt; bold &lt;/b&gt;');
    })

    test('should not escape contents with raw flag', () => {
        const elt = nu();
        extend(elt, { contents: "<b> bold </b>", raw: true });
        expect(elt.innerHTML).toBe('<b> bold </b>');
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