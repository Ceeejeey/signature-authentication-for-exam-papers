const webpack = require('webpack');
module.exports = {
    

    module: {
      rules: [
         
          {
              test: /\.js$/,
              enforce: 'pre',
              use: ['source-map-loader'],
              exclude: [
                  /node_modules\/react-pdf/,  
              ],
          },
      ],
  },
    resolve: {
      extensions: ['.js', '.jsx', '.json'], 
      fallback: {
        "path": require.resolve("path-browserify"),
      },

      fallback: {
        http: require.resolve("stream-http"),
        https: require.resolve("https-browserify"),
        url: require.resolve("url/"),
        stream: require.resolve("stream-browserify"),
        zlib: require.resolve("browserify-zlib"),
        assert: require.resolve("assert/"),
        util: require.resolve("util/"),
      }
    },
    plugins: [
      new webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer']
      })
    ]
  };
  