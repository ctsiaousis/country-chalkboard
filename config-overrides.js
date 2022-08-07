const webpack = require('webpack');

module.exports = function override(config, env) {
    const fallback = config.resolve.fallback || {};
    Object.assign(fallback, {
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "assert": require.resolve("assert"),
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        "os": require.resolve("os-browserify"),
        "util": require.resolve("util"),
        // "fs": require.resolve("fs"),
        "path": require.resolve("path-browserify"),
        "url": require.resolve("url"),
        "buffer": require.resolve("buffer"),
        "process": require.resolve("process"),
    })
    config.resolve.fallback = fallback;
    config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer']
        })
    ]);

    // react-dnd
    config.module.rules.unshift({
        test: /\.m?js$/,
        resolve: {
            fullySpecified: false, // disable the behaviour
        },
    });

    return config;
};