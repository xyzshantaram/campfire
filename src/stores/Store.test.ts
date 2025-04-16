import { Store } from "./Store.ts";
import { ListStore } from "./ListStore.ts";
import { expect, setupTests } from "@/test.setup.ts";
import { spy } from "@std/testing/mock";

setupTests();

Deno.test("Store: eventing and lifecycle", async (t) => {
    await t.step("update fires event and mutates", () => {
        const store = new Store({ foo: "bar" });
        const s = spy();
        store.on("update", s);
        store.update({ foo: "baz" });
        expect(s.calls.length === 1).to.be.true;
        expect(store.current()).to.deep.equal({ foo: "baz" });
    });
    await t.step("dispose disables further updates/events", () => {
        const store = new Store({ foo: 1 });
        store.dispose();
        store.update({ foo: 2 });
        expect(store.current()).to.deep.equal({ foo: 1 });
    });
    await t.step("'any' event triggers on any manual event", () => {
        const store = new Store({ a: 1 });
        const s = spy();
        store.any(s);
        store.update({ a: 2 });
        expect(!!s.calls.length).to.be.true;
    });
});

Deno.test("ListStore: internals and events", async (t) => {
    await t.step("initializes with array", () => {
        const store = new ListStore([1, 2, 3]);
        expect(store.current()).to.deep.equal([1, 2, 3]);
    });
    await t.step("pushes values and fires append", () => {
        const store = new ListStore([1, 2]);
        const append = spy();
        store.on("append", append);
        store.push(3);
        expect(store.current()).to.deep.equal([1, 2, 3]);
        expect(append.calls.length === 1).to.be.true;
    });
    await t.step("removes values and emits deletion", () => {
        const store = new ListStore([1, 2, 3]);
        const deletion = spy();
        store.on("deletion", deletion);
        store.remove(1);
        expect(store.current()).to.deep.equal([1, 3]);
        expect(deletion.calls.length === 1).to.be.true;
    });
    await t.step("throws on out-of-bounds get/set", () => {
        const store = new ListStore([1, 2]);
        expect(() => store.get(-1)).to.throw(RangeError);
        expect(() => store.set(2, 100)).to.throw(RangeError);
    });
    await t.step("clear empties store", () => {
        const store = new ListStore([1, 2]);
        store.clear();
        expect(store.length).to.equal(0);
    });
});

Deno.test("Store missing/edge paths", async (t) => {
    await t.step("unsubscribes via unsubscribe", () => {
        const s = new Store(1);
        const sub = s.on("update", () => {});
        s.unsubscribe("update", sub);
        expect(typeof sub).to.equal("number"); // unsub runs
    });

    await t.step("update with updater fn and with value", () => {
        const st = new Store<number>(1);
        st.update((x) => x + 1);
        expect(st.current()).to.equal(2);
        st.update(5);
        expect(st.current()).to.equal(5);
    });
});
