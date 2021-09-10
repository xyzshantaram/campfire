const homework = new cf.ListStore([]); // create a new store

const list = document.body.appendChild(cf.nu("div"));
const getIdx = (elem) => parseInt(elem.getAttribute("data-idx")); // helper function

homework.on("refresh", function () {
    if (homework.length == 0) list.innerHTML = "yay! no items!";
}, false);

homework.on("push", function (val) {
    if (homework.length === 1) list.innerHTML = "";
    list.appendChild(cf.nu("div", {
        innerHTML: val.value,
        attrs: { "data-idx": homework.length - 1 },
        on: { click: (e) => homework.remove(getIdx(e.target)) },
        style: { cursor: "pointer" },
    }));
});

homework.on("remove", function (val) {
    Array.from(list.querySelectorAll(`div:nth-child(n+${val.idx + 1})`)).forEach(
        (elem, i) => {
            elem.setAttribute("data-idx", getIdx(elem) - 1);
        },
    );
    list.removeChild(list.querySelector(`div:nth-child(${val.idx + 1})`));
    homework.refresh();
});

homework.push("English assignment");
homework.push("Math assignment");
homework.push("French assignment");

homework.setAt(1, "Math test");

console.log(
    "Homework:",
    [homework.get(0), homework.get(1), homework.get(2)].join(", "),
);

homework.setAt(3, "test"); // errors out
homework.setAt(-1, "test 2"); // errors out