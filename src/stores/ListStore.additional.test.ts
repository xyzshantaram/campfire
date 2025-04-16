/**
 * Additional tests for ListStore
 */

import sinon from "sinon";
import { describe, it } from "jsr:@std/testing/bdd";
import { ListStore } from "./ListStore.ts";
import { expect, setupTests } from "@test-setup";

setupTests();

Deno.test("Additional ListStore Tests", (t) => {
    t.step("should silently ignore remove() with negative index", (t) => {
        const store = new ListStore([1, 2, 3]);
        const spy = sinon.spy();
        store.on("deletion", spy);

        // Should not throw and should silently ignore
        store.remove(-1);

        // Verify store was not modified
        expect(store.current()).to.deep.equal([1, 2, 3]);
        expect(spy.called).to.be.false;
    });

    t.step("should be iterable with for-of loop", (t) => {
        const store = new ListStore(["a", "b", "c"]);
        const values: string[] = [];

        for (const item of store) {
            values.push(item);
        }

        expect(values).to.deep.equal(["a", "b", "c"]);
    });

    t.step("should support map() method", (t) => {
        const store = new ListStore([1, 2, 3]);
        const doubled = store.map((x) => x * 2);

        expect(doubled).to.deep.equal([2, 4, 6]);
    });

    t.step("should support forEach() method", (t) => {
        const store = new ListStore([1, 2, 3]);
        const values: number[] = [];

        store.forEach((value) => values.push(value));

        expect(values).to.deep.equal([1, 2, 3]);
    });

    t.step("should support findIndex() method", (t) => {
        const store = new ListStore([10, 20, 30]);

        const index = store.findIndex((value) => value > 15);

        expect(index).to.equal(1);
    });
});
