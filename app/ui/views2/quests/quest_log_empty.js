const NavigationManager = require('app/ui/managers/navigation_manager');
const Logger = require('app/common/logger');
const Templ = require('./templates/quest_log_empty.hbs');

const QuestLogEmptyView = Backbone.Marionette.ItemView.extend({

  template: Templ,

  initialize() {
  },

});

// Expose the class either via CommonJS or the global object
module.exports = QuestLogEmptyView;
