const count = cf.store({ value: 0 });

const btn = cf.nu("button#id.some-class.other-class")
    .deps({ count })
    .render(({ count }) => count === 0 ? "I have not been clicked." :
        `I have been clicked ${count} times.`)
    .attr('data-some-attribute', 42)
    .on('click', () => count.update(count.value + 1))
    .styles({
        // Uses property names as specified in CSSStyleDeclaration.
        background: "#007cdf",
        color: "#f5f4f0",
        fontWeight: "bold",
        cursor: "pointer",
        border: "2px solid white",
    })
    .misc('type', 'button')
    .done()

cf.insert(btn, { into: document.body });