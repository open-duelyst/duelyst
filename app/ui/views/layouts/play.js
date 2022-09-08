// pragma PKGS: nongame

const SDK = require('app/sdk');
const RSX = require('app/data/resources');
const CONFIG = require('app/common/config');
const EventBus = require('app/common/eventbus');
const EVENTS = require('app/common/event_types');
const audio_engine = require('app/audio/audio_engine');
const UtilsEnv = require('app/common/utils/utils_env');
const NavigationManager = require('app/ui/managers/navigation_manager');
const GamesManager = require('app/ui/managers/games_manager');
const DecksCollection = require('app/ui/collections/decks');
const Animations = require('app/ui/views/animations');
const TransitionRegion = require('app/ui/views/regions/transition');
const ChallengeCategorySelectCompositeView = require('app/ui/views/composite/challenge_category_select');
const DeckSelectRankedCompositeView = require('app/ui/views/composite/deck_select_ranked');
const DeckSelectUnrankedCompositeView = require('app/ui/views/composite/deck_select_unranked');
const DeckSelectSinglePlayerCompositeView = require('app/ui/views/composite/deck_select_single_player');
const DeckSelectBossBattleCompositeView = require('app/ui/views/composite/deck_select_boss_battle');
const DeckSelectSandboxCompositeView = require('app/ui/views/composite/deck_select_sandbox');
const DeckSelectFriendlyCompositeView = require('app/ui/views/composite/deck_select_friendly');
const PlayModeSelectCompositeView = require('app/ui/views/composite/play_mode_select');
const PlayLayoutTempl = require('app/ui/templates/layouts/play.hbs');
const RiftDeckSelectLayout = require('app/ui/views2/rift/rift_layout');
const VirtualCollection = require('backbone-virtual-collection');
const ArenaLayout = require('./arena');

const PlayLayout = Backbone.Marionette.LayoutView.extend({

  id: 'app-play',
  template: PlayLayoutTempl,

  regions: {
    modeRegion: { selector: '.mode-region', regionClass: TransitionRegion },
  },

  animateIn: Animations.fadeIn,
  animateOut: Animations.fadeOut,

  /* region INITIALIZE */

  /* endregion INITIALIZE */

  /* region MARIONETTE EVENTS */

  onShow() {
    // play music
    audio_engine.current().play_music(RSX.music_playmode.audio);

    // listen to cancel
    this.listenTo(NavigationManager.getInstance(), EVENTS.user_triggered_cancel, this.onCancel);

    // show starting play mode
    this.showPlayMode(this.model.get('playModeIdentifier'));
  },

  /* endregion MARIONETTE EVENTS */

  /* region EVENTS */

  onCancel() {
    if (!NavigationManager.getInstance().getIsShowingModalView()) {
      GamesManager.getInstance().cancelMatchmaking();
    }
  },

  /* endregion EVENTS */

  /* region GETTERS / SETTERS */

  /* endregion GETTERS / SETTERS */

  /* region PLAY MODES */

  /**
   * Shows a play mode, or if no mode provided defaults to mode select. See SDK.PlayModes for all identifiers.
   * @param {String} [playModeIdentifier]
   */
  showPlayMode(playModeIdentifier) {
    // only allow string identifiers
    if (!_.isString(playModeIdentifier)) {
      playModeIdentifier = '';
    }

    // show new play mode
    this.model.set('playModeIdentifier', playModeIdentifier);

    let showPromise;
    if (playModeIdentifier === SDK.PlayModes.Practice) {
      showPromise = this.modeRegion.show(new DeckSelectSinglePlayerCompositeView({ model: new Backbone.Model(), collection: new VirtualCollection(new DecksCollection()) }));
    } else if (playModeIdentifier === SDK.PlayModes.Challenges) {
      showPromise = this.modeRegion.show(new ChallengeCategorySelectCompositeView({ model: new Backbone.Model(), collection: new Backbone.Collection() }));
    } else if (playModeIdentifier === SDK.PlayModes.Ranked) {
      showPromise = this.modeRegion.show(new DeckSelectRankedCompositeView({ model: new Backbone.Model(), collection: new VirtualCollection(new DecksCollection()) }));
    } else if (playModeIdentifier === SDK.PlayModes.Casual) {
      showPromise = this.modeRegion.show(new DeckSelectUnrankedCompositeView({ model: new Backbone.Model(), collection: new VirtualCollection(new DecksCollection()) }));
    } else if (playModeIdentifier === SDK.PlayModes.Gauntlet) {
      showPromise = this.modeRegion.show(new ArenaLayout());
    } else if (playModeIdentifier === SDK.PlayModes.BossBattle) {
      showPromise = this.modeRegion.show(new DeckSelectBossBattleCompositeView({ model: new Backbone.Model(), collection: new VirtualCollection(new DecksCollection()) }));
    } else if (playModeIdentifier === SDK.PlayModes.Sandbox) {
      showPromise = this.modeRegion.show(new DeckSelectSandboxCompositeView({ model: new Backbone.Model(), collection: new VirtualCollection(new DecksCollection()) }));
    } else if (playModeIdentifier === SDK.PlayModes.Developer && !UtilsEnv.getIsInProduction()) {
      showPromise = this.modeRegion.show(new DeckSelectSandboxCompositeView({ model: new Backbone.Model({ developer: true }), collection: new VirtualCollection(new DecksCollection()) }));
    } else if (playModeIdentifier === SDK.PlayModes.Friend) {
      showPromise = this.modeRegion.show(new DeckSelectFriendlyCompositeView({ model: new Backbone.Model(), collection: new VirtualCollection(new DecksCollection()) }));
    } else if (playModeIdentifier === SDK.PlayModes.Rift) {
      showPromise = this.modeRegion.show(new RiftDeckSelectLayout());
    } else {
      const playModesDisplayed = SDK.PlayModeFactory.getAllVisiblePlayModes();
      if (!UtilsEnv.getIsInProduction()) {
        const sandboxPlayMode = _.extend({}, SDK.PlayModeFactory.playModeForIdentifier(SDK.PlayModes.Sandbox));
        playModesDisplayed.push(sandboxPlayMode);
        const developerPlayMode = _.extend({}, SDK.PlayModeFactory.playModeForIdentifier(SDK.PlayModes.Developer));
        playModesDisplayed.push(developerPlayMode);
      }

      const playModesCollection = new Backbone.Collection(playModesDisplayed);
      const playModeSelectCompositeView = new PlayModeSelectCompositeView({ collection: playModesCollection });
      this.listenToOnce(playModeSelectCompositeView, 'select', (model) => {
        if (model != null) {
          EventBus.getInstance().trigger(EVENTS.show_play, model.get('id'));
        }
      });
      showPromise = this.modeRegion.show(playModeSelectCompositeView);
    }

    return showPromise;
  },

  /* endregion PLAY MODES */

});

// Expose the class either via CommonJS or the global object
module.exports = PlayLayout;
