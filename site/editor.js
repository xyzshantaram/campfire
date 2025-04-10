import * as cf from 'https://esm.sh/campfire.js@4.0.0-rc8';
import toml from 'https://esm.sh/toml@3.0.0';

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
    {{ html }}
    <script type='module'>
        import cf from 'https://esm.sh/campfire.js@4.0.0-rc8';
        window.onload = function() {
            {{ js }}
        }
    </script>
</body>
</html>`, false);

export const editorReady = () => {
    const [examples] = cf.select({ s: '.cf-site-div[data-heading="playground"]' });
    if (!examples) return;

    const editorConfigs = Object.fromEntries(
        ['html', 'css', 'js', 'output']
            .map(itm => [itm, {
                elt: cf.select({ s: '.cf-editor-' + itm, single: true }),
                mode: itm === 'output' ? null : 'ace/mode/' + item,
                editor: null
            }]));

    const wrapper = examples.querySelector('.editor-wrapper');
    const [switcher] = cf.nu('div.switcher').done();

    cf.insert(switcher, { into: wrapper });

    const currentEditorStore = cf.store({ value: 'html' });

    for (const key in editorConfigs) {
        if (key === 'out') continue;
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
            js: editorConfigs.js.editor.getValue().trim()
        });
    }

    const [outputButton] = cf.nu('button')
        .attr('type', 'button')
        .content('output')
        .attr('data-editor-view', 'out')
        .on('click', () => currentEditorStore.update('out'))
        .done();

    cf.insert(outputButton, { into: switcher });

    function generateOutput() {
        cf.empty(editorConfigs.out.elt);
        const [frame] = cf.nu('iframe.cf-editor-output-iframe')
            .style({ width: '100%', height: '100%', background: 'white' })
            .misc('srcdoc', getIframeContents())
            .misc('sandbox', 'allow-modals allow-scripts')
            .done();
        cf.insert(frame, { into: editorConfigs.out.elt });
    }

    currentEditorStore.on('change', (event) => {
        const val = event.value;
        Array.from(document.querySelectorAll('.editor-wrapper > :not(.switcher)')).forEach(elem => elem.style.display = 'none');
        editorConfigs[val].elt.style.display = 'block';
        editorConfigs[val].editor?.resize();
        document.querySelector(`.switcher>button.active`)?.classList.remove('active');
        document.querySelector(`button[data-editor-view="${val}"]`)?.classList.add('active');
        if (val === 'out') {
            generateOutput();
        }
    }, true);

    const setActivePlaygroundDemo = (obj) => {
        obj.html = obj.html || "<!-- This demo has no HTML! -->";
        obj.css = obj.css || "/* This demo has no CSS! */";
        obj.js = obj.js || "/* This demo has no JS! */";

        for (const str of ['html', 'js', 'css']) {
            editorConfigs[str].editor.setValue(obj[str]);
        }
    }

    const list = document.querySelector("#playground-demo-list");

    fetch("site/data/examples.toml").then(res => res.text()).then(text => {
        const data = toml.parse(text);
        for (const key of Object.keys(data)) {
            const itm = data[key];
            const [item] = cf.nu('li')
                .content(`<a href='javascript:void(0)'>${itm.title}</a>`)
                .on('click', _ => {
                    setActivePlaygroundDemo(itm);
                    currentEditorStore.update('out');
                })
                .raw(true)
                .done();
            cf.insert(item, { into: list });
        }
    }).catch(err => {
        list.appendChild(document.createTextNode(`Error loading demos: ${err}. The playground should still work, sorry for the inconvenience!`));
    });

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
        for (const str of ['html', 'js', 'css']) {
            editorConfigs[str].editor.setValue("");
        }
        generateOutput();
    }
}