const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const uuidv4 = require('uuid/v4');
const imsmanifestdata = require('./imsmanifest.json');

const myPlugins = [
  new CleanWebpackPlugin({
    cleanOnceBeforeBuildPatterns: ['**/*', '!.gitignore', '!content*', '!content/**', '!imsmanifest.xml']
  })
];
const orgId = uuidv4();

let imsmanifestoutput = `
  <organizations default="${orgId}">
  <organization identifier="ORG-${orgId}" structure="hierarchical">
      <title>${imsmanifestdata.organization.title}</title>
`;
let resources = '<resources>';
imsmanifestdata.organization.scos.map( sco => {
  myPlugins.push(new HtmlWebpackPlugin({
    title: sco.title,
    template: './src/index.html',
    filename: sco.src,
    frameContent: sco.content
  }) );
  let itemId = uuidv4();
  resources += `
    <resource identifier="RES-${itemId}" type="webcontent" href="${sco.src}" adlcp:scormtype="sco">
      <file href="${sco.src}" />
    </resource>
  `;
  imsmanifestoutput += `
  <item identifier="ITEM-${itemId}" isvisible="true" identifierref="RES-${itemId}">
    <title>${sco.title}</title>
  </item>
  `
});
resources += '</resources>';

imsmanifestoutput += `
  </organization>
</organizations>
`;
imsmanifestoutput += resources;
imsmanifestoutput += `
</manifest>`;
myPlugins.push(new HtmlWebpackPlugin({
  template: './src/imsmanifest.xml',
  filename: 'imsmanifest.xml',
  imsContent: imsmanifestoutput,
  inject: false
}));

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
    writeToDisk:true,
    contentBase: [path.join(__dirname, 'dist'), path.join(__dirname, 'src/rte/')],
    openPage: 'scorm12rte.html'
  },
};