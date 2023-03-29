import esbuild from 'esbuild';
import { resolve } from 'path';
import { promises } from 'fs';
import { createHash } from 'crypto';

const isWatchBuild = process.argv.indexOf('--watch') >= 0;
const minify = process.argv.indexOf('--minify') >= 0;

async function build() {
  await Promise.all([buildExtension(), buildRender()]);
}

async function buildExtension() {
  const options = {
    logLevel: 'info',
    entryPoints: ['./src/extension/extension.ts'],
    outfile: 'dist/extension.js',
    bundle: true,
    minify,
    platform: 'node',
    sourcemap: true,
    target: 'node14',
    external: ['vscode'],
  };

  if (isWatchBuild) {
    const ctx = await esbuild.context(options);
    await ctx.watch();
  } else {
    await esbuild.build(options);
  }
}

async function buildRender() {
  const options = {
    logLevel: 'info',
    entryPoints: ['./src/renderer/rfc7230Renderer.tsx', './src/renderer/testResultsRenderer.tsx'],
    outdir: 'dist',
    bundle: true,
    minify,
    platform: 'browser',
    format: 'esm',
    sourcemap: true,
    target: 'es2022',
    plugins: [inlineCSS],
  };

  if (isWatchBuild) {
    const ctx = await esbuild.context(options);
    await ctx.watch();
  } else {
    await esbuild.build(options);
  }
}

const inlineCSS = {
  name: 'inline-css',
  setup(build) {
    build.onLoad({ filter: /\.(css)$/u }, async args => {
      const sourcePath = resolve(args.resolveDir, args.path);
      async function generateInjectCSS(sourcePath) {
        const styleID = createHash('sha256').update(sourcePath).digest('base64');
        const sourceCSS = await promises.readFile(sourcePath, 'utf-8');

        return `(function(){
              if (!document.getElementById('${styleID}')) {
                  const e = document.createElement('style');
                  e.id = '${styleID}';
                  e.textContent = \`${sourceCSS}\`;
                  document.head.appendChild(e);
              }
          })();`;
      }
      const sourceJS = await generateInjectCSS(sourcePath);
      return {
        contents: sourceJS,
        loader: 'js',
      };
    });
  },
};

build();
