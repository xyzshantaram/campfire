/**
 * Comprehensive tests for ListStore
 */

import { spy } from "@std/testing/mock";
import { ListStore } from "./ListStore.ts";
import { expect, setupTests } from "@/test.setup.ts";

setupTests();

Deno.test("ListStore Tests", async (t) => {
    await t.step(
        "should initialize with empty array when no input is provided",
        () => {
            const store = new ListStore();
            expect(store.current()).to.be.an("array").that.is.empty;
            expect(store.length).to.equal(0);
        },
    );

    await t.step("should initialize with provided array", () => {
        const store = new ListStore([1, 2, 3]);
        expect(store.current()).to.deep.equal([1, 2, 3]);
        expect(store.length).to.equal(3);
    });

    await t.step("should push values and emit append event", () => {
        const store = new ListStore<number>([1, 2]);
        const s = spy();
        store.on("append", s);

        const length = store.push(3);

        expect(length).to.equal(3);
        expect(store.current()).to.deep.equal([1, 2, 3]);
        expect(s.calls.length === 1).to.be.true;
        expect(s.calls[0].args[0]).to.deep.include({
            type: "append",
            value: 3,
            idx: 2,
        });
    });

    await t.step("should remove values at index and emit deletion event", () => {
        const store = new ListStore(["a", "b", "c"]);
        const s = spy();
        store.on("deletion", s);

        store.remove(1);

        expect(store.current()).to.deep.equal(["a", "c"]);
        expect(s.calls.length === 1).to.be.true;
        expect(s.calls[0].args[0]).to.deep.include({
            type: "deletion",
            idx: 1,
            value: "b",
        });
    });

    await t.step("should throw RangeError when removing with invalid index", () => {
        const store = new ListStore([1, 2, 3]);

        expect(() => store.remove(3)).to.throw(RangeError);

        // Verify the store wasn't modified
        expect(store.current()).to.deep.equal([1, 2, 3]);
    });

    await t.step("should get value at specified index", () => {
        const store = new ListStore(["a", "b", "c"]);

        expect(store.get(0)).to.equal("a");
        expect(store.get(1)).to.equal("b");
        expect(store.get(2)).to.equal("c");
    });

    await t.step("should throw RangeError when getting with invalid index", () => {
        const store = new ListStore([1, 2, 3]);

        expect(() => store.get(-1)).to.throw(RangeError);
        expect(() => store.get(3)).to.throw(RangeError);
    });

    await t.step("should set value at specified index and emit change event", () => {
        const store = new ListStore(["a", "b", "c"]);
        const s = spy();
        store.on("change", s);

        store.set(1, "X");

        expect(store.current()).to.deep.equal(["a", "X", "c"]);
        expect(s.calls.length === 1).to.be.true;
        expect(s.calls[0].args[0]).to.deep.include({
            type: "change",
            value: "X",
            idx: 1,
        });
    });

    await t.step("should throw RangeError when setting with invalid index", () => {
        const store = new ListStore([1, 2, 3]);

        expect(() => store.set(-1, 0)).to.throw(RangeError);
        expect(() => store.set(3, 4)).to.throw(RangeError);

        // Verify the store wasn't modified
        expect(store.current()).to.deep.equal([1, 2, 3]);
    });

    await t.step("should clear all values and emit clear event", () => {
        const store = new ListStore([1, 2, 3]);
        const s = spy();
        store.on("clear", s);

        store.clear();

        expect(store.current()).to.be.an("array").that.is.empty;
        expect(store.length).to.equal(0);
        expect(s.calls.length === 1).to.be.true;
        expect(s.calls[0].args[0]).to.deep.include({
            type: "clear",
        });
    });

    await t.step("should access length property correctly", () => {
        const store = new ListStore<number>();
        expect(store.length).to.equal(0);

        store.push(1);
        expect(store.length).to.equal(1);
    });
});
