import { html, mustache, r, template } from "../campfire.ts";
import { expect, setupTests } from "@/test.setup.ts";
setupTests();

Deno.test("html/mustache/template core", async (t) => {
    await t.step("html escapes parameters", () => {
        expect(html`<div>${"<b>test</b>"}</div>`).to.contain(
            "&lt;b&gt;test&lt;/b&gt;",
        );
    });
    await t.step("mustache basic substitution", () => {
        expect(mustache("Hi {{name}}", { name: "Alice" })).to.equal("Hi Alice");
    });
    await t.step("mustache context switching and logic", () => {
        expect(
            mustache("{{#show}}yes{{/show}}{{^show}}no{{/show}}", { show: false }),
        ).to.equal("no");
        expect(mustache("{{#u}}{{n}}{{/u}}", { u: { n: "N" } })).to.equal("N");
    });
    await t.step("mustache throws on unclosed section", () => {
        expect(() => mustache("{{#a}}fail", {})).to.throw();
    });
    await t.step("template interpolates", () => {
        const tpl = template("{{a}}-{{b}}");
        expect(tpl({ a: 1, b: "x" })).to.equal("1-x");
    });
});

Deno.test("templating helpers and edge cases", async (t) => {
    await t.step("r() utility: handles array, string, object, with joiner", () => {
        expect(r(["a", "b"], { joiner: "," }).contents).to.equal("a,b");
        expect(r("hi").contents).to.equal("hi");
        expect(r(42).contents).to.equal("42");
        expect(() => r({})).not.to.throw();
    });

    await t.step("html literal: raw/interpolated/mixed/undefined", () => {
        expect(html`a${r("<")}b`).to.include("<");
        expect(html`q${undefined}z`).to.include("qz");
        expect(html`${r(["x", "y"])}!`).to.include("x");
    });

    await t.step("mustache: undefined, triple, error, bad nesting", () => {
        expect(mustache("{{nope}}", {})).to.include("{{ nope }}");
        expect(mustache("{{{unsafe}}}", { unsafe: "<i>t</i>" })).to.include("<i>");
        expect(() => mustache("{{#a}}", {})).to.throw();
        expect(() => mustache("{{/bad}}", {})).to.throw();
    });

    await t.step("mustache: context fallback dot, array/prim/context", () => {
        expect(mustache("{{.}}", { ".": "Q" })).to.include("Q");
        expect(mustache("{{#arr}}{{.}}{{/arr}}", { arr: [3, 4] })).to.include("34");
        expect(mustache("{{#obj}}{{val}}{{/obj}}", { obj: { val: "X" } })).to.include("X");
    });

    await t.step("template interpolates", () => {
        const tpl = template("{{foo}}xy{{bar}}");
        expect(tpl({ foo: 2, bar: "Y" })).to.equal("2xyY");
    });
});
