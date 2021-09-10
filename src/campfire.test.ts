const { describe, test, expect } = require("@jest/globals");
// @ts-ignore
const { escape, unescape } = require('../dist/campfire.cjs');

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

    test('should unescape entities in order', function () {
        expect(unescape("&amp;lt;")).toStrictEqual("&lt;");
    });

    test('should unescape the proper entities', function () {
        expect(unescape(escaped)).toStrictEqual(unescaped);
    });

    test('should handle strings with nothing to unescape', function () {
        expect(unescape('abc')).toStrictEqual('abc');
    });

    test('should unescape the same characters escaped by `escape`', function () {
        expect(unescape(escape(unescaped))).toBe(unescaped);
    });

    test('should handle leading zeros in html entities', function () {
        expect(unescape('&#39;')).toStrictEqual("'");
        expect(unescape('&#039;')).toStrictEqual("'");
        expect(unescape('&#000039;')).toStrictEqual("'");
    });

})