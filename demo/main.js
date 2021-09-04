import cf from '../dist/campfire.min.js';
window.cf = cf; // for playing around with it in the console

window.addEventListener("DOMContentLoaded", function() {
    const items = new cf.ListStore([]);

    const root = cf.nu("#app", {
        innerHTML: '<h1>Todo App</h1>',
        style: { fontFamily: 'sans-serif' }
    })

    document.body.appendChild(root);

    const field = cf.nu("input", {
        style: { minWidth: '25%' },
        misc: { type: 'text' },
    });

    const button = cf.nu("button", {
        style: { minWidth: '5%' },
        misc: { type: 'button' },
        on: {
            'click': function(e) {
                const value = field.value.trim();
                if (value) items.push({ done: false, name: value })
            }
        },
        innerHTML: 'Add'
    });

    const list = cf.nu("ul#items", {
        style: {
            display: 'flex',
            flexDirection: 'column',
            minWidth: '30%'
        }
    })

    root.append(field, button, list);

    function createTodo(val, idx) {
        const elt = cf.nu("li.todo-item", {
            innerHTML: val.name,
            style: { cursor: 'pointer' },
            on: { 'click': function(e) {
                if (e.target !== this) return;
                const cIdx = parseInt(this.getAttribute("data-todo-idx"));
                const current = items.get(cIdx);
                current.done = !current.done;
                items.setAt(cIdx, current);
            }},
            attrs: {
                "data-todo-idx": idx
            },
        })

        elt.appendChild(cf.nu("button", {
            innerHTML: 'remove',
            style: { marginLeft: '0.5rem' },
            on: { 'click': function(e) {
                const idx = parseInt(this.parentNode.getAttribute('data-todo-idx'));
                items.remove(idx);
            }}
        }));

        return elt;
    }

    items.on("set", (val) => {
        val.forEach(createTodo);
    })

    items.on("remove", (val) => {
        list.removeChild(list.querySelector(`.todo-item:nth-child(${val.idx + 1})`));
        const elems = list.getElementsByClassName('todo-item');
        for (let i = val.idx; i < elems.length; i++) elems[i].setAttribute("data-todo-idx", i);
    })

    items.on("push", (val) => {
        list.appendChild(createTodo(val.value, val.idx));
    })

    items.on("mutation", (val) => {
        list.querySelector(`.todo-item:nth-child(${val.idx + 1})`).style.textDecoration = val.value.done ? 'line-through' : 'initial';
    })
})