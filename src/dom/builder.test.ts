import { NuBuilder } from "@/dom/NuBuilder.ts";
import { nu, store } from "@/campfire.ts";
import { expect, setupTests } from "@/test.setup.ts";

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

Deno.test("NuBuilder method coverage", async (t) => {
    await t.step("covers every builder chainable method", () => {
        const el = document.createElement("div");
        const b = nu(el);

        b.content("A")
            .attr("data-x", "v")
            .attrs({ "data-y": "z" })
            .style("color", "red")
            .styles({ background: "white" })
            .raw(true)
            .misc("tabIndex", 3)
            .misc({ title: "T" })
            .on("click", () => {})
            .cls("foo", true)
            .track("test-id")
            .gimme(".foo", "#id")
            .deps({})
            .html("<span>B</span>");

        expect(b).to.be.instanceOf(NuBuilder);
        expect(b.ref()).to.equal(el);
    });

    await t.step("throws for # in classes", () => {
        expect(() => nu("div.class#name")).to.throw();
    });

    await t.step("defaults tag to div & parses selectors", () => {
        const b = nu();
        expect(b.ref().tagName).to.equal("DIV");
        const tagParse = nu("span#u.x.y").ref();
        expect(tagParse.tagName).to.equal("SPAN");
        expect(tagParse.id).to.equal("u");
        expect(tagParse.classList.contains("x")).to.be.true;
        expect(tagParse.classList.contains("y")).to.be.true;
    });
});
