import { MapStore } from "./MapStore.ts";
import { expect, setupTests } from "@test-setup";
import { spy } from "@std/testing/mock";

setupTests();

Deno.test("MapStore: feature and events", async (t) => {
    await t.step("initialize and get", () => {
        const store = new MapStore<number>({ x: 1 });
        expect(store.get("x")).to.equal(1);
        expect(store.size).to.equal(1);
    });
    await t.step("set triggers change, get returns updated", () => {
        const store = new MapStore({ a: 1 });
        const s = spy();
        store.on("change", s);
        store.set("a", 2);
        expect(store.get("a")).to.equal(2);
        expect(s.calls.length === 1).to.be.true;
    });
    await t.step("remove deletes and size updates", () => {
        const store = new MapStore({ b: 2 });
        store.remove("b");
        expect(store.has("b")).to.be.false;
        expect(store.size).to.equal(0);
    });
    await t.step("clear erases all keys", () => {
        const store = new MapStore({ a: 1, b: 2 });
        store.clear();
        expect(store.size).to.equal(0);
    });
    await t.step("transform updates and throws on missing key", () => {
        const store = new MapStore({ up: 1 });
        store.transform("up", (v) => v + 1);
        expect(store.get("up")).to.equal(2);
        expect(() => store.transform("nope", (v) => v)).to.throw();
    });
});
