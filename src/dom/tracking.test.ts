import { track, tracked, untrack } from "./tracking.ts";
import { CfDom } from "./config.ts";
import { assert } from "chai";
import { setupTests } from "@test-setup";

setupTests();

Deno.test("track/tracked/untrack: add, get, remove", async (t) => {
    await t.step("track and retrieve", () => {
        const el = CfDom.document!.createElement("div");
        track("xyz", el);
        assert.strictEqual(tracked("xyz"), el);
    });
    await t.step("untrack removes", () => {
        untrack("xyz");
        assert.isNull(tracked("xyz"));
    });
});
