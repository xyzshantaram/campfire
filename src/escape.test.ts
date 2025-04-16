import { escape } from "@/utils.ts";
import { expect } from "@/test.setup.ts";

Deno.test("escape() xss protection", async (t) => {
    await t.step("escapes all core dangerous chars", () => {
        expect(escape(`<>&"'/`)).to.equal("&lt;&gt;&amp;&quot;&#39;/");
    });

    await t.step("escapes single quote, double quote, and keeps legit text", () => {
        expect(escape('test\'s "quotes"')).to.include("&#39;");
        expect(escape('a"b')).to.include("&quot;");
        expect(escape("abc")).to.equal("abc");
    });

    await t.step("escapes script", () => {
        expect(escape("<script>alert('xss')</script>")).to.include("&lt;script&gt;");
    });

    await t.step("escapes inline event handlers", () => {
        expect(escape("onerror=alert(1)")).to.include("onerror=alert(1)");
        expect(escape("<img src=x onerror=alert(1)>")).to.include("&lt;img src=x onerror=alert(1)&gt;");
    });

    await t.step("escapes html comment tags and keeps normal chars", () => {
        expect(escape("<!--XSS-->")).to.include("&lt;!--XSS--&gt;");
        expect(escape("plain text")).to.equal("plain text");
    });

    await t.step("escapes ampersands", () => {
        expect(escape("a & b & c")).to.equal("a &amp; b &amp; c");
    });

    await t.step("handles null/undefined/empty string gracefully", () => {
        expect(escape(null as any)).to.equal("");
        expect(escape(undefined as any)).to.equal("");
        expect(escape("")).to.equal("");
    });

    await t.step("does not double-escape already-escaped", () => {
        const once = escape("<abc>");
        expect(escape(once)).to.equal(once);
    });

    await t.step("escapes everything in a giant attack string", () => {
        const input = `<svg><script>alert("XSS")</script><img src=x onerror=alert('xss')><!-- -->&</svg>`;
        const out = escape(input);
        expect(out).to.match(
            /&lt;svg&gt;.+&lt;script&gt;.+alert.+&lt;\/script&gt;.+&lt;img.+onerror.+\(\'xss\'\).+&lt;!--/,
        );
        expect(out).to.include("&amp;");
    });
});
