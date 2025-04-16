import { ids } from "@/utils.ts";
import { expect } from "@/test.setup.ts";

Deno.test("generateId coverage", async (t) => {
    await t.step("generates unique ids with prefix", () => {
        const generate = ids("foo");
        const first = generate();
        const second = generate();
        expect(first).to.not.equal(second);
        expect(first.startsWith("foo-")).to.be.true;
        expect(second.startsWith("foo-")).to.be.true;
    });

    await t.step("generates ids with default prefix", () => {
        const generate = ids();
        const id = generate();
        expect(id).to.match(/cf-[a-zA-Z0-9]{6}/);
    });
});
