import cf from 'https://esm.sh/campfire.js@2.2.0';
import toml from 'https://esm.sh/toml';

const iframeContentTemplate = cf.template(`\
<html>
<head>
    <title>Campfire Playground</title>
    <style>
        {{ css }}
    </style>
</head>
<body>
    {{ html }}
    <script type='module'>
        import cf from 'https://esm.sh/campfire.js@2.2.0';
        window.onload = function() {
            {{ js }}
        }
    </script>
</body>
</html>\
`, false);

const editorReady = () => {
    const examples = document.querySelector('.cf-site-div[data-heading="playground"]');
    if (!examples) return;

    const editorConfigs = {
        html: {
            elt: document.querySelector('.cf-editor-html'),
            mode: 'ace/mode/html',
            editor: null
        },
        css: {
            elt: document.querySelector('.cf-editor-css'),
            mode: 'ace/mode/css',
            editor: null
        },
        js: {
            elt: document.querySelector('.cf-editor-js'),
            mode: 'ace/mode/javascript',
            editor: null
        },
        out: {
            elt: document.querySelector('.cf-editor-output')
        }
    }

    const wrapper = examples.querySelector('.editor-wrapper');
    const switcher = cf.nu('div.switcher');

    wrapper.append(switcher);

    const currentEditorStore = new cf.Store('html');

    for (const key in editorConfigs) {
        if (key === 'out') continue;
        const current = editorConfigs[key];
        if (!current.elt) continue;
        switcher.appendChild(cf.nu('button', {
            m: { type: 'button' },
            c: key,
            a: {
                'data-editor-view': key
            },
            on: {
                'click': () => {
                    currentEditorStore.update(key);
                }
            }
        }))
        current.editor = ace.edit(current.elt, {
            mode: current.mode,
            theme: 'ace/theme/tomorrow_night_blue',
            fontSize: '1rem',
            copyWithEmptySelection: 'true',
        });
    }

    function getIframeContents() {
        return iframeContentTemplate({
            html: editorConfigs.html.editor.getValue().trim(),
            css: editorConfigs.css.editor.getValue().trim(),
            js: editorConfigs.js.editor.getValue().trim()
        });
    }

    switcher.appendChild(cf.nu('button', {
        m: { type: 'button' },
        c: 'output',
        a: {
            'data-editor-view': 'out'
        },
        on: {
            'click': () => {
                currentEditorStore.update('out');
            }
        }
    }))

    function generateOutput() {
        const iframeContents = getIframeContents();
        editorConfigs.out.elt.innerHTML = ''
        const frame = cf.nu('iframe.cf-editor-output-iframe', {
            style: { width: '100%', height: '100%', background: 'white' },
            m: {
                srcdoc: iframeContents,
                sandbox: 'allow-modals allow-scripts'
            }
        })
        editorConfigs.out.elt.appendChild(frame);
    }

    currentEditorStore.on('update', (val) => {
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
        for (let key of Object.keys(data)) {
            const itm = data[key];
            list.appendChild(cf.nu('li', {
                c: `<a href='javascript:void(0)'>${itm.title}</a>`,
                on: {
                    'click': function (e) {
                        setActivePlaygroundDemo(itm);
                        currentEditorStore.update('out');
                    }
                },
                raw: true
            }));
        }
    }).catch(err => {
        list.appendChild(document.createTextNode(`Error loading demos: ${err}. The playground should still work, sorry for the inconvenience!`));
    })

    const clearBtn = document.querySelector("#cf-editor-clear");
    const dlBtn = document.querySelector("#cf-editor-dl");

    dlBtn.onclick = (e) => {
        cf.nu('a', {
            attrs: {
                download: 'playground.html',
                href: 'data:text/html;charset=utf-8,' + encodeURIComponent(getIframeContents())
            }
        }).click();
    }

    clearBtn.onclick = (e) => {
        for (const str of ['html', 'js', 'css']) {
            editorConfigs[str].editor.setValue("");
        }
        generateOutput();
    }
}

window.editorReady = editorReady;