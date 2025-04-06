import cf from 'https://esm.sh/campfire.js@4.0.0-alpha4';
import { highlight } from 'https://esm.sh/macrolight';
import toml from 'https://esm.sh/toml';

import { CodeJar } from 'https://esm.sh/codejar@4.2.0';

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
        import cf from 'https://esm.sh/campfire.js@4.0.0-alpha4';
        window.onload = function() {
            {{ js }}
        }
    </script>
</body>
</html>\
`, false);

const JS_KEYWORDS = ['break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do', 'else', 'export', 'extends', 'finally', 'for', 'function', 'if', 'import', 'in', 'instanceof', 'let', 'new', 'return', 'super', 'switch', 'this', 'throw', 'try', 'typeof', 'var', 'void', 'while', 'with', 'yield'];
const HTML_KEYWORDS = ['<!DOCTYPE', 'html', 'head', 'body', 'title', 'script', 'style', 'meta', 'link'];
const CSS_KEYWORDS = ['@media', '@keyframes', 'animation', 'display', 'position', 'color', 'background', 'margin', 'padding', 'border', 'width', 'height'];

const editorReady = () => {
    const examples = document.querySelector('.cf-site-div[data-heading="playground"]');
    if (!examples) return;

    const editorConfigs = {
        html: {
            elt: document.querySelector('.cf-editor-html'),
            jar: null,
            keywords: HTML_KEYWORDS,
            language: 'html'
        },
        css: {
            elt: document.querySelector('.cf-editor-css'),
            jar: null,
            keywords: CSS_KEYWORDS,
            language: 'css'
        },
        js: {
            elt: document.querySelector('.cf-editor-js'),
            jar: null,
            keywords: JS_KEYWORDS,
            language: 'javascript'
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
        }));

        const config = {
            keywords: current.keywords,
            styles: {
                unformatted: 'color: white;',
                keyword: 'color: #ff9a00; font-weight: bold;',
                punctuation: 'color: #7f7f7f;',
                string: 'color: #3cb371;',
                comment: 'color: #7f7f7f; font-style: italic;'
            }
        };

        current.jar = CodeJar(current.elt, (editor) => {
            editor.innerHTML = highlight(editor.textContent, config);
        }, { tab: '    ' });
    }

    function getIframeContents() {
        return iframeContentTemplate({
            html: editorConfigs.html.jar.toString(),
            css: editorConfigs.css.jar.toString(),
            js: editorConfigs.js.jar.toString()
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
    }));

    function generateOutput() {
        const iframeContents = getIframeContents();
        editorConfigs.out.elt.innerHTML = ''
        const frame = cf.nu('iframe.cf-editor-output-iframe', {
            style: { width: '100%', height: '100%', background: 'white' },
            m: {
                srcdoc: iframeContents,
                sandbox: 'allow-modals allow-scripts'
            }
        });
        editorConfigs.out.elt.appendChild(frame);
    }

    currentEditorStore.on('change', (val) => {
        Array.from(document.querySelectorAll('.editor-wrapper > :not(.switcher)')).forEach(elem => elem.style.display = 'none');
        editorConfigs[val].elt.style.display = 'block';
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
            editorConfigs[str].jar.updateCode(obj[str]);
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
    });

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
            editorConfigs[str].jar.updateCode("");
        }
        generateOutput();
    }
}

window.editorReady = editorReady;