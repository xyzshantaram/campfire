import { describe, it } from "jsr:@std/testing/bdd";
import { assert } from "chai";
import { track, tracked, untrack } from "./tracking.ts";
import { CfDom } from "./config.ts";

Deno.test("Element tracking functionality", (t) => {
    t.step("should track and retrieve elements by ID", (t) => {
        const element = CfDom.document!.createElement("div");
        track("test-element", element);

        const retrievedElement = tracked("test-element");
        assert.strictEqual(retrievedElement, element);
    });

    t.step("should return null for untracked elements", (t) => {
        const retrievedElement = tracked("non-existent-element");
        assert.isNull(retrievedElement);
    });

    t.step("should untrack elements", (t) => {
        const element = CfDom.document!.createElement("div");
        track("element-to-untrack", element);

        // Verify it's tracked
        assert.strictEqual(tracked("element-to-untrack"), element);

        // Untrack and verify it's no longer tracked
        untrack("element-to-untrack");
        assert.isNull(tracked("element-to-untrack"));
    });
});
