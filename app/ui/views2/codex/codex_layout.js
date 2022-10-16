// pragma PKGS: codex

const SDK = require('app/sdk');
const Scene = require('app/view/Scene');
const CONFIG = require('app/common/config');
const PKGS = require('app/data/packages');
const RSX = require('app/data/resources');
const CodexLayer = require('app/view/layers/codex/CodexLayer');
const CodexChapterLayer = require('app/view/layers/codex/CodexChapterLayer');
const WorldMapLayer = require('app/view/layers/codex/WorldMapLayer');
const audio_engine = require('app/audio/audio_engine');
const PackageManager = require('app/ui/managers/package_manager');
const NavigationManager = require('app/ui/managers/navigation_manager');
const ActivityDialogItemView = require('app/ui/views/item/activity_dialog');
const Animations = require('app/ui/views/animations');
const Promise = require('bluebird');
const CodexLayoutTempl = require('./templates/codex_layout.hbs');
const CodexChapterSelectCompositeView = require('./codex_chapter_select');
const CodexChapterItemView = require('./codex_chapter');

const STATE_CHAPTERS = 1;
const STATE_CHAPTER = 2;
const STATE_WORLD_MAP = 3;

const CodexLayout = Backbone.Marionette.LayoutView.extend({

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

  onShow() {
    // hide interactive elements
    this.ui.$showWorldMap.addClass('hide');
    this.ui.$hideWorldMap.addClass('hide');

    // show codex content
    Scene.getInstance().showContentByClass(CodexLayer, true);

    this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

      // setup chapters
      const chaptersDisplayed = SDK.Codex.getAllChapters();
      const chaptersCollection = new Backbone.Collection(chaptersDisplayed);
      const chapterSelectCompositeView = new CodexChapterSelectCompositeView({ collection: chaptersCollection });
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
    });
  },

  getRequiredResources() {
    return Backbone.Marionette.LayoutView.prototype.getRequiredResources.call(this).concat(PKGS.getPkgForIdentifier('codex'));
  },

  onPrepareForDestroy() {
    Promise.all([
      this.chapterRegion.empty(),
      Scene.getInstance().destroyOverlayByClass(CodexChapterLayer),
    ]).then(() => {
      this._unloadCurrentChapterResources();
    });
  },

  /* endregion MARIONETTE EVENTS */

  /* region CUSTOM EVENTS */

  onClickShowWorldMap() {
    this.setState(STATE_WORLD_MAP);
  },

  onClickHideWorldMap() {
    NavigationManager.getInstance().showLastRoute();
  },

  /* endregion CUSTOM EVENTS */

  /* region STATES */

  /**
   * Sets the current codex state, and passes any other arguments to the show state method.
   * @param {Number} state
   * @params {*}
   */
  setState(state) {
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
      const stateArgs = Array.prototype.slice.call(arguments, 1);

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
  _showLore() {
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
  _stopShowingLore() {
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
  _showChapters() {
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
  _stopShowingChapters() {
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
  _showChapter(chapterId) {
    if (chapterId != null) {
      // get chapter data for id
      const chapterData = SDK.Codex.chapterForIdentifier(chapterId);

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
        const chapterPkgId = PKGS.getChapterPkgIdentifier(chapterId);
        const previousLoadedPackageId = this._loadedChapterPkgId;
        this._loadedChapterPkgId = chapterPkgId;

        // load new resources
        this._chapterPromise = PackageManager.getInstance().loadMinorPackage(chapterPkgId).then(() => {
          // remove activity dialog
          NavigationManager.getInstance().destroyDialogView();

          // setup promises
          const promises = [];

          // unload previous
          promises.push(PackageManager.getInstance().unloadMajorMinorPackage(previousLoadedPackageId));

          // check that loaded is same as current
          if (this._loadedChapterPkgId === chapterPkgId) {
            // show chapter ui
            promises.push(this.chapterRegion.show(new CodexChapterItemView({ model: new Backbone.Model(chapterData) })));

            // show chapter visuals
            let chapterLayer = Scene.getInstance().getOverlay();
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
        });
      } else if (this.chapterRegion.currentView != null) {
        // show chapter ui
        const codexChapterItemView = this.chapterRegion.currentView;
        if (codexChapterItemView instanceof CodexChapterItemView) {
          codexChapterItemView.show(this._previousState !== STATE_WORLD_MAP);
        }

        // show chapter visuals
        let chapterLayer = Scene.getInstance().getOverlay();
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

  _unloadCurrentChapterResources() {
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
  _stopShowingChapter() {
    // hide chapter ui
    const codexChapterItemView = this.chapterRegion.currentView;
    if (codexChapterItemView instanceof CodexChapterItemView) {
      codexChapterItemView.hide(this._state !== STATE_WORLD_MAP);
    }

    // hide chapter visuals
    const chapterLayer = Scene.getInstance().getOverlay();
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
  _showWorldMap() {
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
  _stopShowingWorldMap() {
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
