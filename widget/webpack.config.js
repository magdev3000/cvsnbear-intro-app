const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv');

dotenv.config();

const env = {
  DEBUG_MODE: process.env.DEBUG_MODE,
};

module.exports = {
  mode: 'development',
  // mode: 'production',
  entry: './widget/index.js',
  output: {
    filename: 'widget.js',
    library: 'cvsnBearGDPR',
    path: path.resolve(__dirname, '../static'),
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              ["@babel/preset-env", {
              }],
              "@babel/preset-react",
            ],
            plugins: [
              "babel-plugin-styled-components",
              "@babel/plugin-proposal-class-properties",
            ],
          },
        },
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: "style-loader", // creates style nodes from JS strings
          },
          {
            loader: "css-loader", // translates CSS into CommonJS
          },
          {
            loader: "sass-loader", // compiles Sass to CSS
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin(env),
  ],
};
