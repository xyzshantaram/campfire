import { callbackify, deepishClone, escape, poll, seq, unescape } from "@/utils.ts";
import { expect, setupTests } from "@/test.setup.ts";
import { spy } from "@std/testing/mock";
import { FakeTime } from "@std/testing/time";

setupTests();

Deno.test("escape/unescape", async (t) => {
    await t.step("correct escaping and roundtrips", () => {
        const orig = `<>&"'/"`;
        const esc = escape(orig);
        expect(esc).to.not.equal(orig);
        expect(unescape(esc)).to.equal(orig);
        expect(escape("")).to.equal("");
        expect(unescape("")).to.equal("");
    });

    await t.step("null/undefined input safely returns empty string", () => {
        expect(escape(null as any)).to.equal("");
        expect(unescape(undefined as any)).to.equal("");
    });
});

Deno.test("seq: boundaries and steps", async (t) => {
    await t.step("handles positive/negative/step ranges", () => {
        expect(seq(3)).to.deep.equal([0, 1, 2]);
        expect(seq(1, 4)).to.deep.equal([1, 2, 3]);
        expect(seq(0, 3, 0.5)).to.deep.equal([0, 0.5, 1, 1.5, 2, 2.5]);
        expect(seq(3, 3)).to.deep.equal([]);
        expect(seq(-4, -1)).to.deep.equal([-4, -3, -2]);
    });
});

Deno.test("callbackify", async (t) => {
    await t.step("works for resolve and passes args", () => {
        const pfunc = (a: number, b: number) => Promise.resolve(a + b);
        const callbacked = callbackify(pfunc);
        const cb = (err: any | null, result: number | null) => {
            expect(err).to.be.null;
            expect(result).to.equal(5);
        };
        callbacked(cb, 2, 3);
    });

    await t.step("passes rejection as error", () => {
        const fail = callbackify(() => Promise.reject(new Error("fail")));
        fail((err, result) => {
            expect(err).to.be.instanceOf(Error);
            expect(result).to.be.null;
        });
    });
});

Deno.test("poll", async (t) => {
    await t.step("calls at interval and cancels", () => {
        const fn = spy();
        const time = new FakeTime();
        const cancel = poll(fn, 100);
        time.tick(100);
        expect(fn.calls.length).to.equal(1);
        cancel();
        time.tick(200);
        expect(fn.calls.length).to.equal(1);
        time.restore();
    });

    await t.step("calls immediately when callNow is true", () => {
        const cb2 = spy();
        const cancel = poll(cb2, 50, true);
        expect(cb2.calls.length).to.equal(1);
        cancel();
    });
});

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
        const clone = deepishClone(obj);
        expect(clone).not.to.equal(obj);
        expect(clone.me).to.equal(clone);
    });
});
