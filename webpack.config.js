const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const { DefinePlugin } = require('webpack');
const path = require('path');

const devServerPort = 8111;

module.exports = [(env, argv) => {

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
      vscode: 'commonjs vscode'
    },
    resolve: {
      extensions: ['.ts', '.js']
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
                happyPackMode: true
              }
            }
          ]
        }
      ]
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
        eslint: {
          files: ['./src/extension/**/*.{ts,tsx,js,jsx}']
        }
      })
    ],
    cache: {
      type: 'memory',
    },
  };
  return config;
}, (env, argv) => ({
  mode: argv.mode,
  devtool: argv.mode === 'production' ? false : 'inline-source-map',
  entry: './src/client/index.ts',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: "client.js",
    publicPath: '',
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
              configFile: 'src/client/tsconfig.json',
              transpileOnly: true,
              compilerOptions: {
                noEmit: false,
              },
            },
          }
        ]

      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              modules: true,
            },
          },
        ],
      },
			{
				test: /\.svg$/,
				loader: 'svg-sprite-loader',
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
        tsconfig: 'src/client/tsconfig.json',
        diagnosticOptions: {
          semantic: true,
          syntactic: true,
        },
      },
      eslint: {
        files: ['./src/client/**/*.{ts,tsx,js,jsx}']
      }
    }),
    new DefinePlugin({
      // Path from the output filename to the output directory
      __webpack_relative_entrypoint_to_root__: JSON.stringify(
        path.posix.relative(path.posix.dirname(`/client.js`), '/'),
      ),
    }),
  ],
})];
