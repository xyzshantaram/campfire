import { nu } from "./nu.ts";
import { expect } from "@/test.setup.ts";

Deno.test("nu function coverage", async (t) => {
    await t.step("render returns func, builder, string, or undefined", () => {
        const fn = () => "ok";
        const [d1] = nu("div", { render: fn }).done();
        expect(d1.innerHTML).to.equal("ok");
        const [d2] = nu("div", { render: () => "<b>x</b>" }).done();
        expect(d2.innerHTML).to.equal("&lt;b&gt;x&lt;/b&gt;");
        const [d3] = nu("div").done();
        expect(d3.tagName).to.equal("DIV");
    });

    await t.step("provides children as array, handles slot, misses", () => {
        const span = nu("span").content("A").ref();
        const [parent] = nu("div")
            .children({ x: span })
            .render((_, { b }) => b.html`<cf-slot name='x'></cf-slot>`)
            .done();
        expect(parent.querySelector("span")).to.equal(span);
        const [noSlot] = nu("div", { children: {}, render: () => `<cf-slot name='y'></cf-slot>`, raw: true }).done();
        expect(noSlot.innerHTML).to.match(/cf-slot/);
    });

    await t.step("handles gimme single/multiple/missing selectors", () => {
        const html = `<span class='a'>1</span><span id='b'>2</span><span class='c'></span>`;
        const [, one, two, miss] = nu("div").raw(true).content(html).gimme(".a", "#b", "#no", "#c").done();
        expect(one?.classList.contains("a")).to.be.true;
        expect(two?.id).to.equal("b");
        expect(miss === null).to.be.true;
    });
});
