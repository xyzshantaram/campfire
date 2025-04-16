import { extend, insert, nu, rm } from "../campfire.ts";
import { CfDom } from "./config.ts";
import { expect, setupTests } from "@/test.setup.ts";

setupTests();

Deno.test("nu/extend/insert integration", async (t) => {
    await t.step("nu: creates node, parses selector", () => {
        const [d] = nu("button#x.y").done();
        expect(d.id).to.equal("x");
        expect(d.tagName).to.equal("BUTTON");
        expect(d.classList.contains("y")).to.be.true;
    });
    await t.step("extend: sets style/attributes/raw html", () => {
        const [d] = nu().done();
        extend(d, { style: { color: "red" }, contents: "<b>hi</b>", raw: true });
        expect(d.style.color).to.equal("red");
        expect(d.innerHTML).to.equal("<b>hi</b>");
    });
    await t.step("insert: single and array insertion", () => {
        const [c] = nu().done();
        const [x] = nu("span").done();
        insert(c, { into: CfDom.document!.body });
        insert(x, { into: c });
        expect(c.firstChild).to.equal(x);
        rm(c);
    });
});
