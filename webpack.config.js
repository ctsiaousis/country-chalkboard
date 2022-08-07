import NodePolyfillPlugin from "node-polyfill-webpack-plugin"

export const plugins = [
    new NodePolyfillPlugin()
]

module.exports = {
    entry: "./app",
    output: {
      path: __dirname,
      filename: "bundle.js"
    },
    module: {
        loaders: [
            {  
                test: /\.js$/,
                exclude: 'node_modules',
                loader: 'babel',
                query: {presets: ['es2015']},
            }
        ]
    },
    target: 'node'
  };