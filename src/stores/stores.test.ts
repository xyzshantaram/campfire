import cf, { nu } from "../campfire.ts";
import { expect, setupTests } from "@/test.setup.ts";

setupTests();

Deno.test("Store-to-DOM reactivity integration", async (t) => {
    await t.step("signal updates single value", () => {
        const name = cf.store({ value: "X" });
        const [div] = nu("div", {
            deps: { name },
            render: ({ name }) => `Hi, ${name}`,
        }).done();
        expect(div.innerHTML).to.equal("Hi, X");
        name.update("Y");
        expect(div.innerHTML).to.equal("Hi, Y");
    });

    await t.step("ListStore integration with nu", () => {
        const items = cf.store({ type: "list", value: ["a", "b"] });
        const [ul] = nu("ul", {
            deps: { items },
            render: ({ items }) => `<li>${items.join("</li><li>")}</li>`,
            raw: true,
        }).done();
        expect(ul.innerHTML).to.equal("<li>a</li><li>b</li>");
        items.push("c");
        expect(ul.innerHTML).to.equal("<li>a</li><li>b</li><li>c</li>");
    });

    await t.step("MapStore integration with nu", () => {
        const user = cf.store({ type: "map", value: { n: "Q", a: 2 } });
        const [p] = nu("p", {
            deps: { user },
            render: ({ user }) => `Name: ${user.n}, Age: ${user.a}`,
        }).done();
        user.set("a", 3);
        expect(p.innerHTML).to.equal("Name: Q, Age: 3");
    });
});
