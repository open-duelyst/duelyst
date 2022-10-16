// pragma PKGS: nongame

// global libs
const Logger = require('app/common/logger');
const CONFIG = require('app/common/config');
const generatePushID = require('app/common/generate_push_id');
const Scene = require('app/view/Scene');
const SDK = require('app/sdk');
const moment = require('moment');
const Promise = require('bluebird');
const RSX = require('app/data/resources');
const audio_engine = require('app/audio/audio_engine');
// template
//
const Animations = require('app/ui/views/animations');
const NavigationManager = require('app/ui/managers/navigation_manager');
const GamesManager = require('app/ui/managers/games_manager');
const InventoryManager = require('app/ui/managers/inventory_manager');
const UtilsUI = require('app/common/utils/utils_ui');
const DuelystBackbone = require('app/ui/extensions/duelyst_backbone');
const DuelystFirebase = require('app/ui/extensions/duelyst_firebase');
const ChangePortraitItemView = require('app/ui/views/item/change_portrait');
const ChangeUsernameItemView = require('app/ui/views/item/change_username');
const ChangePasswordItemView = require('app/ui/views/item/change_password');
const ConfirmDialogItemView = require('app/ui/views/item/confirm_dialog');
// region views
const ProfileManager = require('app/ui/managers/profile_manager');
const openUrl = require('app/common/openUrl');
const ProfileErrorView = require('./profile_error_item');
const ProfileRegionLoadingView = require('./profile_region_loading_item');
const ProfileSummaryView = require('./profile_summary_item');
const ProfileRiftSummary = require('./profile_rift_summary_item');
const ProfileFactionLevelCollectionView = require('./profile_faction_level_collection');
const ProfileRankHistoryCollectionView = require('./profile_rank_history_collection');
const ProfileMatchHistoryCollectionView = require('./profile_match_history_collection');
const ProfileTemplate = require('./templates/profile_layout.hbs');

