/**
 * Tests for additional utility functions in utils.ts
 */

import { callbackify, escape, poll, seq, unescape } from "./utils.ts";
import { expect, setupTests } from "@test-setup";
import { spy } from "@std/testing/mock";
import { FakeTime } from "@std/testing/time";

setupTests();

Deno.test("tests for escape() and unescape()", async (t) => {
    let escaped = "&amp;&lt;&gt;&quot;&#39;/";
    let unescaped = "&<>\"'/";

    escaped += escaped;
    unescaped += unescaped;

    await t.step("should escape values", () => {
        expect(escape(unescaped)).to.equal(escaped);
    });

    await t.step("should handle strings with nothing to escape", () => {
        expect(escape("abc")).to.equal("abc");
    });

    await t.step("should escape the same characters unescaped by `unescape`", () => {
        expect(escape(unescape(escaped))).to.equal(escaped);
    });

    await t.step("should unescape entities in order", () => {
        expect(unescape("&amp;lt;")).to.equal("&lt;");
    });

    await t.step("should unescape the proper entities", () => {
        expect(unescape(escaped)).to.equal(unescaped);
    });

    await t.step("should handle strings with nothing to unescape", () => {
        expect(unescape("abc")).to.equal("abc");
    });

    await t.step("should unescape the same characters escaped by `escape`", () => {
        expect(unescape(escape(unescaped))).to.equal(unescaped);
    });

    await t.step("should handle leading zeros in html entities", () => {
        expect(unescape("&#39;")).to.equal("'");
        expect(unescape("&#039;")).to.equal("'");
        expect(unescape("&#000039;")).to.equal("'");
    });
});

Deno.test("tests for seq", async (t) => {
    await t.step("should use args[0] as stop if only one param provided", () => {
        expect(seq(3)).to.deep.equal([0, 1, 2]);
    });

    await t.step("should work for ranges", () => {
        expect(seq(1, 4)).to.deep.equal([1, 2, 3]);
    });

    await t.step("should return empty list if start is negative", () => {
        expect(seq(-1)).to.deep.equal([]);
    });

    await t.step("should work for negative ranges", () => {
        expect(seq(-4, -1)).to.deep.equal([-4, -3, -2]);
    });

    await t.step("should work for ranges with a step", () => {
        expect(seq(0, 7, 2)).to.deep.equal([0, 2, 4, 6]);
    });

    await t.step("should work for negative ranges with a step", () => {
        expect(seq(-8, -4, 2)).to.deep.equal([-8, -6]);
    });
});

Deno.test("callbackify", async (t) => {
    await t.step(
        "should convert a Promise-returning function to a callback-style function",
        () => {
            const promiseFn = (value: number) => Promise.resolve(value * 2);
            const callbackFn = callbackify(promiseFn);

            callbackFn((err: Error | null, result: number | null) => {
                expect(err).to.be.null;
                expect(result).to.equal(6);
            }, 3);
        },
    );

    await t.step("should pass errors to the callback", () => {
        const error = new Error("Test error");
        const promiseFn = () => Promise.reject(error);
        const callbackFn = callbackify(promiseFn);

        callbackFn((err: Error | null, result: null) => {
            expect(err).to.equal(error);
            expect(result).to.be.null;
        });
    });

    await t.step("should pass all arguments to the original function", () => {
        const promiseFn = (a: number, b: number, c: number) => Promise.resolve(a + b + c);
        const callbackFn = callbackify(promiseFn);

        callbackFn(
            (err: Error | null, result: number | null) => {
                expect(err).to.be.null;
                expect(result).to.equal(6);
            },
            1,
            2,
            3,
        );
    });

    await t.step("should work with zero arguments", () => {
        const promiseFn = () => Promise.resolve("test result");
        const callbackFn = callbackify(promiseFn);

        callbackFn((err: Error | null, result: string | null) => {
            expect(err).to.be.null;
            expect(result).to.equal("test result");
        });
    });
});

Deno.test("poll", async (t) => {

    await t.step("should call the function at specified intervals", () => {
        const time = new FakeTime();
        const fn = spy();
        poll(fn, 100, false);

        expect(fn.calls.length).to.equal(0);

        time.tick(100);
        expect(fn.calls.length).to.equal(1);

        time.tick(100);
        expect(fn.calls.length).to.equal(2);

        time.tick(200);
        expect(fn.calls.length).to.equal(4);
        time.restore();
    });

    await t.step("should call the function immediately when callNow is true", () => {
        const time = new FakeTime();
        const fn = spy();
        poll(fn, 100, true);

        expect(fn.calls.length).to.equal(1);

        time.tick(100);
        expect(fn.calls.length).to.equal(2);
        time.restore();
    });

    await t.step("should stop polling when the cancel function is called", () => {
        const time = new FakeTime();
        const fn = spy();
        const cancel = poll(fn, 100);

        time.tick(100);
        expect(fn.calls.length).to.equal(1);

        cancel();

        time.tick(200);
        expect(fn.calls.length).to.equal(1); // Should still be 1 as we cancelled
        time.restore();
    });

    await t.step("should poll repeatedly", () => {
        const time = new FakeTime();
        const fn = spy();
        const cancel = poll(fn, 100);

        // Should not have been called yet
        expect(fn.calls.length).to.equal(0);

        // After time advances, should be called
        time.tick(100);
        expect(fn.calls.length).to.equal(1);

        // After more time, should be called again
        time.tick(100);
        expect(fn.calls.length).to.equal(2);

        // Clean up
        cancel();
        time.restore();
    });

    await t.step("should clean up timeout when cancelled", () => {
        const time = new FakeTime();
        const fn = spy();
        const cancel = poll(fn, 100);

        cancel();
        time.tick(200);
        expect(fn.calls.length).to.equal(0);
        time.restore();
    });
});
