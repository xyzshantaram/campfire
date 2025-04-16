import cf from 'https://esm.sh/campfire.js@4.0.0-rc17';
import { FrameTemplate } from "./FrameTemplate.js";

const createEditorConfig = () => {
    return Object.fromEntries(
        ['html', 'css', 'javascript', 'output']
            .map(itm => [itm, {
                elt: cf.select({ s: '.cf-editor-' + itm, single: true }),
                mode: itm === 'output' ? null : 'ace/mode/' + itm,
                editor: null
            }])
    );
};

const EditorButton = (key, currentEditor) => cf.nu('button')
    .attr('type', 'button')
    .content(key)
    .attr('data-editor-view', key)
    .on('click', () => currentEditor.update(key))
    .ref();

const edit = (config) => ace.edit(config.elt, {
    wrap: true,
    fontSize: '1rem',
    mode: config.mode,
    theme: 'ace/theme/tomorrow_night_blue'
})

const EditorSwitcher = (configs, currentEditor) => {
    const switcher = cf.nu('div.switcher').ref();

    for (const key in configs) {
        if (key === 'output') continue;
        if (!configs[key].elt) continue;

        const button = EditorButton(key, currentEditor);
        cf.insert(button, { into: switcher });

        configs[key].editor = edit(configs[key]);
    }

    cf.insert(EditorButton('output', currentEditor), { into: switcher });
    return switcher;
};

const OutputFrame = (contents) => cf.nu('iframe.cf-editor-output-iframe')
    .style({ width: '100%', height: '100%', background: 'white' })
    .misc('srcdoc', FrameTemplate(contents()))
    .misc('sandbox', 'allow-modals allow-scripts')
    .ref();

const DemoListItem = (example, setActiveDemo, cache) => {
    const file = (name) => `examples/${example.path}/${name}`;

    return cf.nu('li')
        .on('click', async () => {
            let files = cache.get(example.path);
            if (files) return setActiveDemo(files);

            files = Object.fromEntries(await Promise.all(
                ['index.html', 'style.css', 'main.js'].map(async name => {
                    const res = await fetch(file(name));
                    const text = res.ok ? await res.text() : '';
                    return [name.split('.').at(-1), text];
                })
            ));
            cache.set(example.path, files);
            setActiveDemo(files);
        })
        .html`<a href='javascript:void(0)'>${example.title}</a>`
        .ref();
};

export const editorReady = () => {
    const [examples] = cf.select({ s: '.cf-site-div[data-heading="playground"]' });
    if (!examples) return;

    const configs = createEditorConfig();
    const wrapper = cf.select({ s: '.editor-wrapper', single: true });
    const currentEditor = cf.store({ value: 'html' });
    const cache = new Map();

    const getContent = () => Object.fromEntries(['html', 'css', 'javascript']
        .map(itm => [itm, configs[itm].editor.getValue()]));

    const generateOutput = () => {
        cf.empty(configs.output.elt);
        cf.insert(OutputFrame(getContent), { into: configs.output.elt });
    };

    const defaults = {
        'html': '<!-- This demo has no HTML. -->',
        'js': '/* This demo has no JavaScript. */',
        'css': '/* This demo has no CSS. */'
    }

    const renderDemo = (obj) => {
        ['html', 'javascript', 'css'].forEach(itm => {
            const key = itm === 'javascript' ? 'js' : itm;
            configs[itm].editor.setValue(obj[key] || defaults[key]);
        });

        currentEditor.update('output');
    };

    cf.insert(EditorSwitcher(configs, currentEditor), { into: wrapper });

    // Set up event handlers
    currentEditor.on('update', (event) => {
        const val = event.value;

        // Update visibility
        cf.select({ s: '.editor-wrapper > :not(.switcher)', all: true })
            .forEach(elem => elem.style.display = 'none');
        configs[val].elt.style.display = 'block';
        configs[val].editor?.resize();

        // Update active button
        cf.select({ s: `.switcher>button.active`, single: true })
            ?.classList.remove('active');
        cf.select({ s: `button[data-editor-view="${val}"]`, single: true })
            ?.classList.add('active');

        if (val === 'output') generateOutput();
    }, true);

    const [list] = cf.select({ s: "#playground-demo-list" });
    const [clearBtn] = cf.select({ s: "#cf-editor-clear" });
    const [dlBtn] = cf.select({ s: "#cf-editor-dl" });

    dlBtn.onclick = () => {
        const link = cf.nu('a')
            .attr('download', 'playground.html')
            .attr('href', 'data:text/html;charset=utf-8,' +
                encodeURIComponent(FrameTemplate(getContent())))
            .ref();
        link.click();
    };

    clearBtn.onclick = () => {
        for (const str of ['html', 'javascript', 'css']) {
            configs[str].editor.setValue("");
        }
        generateOutput();
    };

    // Load examples
    fetch('examples/dir.json')
        .then(res => res.json())
        .then(parsed => parsed.examples.forEach(itm => {
            cf.insert(DemoListItem(itm, renderDemo, cache), { into: list });
        }));
};