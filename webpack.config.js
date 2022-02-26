const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const { DefinePlugin } = require('webpack');
const path = require('path');

const devServerPort = 8111;

module.exports = [
  (env, argv) => {
    /**@type {import('webpack').Configuration}*/
    const config = {
      target: 'node',
      mode: 'none',

      entry: './src/extension/extension.ts',
      output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'extension.js',
        library: {
          type: 'commonjs2',
        },
      },
      devtool: argv.mode === 'development' ? 'eval-cheap-module-source-map' : 'nosources-source-map',
      externals: {
        vscode: 'commonjs vscode',
        httpyac: 'httpyac',
      },
      resolve: {
        extensions: ['.ts', '.js'],
      },
      module: {
        rules: [
          {
            test: /\.ts$/,
            exclude: /node_modules/,
            use: [
              {
                loader: 'thread-loader',
              },
              {
                loader: 'ts-loader',
                options: {
                  happyPackMode: true,
                },
              },
            ],
          },
        ],
      },
      plugins: [
        new ForkTsCheckerWebpackPlugin({
          async: true,
          typescript: {
            diagnosticOptions: {
              semantic: true,
              syntactic: true,
            },
          },
        }),
      ],
      cache: {
        type: 'memory',
      },
    };
    return config;
  },
  (env, argv) => {
    /**@type {import('webpack').Configuration}*/
    const config = {
      mode: argv.mode,
      devtool: argv.mode === 'development' ? 'eval-cheap-module-source-map' : false,
      entry: {
        testResultsRenderer: './src/renderer/testResultsRenderer.tsx',
        rfc7230Renderer: './src/renderer/rfc7230Renderer.tsx',
      },
      output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].js',
        libraryTarget: 'module',
      },
      experiments: {
        outputModule: true,
      },
      resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.css'],
      },
      module: {
        rules: [
          {
            test: /\.tsx?$/,
            use: [
              {
                loader: 'thread-loader',
              },
              {
                loader: 'ts-loader',
                options: {
                  happyPackMode: true,
                  configFile: 'src/renderer/tsconfig.json',
                  transpileOnly: true,
                  compilerOptions: {
                    noEmit: false,
                  },
                },
              },
            ],
          },
          {
            test: /\.css$/,
            use: [
              'style-loader',
              {
                loader: 'css-loader',
              },
            ],
          },
          {
            test: /\.ttf$/,
            use: ['file-loader'],
          },
        ],
      },
      devServer: {
        port: devServerPort,
        hot: true,
        disableHostCheck: true,
        writeToDisk: true,
        headers: { 'Access-Control-Allow-Origin': '*' },
      },
      plugins: [
        new ForkTsCheckerWebpackPlugin({
          async: true,
          typescript: {
            tsconfig: 'src/renderer/tsconfig.json',
            diagnosticOptions: {
              semantic: true,
              syntactic: true,
            },
          },
        }),
      ],
      optimization: {
        minimize: true,
      },
    };
    return config;
  },
];
