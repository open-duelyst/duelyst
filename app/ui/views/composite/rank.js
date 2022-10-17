// pragma PKGS: game

'use strict';

var CONFIG = require('app/common/config');
var Logger = require('app/common/logger');
var RSX = require('app/data/resources');
var audio_engine = require('app/audio/audio_engine');
var DuelystFirebase = require('app/ui/extensions/duelyst_firebase');
var RankTmpl = require('app/ui/templates/composite/rank.hbs');
var RankStarItemView = require('app/ui/views/item/rank_star');
var SDK = require('app/sdk');

var RankCompositeView = Backbone.Marionette.CompositeView.extend({

  initialize: function () {
    Logger.module('UI').log('initialize a RankCompositeView');
    this.collection = new Backbone.Collection();
    this.showCurrentRank();
    this.showCurrentStars();
  },

  template: RankTmpl,

  childView: RankStarItemView,
  childViewContainer: '.stars-list',

  ui: {
    $rankValue: '.rank-value',
    $symbolRankRingOuter: '.symbol-rank-ring-outer',
    $symbolRankRingInner: '.symbol-rank-ring-inner',
    $symbolRankCenter: '.symbol-rank-center',
    $symbolMedal: '.symbol-medal',
    $imgSymbolMedal: '#img_medal',
  },

  events: {},

  _rank: 0,
  _stars: 0,
  _starsRequired: 0,
  _medal: null,

  templateHelpers: {
    nextDivisionName: function () {
      var nextRank = _.find(this.divisions, function (division) {
        if (this.rank > division.rank)
          return true;
      }.bind(this));

      if (nextRank)
        return nextRank.name;
      else
        return '';
    },
    nextDivisionRank: function () {
      var nextRank = _.find(this.divisions, function (division) {
        if (this.rank > division.rank)
          return true;
      }.bind(this));

      if (nextRank)
        return nextRank.rank;
      else
        return 0;
    },
    progressUntilNextDivision: function () {
      var nextRank = _.find(this.divisions, function (division) {
        if (this.rank > division.rank)
          return true;
      }.bind(this));

      if (nextRank)
        return nextRank.rank - this.rank;
      else
        return 0;
    },
    shouldShowWinStreakBonus: function () {
      return SDK.RankFactory.areWinStreaksEnabled(this.rank_before);
    },
  },

  /* region BACKBONE EVENTS */

  onRender: function () {
    this._showRank();
    this._showStars();

    // medal is generated from rank
    this._updateMedal(this._rank);
    this._showMedal();
  },

  onShow: function () {
    this.ui.$symbolRankCenter.velocity(
      { opacity: [1.0, 0.5] },
      { duration: CONFIG.PULSE_MEDIUM_DURATION * 1000.0, easing: 'easeInOutSine', loop: true },
    );
  },

  onDestroy: function () {
    // cleanup animations
    this.ui.$rankValue.velocity('stop');
    this.ui.$symbolRankCenter.velocity('stop');
    this.ui.$symbolRankRingOuter.velocity('stop');
    this.ui.$symbolMedal.velocity('stop');
    if (this._rankChangeTimeout != null) {
      clearTimeout(this._rankChangeTimeout);
      this._rankChangeTimeout = null;
    }
  },

  /* endregion BACKBONE EVENTS */

  /* region MODEL to VIEW DATA */

  serializeModel: function (model) {
    var data = model.toJSON.apply(model, _.rest(arguments));

    data.divisions = [
      { name: SDK.RankFactory.rankedDivisionNameForRank(30), rank: 30 },
      { name: SDK.RankFactory.rankedDivisionNameForRank(20), rank: 20 },
      { name: SDK.RankFactory.rankedDivisionNameForRank(10), rank: 10 },
      { name: SDK.RankFactory.rankedDivisionNameForRank(5), rank: 5 },
      { name: SDK.RankFactory.rankedDivisionNameForRank(0), rank: 0 },
    ];

    data.rank = data.rank_before + data.rank_delta;

    for (var i = data.divisions.length - 1; i >= 0; i--) {
      var division = data.divisions[i];
      if (data.rank <= division.rank) {
        data.divisionName = division.name;
        break;
      }
    }

    return data;
  },

  /* endregion MODEL to VIEW DATA */

  /* region CHANGES */

  showStarsAndRankChange: function () {
    // get previous rank and stars
    var previousRank = this.model.get('rank_before');
    var previousStars = this.model.get('rank_stars_before');
    var previousStarsRequired = SDK.RankFactory.starsNeededToAdvanceRank(previousRank);

    // Win streak is already updated so subtract 1,
    // this will not be the correct previous win streak when game was lost, but that won't have a negative impact (currently)
    var previousWinStreak = Math.max(this.model.get('rank_win_streak') - 1, 0);

    // Calculate rank data after game outcome
    var rankDataAfter = SDK.RankFactory.updateRankDataWithGameOutcome({
      rank: previousRank,
      stars: previousStars,
      win_streak: previousWinStreak,
    }, this.model.get('is_winner'), this.model.get('is_draw'));

    // get current rank and stars
    var rank = rankDataAfter.rank;
    var stars = rankDataAfter.stars;
    var starsRequired = SDK.RankFactory.starsNeededToAdvanceRank(rank);

    this._showRankChange(previousRank, rank, rank, previousStars, stars, previousStarsRequired, starsRequired);
  },

  _showRankChange: function (fromRank, toRank, finalRank, fromStars, toStars, fromStarsRequired, toStarsRequired) {
    this._updateStarsRequired(fromStarsRequired);
    this._updateRank(fromRank);

    var delta = toRank - fromRank;
    // when fromRank is not yet at finalRank and ranks are different
    if (fromRank !== finalRank && delta !== 0) {
      var dir = delta / Math.abs(delta);

      if (delta < 0) {
        // gained rank, show stars filling up to max then reset to 0
        this._showStarsChange(fromStars, fromStarsRequired, 0, function () {
          // rotate ring once to show gain in rank
          this.ui.$symbolRankRingOuter.velocity(
            { rotateZ: '+=360deg' },
            {
              duration: 750.0,
              easing: 'easeInOutSine',
              complete: function () {
                // shift text to simulate counter
                this.ui.$rankValue.velocity(
                  { translateY: [-20, 0], opacity: [0, 1] },
                  {
                    duration: 250.0,
                    easing: 'easeInSine',
                    complete: function () {
                      // set stars to final
                      this._updateStars(0);

                      // play rank change
                      audio_engine.current().play_effect(RSX.sfx_unit_deploy_3.audio, false);

                      // show next rank
                      var nextRank = fromRank + dir;
                      var currentMedal = this._medal;
                      this._updateRank(nextRank);

                      // check if medal has changed
                      if (currentMedal != this._medal) {
                        this._updateMedal(fromRank);

                        // animate medal changing
                        this.ui.$symbolMedal.velocity(
                          { opacity: [1, 0], scale: [1, 5] },
                          {
                            duration: 350.0,
                            delay: 250.0,
                            easing: [0.84, 0.11, 0.3, 1.68],
                            begin: function () {
                              this._updateMedal(nextRank);
                            }.bind(this),
                            complete: function () {
                              audio_engine.current().play_effect(RSX.sfx_deploy_circle1.audio, false);
                              this._showRankChange(nextRank, fromRank + dir * 2, finalRank, 0, toStars, toStarsRequired, toStarsRequired);
                            }.bind(this),
                          },
                        );
                      } else {
                        // show next change
                        this._showRankChange(nextRank, fromRank + dir * 2, finalRank, 0, toStars, toStarsRequired, toStarsRequired);
                      }
                    }.bind(this),
                  },
                ).velocity(
                  { translateY: [0, 20], opacity: [1, 0] },
                  { duration: 250.0, easing: 'easeOutSine' },
                );
              }.bind(this),
            },
          );
        }.bind(this));
      } else {
        // lost rank, shows stars emptying to 0 then set to current
        this._showStarsChange(fromStars, 0, toStars, function () {
          // rotate ring once to show loss in rank
          this.ui.$symbolRankRingOuter.velocity(
            { rotateZ: '-=360deg' },
            {
              duration: 750.0,
              easing: 'easeInOutSine',
              complete: function () {
                // shift text to simulate counter
                this.ui.$rankValue.velocity(
                  { translateY: [20, 0], opacity: [0, 1] },
                  {
                    duration: 250.0,
                    easing: 'easeInSine',
                    complete: function () {
                      // set stars to final
                      this._updateStars(toStars);

                      // play rank change
                      audio_engine.current().play_effect(RSX.sfx_unit_deploy_1.audio, false);

                      // show next rank
                      this._showRankChange(fromRank + dir, fromRank + dir * 2, finalRank, toStarsRequired, toStars, toStarsRequired, toStarsRequired);
                    }.bind(this),
                  },
                ).velocity(
                  { translateY: [0, -20], opacity: [1, 0] },
                  { duration: 250.0, easing: 'easeOutSine' },
                );
              }.bind(this),
            },
          );
        }.bind(this));
      }
    } else {
      // only change stars
      this._showStarsChange(fromStars, toStars, toStars);
    }
  },

  _showStarsChange: function (fromStars, toStars, finalStars, callback) {
    this._updateStars(fromStars);

    if (fromStars !== toStars) {
      // step stars fromStars to toStars
      var delta = toStars - fromStars;
      if (delta > 0) {
        for (var i = fromStars + 1; i <= toStars; i++) {
          this._queueCallback(this._showStarsChangeGain.bind(this), i, CONFIG.STARS_SEQUENCE_DELAY * 1000.0);
        }
      } else {
        for (var i = fromStars - 1; i >= toStars; i--) {
          this._queueCallback(this._showStarsChangeLoss.bind(this), i, CONFIG.STARS_SEQUENCE_DELAY * 1000.0);
        }
      }

      // show
      this._queueCallback(function () {
        if (callback) {
          callback();
        }
      }.bind(this), null, CONFIG.STARS_SEQUENCE_DELAY * 1000.0);
    } else if (callback) {
      callback();
    }
  },

  _showStarsChangeGain: function (stars) {
    audio_engine.current().play_effect(RSX.sfx_unit_onclick.audio, false);
    this._updateStars(stars);
  },

  _showStarsChangeLoss: function (stars) {
    audio_engine.current().play_effect(RSX.sfx_unit_onclick.audio, false);
    this._updateStars(stars);
  },

  _queueCallback: function (callback, args, delay) {
    if (!args) {
      args = [];
    } else if (!_.isArray(args)) {
      args = [args];
    }
    return this.$el.delay(delay).queue(function () { callback.apply(this, args); $(this).dequeue(); });
  },

  /* endregion CHANGES */

  /* region RANK */

  showCurrentRank: function () {
    var rank = this.model.get('rank_before') + this.model.get('rank_delta');
    this._updateRank(rank);
    this._updateStarsRequired(SDK.RankFactory.starsNeededToAdvanceRank(rank));
  },

  showPreviousRank: function () {
    var prevRank = this.model.get('rank_before');
    this._updateRank(prevRank);
    this._updateStarsRequired(SDK.RankFactory.starsNeededToAdvanceRank(prevRank));
  },

  _updateRank: function (rank) {
    if (this._rank != rank) {
      this._rank = rank;
      this._showRank();
      this._updateMedal(this._rank);
    }
  },

  _showRank: function () {
    // set rank text
    if (this.ui.$rankValue instanceof $) {
      this.ui.$rankValue.text(this._rank);
    }
  },

  _updateMedal: function (rank) {
    var lastMedal = this._medal;

    this._medal = SDK.RankFactory.rankedDivisionAssetNameForRank(rank);

    if (lastMedal != this._medal && this.ui.$imgSymbolMedal instanceof $) {
      this.ui.$symbolMedal.removeClass(lastMedal);
      this._showMedal();
    }
  },

  _showMedal: function () {
    // update medal
    if (this.ui.$imgSymbolMedal instanceof $) {
      this.ui.$symbolMedal.addClass(this._medal);
      this.ui.$imgSymbolMedal.attr('src', 'resources/season_rewards/season_rank_' + this._medal + '.png');
      this.ui.$imgSymbolMedal.attr('src', 'resources/season_rewards/season_rank_' + this._medal + '.png');
    }
  },

  /* endregion RANK */

  /* region STARS */

  showCurrentStars: function () {
    this._updateStars(this.model.get('rank_stars_before') + this.model.get('rank_stars_delta'));
  },

  showPreviousStars: function () {
    this._updateStars(this.model.get('rank_stars_before'));
  },

  _updateStars: function (stars) {
    this._stars = stars;
    this._showStars();
  },

  _showStars: function () {
    this.children.each(function (childView, index) {
      if (index < this._stars) {
        childView.$el.addClass('active');
      } else {
        childView.$el.removeClass('active');
      }
    }.bind(this));
  },

  _updateStarsRequired: function (starsRequired) {
    this._starsRequired = starsRequired;

    var starModels = [];
    for (var i = 0; i < starsRequired; i++) {
      starModels.push(new Backbone.Model());
    }
    this.collection.reset(starModels);
  },

  /* endregion STARS */
});

// Expose the class either via CommonJS or the global object
module.exports = RankCompositeView;
