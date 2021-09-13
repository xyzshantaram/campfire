const result = document.querySelector("#result");
const store = new cf.Store(0); // initial value
const question = store.on("update", (val) => { // this function is called every time the value is changed
    if (val == 54) {
        result.textContent = "The correct answer.";
    }
    else if (val == 42) {
        result.textContent = 'Ah, I see you\'re a man of culture as well.';
    } else {
        result.textContent = "Hmm. Try again.";
    }
}, false);
/* The last argument specifies whether or not the callback should be called right now with the current value of the store. */

const input = cf.nu("input", {
    m: { type: 'text', placeholder: 'What is six by nine?' },
})
document.body.prepend(input,
    cf.nu("button", {
        m: { type: 'button' },
        i: 'Answer',
        on: {
            'click': function (e) {
                const val = input.value.trim();
                if (val) store.update(val);
                else result.innerHTML = 'Type something first, ya numpty!';
            }
        }
    }))