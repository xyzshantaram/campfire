/**
 * Tests for DOM manipulation utilities in Campfire.js
 */

import sinon from "sinon";
import { extend, insert, nu, rm, seq, store } from "../campfire.ts";
import { CfDom } from "./config.ts";
import { tracked } from "./tracking.ts";
import { expect, setupTests } from "@test-setup";

setupTests();

Deno.test("Tests for nu", (t) => {
    t.step("should create a div when no args are passed", (t) => {
        expect(nu().ref().tagName).to.equal("DIV");
    });

    t.step("the new div must be empty", (t) => {
        expect(nu().ref()).to.be.empty;
    });

    t.step("should parse element string correctly", (t) => {
        const [elt] = nu("button#click-me.btn.cls").done();
        expect(elt).to.have.class("btn");
        expect(elt).to.have.class("cls");
        expect(elt.id).to.equal("click-me");
        expect(elt.tagName).to.equal("BUTTON");
    });
});

Deno.test("Tests for extend", (t) => {
    t.step("should work properly with nu", (t) => {
        const [elt] = nu("#id", {
            style: { textAlign: "center" },
            attrs: { "data-an-attribute": 32 },
        }).done();
        expect(elt.id).to.equal("id");
        expect(elt.tagName).to.equal("DIV");
        expect(elt).to.have.attr("style", "text-align: center;");
        expect(elt).to.have.attr("data-an-attribute", "32");
    });

    t.step("should add styles", (t) => {
        const [elt] = nu().done();
        extend(elt, { style: { margin: 0 } });
        expect(elt).to.have.attr("style", "margin: 0px;");
    });

    t.step("should escape and set contents", (t) => {
        const [elt] = nu().done();
        extend(elt, { contents: "<b> bold </b>" });
        expect(elt.innerHTML).to.equal("&lt;b&gt; bold &lt;/b&gt;");
    });

    t.step("should not escape contents with raw flag", (t) => {
        const [elt] = nu().done();
        extend(elt, { contents: "<b> bold </b>", raw: true });
        expect(elt.innerHTML).to.equal("<b> bold </b>");
    });

    t.step("should return elements passed in gimme param", (t) => {
        const [elt, span] = nu(`div#container`, {
            raw: true,
            contents: `<span class=some-span>42</span>`,
            gimme: ["span.some-span"],
        }).done();
        expect(elt.id).to.equal("container");
        expect(span.tagName).to.equal("SPAN");
        expect(span).to.have.class("some-span");
        expect(span.innerHTML).to.equal("42");
    });
});

