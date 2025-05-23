import cf from "https://esm.sh/jsr/@campfire/core@4";
import { FrameTemplate } from "./FrameTemplate.js";
import * as CodeCake from "https://unpkg.com/codecake@0.5.0/codecake.js";
import { highlight } from "https://esm.sh/jsr/@xyzshantaram/macrolight@1.7.0";
import js from "https://esm.sh/jsr/@xyzshantaram/macrolight@1.7.0/langs/javascript";
import css from "https://esm.sh/jsr/@xyzshantaram/macrolight@1.7.0/langs/sass";
import html from "https://esm.sh/jsr/@xyzshantaram/macrolight@1.7.0/langs/xhtml";

export const highlightStyles = {
    unformatted: "color: white;",
    keyword: "color: #ff9a00; font-weight: bold;",
    punctuation: "color: #7f7f7f;",
    string: "color: #3cb371;",
    comment: "color: #7f7f7f; font-style: italic;",
}

const keywords = {
    js, css, html
}

const highlighter = (text, lang) => {
    return highlight(text, {
        keywords: keywords[lang],
        styles: highlightStyles
    })
}

const ccConfig = (language) => ({
    language,
    className: "codecake-dark",
    highlight: highlighter
})

const setupEditor = ({ elt, mode }) => {
    console.log(elt, mode)
    const editor = CodeCake.create(elt, ccConfig(mode));
    return editor;
};

const EDITABLE = ['html', 'css', 'js'];
const VISIBLE = [...EDITABLE, "output"];

const createEditorConfig = (overlay) => {
    return Object.fromEntries(
        [...EDITABLE, "output", "loading"].map((itm) => {
            let elt = itm === 'loading' ? overlay : null;
            let mode = null;

            if (VISIBLE.includes(itm)) {
                mode = itm;
                elt = cf.select({ s: ".cf-editor-" + itm, single: true });
            }

            return [itm, { elt, mode, editor: null }];
        }),
    );
};

const EditorButton = (key, currentEditor) =>
    cf.nu("button")
        .attr("type", "button")
        .content(key)
        .attr("data-editor-view", key)
        .on("click", () => currentEditor.update(key))
        .track(`editor-btn-${key}`)
        .ref();

const EditorSwitcher = (configs, state) => {
    const slots = VISIBLE
        .map(item => cf.html`<cf-slot name=${item}></cf-slot>`)
        .join('');

    const buttons = {
        ...Object.fromEntries(EDITABLE.map(key => {
            configs[key].editor = setupEditor(configs[key]);
            return [key, EditorButton(key, state)];
        })),
        output: EditorButton('output', state)
    };

    const switcher = cf.nu('div.switcher').html(slots).children(buttons).ref();
    return [switcher, buttons];
}

const OutputFrame = (contents) =>
    cf.nu("iframe.cf-editor-output-iframe")
        .style({ width: "100%", height: "100%", background: "white" })
        .misc("srcdoc", FrameTemplate(contents()))
        .misc("sandbox", "allow-modals allow-scripts")
        .ref();

const DemoListItem = ({ example, setDemo, cache, current }) => {
    const file = (name) => `examples/${example.path}/${name}`;

    const getFiles = async () => Object.fromEntries(await Promise.all(
        ["index.html", "style.css", "main.js"].map(async (name) => {
            const res = await fetch(file(name));
            const text = res.ok ? await res.text() : "";
            return [name.split(".").at(-1), text];
        }),
    ));

    return cf.nu("li")
        .on("click", async () => {
            let files = cache.get(example.path);
            if (files) return setDemo(files);
            current.update('loading');
            files = await getFiles();
            cache.set(example.path, files);
            setDemo(files);
        })
        .html`<a href='javascript:void(0)'>${example.title}</a>`
        .ref();
};

const Overlay = () => cf.nu("div.cf-editor-loading-overlay")
    .styles({
        display: "none",
        zIndex: "1000",
        inset: "0",
        background: "inherit",
        fontFamily: "inherit",
        color: "#fff",
        fontSize: "2rem",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        pointerEvents: "all"
    })
    .content("Loading…")
    .ref();

export const editorReady = () => {
    const [examples] = cf.select({
        s: '.cf-site-div[data-heading="playground"]',
    });
    if (!examples) return;

    const overlay = Overlay();
    const configs = createEditorConfig(overlay);
    const wrapper = cf.select({ s: ".editor-wrapper", single: true });
    wrapper.style.position = "relative";
    cf.insert(overlay, { into: wrapper, at: 'start' });
    const current = cf.store({ value: "html" });
    const cache = new Map();

    const getContent = () =>
        Object.fromEntries(EDITABLE
            .map((itm) => [itm, configs[itm].editor.getCode()]));

    const generateOutput = () => {
        cf.empty(configs.output.elt);
        cf.insert(OutputFrame(getContent), { into: configs.output.elt });
    };

    const defaults = {
        "html": "<!-- This demo has no HTML. -->",
        "js": "/* This demo has no JavaScript. */",
        "css": "/* This demo has no CSS. */",
    };

    const setDemo = (obj) => {
        VISIBLE.forEach((itm) => {
            const key = itm === "javascript" ? "js" : itm;
            configs[itm].editor?.setCode(obj[key] || defaults[key]);
        });

        current.update("output");
    };

    const [switcher, buttons] = EditorSwitcher(configs, current);
    cf.insert(switcher, { into: wrapper });

    // Set up event handlers
    current.on("update", (event) => {
        const val = event.value;

        Object.entries(configs).forEach(([key, config]) =>
            config.elt.style.display = key === val ? 'block' : 'none');

        if (val === 'loading') return;
        if (val === "output") generateOutput();
        Object.values(buttons).forEach(button => button.classList.remove('active'));
        cf.tracked(`editor-btn-${val}`).classList.add('active');
    }, true);

    const [list] = cf.select({ s: "#playground-demo-list" });
    const [clearBtn] = cf.select({ s: "#cf-editor-clear" });
    const [dlBtn] = cf.select({ s: "#cf-editor-dl" });

    dlBtn.onclick = () => {
        const link = cf.nu("a")
            .attr("download", "playground.html")
            .attr(
                "href",
                "data:text/html;charset=utf-8," +
                encodeURIComponent(FrameTemplate(getContent())),
            )
            .ref();
        link.click();
    };

    clearBtn.onclick = () => {
        for (const str of ["html", "javascript", "css"]) {
            configs[str].editor.setValue("");
        }
        generateOutput();
    };

    // Load examples
    fetch("examples/dir.json")
        .then((res) => res.json())
        .then((parsed) =>
            parsed.examples.forEach((example) => {
                cf.insert(DemoListItem({ example, setDemo, cache, current }),
                    { into: list });
            })
        );
};
