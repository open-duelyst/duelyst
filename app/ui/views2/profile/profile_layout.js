// pragma PKGS: nongame

'use strict';

// global libs
var Logger = require('app/common/logger');
var CONFIG = require('app/common/config');
var generatePushID = require('app/common/generate_push_id');
var Scene = require('app/view/Scene');
var SDK = require('app/sdk');
var moment = require('moment');
var Promise = require('bluebird');
var RSX = require('app/data/resources');
var audio_engine = require('app/audio/audio_engine');
// template
//
var Animations = require('app/ui/views/animations');
var NavigationManager = require('app/ui/managers/navigation_manager');
var GamesManager = require('app/ui/managers/games_manager');
var InventoryManager = require('app/ui/managers/inventory_manager');
var UtilsUI = require('app/common/utils/utils_ui');
var DuelystBackbone = require('app/ui/extensions/duelyst_backbone');
var DuelystFirebase = require('app/ui/extensions/duelyst_firebase');
var ChangePortraitItemView = require('app/ui/views/item/change_portrait');
var ChangeUsernameItemView = require('app/ui/views/item/change_username');
var ChangePasswordItemView = require('app/ui/views/item/change_password');
var ConfirmDialogItemView = require('app/ui/views/item/confirm_dialog');
// region views
var ProfileManager = require('app/ui/managers/profile_manager');
var openUrl = require('app/common/openUrl');
var ProfileErrorView = require('./profile_error_item');
var ProfileRegionLoadingView = require('./profile_region_loading_item');
var ProfileSummaryView = require('./profile_summary_item');
var ProfileRiftSummary = require('./profile_rift_summary_item');
var ProfileFactionLevelCollectionView = require('./profile_faction_level_collection');
var ProfileRankHistoryCollectionView = require('./profile_rank_history_collection');
var ProfileMatchHistoryCollectionView = require('./profile_match_history_collection');
var ProfileTemplate = require('./templates/profile_layout.hbs');

