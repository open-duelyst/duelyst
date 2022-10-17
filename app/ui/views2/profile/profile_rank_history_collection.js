'use strict';

var SDK = require('app/sdk');
var moment = require('moment');
var ProfileRankHistoryCollectionViewTempl = require('./templates/profile_rank_history_collection.hbs');

var ProfileRankHistoryCollectionView = Backbone.Marionette.ItemView.extend({

  className: 'profile-rank-history',
  template: ProfileRankHistoryCollectionViewTempl,

  serializeModel: function (model) {
    var data = model.toJSON.apply(model, _.rest(arguments));
    var pastTwelveSeasons = [];
    for (var i = 0; i < 12; i++) {
      var startingAt = moment.utc().subtract(i, 'months').startOf('month');
      var rank = null;
      if (startingAt.valueOf() == data.currentSeasonRankModel.starting_at) {
        rank = data.currentSeasonRankModel;
      } else {
        rank = _.find(data.rankHistory, function (row) { return row.starting_at === startingAt.valueOf(); });
        // Default to displaying top_rank for past seasons
        if (rank != null && rank.top_rank != null) {
          rank.rank = rank.top_rank;
        }
      }
      var gameCounter = _.find(data.rankHistoryGameCounters, function (row) { return row.season_starting_at === startingAt.valueOf(); });

      if (!gameCounter)
        gameCounter = { game_count: 0, win_count: 0, win_streak: 0 };
      if (!rank)
        rank = { rank: null, starting_at: startingAt };

      _.extend(rank, gameCounter);
      pastTwelveSeasons.unshift(rank);
    }
    data.rankHistory = pastTwelveSeasons;
    return data;
  },

});

// Expose the class either via CommonJS or the global object
module.exports = ProfileRankHistoryCollectionView;
