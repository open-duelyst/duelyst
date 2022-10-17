// pragma PKGS: codex

'use strict';

var SDK = require('app/sdk');
var Scene = require('app/view/Scene');
var CONFIG = require('app/common/config');
var PKGS = require('app/data/packages');
var RSX = require('app/data/resources');
var CodexLayer = require('app/view/layers/codex/CodexLayer');
var CodexChapterLayer = require('app/view/layers/codex/CodexChapterLayer');
var WorldMapLayer = require('app/view/layers/codex/WorldMapLayer');
var audio_engine = require('app/audio/audio_engine');
var PackageManager = require('app/ui/managers/package_manager');
var NavigationManager = require('app/ui/managers/navigation_manager');
var ActivityDialogItemView = require('app/ui/views/item/activity_dialog');
var Animations = require('app/ui/views/animations');
var Promise = require('bluebird');
var CodexLayoutTempl = require('./templates/codex_layout.hbs');
var CodexChapterSelectCompositeView = require('./codex_chapter_select');
var CodexChapterItemView = require('./codex_chapter');

var STATE_CHAPTERS = 1;
var STATE_CHAPTER = 2;
var STATE_WORLD_MAP = 3;

var CodexLayout = Backbone.Marionette.LayoutView.extend({

  id: 'app-codex',
  // className: "",
  template: CodexLayoutTempl,

  regions: {
    chaptersRegion: { selector: '.chapters-region' },
    chapterRegion: { selector: '.chapter-region' },
  },

  ui: {
    $lore: '.lore',
    $showWorldMap: '.show-world-map',
    $hideWorldMap: '.hide-world-map',
  },

  events: {
    'click .show-world-map': 'onClickShowWorldMap',
    'click .hide-world-map': 'onClickHideWorldMap',
  },

  animateIn: Animations.fadeIn,
  animateOut: Animations.fadeOut,

  _state: null,
  _previousState: null,
  _chapterId: null,
  _loadedChapterPkgId: null,
  _chapterPromise: null,
  _unloadPromise: null,

  /* region MARIONETTE EVENTS */

  onShow: function () {
    // hide interactive elements
    this.ui.$showWorldMap.addClass('hide');
    this.ui.$hideWorldMap.addClass('hide');

    // show codex content
    Scene.getInstance().showContentByClass(CodexLayer, true);

    this.whenRequiredResourcesReady().then(function (requestId) {
      if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

      // setup chapters
      var chaptersDisplayed = SDK.Codex.getAllChapters();
      var chaptersCollection = new Backbone.Collection(chaptersDisplayed);
      var chapterSelectCompositeView = new CodexChapterSelectCompositeView({ collection: chaptersCollection });
      this.listenTo(chapterSelectCompositeView, 'select', function (model) {
        if (model != null) {
          this.setState(STATE_CHAPTER, model.get('id'));
        }
      });
      this.chaptersRegion.show(chapterSelectCompositeView);

      // show lore
      this._showLore();

      // set starting state to chapters
      this.setState(STATE_CHAPTERS);

      // shoiw interactive elements
      this.ui.$showWorldMap.removeClass('hide');
      this.ui.$hideWorldMap.removeClass('hide');
    }.bind(this));
  },

  getRequiredResources: function () {
    return Backbone.Marionette.LayoutView.prototype.getRequiredResources.call(this).concat(PKGS.getPkgForIdentifier('codex'));
  },

  onPrepareForDestroy: function () {
    Promise.all([
      this.chapterRegion.empty(),
      Scene.getInstance().destroyOverlayByClass(CodexChapterLayer),
    ]).then(function () {
      this._unloadCurrentChapterResources();
    }.bind(this));
  },

  /* endregion MARIONETTE EVENTS */

  /* region CUSTOM EVENTS */

  onClickShowWorldMap: function () {
    this.setState(STATE_WORLD_MAP);
  },

  onClickHideWorldMap: function () {
    NavigationManager.getInstance().showLastRoute();
  },

  /* endregion CUSTOM EVENTS */

  /* region STATES */

  /**
   * Sets the current codex state, and passes any other arguments to the show state method.
   * @param {Number} state
   * @params {*}
   */
  setState: function (state) {
    if (state !== this._state) {
      // swap states
      this._previousState = this._state;
      this._state = state;

      // hide old state
      if (this._previousState === STATE_WORLD_MAP) {
        this._stopShowingWorldMap();
      } else if (this._previousState === STATE_CHAPTER) {
        this._stopShowingChapter();
      } else if (this._previousState === STATE_CHAPTERS) {
        this._stopShowingChapters();
      }

      // get state arguments
      var stateArgs = Array.prototype.slice.call(arguments, 1);

      // show new state
      if (this._state === STATE_WORLD_MAP) {
        this._showWorldMap.apply(this, stateArgs);
      } else if (this._state === STATE_CHAPTER) {
        this._showChapter.apply(this, stateArgs);
      } else if (this._state === STATE_CHAPTERS) {
        this._showChapters.apply(this, stateArgs);
      }
    }
  },

  /* region LORE */

  /**
   * Shows the lore and returns a promise.
   * @private
   * @returns {Promise}
   */
  _showLore: function () {
    // set css state
    this.$el.addClass('state-lore');

    Animations.fadeIn.call(this.ui.$lore);

    return Promise.resolve();
  },

  /**
   * Hides the lore and returns a promise.
   * @private
   * @returns {Promise}
   */
  _stopShowingLore: function () {
    // set css state
    this.$el.removeClass('state-lore');

    Animations.fadeOut.call(this.ui.$lore);

    return Promise.resolve();
  },

  /**
   * Shows chapters and returns a promise.
   * @private
   * @returns {Promise}
   */
  _showChapters: function () {
    // add mode to route
    NavigationManager.getInstance().resetMinorRoutes();
    NavigationManager.getInstance().addMinorRoute('chapters', this.setState, this, [STATE_CHAPTERS]);

    // start music
    audio_engine.current().play_music(RSX.music_codex.audio);

    // show chapters region
    if (this.chaptersRegion.currentView != null) {
      Animations.fadeIn.call(this.chaptersRegion.currentView);
    }

    return Promise.resolve();
  },

  /**
   * Stops showing chapters and returns a promise.
   * @private
   * @returns {Promise}
   */
  _stopShowingChapters: function () {
    // hide chapters region
    if (this.chaptersRegion.currentView != null) {
      Animations.fadeOut.call(this.chaptersRegion.currentView);
    }
  },

  /**
   * Shows a chapter and returns a promise.
   * @param {String} chapterId
   * @private
   * @returns {Promise}
   */
  _showChapter: function (chapterId) {
    if (chapterId != null) {
      // get chapter data for id
      var chapterData = SDK.Codex.chapterForIdentifier(chapterId);

      // add mode to route
      NavigationManager.getInstance().addMinorRoute('chapter', this.setState, this, [STATE_CHAPTER, chapterId]);

      // Analytics call
      Analytics.track('read codex chapter', {
        category: Analytics.EventCategory.Codex,
        chapter_id: chapterId,
      }, {
        nonInteraction: 1,
      });

      if (this._chapterId == null || this._chapterId !== chapterId) {
        // set new chapter
        this._chapterId = chapterId;

        // show activity dialog
        NavigationManager.getInstance().showDialogView(new ActivityDialogItemView());

        // store loaded chapter package id
        var chapterPkgId = PKGS.getChapterPkgIdentifier(chapterId);
        var previousLoadedPackageId = this._loadedChapterPkgId;
        this._loadedChapterPkgId = chapterPkgId;

        // load new resources
        this._chapterPromise = PackageManager.getInstance().loadMinorPackage(chapterPkgId).then(function () {
          // remove activity dialog
          NavigationManager.getInstance().destroyDialogView();

          // setup promises
          var promises = [];

          // unload previous
          promises.push(PackageManager.getInstance().unloadMajorMinorPackage(previousLoadedPackageId));

          // check that loaded is same as current
          if (this._loadedChapterPkgId === chapterPkgId) {
            // show chapter ui
            promises.push(this.chapterRegion.show(new CodexChapterItemView({ model: new Backbone.Model(chapterData) })));

            // show chapter visuals
            var chapterLayer = Scene.getInstance().getOverlay();
            if (chapterLayer instanceof CodexChapterLayer) {
              chapterLayer.showChapter(chapterData.background);
              chapterLayer.fadeTo(CONFIG.VIEW_TRANSITION_DURATION, 255.0);
            } else {
              chapterLayer = new CodexChapterLayer();
              promises.push(Scene.getInstance().showOverlay(chapterLayer));
              chapterLayer.showChapter(chapterData.background);
            }
          }

          return Promise.all(promises);
        }.bind(this));
      } else if (this.chapterRegion.currentView != null) {
        // show chapter ui
        var codexChapterItemView = this.chapterRegion.currentView;
        if (codexChapterItemView instanceof CodexChapterItemView) {
          codexChapterItemView.show(this._previousState !== STATE_WORLD_MAP);
        }

        // show chapter visuals
        var chapterLayer = Scene.getInstance().getOverlay();
        if (chapterLayer instanceof CodexChapterLayer) {
          chapterLayer.showChapter(chapterData.background);
          chapterLayer.fadeTo(CONFIG.VIEW_TRANSITION_DURATION, 255.0);
        } else {
          chapterLayer = new CodexChapterLayer();
          Scene.getInstance().showOverlay(chapterLayer);
          chapterLayer.showChapter(chapterData.background);
        }
      }
    }

    return this._chapterPromise;
  },

  _unloadCurrentChapterResources: function () {
    if (this._loadedChapterPkgId != null) {
      this._unloadPromise = PackageManager.getInstance().unloadMajorMinorPackage(this._loadedChapterPkgId);
      this._loadedChapterPkgId = null;
    }

    return this._unloadPromise;
  },

  /**
   * Stops showing the currently showing chapter and returns a promise.
   * @private
   * @returns {Promise}
   */
  _stopShowingChapter: function () {
    // hide chapter ui
    var codexChapterItemView = this.chapterRegion.currentView;
    if (codexChapterItemView instanceof CodexChapterItemView) {
      codexChapterItemView.hide(this._state !== STATE_WORLD_MAP);
    }

    // hide chapter visuals
    var chapterLayer = Scene.getInstance().getOverlay();
    if (chapterLayer instanceof CodexChapterLayer) {
      chapterLayer.fadeToInvisible(CONFIG.VIEW_TRANSITION_DURATION);
    }

    return Promise.resolve();
  },

  /* endregion LORE */

  /* region MAP */

  /**
   * Shows the world map and returns a promise.
   * @private
   * @returns {Promise}
   */
  _showWorldMap: function () {
    // add mode to route
    NavigationManager.getInstance().addMinorRoute('world_map', this.setState, this, [STATE_WORLD_MAP]);

    // play audio
    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_tab_in.audio, CONFIG.SHOW_SFX_PRIORITY);

    // stop showing lore
    this._stopShowingLore();

    // set css state
    this.$el.addClass('state-world-map');

    // show overlay
    Scene.getInstance().showOverlayByClass(WorldMapLayer);

    return Promise.resolve();
  },

  /**
   * Stops showing the world map and returns a promise.
   * @private
   * @returns {Promise}
   */
  _stopShowingWorldMap: function () {
    // play audio
    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_tab_out.audio, CONFIG.HIDE_SFX_PRIORITY);

    // set css state
    this.$el.removeClass('state-world-map');

    // destroy overlay
    Scene.getInstance().destroyOverlayByClass(WorldMapLayer);

    // show lore
    this._showLore();

    return Promise.resolve();
  },

  /* endregion MAP */

  /* endregion STATES */

});

// Expose the class either via CommonJS or the global object
module.exports = CodexLayout;
