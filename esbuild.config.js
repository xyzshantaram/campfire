import { build } from 'esbuild'

// Automatically exclude all node_modules from the bundled version
import { nodeExternalsPlugin } from 'esbuild-node-externals'

build({
    entryPoints: ['src/campfire.ts'],
    outdir: './dist/',
    bundle: true,
    minify: false,
    platform: 'browser',
    sourcemap: true,
    target: ['es2020'],
    format: 'esm',
    plugins: [nodeExternalsPlugin()],
    outExtension: { '.js': '.js' }
}).catch((err) => {
    console.error(err)
    process.exit(1)
})

// minified ESM version
build({
    entryPoints: ['src/campfire.ts'],
    outfile: './dist/campfire.esm.min.js',
    bundle: true,
    minify: true,
    platform: 'browser',
    sourcemap: true,
    target: ['es2020'],
    format: 'esm',
    plugins: [nodeExternalsPlugin()]
}).catch((err) => {
    console.error(err)
    process.exit(1)
})
