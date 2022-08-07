import NodePolyfillPlugin from "node-polyfill-webpack-plugin"

export const plugins = [
    new NodePolyfillPlugin()
]

module.exports = {
    //...
    experiments: {
      asyncWebAssembly: true,
      buildHttp: true,
      layers: true,
      lazyCompilation: true,
      outputModule: true,
      syncWebAssembly: true,
      topLevelAwait: true,
    },
  };
// module.exports = {
//     entry: "./app",
//     output: {
//         path: __dirname,
//         filename: "bundle.js"
//     },
//     module: {
//         rules: [
//             {
//                 test: /\.m?js$/,
//                 include: /node_modules/,
//                 type: 'javascript/auto',
//                 resolve: {
//                     fullySpecified: false
//                 }
//             }
//         ],
//         loaders: [
//             {
//                 test: /\.m?js$/,
//                 exclude: 'node_modules',
//                 loader: 'babel',
//                 query: { presets: ['es2015'] },
//             }
//         ]
//     },
//     target: 'node'
// };