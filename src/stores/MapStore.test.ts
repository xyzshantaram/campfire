/**
 * Comprehensive tests for MapStore
 */

import sinon from "sinon";
import { describe, it } from "jsr:@std/testing/bdd";
import { MapStore } from "./MapStore.ts";
import { expect, setupTests } from "@test-setup";

setupTests();

Deno.test("MapStore Tests", (t) => {
    t.step("should initialize with empty map when no input is provided", (t) => {
        const store = new MapStore();
        expect(store.size).to.equal(0);
    });

    t.step("should initialize with provided key-value pairs", (t) => {
        const store = new MapStore({ name: "John", age: 30 });
        expect(store.get("name")).to.equal("John");
        expect(store.get("age")).to.equal(30);
        expect(store.size).to.equal(2);
    });

    t.step("should set values and emit change event", (t) => {
        const store = new MapStore<string | number>();
        const spy = sinon.spy();
        store.on("change", spy);

        store.set("name", "John");

        expect(store.get("name")).to.equal("John");
        expect(spy.calledOnce).to.be.true;
        expect(spy.firstCall.args[0]).to.deep.include({
            type: "change",
            key: "name",
            value: "John",
        });
    });

    t.step("should remove values and emit deletion event", (t) => {
        const store = new MapStore({ name: "John", age: 30 });
        const spy = sinon.spy();
        store.on("deletion", spy);

        store.remove("name");

        expect(store.has("name")).to.be.false;
        expect(store.size).to.equal(1);
        expect(spy.calledOnce).to.be.true;
        expect(spy.firstCall.args[0]).to.deep.include({
            type: "deletion",
            key: "name",
            value: "John",
        });
    });

    t.step("should do nothing when removing non-existent key", (t) => {
        const store = new MapStore({ name: "John" });
        const spy = sinon.spy();
        store.on("deletion", spy);

        store.remove("nonexistent");

        expect(spy.called).to.be.false;
        expect(store.size).to.equal(1);
    });

    t.step("should clear all values and emit clear event", (t) => {
        const store = new MapStore({ name: "John", age: 30 });
        const spy = sinon.spy();
        store.on("clear", spy);

        store.clear();

        expect(store.size).to.equal(0);
        expect(spy.calledOnce).to.be.true;
        expect(spy.firstCall.args[0]).to.deep.include({
            type: "clear",
        });
    });

    t.step("should transform values and emit change event", (t) => {
        const store = new MapStore({ count: 5 });
        const spy = sinon.spy();
        store.on("change", spy);

        store.transform("count", (val) => val + 1);

        expect(store.get("count")).to.equal(6);
        expect(spy.calledTwice).to.be.true; // Once from set() and once from transform()
    });

    t.step("should throw error when transforming non-existent key", (t) => {
        const store = new MapStore<number>();

        expect(() => store.transform("nonexistent", (val) => val + 1))
            .to.throw(/key nonexistent does not exist/);
    });

    t.step("should check if key exists with has()", (t) => {
        const store = new MapStore({ name: "John" });

        expect(store.has("name")).to.be.true;
        expect(store.has("age")).to.be.false;
    });

    t.step("should return entries iterator", (t) => {
        const store = new MapStore({ name: "John", age: 30 });
        const entries = Array.from(store.entries());

        expect(entries).to.have.length(2);
        expect(entries).to.deep.include(["name", "John"]);
        expect(entries).to.deep.include(["age", 30]);
    });
});
