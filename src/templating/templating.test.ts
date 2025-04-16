import { html, mustache, template } from "../campfire.ts";
import { expect, setupTests } from "@test-setup";
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
