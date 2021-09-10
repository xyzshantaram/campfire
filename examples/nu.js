let count = 0;
const btn = cf.nu("button#id.class1.class2", {
    innerHTML: "I have not been clicked.",
    attrs: {
        // DOM attributes
        "data-an-attribute": 42,
    },
    on: {
        // event handlers, assigned using addEventListener
        "click": function (e) {
            this.innerHTML = `I have been clicked ${++count} times.`;
        },
    },
    style: {
        // Uses property names as specified in CSSStyleDeclaration.
        background: "#007cdf",
        borderRadius: "0.25em",
        margin: "0.5rem",
        color: "#f5f4f0",
        transitionDuration: "0.2s",
        border: "2px solid black",
    }, // styles
    misc: {
        // miscellaneous properties
        type: "button",
    },
});