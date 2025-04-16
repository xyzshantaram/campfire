/**
 * Comprehensive tests for MapStore
 */

import { spy } from "@std/testing/mock";
import { MapStore } from "./MapStore.ts";
import { expect, setupTests } from "@test-setup";

setupTests();

Deno.test("MapStore Tests", async (t) => {
    await t.step("should initialize with empty map when no input is provided", () => {
        const store = new MapStore();
        expect(store.size).to.equal(0);
    });

    await t.step("should initialize with provided key-value pairs", () => {
        const store = new MapStore({ name: "John", age: 30 });
        expect(store.get("name")).to.equal("John");
        expect(store.get("age")).to.equal(30);
        expect(store.size).to.equal(2);
    });

    await t.step("should set values and emit change event", () => {
        const store = new MapStore<string | number>();
        const s = spy();
        store.on("change", s);

        store.set("name", "John");

        expect(store.get("name")).to.equal("John");
        expect(s.calls.length === 1).to.be.true;
        expect(s.calls[0].args[0]).to.deep.include({
            type: "change",
            key: "name",
            value: "John",
        });
    });

    await t.step("should remove values and emit deletion event", () => {
        const store = new MapStore({ name: "John", age: 30 });
        const s = spy();
        store.on("deletion", s);

        store.remove("name");

        expect(store.has("name")).to.be.false;
        expect(store.size).to.equal(1);
        expect(s.calls.length === 1).to.be.true;
        expect(s.calls[0].args[0]).to.deep.include({
            type: "deletion",
            key: "name",
            value: "John",
        });
    });

    await t.step("should do nothing when removing non-existent key", () => {
        const store = new MapStore({ name: "John" });
        const s = spy();
        store.on("deletion", s);

        store.remove("nonexistent");

        expect(s.calls.length === 0).to.be.true;
        expect(store.size).to.equal(1);
    });

    await t.step("should clear all values and emit clear event", () => {
        const store = new MapStore({ name: "John", age: 30 });
        const s = spy();
        store.on("clear", s);

        store.clear();

        expect(store.size).to.equal(0);
        expect(s.calls.length === 1).to.be.true;
        expect(s.calls[0].args[0]).to.deep.include({
            type: "clear",
        });
    });

    await t.step("should transform values and emit change event", () => {
        const store = new MapStore({ count: 5 });
        const s = spy();
        store.on("change", s);

        store.transform("count", (val) => val + 1);

        expect(store.get("count")).to.equal(6);
        expect(s.calls.length === 2).to.be.true; // Once from set() and once from transform()
    });

    await t.step("should throw error when transforming non-existent key", () => {
        const store = new MapStore<number>();

        expect(() => store.transform("nonexistent", (val) => val + 1))
            .to.throw(/key nonexistent does not exist/);
    });

    await t.step("should check if key exists with has()", () => {
        const store = new MapStore({ name: "John" });

        expect(store.has("name")).to.be.true;
        expect(store.has("age")).to.be.false;
    });

    await t.step("should return entries iterator", () => {
        const store = new MapStore({ name: "John", age: 30 });
        const entries = Array.from(store.entries());

        expect(entries).to.have.length(2);
        expect(entries).to.deep.include(["name", "John"]);
        expect(entries).to.deep.include(["age", 30]);
    });
});
