/**
 * Tests for templating functionality in Campfire.js
 */

import * as chai from 'chai';
import { describe, it } from 'mocha';
import { mustache, template, html, r, seq } from '../campfire.ts';

const expect = chai.expect;

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