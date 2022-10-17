'use strict';

var SDK = require('app/sdk');
var moment = require('moment');
var _ = require('underscore');
var ProfileSummaryViewTempl = require('./templates/profile_summary_item.hbs');

var ProfileSummaryView = Backbone.Marionette.ItemView.extend({

  className: 'profile-summary',

  template: ProfileSummaryViewTempl,

  serializeModel: function (model) {
    var data = model.toJSON.apply(model, _.rest(arguments));

    if (!_.isNumber(data.currentSeasonRank.rank)) { data.currentSeasonRank.rank = 30; }
    if (!_.isNumber(data.currentSeasonRank.win_streak)) { data.currentSeasonRank.win_streak = 0; }
    if (!_.isNumber(data.currentSeasonGameCounterModel.win_count)) { data.currentSeasonGameCounterModel.win_count = 0; }
    data.currentSeasonRank.rank_progress_percent = Math.ceil(100 * (30 - data.currentSeasonRank.rank) / 30);
    data.currentSeasonRank.season_label = moment.utc(data.currentSeasonRank.starting_at).format('MMMM YYYY');

    if (data.currentSeasonLadderPositionModel == null) { data.currentSeasonLadderPositionModel = {}; }

    if (!_.isNumber(data.topRank.rank)) { data.topRank.rank = 30; }
    if (!_.isNumber(data.topRank.top_win_streak)) { data.topRank.top_win_streak = 0; }
    if (!_.isNumber(data.topRank.win_count)) { data.topRank.win_count = 0; }
    if (!_.isNumber(data.ranked.win_count)) { data.ranked.win_count = 0; }
    data.topRank.rank_progress_percent = Math.ceil(100 * (30 - data.topRank.top_rank) / 30);
    data.topRank.season_label = moment.utc(data.topRank.top_rank_starting_at).format('MMMM YYYY');

    if (!_.isNumber(data.topRank.top_rank_ladder_position)) { data.topRank.top_rank_ladder_position = null; }

    if (!_.isNumber(data.run.win_count)) { data.run.win_count = 0; }
    data.run.gauntlet_progress_percent = Math.ceil(100 * data.run.win_count / 12);
    data.run.blade_id = Math.max(1, Math.min(9, data.run.win_count));
    if (!_.isNumber(data.gauntlet.win_count)) { data.gauntlet.win_count = 0; }

    return data;
  },

  onShow: function () {
    // model changes do not auto render unless we listen for changes and listeners should only be added onShow to prevent zombie views
    this.listenTo(this.model, 'change sync', this.render);
  },

});

// Expose the class either via CommonJS or the global object
module.exports = ProfileSummaryView;
