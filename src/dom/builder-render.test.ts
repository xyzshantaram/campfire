import { nu, store } from "../campfire.ts";
import { expect, setupTests } from "@test-setup";

setupTests();

Deno.test("Builder: core functional chains", async (t) => {
    await t.step("render with store dep, content updates", () => {
        const c = store({ value: 0 });
        const [div] = nu().deps({ c }).render(({ c }) => `v${c}`).done();
        expect(div.innerHTML).to.equal("v0");
        c.update(2);
        expect(div.innerHTML).to.equal("v2");
    });

    await t.step("chain content, style, and prop update", () => {
        const color = store({ value: "red" });
        const [d] = nu("div")
            .deps({ color })
            .render(({ color }, { b }) => b.content("t").style("color", color))
            .done();
        expect(d.style.color).to.equal("red");
        color.update("blue");
        expect(d.style.color).to.equal("blue");
    });

    await t.step("attribute clear with empty string", () => {
        const v = store({ value: true });
        const [d] = nu("div")
            .attr("test", "v")
            .deps({ v })
            .render(({ v }, { b }) => b.attr("test", v))
            .done();

        expect(d.getAttribute("test")).to.equal("v");
        v.update(false);
        expect(d.hasAttribute("test")).to.be.false;
    });
});

Deno.test("classes logic", async (t) => {
    await t.step(".cls for single and multiple classes", () => {
        const [d] = nu("div").cls("a").cls("b").cls("c", true).done();
        expect(d.classList.contains("a")).to.be.true;
        expect(d.classList.contains("b")).to.be.true;
        expect(d.classList.contains("c")).to.be.true;
    });
    await t.step("cls conditional logic", () => {
        const [d] = nu("div").cls("foo", false).cls("bar", true).done();
        expect(d.classList.contains("foo")).to.be.false;
        expect(d.classList.contains("bar")).to.be.true;
    });
    await t.step("classes updates with store", () => {
        const s = store({ value: false });
        const [b] = nu("button").deps({ s }).render(({ s }, { b }) => b.cls("on", s)).done();
        expect(b.classList.contains("on")).to.be.false;
        s.update(true);
        expect(b.classList.contains("on")).to.be.true;
    });
});
