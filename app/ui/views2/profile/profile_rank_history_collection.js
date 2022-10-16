const SDK = require('app/sdk');
const moment = require('moment');
const ProfileRankHistoryCollectionViewTempl = require('./templates/profile_rank_history_collection.hbs');

const ProfileRankHistoryCollectionView = Backbone.Marionette.ItemView.extend({

  className: 'profile-rank-history',
  template: ProfileRankHistoryCollectionViewTempl,

  serializeModel(model) {
    const data = model.toJSON.apply(model, _.rest(arguments));
    const pastTwelveSeasons = [];
    for (let i = 0; i < 12; i++) {
      var startingAt = moment.utc().subtract(i, 'months').startOf('month');
      let rank = null;
      if (startingAt.valueOf() == data.currentSeasonRankModel.starting_at) {
        rank = data.currentSeasonRankModel;
      } else {
        rank = _.find(data.rankHistory, (row) => row.starting_at === startingAt.valueOf());
        // Default to displaying top_rank for past seasons
        if (rank != null && rank.top_rank != null) {
          rank.rank = rank.top_rank;
        }
      }
      let gameCounter = _.find(data.rankHistoryGameCounters, (row) => row.season_starting_at === startingAt.valueOf());

      if (!gameCounter) gameCounter = { game_count: 0, win_count: 0, win_streak: 0 };
      if (!rank) rank = { rank: null, starting_at: startingAt };

      _.extend(rank, gameCounter);
      pastTwelveSeasons.unshift(rank);
    }
    data.rankHistory = pastTwelveSeasons;
    return data;
  },

});

// Expose the class either via CommonJS or the global object
module.exports = ProfileRankHistoryCollectionView;
