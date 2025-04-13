/**
 * Tests for templating functionality in Campfire.js
 */

import * as chai from 'chai';
import { describe, it } from 'mocha';
import { mustache, template, html, r, seq } from '../campfire.ts';

const expect = chai.expect;

describe('tests for html``', () => {
    it('should escape parameters', () => {
        expect(html`<div>${"<script> alert('xss') </script>"}</div>`)
            .to.equal("<div>&lt;script&gt; alert(&#39;xss&#39;) &lt;/script&gt;</div>");
    });

    it('should not escape r() values', () => {
        expect(html`<div>${r("<script> alert('xss') </script>")}</div>`)
            .to.equal("<div><script> alert('xss') </script></div>");
    });

    it('should join arrays together', () => {
        const transform = (itm: number) => html`<li>${itm.toString()}</li>`;
        const list = html`<ul> ${r(seq(3).map(transform))} </ul>`;

        expect(list).to.equal('<ul> <li>0</li> <li>1</li> <li>2</li> </ul>');
    });

    it('should enable custom joiners', () => {
        const transform = (itm: number) => html`<li>${itm.toString()}</li>`;
        const spans = html`${r(seq(3).map(transform), { joiner: ', ' })}`;

        expect(spans).to.equal('<li>0</li>, <li>1</li>, <li>2</li>');
    });

    it('should allow empty custom joiner', () => {
        const transform = (itm: number) => html`<li>${itm.toString()}</li>`;
        const num = html`${r(seq(3).map(transform), { joiner: '' })}`;

        expect(num).to.equal('<li>0</li><li>1</li><li>2</li>');
    });

    it('should not erase zeroes', () => {
        const s = html`1${0}1`;
        expect(s).to.equal('101');
    })

    it('should handle booleans correctly', () => {
        const s = html`1${true}1`;
        expect(s).to.equal('1true1');
    })
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

    describe('Unescaped variables', () => {
        it('should not escape triple-braced variables', () => {
            expect(mustache("Welcome to {{{ location }}}, {{ name }}.", {
                name: "John",
                location: "<b>Mars</b>"
            })).to.equal("Welcome to <b>Mars</b>, John.");
        });

        it('should handle absent triple-braced variables', () => {
            expect(mustache("{{{ nonexistent }}}", { name: "John" }))
                .to.equal("{{{ nonexistent }}}");
        });
    });

    describe('Sections', () => {
        it('should render section when value is truthy', () => {
            expect(mustache("{{#show}}This is visible{{/show}}", { show: true }))
                .to.equal("This is visible");
        });

        it('should not render section when value is falsy', () => {
            expect(mustache("{{#show}}This is not visible{{/show}}", { show: false }))
                .to.equal("");
        });

        it('should render inverted section when value is falsy', () => {
            expect(mustache("{{^show}}This is visible{{/show}}", { show: false }))
                .to.equal("This is visible");
        });

        it('should not render inverted section when value is truthy', () => {
            expect(mustache("{{^show}}This is not visible{{/show}}", { show: true }))
                .to.equal("");
        });

        it('should treat empty arrays as falsy for inverted sections', () => {
            expect(mustache("{{^items}}No items{{/items}}", { items: [] }))
                .to.equal("No items");
        });
    });

    describe('Array iteration', () => {
        it('should iterate over arrays with separators in template', () => {
            expect(mustache("Items: {{#items}}{{name}}, {{/items}}", {
                items: [
                    { name: "Item 1" },
                    { name: "Item 2" },
                    { name: "Item 3" }
                ]
            })).to.equal("Items: Item 1, Item 2, Item 3, ");
        });

        it('should use the dot value for primitive array items', () => {
            expect(mustache("Numbers: {{#numbers}}{{.}}{{/numbers}}", {
                numbers: [1, 2, 3]
            })).to.equal("Numbers: 123");
        });
    });

    describe('Context changes', () => {
        it('should change context inside sections with object values', () => {
            expect(mustache("{{#person}}{{name}} is {{age}} years old.{{/person}}", {
                person: {
                    name: "John",
                    age: 30
                }
            })).to.equal("John is 30 years old.");
        });
    });

    describe('Nested sections', () => {
        it('should render nested sections correctly', () => {
            expect(mustache(
                "{{#users}}User: {{name}} {{#active}}(active){{/active}}{{^active}}(inactive){{/active}}\n{{/users}}",
                {
                    users: [
                        { name: "John", active: true },
                        { name: "Jane", active: false }
                    ]
                }
            )).to.equal("User: John (active)\nUser: Jane (inactive)\n");
        });

        it('should handle deep nesting', () => {
            expect(mustache(
                "{{#a}}A{{#b}}B{{#c}}C{{/c}}{{/b}}{{/a}}",
                { a: true, b: true, c: true }
            )).to.equal("ABC");
        });
    });

    describe('Error cases', () => {
        it('should throw an error for unclosed sections', () => {
            expect(() => mustache("{{#section}}content", {})).to.throw(Error);
        });

        it('should throw an error for unopened section closers', () => {
            expect(() => mustache("content{{/section}}", {})).to.throw(Error);
        });
    });
});

describe('Tests for template', () => {
    const t = template("Welcome to {{ location }}, {{ name }}.");

    it('should work', () => {
        expect(t({ name: "John", location: "Mars" })).to.equal("Welcome to Mars, John.");
        expect(t({ name: "Joseph", location: "Mars" })).to.equal("Welcome to Mars, Joseph.");
    });
});