Deno.test("Tests for NuBuilder", (t) => {
    t.step("should support fluent method chaining", (t) => {
        const [btn] = nu("button")
            .content("Click me")
            .attr("type", "submit")
            .style("backgroundColor", "blue")
            .style("color", "white")
            .attr("data-test", "test-button")
            .on("click", () => {})
            .done();

        expect(btn.tagName).to.equal("BUTTON");
        expect(btn.innerHTML).to.equal("Click me");
        expect(btn).to.have.attr("type", "submit");
        expect(btn).to.have.attr("data-test", "test-button");
        expect(btn.style.backgroundColor).to.equal("blue");
        expect(btn.style.color).to.equal("white");
    });

    t.step("should support multiple style setting via styles method", (t) => {
        const [div] = nu("div")
            .styles({
                color: "red",
                fontWeight: "bold",
                marginTop: "10px",
            })
            .done();

        expect(div.style.color).to.equal("red");
        expect(div.style.fontWeight).to.equal("bold");
        expect(div.style.marginTop).to.equal("10px");
    });

    t.step("should support multiple attribute setting via attrs method", (t) => {
        const [input] = nu("input")
            .attrs({
                type: "text",
                placeholder: "Enter your name",
                required: "true",
            })
            .done();

        expect(input).to.have.attr("type", "text");
        expect(input).to.have.attr("placeholder", "Enter your name");
        expect(input).to.have.attr("required", "true");
    });

    t.step("should support raw HTML content", (t) => {
        const [div] = nu("div")
            .content("<span>Hello</span>")
            .raw(true)
            .done();

        expect(div.innerHTML).to.equal("<span>Hello</span>");
        expect(div.firstChild?.nodeName).to.equal("SPAN");
    });

    t.step("should support multiple event listeners", (t) => {
        const clickHandler = sinon.spy();
        const mouseoverHandler = sinon.spy();

        const [btn] = nu("button")
            .content("Interactive")
            .on("click", clickHandler)
            .on("mouseover", mouseoverHandler)
            .done();

        btn.click();
        btn.dispatchEvent(new MouseEvent("mouseover"));

        expect(clickHandler.calledOnce).to.be.true;
        expect(mouseoverHandler.calledOnce).to.be.true;
    });

    t.step("should support querying multiple elements with gimme", (t) => {
        const html = `
            <h2 class="title">Hello</h2>
            <p class="content">Paragraph 1</p>
            <p class="content">Paragraph 2</p>
        `;

        const [, title, first, second] = nu("div")
            .content(html)
            .raw(true)
            .gimme(".title", ".content:first-of-type", ".content:last-child")
            .done();

        expect(title.innerHTML).to.equal("Hello");
        expect(first.innerHTML).to.equal("Paragraph 1");
        expect(second.innerHTML).to.equal("Paragraph 2");
    });

    t.step("should handle misc properties", (t) => {
        const [checkbox] = nu("input").done();

        extend(checkbox, {
            misc: { type: "checkbox", checked: true, disabled: false },
        });

        expect(checkbox.type).to.equal("checkbox");
        expect(checkbox.checked).to.be.true;
        expect(checkbox.disabled).to.be.false;
    });

    t.step("Slotted children should be preserved across parent updates", (t) => {
        const greeting = store({ value: "Hello" });
        const to = store({ value: "World" });

        // Create the child element first
        const [child] = nu("span")
            .deps({ to })
            .render(({ to }) => `Child: ${to}`)
            .done();

        // Set raw=true on the parent explicitly to avoid escaping
        const [parent] = nu("div", {
            deps: { greeting },
            render: ({ greeting }, { b }) => b.html`<div>Parent: ${greeting}</div><cf-slot name="to"></cf-slot>`,
            children: { to: child },
        }).done();

        expect(parent.innerHTML).to.equal(
            `<div>Parent: Hello</div><span data-cf-slot="to">Child: World</span>`,
        );

        // Update parent store – child should stay untouched
        greeting.update("Hi");
        expect(parent.innerHTML).to.equal(
            `<div>Parent: Hi</div><span data-cf-slot="to">Child: World</span>`,
        );

        to.update("Universe");
        expect(parent.innerHTML).to.equal(
            `<div>Parent: Hi</div><span data-cf-slot="to">Child: Universe</span>`,
        );
    });

    t.step("should support a single element as a child", (t) => {
        const value = store({ value: "Child Content" });

        // Get a single element
        const [singleChild] = nu("span")
            .deps({ value })
            .render(({ value }) => `${value}`)
            .done();

        // Set raw=true explicitly
        const [parent] = nu("div", {
            render: (_, { b }) => b.html`<div>Parent Content</div>$<cf-slot name="child"></cf-slot>`,
            children: { child: singleChild },
        }).done();

        expect(parent.innerHTML).to.contain(
            '<span data-cf-slot="child">Child Content</span>',
        );

        value.update("New Content");
        expect(parent.innerHTML).to.contain(
            '<span data-cf-slot="child">New Content</span>',
        );
    });

    t.step("should support multiple elements as children", (t) => {
        const items = seq(3).map((n) => nu("li").content(`${n}`).ref());
        const [parent] = nu("ul")
            .html`<cf-slot name="items"></cf-slot>`
            .children({ items })
            .done();

        expect(parent.children.length).to.equal(3);
        expect(
            Array.from(parent.children).every((itm) => itm.getAttribute("data-cf-slot") === "items"),
        ).to.be.true;
    });

    t.step("should track an element with an ID", (t) => {
        // Create an element with tracking
        const [div] = nu("div")
            .content("Tracked element")
            .track("test-tracked-element")
            .done();

        // Verify the element is tracked
        const trackedElement = tracked("test-tracked-element");
        expect(trackedElement).to.equal(div);
    });
});

Deno.test("Tests for insert()", (t) => {
    t.step("should insert a single element", (t) => {
        const [container] = nu().done();
        insert(container, { into: CfDom.document!.body });

        const [element] = nu("p").content("Test paragraph").done();
        const result = insert(element, { into: container });

        expect(container.children.length).to.equal(1);
        expect(container.firstChild).to.equal(element);
        expect(result).to.equal(element);

        rm(container);
    });

    t.step("should insert an array of elements", (t) => {
        const [container] = nu().done();
        insert(container, { into: CfDom.document!.body });

        const paragraphs = seq(3).map((i) => nu("p").content(`Paragraph ${i}`).done()).flat();
        const result = insert(paragraphs, { into: container });

        expect(container.children.length).to.equal(3);
        expect(Array.from(container.children)).to.deep.equal(paragraphs);
        expect(result).to.deep.equal(paragraphs);

        rm(container);
    });

    t.step("should insert a single element before another element", (t) => {
        const [container] = nu().done();
        insert(container, { into: CfDom.document!.body });

        const [existing] = nu("#existing").done();
        insert(existing, { into: container });

        const [created] = nu("span").content("Before").done();

        insert(created, { before: existing });

        expect(container.firstChild).to.equal(created);
        expect(container.children.length).to.equal(2);

        rm(container);
    });

    t.step("should insert a single element after another element", (t) => {
        const [container] = nu().done();
        insert(container, { into: CfDom.document!.body });

        const [existing] = nu("#existing").done();
        insert(existing, { into: container });

        const [created] = nu("span").content("After").done();

        insert(created, { after: existing });

        expect(container.lastChild).to.equal(created);
        expect(container.children.length).to.equal(2);

        rm(container);
    });

    t.step("should insert a single element at the start of a container", (t) => {
        const [container] = nu().done();
        insert(container, { into: CfDom.document!.body });

        const [existing] = nu("#existing").done();
        insert(existing, { into: container });

        const [created] = nu("span").content("Start").done();

        // The correct format for 'into' with 'at' is a single object
        insert(created, { into: container, at: "start" });

        expect(container.firstChild).to.equal(created);
        expect(container.children.length).to.equal(2);

        rm(container);
    });
});
