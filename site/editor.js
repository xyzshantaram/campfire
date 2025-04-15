import * as cf from 'http://localhost:5500/dist/campfire.js';

const iframeContentTemplate = cf.template(cf.html`\
<html>
<head>
    <title>Campfire Playground</title>
    <style>
        body {
            color: white;
            line-height: 1.6;
        }

        input {
            border-top: none;
            border-left: none;
            border-right: none;
            border-bottom: 2px solid white;
        }

        button, input {
            padding: 0.2rem;
            font-size: inherit;
            color: inherit;
            background-color: transparent;
            min-width: 10ch;
            margin-top: 0.4rem;
            margin-bottom: 0.4rem;
        }

        button {
            margin-left: 0.4rem;
            border-radius: 0.2rem;
            border: 2px solid #ff9a00;
        }

        input:focus {
            border-bottom-color: #ff9a00;
        }
        {{ css }}
    </style>
</head>
<body>
    {{{ html }}}
    <script type='module'>
        import cf from 'http://localhost:5500/dist/campfire.js';
        window.onload = function() {
            {{{ javascript }}}
        }
    </script>
</body>
</html>`, false);

export const editorReady = () => {
    const [examples] = cf.select({ s: '.cf-site-div[data-heading="playground"]' });
    if (!examples) return;

    const editorConfigs = Object.fromEntries(
        ['html', 'css', 'javascript', 'output']
            .map(itm => [itm, {
                elt: cf.select({ s: '.cf-editor-' + itm, single: true }),
                mode: itm === 'output' ? null : 'ace/mode/' + itm,
                editor: null
            }]));

    const wrapper = cf.select({ s: '.editor-wrapper', single: true });
    const [switcher] = cf.nu('div.switcher').done();

    cf.insert(switcher, { into: wrapper });

    const currentEditorStore = cf.store({ value: 'html' });

    for (const key in editorConfigs) {
        if (key === 'output') continue;
        const current = editorConfigs[key];
        if (!current.elt) continue;

        const [button] = cf.nu('button')
            .attr('type', 'button')
            .content(key)
            .attr('data-editor-view', key)
            .on('click', () => {
                currentEditorStore.update(key);
            })
            .done();

        cf.insert(button, { into: switcher });

        // Set up Ace Editor
        current.editor = ace.edit(current.elt, {
            mode: current.mode,
            theme: 'ace/theme/tomorrow_night_blue',
            fontSize: '1rem',
            copyWithEmptySelection: 'true',
            highlightActiveLine: true,
            wrap: true
        });
    }

    function getIframeContents() {
        return iframeContentTemplate({
            html: editorConfigs.html.editor.getValue().trim(),
            css: editorConfigs.css.editor.getValue().trim(),
            javascript: editorConfigs.javascript.editor.getValue().trim()
        });
    }

    const [outputButton] = cf.nu('button')
        .attr('type', 'button')
        .content('output')
        .attr('data-editor-view', 'output')
        .on('click', () => currentEditorStore.update('output'))
        .done();

    cf.insert(outputButton, { into: switcher });

    function generateOutput() {
        cf.empty(editorConfigs.output.elt);
        const [frame] = cf.nu('iframe.cf-editor-output-iframe')
            .style({ width: '100%', height: '100%', background: 'white' })
            .misc('srcdoc', getIframeContents())
            .misc('sandbox', 'allow-modals allow-scripts')
            .done();
        cf.insert(frame, { into: editorConfigs.output.elt });
    }

    currentEditorStore.on('update', (event) => {
        const val = event.value;
        Array.from(document.querySelectorAll('.editor-wrapper > :not(.switcher)'))
            .forEach(elem => elem.style.display = 'none');
        editorConfigs[val].elt.style.display = 'block';
        editorConfigs[val].editor?.resize();
        document.querySelector(`.switcher>button.active`)?.classList.remove('active');
        document.querySelector(`button[data-editor-view="${val}"]`)?.classList.add('active');
        if (val === 'output') {
            generateOutput();
        }
    }, true);

    const setActiveDemo = (obj) => {
        obj.html = obj.html || "<!-- This demo has no HTML! -->";
        obj.css = obj.css || "/* This demo has no CSS! */";
        obj.javascript = obj.javascript || "/* This demo has no JavaScript! */";

        for (const str of ['html', 'javascript', 'css']) {
            editorConfigs[str].editor.setValue(obj[str]);
        }

        currentEditorStore.update('output');
    }

    const list = document.querySelector("#playground-demo-list");


    const clearBtn = document.querySelector("#cf-editor-clear");
    const dlBtn = document.querySelector("#cf-editor-dl");

    dlBtn.onclick = _ => {
        const [link] = cf.nu('a')
            .attr('download', 'playground.html')
            .attr('href', 'data:text/html;charset=utf-8,' + encodeURIComponent(getIframeContents()))
            .done();
        link.click();
    }

    clearBtn.onclick = _ => {
        for (const str of ['html', 'javascript', 'css']) {
            editorConfigs[str].editor.setValue("");
        }
        generateOutput();
    }

    const cached = new Map();

    fetch('examples/dir.json').then(res => res.json()).then(parsed => {
        for (const example of parsed.examples) {
            const file = (name) => `examples/${example.path}/${name}`;
            const [item] = cf.nu('li')
                .html`<a href='javascript:void(0)'>${example.title}</a>`
                .on('click', async _ => {
                    let files = cached.get(example.path);
                    if (!files) files = Object.fromEntries(await Promise.all(
                        ['index.html', 'style.css', 'main.js'].map(async name => {
                            const res = await fetch(file(name));
                            const text = res.ok ? await res.text() : '';
                            return [name.split('.').at(-1), text];
                        })
                    ));

                    cached.set(example.path, files);

                    setActiveDemo({ html: files.html, css: files.css, javascript: files.js })
                })
                .done();
            cf.insert(item, { into: list });
        }
    })
}