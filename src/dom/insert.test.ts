import { insert } from "@/dom/mod.ts";
import { expect } from "@/test.setup.ts";

Deno.test("insert edge cases", async (t) => {
    await t.step("throws if no position specified", () => {
        const d = document.createElement("div");
        // @ts-ignore purposely missing
        expect(() => insert(d, { where: {} })).to.throw();
    });

    await t.step("inserts after, before, into with/without at", () => {
        const container = document.createElement("section");
        const ref = document.createElement("hr");
        const newEl = document.createElement("div");
        container.appendChild(ref);

        // after
        insert(newEl, { after: ref });
        expect(ref.nextSibling).to.equal(newEl);
        // before
        const beforeEl = document.createElement("div");
        insert(beforeEl, { before: ref });
        expect(container.firstChild).to.equal(beforeEl);
        // into (append)
        const intoEl = document.createElement("div");
        insert(intoEl, { into: container });
        expect(container.lastChild).to.equal(intoEl);
        // into (start)
        const atStart = document.createElement("div");
        insert(atStart, { into: container, at: "start" });
        expect(container.firstChild).to.equal(atStart);
    });

    await t.step("inserts arrays of elements", () => {
        const ul = document.createElement("ul");
        const arr = [document.createElement("li"), document.createElement("li")];
        insert(arr, { into: ul });
        expect(ul.childElementCount).to.equal(2);
        expect(Array.from(ul.children)).to.deep.equal(arr);
    });
});
