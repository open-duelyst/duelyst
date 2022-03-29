(function(root, factory) {

  if (typeof define === 'function' && define.amd) {
    define(['backbone', 'underscore'], function(Backbone, _) {
      return factory(Backbone, _);
    });
  } else if (typeof exports !== 'undefined') {
    var Backbone = require('backbone');
    var _ = require('underscore');
    module.exports = factory(Backbone, _);
  } else {
    factory(root.Backbone, root._);
  }

}(this, function(Backbone, _) {
  "use strict";

  var previousWreqr = Backbone.Wreqr;

  var Wreqr = Backbone.Wreqr = {};

  Backbone.Wreqr.VERSION = '<%= version %>';

  Backbone.Wreqr.noConflict = function () {
    Backbone.Wreqr = previousWreqr;
    return this;
  };

  // @include ../wreqr.handlers.js
  // @include ../wreqr.commandStorage.js
  // @include ../wreqr.commands.js
  // @include ../wreqr.requestresponse.js
  // @include ../wreqr.eventaggregator.js
  // @include ../wreqr.channel.js
  // @include ../wreqr.radio.js

  return Backbone.Wreqr;

}));
