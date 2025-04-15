import { template } from 'https://esm.sh/campfire.js@4.0.0-rc15';

export const FrameTemplate = template(`
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
        import * as cf from 'https://esm.sh/campfire.js@4.0.0-rc15';
        window.onload = function() {
            {{{ javascript }}}
        }
    </script>
</body>
</html>`);