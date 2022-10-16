'use strict';

var Templ = require('./templates/quest_log_empty.hbs');
var NavigationManager = require('app/ui/managers/navigation_manager');
var Logger = require('app/common/logger');

var QuestLogEmptyView = Backbone.Marionette.ItemView.extend({

  template: Templ,

  initialize: function() {
  }

});

// Expose the class either via CommonJS or the global object
module.exports = QuestLogEmptyView;
