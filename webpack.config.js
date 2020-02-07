const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const imsmanifest = require('./imsmanifest.json');

const myPlugins = [
  new CleanWebpackPlugin({
    cleanOnceBeforeBuildPatterns: ['**/*', '!content*', '!content/**']
  }),
  new HtmlWebpackPlugin({
    template: './src/fin.html',
    filename: 'fin.html'
  })
];
imsmanifest.organization.scos.map( sco => {
  myPlugins.push(new HtmlWebpackPlugin({
    title: sco.title,
    template: './src/index.html',
    filename: sco.src,
    frameContent: sco.content
  }) );
});

module.exports = {
  entry: './src/js/main.js',
  plugins: myPlugins,
  output: {
    filename: 'js/main.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  devServer: {
    contentBase: './dist',
  },
};