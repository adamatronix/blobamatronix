const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
   mode: 'development',
   devServer: {
      contentBase: './lib',
      host: '0.0.0.0',
      port: 8089,
      disableHostCheck: true,
    }
    
});