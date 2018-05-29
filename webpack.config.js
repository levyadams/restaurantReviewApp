const path = require("path");
const webpackDashboard = require('webpack-dashboard/plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
module.exports = {
    entry: "./src/js/main.js",
    output: {
      path: path.resolve(__dirname, "./build"),
      filename: "bundle.js"
    },
    mode: 'production',
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
        },
        { 
          test: /\.(jpe?g|png|gif|svg)$/i,
          loader: "url-loader?name=build/images/[name].[ext]"
        }
        
      ]
    },
    plugins: [
      new BrowserSyncPlugin(
        {
          host: 'localhost',
          port: 3000,
          server: { baseDir: ['build'] }
        },
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
      )]
  };