const ProfileLayout = Backbone.Marionette.LayoutView.extend({

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

  serializeModel(model) {
    const data = model.toJSON.apply(model, _.rest(arguments));
    data.isViewingBuddyProfile = model.userId != null;
    if (!data.isViewingBuddyProfile) {
      data.season_count = Math.floor(moment.duration(moment().utc().valueOf() - data.created_at).asMonths());
    }
    if (!data.rank && data.presence) {
      data.rank = data.presence.rank;
    }
    return data;
  },

  initialize() {
    // generate unique id for requests
    this._requestId = generatePushID();

    this.cache = {};

    if (this.model.userId) {
      this.apiEndpointUrl = `${process.env.API_URL}/api/users/${this.model.userId}`;
    } else {
      this.apiEndpointUrl = `${process.env.API_URL}/api/me`;
    }
  },

  onRender() {
    this._bindPortrait();
    this.showSelectedTab();

    if (window.isSteam) {
      this.$el.find('.change-password').text('Set Password');
    }
  },

  onShow() {
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

  onPrepareForDestroy() {
    // reset gradient color mapping
    Scene.getInstance().getFX().clearGradientColorMap(this._requestId, CONFIG.ANIMATE_MEDIUM_DURATION);
  },

  onDestroy() {
  },

  onChangePortraitClick() {
    NavigationManager.getInstance().showDialogView(new ChangePortraitItemView({ model: new Backbone.Model() }));
  },

  _bindPortrait() {
    let portraitId;
    if (this.model.userId != null) {
      // viewing buddy
      portraitId = this.model.get('portrait_id');
    } else {
      // viewing self
      portraitId = ProfileManager.getInstance().profile.get('presence').portrait_id;
    }
    const portraitData = SDK.CosmeticsFactory.profileIconForIdentifier(portraitId);
    const portraitImg = portraitData.img;
    const portraitScaledImg = RSX.getResourcePathForScale(portraitImg, CONFIG.resourceScaleCSS);
    this.ui.$portraitImg.attr('src', portraitScaledImg);
  },

  onChangeUsernameClicked(e) {
    const changeUsernameItemView = new ChangeUsernameItemView({ model: ProfileManager.getInstance().profile });
    changeUsernameItemView.listenTo(changeUsernameItemView, 'success', () => {
      this.ui.$usernameContent.text(ProfileManager.getInstance().get('username'));
    });
    NavigationManager.getInstance().showDialogView(changeUsernameItemView);
  },

  onChangePasswordClicked(e) {
    if (!window.isSteam) {
      NavigationManager.getInstance().showDialogView(new ChangePasswordItemView());
    } else {
      const confirmDialogItemView = new ConfirmDialogItemView({ title: 'Click OK and use the forgot password system to set a password for use outside of Steam.' });
      this.listenToOnce(confirmDialogItemView, 'confirm', () => {
        openUrl(`${process.env.API_URL}/forgot`);
      });
      this.listenToOnce(confirmDialogItemView, 'cancel', () => {
        this.stopListening(confirmDialogItemView);
      });
      NavigationManager.getInstance().showDialogView(confirmDialogItemView);
    }
  },

  onTabChanged(e) {
    const li = $(e.currentTarget);
    const selectedTabValue = li.data('value');
    this.setSelectedTab(selectedTabValue);
  },

  setSelectedTab(selectedTabValue) {
    if (selectedTabValue !== this.selectedTabValue) {
      this.gamesHistoryPage = 0;
      this.selectedTabValue = selectedTabValue;
      audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_tab_in.audio, CONFIG.SELECT_SFX_PRIORITY);
      this.showSelectedTab();
    }
  },

  showSelectedTab() {
    this.ui.$profileTabs.children().removeClass('active');
    if (this.selectedTabValue != null) {
      this.ui.$profileTabs.find(`[data-value='${this.selectedTabValue}']`).addClass('active');
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

  showSummary() {
    if (this.cache.summary) {
      this.contentRegion.show(new ProfileSummaryView({
        model: this.cache.summary,
      }));
    } else {
      //
      const rankedGameCounterModel = new DuelystBackbone.Model();
      rankedGameCounterModel.url = `${this.apiEndpointUrl}/stats/games/ranked`;
      rankedGameCounterModel.fetch();

      //
      const gauntletGameCounterModel = new DuelystBackbone.Model();
      gauntletGameCounterModel.url = `${this.apiEndpointUrl}/stats/games/gauntlet`;
      gauntletGameCounterModel.fetch();

      //
      const gauntletTopRunWinCountModel = new DuelystBackbone.Model();
      gauntletTopRunWinCountModel.url = `${this.apiEndpointUrl}/stats/gauntlet_runs/top/win_count`;
      gauntletTopRunWinCountModel.fetch();

      //
      const topRankModel = new DuelystBackbone.Model();
      topRankModel.url = `${this.apiEndpointUrl}/rank/top`;
      topRankModel.fetch();

      //
      const divisionStatsModel = new DuelystBackbone.Model();
      divisionStatsModel.url = `${this.apiEndpointUrl}/rank/division_stats`;
      divisionStatsModel.fetch();

      //
      const factionProgressionModel = new DuelystBackbone.Model();
      factionProgressionModel.url = `${this.apiEndpointUrl}/faction_progression`;
      factionProgressionModel.fetch();

      //
      const ribbonsCollection = new DuelystBackbone.Collection();
      ribbonsCollection.url = `${this.apiEndpointUrl}/ribbons`;
      ribbonsCollection.fetch();

      var currentSeasonRankModel = null;
      if (this.model.userId) {
        var currentSeasonRankModel = new DuelystBackbone.Model();
        currentSeasonRankModel.url = `${this.apiEndpointUrl}/rank/current`;
        currentSeasonRankModel.fetch();
      } else {
        currentSeasonRankModel = GamesManager.getInstance().rankingModel;
      }

      const currentSeasonLadderPositionModel = new DuelystBackbone.Model();
      currentSeasonLadderPositionModel.url = `${this.apiEndpointUrl}/rank/current_ladder_position`;
      currentSeasonLadderPositionModel.fetch();

      const currentSeasonGameCounterModel = new DuelystBackbone.Model();
      currentSeasonGameCounterModel.url = `${this.apiEndpointUrl}/rank/history/${moment().utc().startOf('month').format('YYYY-MM')}/game_counter`;
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
      ]).then(() => {
        if (this.isDestroyed) return; // view is destroyed

        // Add win streak to model
        const ribbons = [];
        _.each(SDK.RibbonFactory.ribbons, (v, k) => {
          const ribbon = _.clone(v);
          _.extend(ribbon, { count: 0 });
          ribbons.push(ribbon);
        });
        _.each(ribbonsCollection.toJSON(), (r) => {
          const ribbon = _.find(ribbons, (ribbon) => ribbon.id == r.ribbon_id);
          if (ribbon) ribbon.count += 1;
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
          ribbons,
        });

        this.contentRegion.show(new ProfileSummaryView({
          model: this.cache.summary,
        }));
      }).catch((error) => {
        let errorMessage = '';
        if (error) {
          errorMessage = error.message;
        }
        Logger.module('UI').error('Error loading profile summary data', errorMessage);
        this.contentRegion.show(new ProfileErrorView({
          model: new Backbone.Model({ message: errorMessage }),
        }));
      });
    }

    //
    this.selectedTabValue = 'summary';
    this.ui.$profileTabs.children().removeClass('active');
    this.ui.$profileTabs.children(`[data-value='${this.selectedTabValue}']`).addClass('active');
  },

  showRankHistory() {
    if (this.cache.rank_history) {
      this.contentRegion.show(new ProfileRankHistoryCollectionView({
        model: this.cache.rank_history,
      }));
    } else {
      var currentSeasonRankModel = null;
      if (this.model.userId) {
        var currentSeasonRankModel = new DuelystBackbone.Model();
        currentSeasonRankModel.url = `${this.apiEndpointUrl}/rank/current`;
        currentSeasonRankModel.fetch();
      } else {
        currentSeasonRankModel = GamesManager.getInstance().rankingModel;
      }

      //
      const rankHistoryCollection = new DuelystBackbone.Collection();
      rankHistoryCollection.url = `${this.apiEndpointUrl}/rank/history`;
      rankHistoryCollection.fetch();

      //
      const rankHistoryGameCounters = new DuelystBackbone.Collection();
      rankHistoryGameCounters.url = `${this.apiEndpointUrl}/rank/history/game_counters`;
      rankHistoryGameCounters.fetch();

      //
      const topRankModel = new DuelystBackbone.Model();
      topRankModel.url = `${this.apiEndpointUrl}/rank/top`;
      topRankModel.fetch();

      //
      const divisionStatsModel = new DuelystBackbone.Model();
      divisionStatsModel.url = `${this.apiEndpointUrl}/rank/division_stats`;
      divisionStatsModel.fetch();

      //
      this.contentRegion.show(new ProfileRegionLoadingView());

      Promise.all([
        rankHistoryCollection.onSyncOrReady(),
        topRankModel.onSyncOrReady(),
        divisionStatsModel.onSyncOrReady(),
        rankHistoryGameCounters.onSyncOrReady(),
      ]).then(() => {
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
      });
    }

    //
    this.selectedTabValue = 'rank_history';
    this.ui.$profileTabs.children().removeClass('active');
    this.ui.$profileTabs.children(`[data-value='${this.selectedTabValue}']`).addClass('active');
  },

  showMatchHistory() {
    let matchHistoryCollectionView = null;

    if (this.cache[`match_history_${this.gamesHistoryPage}`]) {
      matchHistoryCollectionView = new ProfileMatchHistoryCollectionView({
        model: this.cache[`match_history_${this.gamesHistoryPage}`],
      });
      this.contentRegion.show(matchHistoryCollectionView);
      this.listenTo(matchHistoryCollectionView, 'next_page', this.onMatchHistoryPageNext);
    } else {
      //
      const gameHistoryCollection = new DuelystBackbone.Collection();
      gameHistoryCollection.url = `${this.apiEndpointUrl}/games?page=${this.gamesHistoryPage}`;
      gameHistoryCollection.fetch();

      //
      this.contentRegion.show(new ProfileRegionLoadingView());

      Promise.all([
        gameHistoryCollection.onSyncOrReady(),
      ]).then(() => {
        this.cache[`match_history_${this.gamesHistoryPage}`] = new Backbone.Model({
          matchHistory: gameHistoryCollection.toJSON(),
        });
        matchHistoryCollectionView = new ProfileMatchHistoryCollectionView({
          model: this.cache[`match_history_${this.gamesHistoryPage}`],
        });
        this.contentRegion.show(matchHistoryCollectionView);
        this.listenTo(matchHistoryCollectionView, 'next_page', this.onMatchHistoryPageNext);
      });
    }

    //
    this.selectedTabValue = 'match_history';
    this.ui.$profileTabs.children().removeClass('active');
    this.ui.$profileTabs.children(`[data-value='${this.selectedTabValue}']`).addClass('active');
  },

  showRiftSummary() {
    if (this.cache.rift_summary) {
      this.contentRegion.show(new ProfileRiftSummary({
        model: this.cache.rift_summary,
      }));
    } else {
      const riftSummaryModel = new DuelystBackbone.Model();
      riftSummaryModel.url = `${this.apiEndpointUrl}/rift`;
      riftSummaryModel.fetch();

      this.contentRegion.show(new ProfileRegionLoadingView());

      Promise.all([
        riftSummaryModel.onSyncOrReady(),
      ]).then(() => {
        this.cache.rift_summary = new Backbone.Model(riftSummaryModel.toJSON());
        this.contentRegion.show(new ProfileRiftSummary({
          model: this.cache.rift_summary,
        }));
      });
    }

    this.selectedTabValue = 'rift_summary';
    this.ui.$profileTabs.children().removeClass('active');
    this.ui.$profileTabs.children(`[data-value='${this.selectedTabValue}']`).addClass('active');
  },

  showFactionLevels() {
    if (this.cache.faction_levels) {
      this.contentRegion.show(new ProfileFactionLevelCollectionView({
        model: this.cache.faction_levels,
      }));
    } else {
      //
      const factionProgressionModel = new DuelystBackbone.Model();
      factionProgressionModel.url = `${this.apiEndpointUrl}/faction_progression`;
      factionProgressionModel.fetch();

      //
      this.contentRegion.show(new ProfileRegionLoadingView());

      Promise.all([
        factionProgressionModel.onSyncOrReady(),
      ]).then(() => {
        this.cache.faction_levels = new Backbone.Model({
          factionProgression: factionProgressionModel.toJSON(),
        });
        this.contentRegion.show(new ProfileFactionLevelCollectionView({
          model: this.cache.faction_levels,
        }));
      });
    }

    //
    this.selectedTabValue = 'faction_levels';
    this.ui.$profileTabs.children().removeClass('active');
    this.ui.$profileTabs.children(`[data-value='${this.selectedTabValue}']`).addClass('active');
  },

  onMatchHistoryPageNext() {
    this.gamesHistoryPage += 1;
    this.showMatchHistory();
  },

});

// Expose the class either via CommonJS or the global object
module.exports = ProfileLayout;
