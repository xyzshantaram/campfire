/**
 * Additional tests for ListStore
 */

import { spy } from "@std/testing/mock";
import { ListStore } from "./ListStore.ts";
import { expect, setupTests } from "@test-setup";

setupTests();

Deno.test("Additional ListStore Tests", async (t) => {
    await t.step("should silently ignore remove() with negative index", () => {
        const store = new ListStore([1, 2, 3]);
        const s = spy();
        store.on("deletion", s);

        // Should not throw and should silently ignore
        store.remove(-1);

        // Verify store was not modified
        expect(store.current()).to.deep.equal([1, 2, 3]);
        expect(s.calls.length).to.equal(0);
    });

    await t.step("should be iterable with for-of loop", () => {
        const store = new ListStore(["a", "b", "c"]);
        const values: string[] = [];

        for (const item of store) {
            values.push(item);
        }

        expect(values).to.deep.equal(["a", "b", "c"]);
    });

    await t.step("should support map() method", () => {
        const store = new ListStore([1, 2, 3]);
        const doubled = store.map((x) => x * 2);

        expect(doubled).to.deep.equal([2, 4, 6]);
    });

    await t.step("should support forEach() method", () => {
        const store = new ListStore([1, 2, 3]);
        const values: number[] = [];

        store.forEach((value) => values.push(value));

        expect(values).to.deep.equal([1, 2, 3]);
    });

    await t.step("should support findIndex() method", () => {
        const store = new ListStore([10, 20, 30]);

        const index = store.findIndex((value) => value > 15);

        expect(index).to.equal(1);
    });
});
