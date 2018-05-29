const path = require("path");
const webpackDashboard = require('webpack-dashboard/plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: "./src/js/main.js",
    output: {
      path: path.resolve(__dirname, "./build"),
      filename: "bundle.js"
    },
    module: {
      rules: [
        {
            test: /\.js$/,
            exclude: /(node_modules)/,
            use: {
              loader: "babel-loader",
              options: {
                presets: ["babel-preset-env"]
              }
            }
        },
        {
          test: /\.css$/,
          loaders: ["style-loader","css-loader"]
        }
      ]
    },
    plugins: [
      new webpackDashboard(),
      new HtmlWebpackPlugin
      ({
      filename: 'index.html',
      template: 'src/public/index.html'
      }),
      new HtmlWebpackPlugin
      ({
      filename: 'restaurant.html',
      template: 'src/public/restaurant.html'
      })
    ]
  };