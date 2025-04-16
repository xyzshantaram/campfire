import { deepishClone } from "@/utils.ts";
import { expect } from "@/test.setup.ts";

Deno.test("deepishClone edge cases", async (t) => {
    await t.step("falls back for Map/Set/Date/RegExp and returns the reference", () => {
        const m = new Map();
        expect(deepishClone(m)).to.equal(m);
        const s = new Set();
        expect(deepishClone(s)).to.equal(s);
        const d = new Date();
        expect(deepishClone(d)).to.equal(d);
        const r = /x/;
        expect(deepishClone(r)).to.equal(r);
    });
    await t.step("cycles fallback to original", () => {
        const obj: any = {};
        obj.me = obj;
        expect(deepishClone(obj).me).to.equal(obj);
    });
});
