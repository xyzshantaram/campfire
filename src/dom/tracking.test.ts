import { describe, it } from "mocha";
import { assert } from "chai";
import { track, untrack, tracked } from "./tracking.ts";
import { CfDom } from "./config.ts";

describe("Element tracking functionality", () => {
  it("should track and retrieve elements by ID", () => {
    const element = CfDom.document!.createElement("div");
    track("test-element", element);
    
    const retrievedElement = tracked("test-element");
    assert.strictEqual(retrievedElement, element);
  });

  it("should return null for untracked elements", () => {
    const retrievedElement = tracked("non-existent-element");
    assert.isNull(retrievedElement);
  });

  it("should untrack elements", () => {
    const element = CfDom.document!.createElement("div");
    track("element-to-untrack", element);
    
    // Verify it's tracked
    assert.strictEqual(tracked("element-to-untrack"), element);
    
    // Untrack and verify it's no longer tracked
    untrack("element-to-untrack");
    assert.isNull(tracked("element-to-untrack"));
  });
});