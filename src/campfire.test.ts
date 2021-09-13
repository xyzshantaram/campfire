const { describe, test, expect } = require("@jest/globals");
// @ts-ignore
const { escape, unescape, mustache, template } = require('../dist/testing/campfire.cjs');

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

    test('Should ignore escaped mustaches', () => {
        expect(mustache("\\{{ name }}", { name: "John" })).toBe("{{ name }}");
    })

    test('Should ignore absent mustaches', () => {
        expect(mustache("{{ nonexistent }}", { name: "John" })).toBe("{{ nonexistent }}");
    })
})