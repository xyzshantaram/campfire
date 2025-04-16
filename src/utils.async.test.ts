/**
 * Tests for async utility functions in Campfire.js
 */
import { callbackify, poll } from "./utils.ts";
import { expect, setupTests } from "@test-setup";
import { FakeTime } from "@std/testing/time";
import { spy } from "@std/testing/mock";

setupTests();

Deno.test("callbackify", async (t) => {
    await t.step(
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

    await t.step("should pass errors to the callback", () => {
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

    await t.step("should pass all arguments to the original function", () => {
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

    await t.step("should work with zero arguments", () => {
        const noArgs = () => Promise.resolve("success");
        const cb = callbackify(noArgs);

        cb((err, result) => {
            expect(err).to.be.null;
            expect(result).to.equal("success");
        });
    });
});

Deno.test("poll", async (t) => {
    await t.step("should call the function at specified intervals", () => {
        const callback = spy();
        const time = new FakeTime();

        // Start polling every 100ms
        poll(callback, 100);

        // Function should not be called immediately by default
        expect(callback.calls.length).to.equal(0);

        // Advance time by 100ms
        time.tick(100);
        expect(callback.calls.length).to.equal(1);

        // Advance time by another 200ms (2 more calls)
        time.tick(200);
        expect(callback.calls.length).to.equal(3);
        time.restore();
    });

    await t.step("should call the function immediately when callNow is true", () => {
        const callback = spy();
        const time = new FakeTime();
        // Start polling with immediate execution
        poll(callback, 100, true);

        // Function should be called immediately
        expect(callback.calls.length).to.equal(1);

        // Advance time by 100ms
        time.tick(100);
        expect(callback.calls.length).to.equal(2);
    });
});
