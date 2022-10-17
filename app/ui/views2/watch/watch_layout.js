// pragma PKGS: nongame

'use strict';

var Logger = require('app/common/logger');
var CONFIG = require('app/common/config');
var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');
var UtilsJavascript = require('app/common/utils/utils_javascript');
var Scene = require('app/view/Scene');
var SDK = require('app/sdk');
var moment = require('moment');
var Promise = require('bluebird');
var RSX = require('app/data/resources');
var audio_engine = require('app/audio/audio_engine');

//
var Animations = require('app/ui/views/animations');
var NavigationManager = require('app/ui/managers/navigation_manager');
var GamesManager = require('app/ui/managers/games_manager');
var InventoryManager = require('app/ui/managers/inventory_manager');
var StreamManager = require('app/ui/managers/stream_manager');
var UtilsUI = require('app/common/utils/utils_ui');
var DuelystBackbone = require('app/ui/extensions/duelyst_backbone');
var DuelystFirebase = require('app/ui/extensions/duelyst_firebase');
var ErrorDialogItemView = require('app/ui/views/item/error_dialog');

// sub views
var WatchGamesCompositeView = require('./watch_games_composite');
var WatchStreamsCompositeView = require('./watch_streams_composite');
var WatchGamesLoadingView = require('./watch_games_loading');

// template
var Template = require('./templates/watch_layout.hbs');

