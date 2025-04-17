/** @import cf from '@/campfire.ts'; */
const value = cf.store({ value: 0 }); // initial value

const [result] = cf.nu() // defaults to div
    .deps({ value })
    .render(({ value }, { first }) => {
        if (first) return "";
        if (!value) return "Type something first, ya numpty!";
        const n = Number(value);
        if (isNaN(n)) return "Numbers only, please :P";
        switch (n) {
            case 54:
                return "The correct answer.";
            case 42:
                return "Ah, I see you're a man of culture as well.";
            default:
                return `Hmm. ${value} isn't quite right.`;
        }
    })
    .done();

const [last] = cf.nu("#last")
    .deps({ value })
    .render(({ value }, { first, b }) =>
        first ? "What is six by nine?" : b.html`<div>What is six by nine?</div> 
        You answered: ${value}`
    )
    .done();

const [container] = cf.select({ s: "#container" });
cf.insert([last, result], { into: container });

const [input] = cf.nu("input")
    .misc("type", "text")
    .misc("placeholder", "What is six by nine?")
    .done();

const [btn] = cf.nu("button")
    .misc("type", "button")
    .content("Answer")
    .on("click", () => value.update(input.value.trim()))
    .done();

cf.insert([input, btn], { before: result });
