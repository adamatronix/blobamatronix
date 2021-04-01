const path = require('path')

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'blobamatronix.js',
    path: path.resolve(__dirname, 'lib'),
    libraryTarget: 'var',
    library: 'Blobamatronix'
  },
  node: {
    fs: 'empty'
  },   
  module: {
    rules: [   
        {
            test: /\.js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
                loader: 'babel-loader',
            }
        },
        {
          test: /\.glsl$/,
          loader: 'webpack-glsl-loader'
        }
    ]
  }
}