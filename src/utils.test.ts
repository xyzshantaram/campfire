/**
 * Tests for additional utility functions in utils.ts
 */

import sinon from "sinon";
import { afterEach, beforeEach } from "jsr:@std/testing/bdd";
import { callbackify, escape, poll, seq, unescape } from "./utils.ts";
import { expect, setupTests } from "@test-setup";

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
    let clock: sinon.SinonFakeTimers;

    beforeEach(() => {
        clock = sinon.useFakeTimers();
    });

    afterEach(() => {
        clock.restore();
    });

    await t.step("should call the function at specified intervals", () => {
        const fn = sinon.spy();
        poll(fn, 100, false);

        expect(fn.callCount).to.equal(0);

        clock.tick(100);
        expect(fn.callCount).to.equal(1);

        clock.tick(100);
        expect(fn.callCount).to.equal(2);

        clock.tick(200);
        expect(fn.callCount).to.equal(4);
    });

    await t.step("should call the function immediately when callNow is true", () => {
        const fn = sinon.spy();
        poll(fn, 100, true);

        expect(fn.callCount).to.equal(1);

        clock.tick(100);
        expect(fn.callCount).to.equal(2);
    });

    await t.step("should stop polling when the cancel function is called", () => {
        const fn = sinon.spy();
        const cancel = poll(fn, 100);

        clock.tick(100);
        expect(fn.callCount).to.equal(1);

        cancel();

        clock.tick(200);
        expect(fn.callCount).to.equal(1); // Should still be 1 as we cancelled
    });

    await t.step("should poll repeatedly", () => {
        const fn = sinon.spy();
        const cancel = poll(fn, 100);

        // Should not have been called yet
        expect(fn.callCount).to.equal(0);

        // After time advances, should be called
        clock.tick(100);
        expect(fn.callCount).to.equal(1);

        // After more time, should be called again
        clock.tick(100);
        expect(fn.callCount).to.equal(2);

        // Clean up
        cancel();
    });

    // Error handling test
    await t.step("should handle errors within the callback", () => {
        const errorSpy = sinon.spy();
        const fn = sinon.stub();
        fn.onFirstCall().callsFake(() => {
            errorSpy();
        });

        // No error should propagate out
        poll(fn, 100, true);
        expect(errorSpy.calledOnce).to.be.true;
    });

    await t.step("should clean up timeout when cancelled", () => {
        const fn = sinon.spy();
        const cancel = poll(fn, 100);

        cancel();
        clock.tick(200);
        expect(fn.callCount).to.equal(0);
    });
});
