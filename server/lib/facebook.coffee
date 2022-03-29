config 		= require '../../config/config'
FB = require 'fb'
FB.options({appId: config.get('facebook.appId'), appSecret: config.get('facebook.appSecret')})

module.exports = FB