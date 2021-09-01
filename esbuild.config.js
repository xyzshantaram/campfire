const esbuild = require('esbuild')

// Automatically exclude all node_modules from the bundled version
const { nodeExternalsPlugin } = require('esbuild-node-externals')

esbuild.build({
  entryPoints: ['./dist/campfire.js'],
  outfile: './dist/campfire.min.js',
  bundle: true,
  minify: true,
  platform: 'browser',
  sourcemap: false,
  target: ['es6'],
  format: 'esm',
  plugins: [nodeExternalsPlugin()]
}).catch((err) => {
    console.error(err)
    process.exit(1)
})