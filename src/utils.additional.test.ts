/**
 * Additional tests for utility functions in Campfire.js
 */

import { escape, seq, unescape } from "./utils.ts";
import { expect, setupTests } from "@test-setup";
setupTests();

Deno.test("Additional tests for utility functions", async (t) => {
    await t.step("escape and unescape edge cases", async (t) => {
        await t.step("should handle null or undefined input for escape", () => {
            expect(escape(null as any)).to.equal("");
            expect(escape(undefined as any)).to.equal("");
        });

        await t.step("should handle null or undefined input for unescape", () => {
            expect(unescape(null as any)).to.equal("");
            expect(unescape(undefined as any)).to.equal("");
        });

        await t.step("should handle empty string", () => {
            expect(escape("")).to.equal("");
            expect(unescape("")).to.equal("");
        });
    });

    await t.step("additional seq tests", async (t) => {
        await t.step("should handle 0 length sequences", () => {
            expect(seq(0)).to.deep.equal([]);
            expect(seq(5, 5)).to.deep.equal([]);
        });

        await t.step(
            "should handle step values with direction opposite to range",
            () => {
                // In the implementation, for loop doesn't run when step is in opposite direction
                const result = seq(10, 0, 1);
                expect(result).to.deep.equal([]);
            },
        );

        await t.step("should handle floating point values", () => {
            expect(seq(0, 3, 0.5)).to.deep.equal([0, 0.5, 1, 1.5, 2, 2.5]);
        });

        await t.step("should return correct result for large ranges", () => {
            expect(seq(0, 1000, 250)).to.deep.equal([0, 250, 500, 750]);
        });
    });
});