var WatchLayout = Backbone.Marionette.LayoutView.extend({

  id: 'app_watch',
  className: 'modal duelyst-modal',
  template: Template,
  ui: {
    $tabs: '.nav-tabs',
    $watch_tabs_type: '#watch_tabs_type',
    $watch_tabs_division: '#watch_tabs_division',
    $watch_tabs_division_container: '#watch_tabs_division_container',
    $live_streams_tab_item: '#live_streams_tab_item',
  },
  regions: {
    contentRegion: '.content-region',
  },
  events: {
    'click ul#watch_tabs_type li': 'onWatchTypeTabChanged',
    'click ul#watch_tabs_division li': 'onDivisionTabChanged',
  },
  _selectedDivisionTabValue: null,
  _selectedGamesCollection: null,

  animateIn: Animations.fadeIn,
  animateOut: Animations.fadeOut,

  onResize: function () {
    this.render();
  },

  onRender: function () {
    if (StreamManager.getInstance().liveStreamCollection.length > 0) {
      this.ui.$live_streams_tab_item.addClass('any-live');
      this.setSelectedWatchTypeTab('live');
    } else {
      // this.ui.$watch_tabs_type.hide()
      this.showSelectedDivisionTab();
    }
  },

  onShow: function () {
    this._previousBlurProgramKey = Scene.getInstance().getFX().surfaceBlurShaderProgramKey;
    if (this._screenBlurId == null) {
      this._screenBlurId = UtilsJavascript.generateIncrementalId();
    }
    Scene.getInstance().getFX().screenBlurShaderProgramKey = 'BlurFullScreenMega';
    Scene.getInstance().getFX().requestBlurScreen(this._screenBlurId);

    // listen to global events
    this.listenTo(EventBus.getInstance(), EVENTS.resize, this.onResize);

    // start on bronze
    if (this._selectedWatchTypeTabValue == 'replays') {
      this._selectedDivisionTabValue = 'bronze';
      this.animateReveal();
    }
  },

  animateReveal: function () {
    var tabs = this.$el.find('.nav-tabs > li');

    var delay = 0;

    for (var i = 0; i < tabs.length; i++) {
      $(tabs[i]).css('opacity', 0);
      tabs[i].animate([
        { opacity: 0.0, transform: 'translateY(1.0rem)' },
        { opacity: 1.0, transform: 'translateY(0)' },
      ], {
        duration: 200,
        delay: delay,
        easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
        fill: 'forwards',
      });
      delay += 100;
    }
  },

  onPrepareForDestroy: function () {
    Scene.getInstance().getFX().screenBlurShaderProgramKey = this._previousBlurProgramKey;
    Scene.getInstance().getFX().requestUnblurScreen(this._screenBlurId);
  },

  onDestroy: function () {
    if (this._selectedGamesCollection != null) {
      this._selectedGamesCollection.off();
      this._selectedGamesCollection = null;
    }
  },

  onWatchTypeTabChanged: function (e) {
    var li = $(e.currentTarget);
    var selectedTabValue = li.data('value');
    this.setSelectedWatchTypeTab(selectedTabValue);
  },

  setSelectedWatchTypeTab: function (selectedTabValue) {
    if (selectedTabValue !== this._selectedWatchTypeTabValue) {
      this._selectedWatchTypeTabValue = selectedTabValue;
      audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_tab_in.audio, CONFIG.SELECT_SFX_PRIORITY);
      this.ui.$watch_tabs_type.children().removeClass('active');
      this.ui.$watch_tabs_type.find('[data-value=\'' + this._selectedWatchTypeTabValue + '\']').addClass('active');
      this.showSelectedWatchTypeTab();
    }
  },

  showSelectedWatchTypeTab: function () {
    switch (this._selectedWatchTypeTabValue) {
    case 'live':
      this.contentRegion.show(new WatchGamesLoadingView());
      StreamManager.getInstance().loadStreamStatusFromTwitch().then(function () {
        if (this.isDestroyed) return; // this view was destroyed
        this.contentRegion.show(new WatchStreamsCompositeView({ collection: StreamManager.getInstance().liveStreamCollection }));
      }.bind(this));
      this._selectedDivisionTabValue = null;
      this.ui.$watch_tabs_division.children().removeClass('active');
      break;
    case 'replays':
      this.setSelectedDivisionTab('bronze');
      break;
    default:
      break;
    }
  },

  onDivisionTabChanged: function (e) {
    var li = $(e.currentTarget);
    var selectedTabValue = li.data('value');
    this.setSelectedDivisionTab(selectedTabValue);
  },

  setSelectedDivisionTab: function (selectedTabValue) {
    if (selectedTabValue !== this._selectedDivisionTabValue) {
      this._selectedDivisionTabValue = selectedTabValue;
      audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_tab_in.audio, CONFIG.SELECT_SFX_PRIORITY);
      //
      this.ui.$watch_tabs_division.children().removeClass('active');
      this.ui.$watch_tabs_division.find('[data-value=\'' + this._selectedDivisionTabValue + '\']').addClass('active');
      //
      this._selectedWatchTypeTabValue = 'replays';
      this.ui.$watch_tabs_type.children().removeClass('active');
      this.ui.$watch_tabs_type.find('[data-value=\'' + this._selectedWatchTypeTabValue + '\']').addClass('active');
      //
      this.showSelectedDivisionTab();
    }
  },

  showSelectedDivisionTab: function () {
    var gamesCollectionURL;
    switch (this._selectedDivisionTabValue) {
    case 'elite':
      gamesCollectionURL = process.env.API_URL + '/api/me/games/watchable/elite';
      break;
    case 'diamond':
      gamesCollectionURL = process.env.API_URL + '/api/me/games/watchable/diamond';
      break;
    case 'gold':
      gamesCollectionURL = process.env.API_URL + '/api/me/games/watchable/gold';
      break;
    case 'silver':
      gamesCollectionURL = process.env.API_URL + '/api/me/games/watchable/silver';
      break;
    default:
      gamesCollectionURL = process.env.API_URL + '/api/me/games/watchable/bronze';
      break;
    }

    if (this._selectedGamesCollection == null || this._selectedGamesCollection.url !== gamesCollectionURL) {
      this._selectedGamesCollection = new DuelystBackbone.Collection();
      this._selectedGamesCollection.url = gamesCollectionURL;

      // show loading view
      this.contentRegion.show(new WatchGamesLoadingView());

      // load games
      this._selectedGamesCollection.fetch();
    }

    // show games
    this._selectedGamesCollection.onSyncOrReady().then(function () {
      if (this.isDestroyed) return; // this view was destroyed
      if (this._selectedGamesCollection != null) {
        this.contentRegion.show(new WatchGamesCompositeView({
          collection: this._selectedGamesCollection,
        }));
      }
    }.bind(this)).catch(function (e) {
      NavigationManager.getInstance().showDialogView(new ErrorDialogItemView({ title: e.message }));
    }.bind(this));
  },

});

// Expose the class either via CommonJS or the global object
module.exports = WatchLayout;
