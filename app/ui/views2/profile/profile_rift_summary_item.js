const SDK = require('app/sdk');
const RiftHelper = require('app/sdk/rift/riftHelper');
const moment = require('moment');
const _ = require('underscore');
const ProfileRiftSummaryViewTempl = require('./templates/profile_rift_summary_item.hbs');

const ProfileRiftSummaryView = Backbone.Marionette.ItemView.extend({

  className: 'profile-rift-summary',

  template: ProfileRiftSummaryViewTempl,

  serializeModel(model) {
    const data = model.toJSON.apply(model, _.rest(arguments));

    if (data.highest_rated_run != null) {
      if (data.highest_rated_run.rift_level != null && data.highest_rated_run.rift_points != null) {
        const currentLevelPointsNeeded = RiftHelper.pointsRequiredForLevel(data.highest_rated_run.rift_level + 1);
        const currentLevelPointsProgress = data.highest_rated_run.rift_points - RiftHelper.totalPointsForLevel(data.highest_rated_run.rift_level);
        data.highest_rated_run.rift_level_percent = currentLevelPointsProgress / currentLevelPointsNeeded * 100.0;
      }
    }

    return data;
  },

  onShow() {
    // model changes do not auto render unless we listen for changes and listeners should only be added onShow to prevent zombie views
    this.listenTo(this.model, 'change sync', this.render);
  },

});

// Expose the class either via CommonJS or the global object
module.exports = ProfileRiftSummaryView;
