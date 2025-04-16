/**
 * Tests for async utility functions in Campfire.js
 */

import { afterEach, beforeEach } from "jsr:@std/testing/bdd";
import { callbackify, poll } from "./utils.ts";
import sinon from "sinon";
import { expect, setupTests } from "@test-setup";

setupTests();

Deno.test("callbackify", (t) => {
    t.step(
        "should convert a Promise-returning function to a callback-style function",
        () => {
            // Setup a function that returns a promise
            const asyncFn = (x: number, y: number) => Promise.resolve(x + y);

            // Convert to callback style
            const cb = callbackify(asyncFn);

            // Use with a callback
            cb(
                (err, result) => {
                    expect(err).to.be.null;
                    expect(result).to.equal(5);
                },
                2,
                3,
            );
        },
    );

    t.step("should pass errors to the callback", () => {
        // Setup a function that returns a rejected promise
        const msg = "Test error";
        const failingFn = () => {
            return Promise.reject(new Error(msg));
        };

        // Convert to callback style
        const cb = callbackify(failingFn);

        // Use with a callback
        cb((err, result) => {
            expect(err).to.be.instanceOf(Error);
            expect(err!.message).to.equal(msg);
            expect(result).to.be.null;
        });
    });

    t.step("should pass all arguments to the original function", () => {
        // Setup a function that returns each argument
        const check = (...args: any[]) => Promise.resolve(args);

        // Convert to callback style
        const cb = callbackify(check);

        // Call with multiple arguments
        cb(
            (err, result) => {
                expect(err).to.be.null;
                expect(result).to.deep.equal([1, "two", true, { four: 4 }]);
            },
            1,
            "two",
            true,
            { four: 4 },
        );
    });

    t.step("should work with zero arguments", () => {
        const noArgs = () => Promise.resolve("success");
        const cb = callbackify(noArgs);

        cb((err, result) => {
            expect(err).to.be.null;
            expect(result).to.equal("success");
        });
    });
});

Deno.test("poll", (t) => {
    let clock: sinon.SinonFakeTimers;

    beforeEach(() => {
        // Setup fake timer
        clock = sinon.useFakeTimers();
    });

    afterEach(() => {
        // Restore original timer
        clock.restore();
    });

    t.step("should call the function at specified intervals", () => {
        const callback = sinon.spy();

        // Start polling every 100ms
        poll(callback, 100);

        // Function should not be called immediately by default
        expect(callback.callCount).to.equal(0);

        // Advance time by 100ms
        clock.tick(100);
        expect(callback.callCount).to.equal(1);

        // Advance time by another 200ms (2 more calls)
        clock.tick(200);
        expect(callback.callCount).to.equal(3);
    });

    t.step("should call the function immediately when callNow is true", () => {
        const callback = sinon.spy();

        // Start polling with immediate execution
        poll(callback, 100, true);

        // Function should be called immediately
        expect(callback.callCount).to.equal(1);

        // Advance time by 100ms
        clock.tick(100);
        expect(callback.callCount).to.equal(2);
    });

    t.step("should stop polling when the cancel function is called", () => {
        const callback = sinon.spy();

        // Start polling and get cancel function
        const cancel = poll(callback, 100);

        // Advance time by 200ms (2 calls)
        clock.tick(200);
        expect(callback.callCount).to.equal(2);

        // Cancel the polling
        cancel();

        // Advance time by 300ms
        clock.tick(300);

        // No more calls should occur
        expect(callback.callCount).to.equal(2);
    });

    t.step(
        "should continue polling even if the callback throws an error",
        () => {
            const errorCallback = sinon.stub();
            errorCallback.onFirstCall().returns(undefined);
            errorCallback.onSecondCall().throws(new Error("Test error"));
            errorCallback.onThirdCall().returns(undefined);

            // We need to catch the error that will be thrown when we advance the clock
            const originalSetTimeout = globalThis.setTimeout;
            sinon.stub(globalThis, "setTimeout").callsFake(
                (
                    callback: (...args: any[]) => void,
                    delay: number | undefined,
                    ...args: any[]
                ) => {
                    if (typeof callback === "function") {
                        return originalSetTimeout(() => {
                            try {
                                callback(...args);
                            } catch (_) {
                                // Ignore the error - this is what we want to test
                            }
                        }, delay);
                    }
                    return originalSetTimeout(callback as any, delay);
                },
            );

            try {
                // Start polling
                poll(errorCallback, 100);

                // Advance time for 3 intervals
                clock.tick(100); // 1st call succeeds
                expect(errorCallback.callCount).to.equal(1);

                clock.tick(100); // 2nd call throws, but polling continues
                expect(errorCallback.callCount).to.equal(2);

                clock.tick(100); // 3rd call succeeds
                expect(errorCallback.callCount).to.equal(3);
            } finally {
                // @ts-ignore this is fine
                (globalThis.setTimeout as sinon.SinonStub).restore();
            }
        },
    );

    t.step("should clean up timeout when cancelled", () => {
        const clearTimeoutSpy = sinon.spy(globalThis, "clearTimeout");
        const callback = sinon.stub();

        try {
            // Start polling and cancel
            const cancel = poll(callback, 100);
            cancel();

            // Should have called clearTimeout
            expect(clearTimeoutSpy.called).to.be.true;
        } finally {
            clearTimeoutSpy.restore();
        }
    });
});
