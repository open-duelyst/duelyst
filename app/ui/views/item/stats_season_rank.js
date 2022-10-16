const moment = require('moment');
const StatsSeasonRankItemViewTempl = require('app/ui/templates/item/stats_season_rank.hbs');
const RankFactory = require('app/ui/sdk/rank/rankFactory');
const UtilsJavascript = require('app/common/utils/utils_javascript');

const StatsSeasonRankItemView = Backbone.Marionette.ItemView.extend({

  className: 'stats-season-rank',

  template: StatsSeasonRankItemViewTempl,

  ui: {
    $rankBar: '.rank-bar',
    $rankDescription: '.rank-description',
  },

  initialize() {
    // rank should always be set
    if (this.model.get('rank') == null) {
      this.model.set('rank', 30);
    }
  },

  onRender() {
    // set bar width by rank
    this.ui.$rankBar.css('width', `${(1.0 - this.model.get('rank') / 30) * 100.0}%`);

    if (this.model.get('_isTop')) {
      // setup top rank
      let topRankText = `Highest Rank: ${RankFactory.rankedDivisionNameForRank(this.model.get('rank'))} Division`;
      topRankText = topRankText.toUpperCase();
      this.ui.$rankDescription.text(topRankText);
    } else {
      // setup normal month rank
      let rankText = moment.utc(this.model.get('starting_at')).format('MMM YYYY');
      rankText = rankText.toUpperCase();

      // Special text for current season (shows the duration left in season
      if (moment.utc(this.model.get('starting_at')).month() == moment.utc().month()) {
        // this is the curren season
        const nextSeasonStartMoment = moment.utc(this.model.get('starting_at')).add(1, 'months');
        const daysTillNextSeason = nextSeasonStartMoment.diff(moment.utc(), 'days');

        // Show days left in current season, or show hours/minutes left if less than 1 day
        if (daysTillNextSeason > 0) {
          rankText += ` (${daysTillNextSeason} days left)`;
        } else {
          rankText += ` (${UtilsJavascript.stringifyHoursMinutesSeconds(nextSeasonStartMoment.diff(moment.utc(), 'hours') % 24, nextSeasonStartMoment.diff(moment.utc(), 'minutes') % 60, 0)} left)`;
        }
      }

      this.ui.$rankDescription.text(rankText);
    }
  },

});

// Expose the class either via CommonJS or the global object
module.exports = StatsSeasonRankItemView;
