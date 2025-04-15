const value = cf.store({ value: 0 }); // initial value

const [result] = cf.nu() // defaults to div
    .deps({ value })
    .render(({ value }) => {
        switch (Number(value)) {
            case 54:
                return "The correct answer.";
            case 42:
                return "Ah, I see you're a man of culture as well.";
            default:
                return `Hmm. ${value} isn't quite right.`;
        }
    })
    .done();

const [last] = cf.nu('#last')
    .deps({ value })
    .render(({ value }) => `Current value: ${value}`)
    .done();

const [container] = cf.select({ s: '#container' });
cf.insert([last, result], { into: container });

const [input] = cf.nu('input')
    .misc('type', 'text')
    .misc('placeholder', 'What is six by nine?')
    .done();

const [btn] = cf.nu('button')
    .misc('type', 'button')
    .content("Answer")
    .on('click', () => {
        const val = input.value.trim();
        if (val) value.update(val);
        else result.innerHTML = 'Type something first, ya numpty!';
    })
    .done()

cf.insert([input, btn], { before: result });