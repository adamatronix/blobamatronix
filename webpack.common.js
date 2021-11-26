const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'blobamatronix.js',
    path: path.resolve(__dirname, 'lib')
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
          test: /\.(png|svg|jpg|gif|hdr)$/,
          use: [
            {
              loader: 'file-loader'
            }
          ]
        },
        {
          test: /\.glsl$/,
          loader: 'webpack-glsl-loader'
        }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Blobamatronix Examples',
      templateContent: ({htmlWebpackPlugin}) => `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8"/>
            <meta name="viewport" content="width=device-width,initial-scale=1">
            <title>${htmlWebpackPlugin.options.title}</title>
          </head>
          <body style="margin: 0; padding: 0; width: 100%; height: 100vh;">
          </body>
        </html>
      `
    })
  ],
}