var ProfileLayout = Backbone.Marionette.LayoutView.extend({

  id: 'app-profile',
  className: 'modal duelyst-modal',
  template: ProfileTemplate,
  ui: {
    $profileTabs: '#profile_tabs',
    $portraitImg: '.portrait img',
    $usernameContent: '.username-content',
  },
  regions: {
    contentRegion: '.content-region',
  },
  events: {
    'click #profile_tabs li': 'onTabChanged',
    'click .change-portrait': 'onChangePortraitClick',
    'click .change-username': 'onChangeUsernameClicked',
    'click .change-password': 'onChangePasswordClicked',
  },
  selectedTabValue: null,
  baseSelectedTabValue: 'summary',
  animateIn: Animations.fadeIn,
  animateOut: Animations.fadeOut,
  cache: null,
  apiEndpointUrl: null,
  gamesHistoryPage: 0,
  _requestId: null,

  serializeModel: function (model) {
    var data = model.toJSON.apply(model, _.rest(arguments));
    data.isViewingBuddyProfile = model.userId != null;
    if (!data.isViewingBuddyProfile) {
      data.season_count = Math.floor(moment.duration(moment().utc().valueOf() - data.created_at).asMonths());
    }
    if (!data.rank && data.presence) {
      data.rank = data.presence.rank;
    }
    return data;
  },

  initialize: function () {
    // generate unique id for requests
    this._requestId = generatePushID();

    this.cache = {};

    if (this.model.userId) {
      this.apiEndpointUrl = process.env.API_URL + '/api/users/' + this.model.userId;
    } else {
      this.apiEndpointUrl = process.env.API_URL + '/api/me';
    }
  },

  onRender: function () {
    this._bindPortrait();
    this.showSelectedTab();
  },

  onShow: function () {
    // change gradient color mapping
    Scene.getInstance().getFX().showGradientColorMap(this._requestId, CONFIG.ANIMATE_FAST_DURATION, {
      r: 194, g: 203, b: 220, a: 255,
    }, {
      r: 36, g: 51, b: 65, a: 255,
    });

    // listen to events
    this.listenTo(ProfileManager.getInstance().profile, 'change:presence', this._bindPortrait);

    // start at default tab
    this.setSelectedTab(this.baseSelectedTabValue);
  },

  onPrepareForDestroy: function () {
    // reset gradient color mapping
    Scene.getInstance().getFX().clearGradientColorMap(this._requestId, CONFIG.ANIMATE_MEDIUM_DURATION);
  },

  onDestroy: function () {
  },

  onChangePortraitClick: function () {
    NavigationManager.getInstance().showDialogView(new ChangePortraitItemView({ model: new Backbone.Model() }));
  },

  _bindPortrait: function () {
    var portraitId;
    if (this.model.userId != null) {
      // viewing buddy
      portraitId = this.model.get('portrait_id');
    } else {
      // viewing self
      portraitId = ProfileManager.getInstance().profile.get('presence').portrait_id;
    }
    var portraitData = SDK.CosmeticsFactory.profileIconForIdentifier(portraitId);
    var portraitImg = portraitData.img;
    var portraitScaledImg = RSX.getResourcePathForScale(portraitImg, CONFIG.resourceScaleCSS);
    this.ui.$portraitImg.attr('src', portraitScaledImg);
  },

  onChangeUsernameClicked: function (e) {
    var changeUsernameItemView = new ChangeUsernameItemView({ model: ProfileManager.getInstance().profile });
    changeUsernameItemView.listenTo(changeUsernameItemView, 'success', function () {
      this.ui.$usernameContent.text(ProfileManager.getInstance().get('username'));
    }.bind(this));
    NavigationManager.getInstance().showDialogView(changeUsernameItemView);
  },

  onChangePasswordClicked: function (e) {
    var confirmDialogItemView = new ConfirmDialogItemView({ title: 'Click OK and use the forgot password system to set a password.' });
    this.listenToOnce(confirmDialogItemView, 'confirm', function () {
      openUrl(process.env.API_URL + '/forgot');
    });
    this.listenToOnce(confirmDialogItemView, 'cancel', function () {
      this.stopListening(confirmDialogItemView);
    }.bind(this));
    NavigationManager.getInstance().showDialogView(confirmDialogItemView);
  },

  onTabChanged: function (e) {
    var li = $(e.currentTarget);
    var selectedTabValue = li.data('value');
    this.setSelectedTab(selectedTabValue);
  },

  setSelectedTab: function (selectedTabValue) {
    if (selectedTabValue !== this.selectedTabValue) {
      this.gamesHistoryPage = 0;
      this.selectedTabValue = selectedTabValue;
      audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_tab_in.audio, CONFIG.SELECT_SFX_PRIORITY);
      this.showSelectedTab();
    }
  },

  showSelectedTab: function () {
    this.ui.$profileTabs.children().removeClass('active');
    if (this.selectedTabValue != null) {
      this.ui.$profileTabs.find('[data-value=\'' + this.selectedTabValue + '\']').addClass('active');
      switch (this.selectedTabValue) {
      case 'summary':
        this.showSummary();
        break;
      case 'rank_history':
        this.showRankHistory();
        break;
      case 'match_history':
        this.showMatchHistory();
        break;
      case 'faction_levels':
        this.showFactionLevels();
        break;
      case 'rift_summary':
        this.showRiftSummary();
        break;
      }
    }
  },

  showSummary: function () {
    if (this.cache.summary) {
      this.contentRegion.show(new ProfileSummaryView({
        model: this.cache.summary,
      }));
    } else {
      //
      var rankedGameCounterModel = new DuelystBackbone.Model();
      rankedGameCounterModel.url = this.apiEndpointUrl + '/stats/games/ranked';
      rankedGameCounterModel.fetch();

      //
      var gauntletGameCounterModel = new DuelystBackbone.Model();
      gauntletGameCounterModel.url = this.apiEndpointUrl + '/stats/games/gauntlet';
      gauntletGameCounterModel.fetch();

      //
      var gauntletTopRunWinCountModel = new DuelystBackbone.Model();
      gauntletTopRunWinCountModel.url = this.apiEndpointUrl + '/stats/gauntlet_runs/top/win_count';
      gauntletTopRunWinCountModel.fetch();

      //
      var topRankModel = new DuelystBackbone.Model();
      topRankModel.url = this.apiEndpointUrl + '/rank/top';
      topRankModel.fetch();

      //
      var divisionStatsModel = new DuelystBackbone.Model();
      divisionStatsModel.url = this.apiEndpointUrl + '/rank/division_stats';
      divisionStatsModel.fetch();

      //
      var factionProgressionModel = new DuelystBackbone.Model();
      factionProgressionModel.url = this.apiEndpointUrl + '/faction_progression';
      factionProgressionModel.fetch();

      //
      var ribbonsCollection = new DuelystBackbone.Collection();
      ribbonsCollection.url = this.apiEndpointUrl + '/ribbons';
      ribbonsCollection.fetch();

      var currentSeasonRankModel = null;
      if (this.model.userId) {
        var currentSeasonRankModel = new DuelystBackbone.Model();
        currentSeasonRankModel.url = this.apiEndpointUrl + '/rank/current';
        currentSeasonRankModel.fetch();
      } else {
        currentSeasonRankModel = GamesManager.getInstance().rankingModel;
      }

      var currentSeasonLadderPositionModel = new DuelystBackbone.Model();
      currentSeasonLadderPositionModel.url = this.apiEndpointUrl + '/rank/current_ladder_position';
      currentSeasonLadderPositionModel.fetch();

      var currentSeasonGameCounterModel = new DuelystBackbone.Model();
      currentSeasonGameCounterModel.url = this.apiEndpointUrl + '/rank/history/' + moment().utc().startOf('month').format('YYYY-MM') + '/game_counter';
      currentSeasonGameCounterModel.fetch();

      //
      this.contentRegion.show(new ProfileRegionLoadingView());

      Promise.all([
        rankedGameCounterModel.onSyncOrReady(),
        gauntletGameCounterModel.onSyncOrReady(),
        gauntletTopRunWinCountModel.onSyncOrReady(),
        topRankModel.onSyncOrReady(),
        divisionStatsModel.onSyncOrReady(),
        factionProgressionModel.onSyncOrReady(),
        ribbonsCollection.onSyncOrReady(),
        currentSeasonRankModel.onSyncOrReady(),
        currentSeasonGameCounterModel.onSyncOrReady(),
        currentSeasonLadderPositionModel.onSyncOrReady(),
      ]).then(function () {
        if (this.isDestroyed) return; // view is destroyed

        // Add win streak to model
        var ribbons = [];
        _.each(SDK.RibbonFactory.ribbons, function (v, k) {
          var ribbon = _.clone(v);
          _.extend(ribbon, { count: 0 });
          ribbons.push(ribbon);
        });
        _.each(ribbonsCollection.toJSON(), function (r) {
          var ribbon = _.find(ribbons, function (ribbon) { return ribbon.id == r.ribbon_id; });
          if (ribbon)
            ribbon.count += 1;
        });

        this.cache.summary = new Backbone.Model({
          ranked: rankedGameCounterModel.attributes,
          gauntlet: gauntletGameCounterModel.attributes,
          run: gauntletTopRunWinCountModel.attributes,
          currentSeasonRank: currentSeasonRankModel.attributes,
          currentSeasonGameCounterModel: currentSeasonGameCounterModel.attributes,
          currentSeasonLadderPositionModel: currentSeasonLadderPositionModel.attributes,
          topRank: topRankModel.attributes,
          divisionStats: divisionStatsModel.attributes,
          factionProgression: factionProgressionModel.attributes,
          ribbons: ribbons,
        });

        this.contentRegion.show(new ProfileSummaryView({
          model: this.cache.summary,
        }));
      }.bind(this)).catch(function (error) {
        var errorMessage = '';
        if (error) {
          errorMessage = error.message;
        }
        Logger.module('UI').error('Error loading profile summary data', errorMessage);
        this.contentRegion.show(new ProfileErrorView({
          model: new Backbone.Model({ message: errorMessage }),
        }));
      }.bind(this));
    }

    //
    this.selectedTabValue = 'summary';
    this.ui.$profileTabs.children().removeClass('active');
    this.ui.$profileTabs.children('[data-value=\'' + this.selectedTabValue + '\']').addClass('active');
  },

  showRankHistory: function () {
    if (this.cache.rank_history) {
      this.contentRegion.show(new ProfileRankHistoryCollectionView({
        model: this.cache.rank_history,
      }));
    } else {
      var currentSeasonRankModel = null;
      if (this.model.userId) {
        var currentSeasonRankModel = new DuelystBackbone.Model();
        currentSeasonRankModel.url = this.apiEndpointUrl + '/rank/current';
        currentSeasonRankModel.fetch();
      } else {
        currentSeasonRankModel = GamesManager.getInstance().rankingModel;
      }

      //
      var rankHistoryCollection = new DuelystBackbone.Collection();
      rankHistoryCollection.url = this.apiEndpointUrl + '/rank/history';
      rankHistoryCollection.fetch();

      //
      var rankHistoryGameCounters = new DuelystBackbone.Collection();
      rankHistoryGameCounters.url = this.apiEndpointUrl + '/rank/history/game_counters';
      rankHistoryGameCounters.fetch();

      //
      var topRankModel = new DuelystBackbone.Model();
      topRankModel.url = this.apiEndpointUrl + '/rank/top';
      topRankModel.fetch();

      //
      var divisionStatsModel = new DuelystBackbone.Model();
      divisionStatsModel.url = this.apiEndpointUrl + '/rank/division_stats';
      divisionStatsModel.fetch();

      //
      this.contentRegion.show(new ProfileRegionLoadingView());

      Promise.all([
        rankHistoryCollection.onSyncOrReady(),
        topRankModel.onSyncOrReady(),
        divisionStatsModel.onSyncOrReady(),
        rankHistoryGameCounters.onSyncOrReady(),
      ]).then(function () {
        this.cache.rank_history = new Backbone.Model({
          currentSeasonRankModel: currentSeasonRankModel.toJSON(),
          rankHistory: rankHistoryCollection.toJSON(),
          topRank: topRankModel.attributes,
          divisionStats: divisionStatsModel.attributes,
          rankHistoryGameCounters: rankHistoryGameCounters.toJSON(),
        });
        this.contentRegion.show(new ProfileRankHistoryCollectionView({
          model: this.cache.rank_history,
        }));
      }.bind(this));
    }

    //
    this.selectedTabValue = 'rank_history';
    this.ui.$profileTabs.children().removeClass('active');
    this.ui.$profileTabs.children('[data-value=\'' + this.selectedTabValue + '\']').addClass('active');
  },

  showMatchHistory: function () {
    var matchHistoryCollectionView = null;

    if (this.cache['match_history_' + this.gamesHistoryPage]) {
      matchHistoryCollectionView = new ProfileMatchHistoryCollectionView({
        model: this.cache['match_history_' + this.gamesHistoryPage],
      });
      this.contentRegion.show(matchHistoryCollectionView);
      this.listenTo(matchHistoryCollectionView, 'next_page', this.onMatchHistoryPageNext);
    } else {
      //
      var gameHistoryCollection = new DuelystBackbone.Collection();
      gameHistoryCollection.url = this.apiEndpointUrl + '/games?page=' + this.gamesHistoryPage;
      gameHistoryCollection.fetch();

      //
      this.contentRegion.show(new ProfileRegionLoadingView());

      Promise.all([
        gameHistoryCollection.onSyncOrReady(),
      ]).then(function () {
        this.cache['match_history_' + this.gamesHistoryPage] = new Backbone.Model({
          matchHistory: gameHistoryCollection.toJSON(),
        });
        matchHistoryCollectionView = new ProfileMatchHistoryCollectionView({
          model: this.cache['match_history_' + this.gamesHistoryPage],
        });
        this.contentRegion.show(matchHistoryCollectionView);
        this.listenTo(matchHistoryCollectionView, 'next_page', this.onMatchHistoryPageNext);
      }.bind(this));
    }

    //
    this.selectedTabValue = 'match_history';
    this.ui.$profileTabs.children().removeClass('active');
    this.ui.$profileTabs.children('[data-value=\'' + this.selectedTabValue + '\']').addClass('active');
  },

  showRiftSummary: function () {
    if (this.cache.rift_summary) {
      this.contentRegion.show(new ProfileRiftSummary({
        model: this.cache.rift_summary,
      }));
    } else {
      var riftSummaryModel = new DuelystBackbone.Model();
      riftSummaryModel.url = this.apiEndpointUrl + '/rift';
      riftSummaryModel.fetch();

      this.contentRegion.show(new ProfileRegionLoadingView());

      Promise.all([
        riftSummaryModel.onSyncOrReady(),
      ]).then(function () {
        this.cache.rift_summary = new Backbone.Model(riftSummaryModel.toJSON());
        this.contentRegion.show(new ProfileRiftSummary({
          model: this.cache.rift_summary,
        }));
      }.bind(this));
    }

    this.selectedTabValue = 'rift_summary';
    this.ui.$profileTabs.children().removeClass('active');
    this.ui.$profileTabs.children('[data-value=\'' + this.selectedTabValue + '\']').addClass('active');
  },

  showFactionLevels: function () {
    if (this.cache.faction_levels) {
      this.contentRegion.show(new ProfileFactionLevelCollectionView({
        model: this.cache.faction_levels,
      }));
    } else {
      //
      var factionProgressionModel = new DuelystBackbone.Model();
      factionProgressionModel.url = this.apiEndpointUrl + '/faction_progression';
      factionProgressionModel.fetch();

      //
      this.contentRegion.show(new ProfileRegionLoadingView());

      Promise.all([
        factionProgressionModel.onSyncOrReady(),
      ]).then(function () {
        this.cache.faction_levels = new Backbone.Model({
          factionProgression: factionProgressionModel.toJSON(),
        });
        this.contentRegion.show(new ProfileFactionLevelCollectionView({
          model: this.cache.faction_levels,
        }));
      }.bind(this));
    }

    //
    this.selectedTabValue = 'faction_levels';
    this.ui.$profileTabs.children().removeClass('active');
    this.ui.$profileTabs.children('[data-value=\'' + this.selectedTabValue + '\']').addClass('active');
  },

  onMatchHistoryPageNext: function () {
    this.gamesHistoryPage += 1;
    this.showMatchHistory();
  },

});

// Expose the class either via CommonJS or the global object
module.exports = ProfileLayout;
