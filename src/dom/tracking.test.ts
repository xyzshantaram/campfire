import { assert } from "chai";
import { track, tracked, untrack } from "./tracking.ts";
import { CfDom } from "./config.ts";

Deno.test("Element tracking functionality", async (t) => {
    await t.step("should track and retrieve elements by ID", () => {
        const element = CfDom.document!.createElement("div");
        track("test-element", element);

        const retrievedElement = tracked("test-element");
        assert.strictEqual(retrievedElement, element);
    });

    await t.step("should return null for untracked elements", () => {
        const retrievedElement = tracked("non-existent-element");
        assert.isNull(retrievedElement);
    });

    await t.step("should untrack elements", () => {
        const element = CfDom.document!.createElement("div");
        track("element-to-untrack", element);

        // Verify it's tracked
        assert.strictEqual(tracked("element-to-untrack"), element);

        // Untrack and verify it's no longer tracked
        untrack("element-to-untrack");
        assert.isNull(tracked("element-to-untrack"));
    });
});
