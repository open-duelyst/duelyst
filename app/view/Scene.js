const CONFIG = require('app/common/config');
const Logger = require('app/common/logger');
const Promise = require('bluebird');
const UtilsEngine = require('app/common/utils/utils_engine');

// vendor engine extensions
// must be required to activate
const CCInjections = require('app/view/extensions/CCInjections');
const NodeInjections = require('app/view/extensions/NodeInjections');
const RenderingInjections = require('app/view/extensions/RenderingInjections');

const Scene = {};

Scene._instance = null;
Scene.getInstance = function () {
  if (Scene._instance == null) {
    Scene._instance = Scene.create();
  }
  return Scene._instance;
};
Scene.current = Scene.getInstance;

Scene.create = function () {
  const scene = new _Scene();
  scene.init();
  return scene;
};

Scene._isSetupPromise = null;
Scene.setup = function () {
  if (Scene._isSetupPromise == null) {
    Logger.module('ENGINE').log('Scene.setup');
    Scene._isSetupPromise = new Promise((resolve, reject) => {
      cc.game.onStart = function () {
        const scene = Scene.getInstance();
        scene.resize();
        cc.director.runScene(scene);
        return resolve();
      };
      return cc.game.run();
    });
  }
  return Scene._isSetupPromise;
};

Scene.projection = {
  updateProjection() {
    if (CONFIG.DYNAMIC_PROJECTION) {
      cc.kmGLMatrixMode(cc.KM_GL_PROJECTION);
      cc.kmGLLoadMatrix(UtilsEngine.MAT4_ORTHOGRAPHIC_PROJECTION);
      cc.kmGLMatrixMode(cc.KM_GL_MODELVIEW);
      return cc.kmGLLoadMatrix(UtilsEngine.MAT4_ORTHOGRAPHIC_STACK);
    }
    cc.kmGLMatrixMode(cc.KM_GL_PROJECTION);
    cc.kmGLLoadMatrix(UtilsEngine.MAT4_PERSPECTIVE_PROJECTION);
    cc.kmGLMatrixMode(cc.KM_GL_MODELVIEW);
    return cc.kmGLLoadMatrix(UtilsEngine.MAT4_PERSPECTIVE_STACK);
  },
};

// export scene for requires here so there are no looping dependencies
module.exports = Scene;

// now add the rest of the requires and methods
// why is this organized in this way? https://coderwall.com/p/myzvmg
const EventBus = require('app/common/eventbus');
const EVENTS = require('app/common/event_types');
const SDK = require('app/sdk');
const NodeFactorySetup = require('app/view/helpers/NodeFactorySetup');
const FX = require('app/view/fx/FX');
const TransitionLayer = require('app/view/layers/TransitionLayer');
const LoadLayer = require('app/view/layers/start/LoadLayer');
const MainObsidianWoodsLayer = require('app/view/layers/start/MainObsidianWoodsLayer');
const MainMagaariEmberHighlandsLayer = require('app/view/layers/start/MainMagaariEmberHighlandsLayer');
const MainFrostfireLayer = require('app/view/layers/start/MainFrostfireLayer');
const MainVetruvianLayer = require('app/view/layers/start/MainVetruvianLayer');
const MainShimzarLayer = require('app/view/layers/start/MainShimzarLayer');
const MatchmakingLayer = require('app/view/layers/pregame/MatchmakingLayer');
const GameLayer = require('app/view/layers/game/GameLayer');

/** **************************************************************************
 Scene
 *************************************************************************** */

var _Scene = cc.Scene.extend({
  // layer above
  // used for overlay content (matchmaking, end game, reconnecting, etc)
  _overlay: null,
  _overlayPromise: null,

  // layer beneath
  // used for main content (loader, main, game, etc)
  _contentContainer: null,
  _contentOnlyPromise: null,
  _contentPromise: null,

  // fx manager
  _fx: null,

  // event manager
  _eventBus: null,

  /* region INITIALIZE */

  ctor() {
    // initialize properties that may be required in init
    this._eventBus = EventBus.create();
    this._fx = FX.create();
    this._contentContainer = TransitionLayer.create();
    this._overlay = TransitionLayer.create();

    // do super ctor
    this._super();

    this.addChild(this._contentContainer);
    this.addChild(this._overlay);
  },

  /* endregion INITIALIZE */

  /* region COCOS EVENTS */

  onEnter() {
    cc.Scene.prototype.onEnter.call(this);

    EventBus.getInstance().on(EVENTS.change_scene, this.onChangeMain, this);

    this._fx.getEventBus().on(EVENTS.caching_screen_setup, this.onCachingSetup, this);
    this._fx.getEventBus().on(EVENTS.caching_surface_setup, this.onCachingSetup, this);
    this._fx.getEventBus().on(EVENTS.caching_screen_start, this.onCachingScreenStart, this);
    this._fx.getEventBus().on(EVENTS.caching_screen_stop, this.onCachingScreenReset, this);
    this._fx.getEventBus().on(EVENTS.caching_screen_dirty, this.onCachingScreenReset, this);

    this._fx.getEventBus().on(EVENTS.blur_screen_start, this.onBlurChange, this);
    this._fx.getEventBus().on(EVENTS.blur_screen_stop, this.onBlurChange, this);
    this._fx.getEventBus().on(EVENTS.blur_surface_start, this.onBlurChange, this);
    this._fx.getEventBus().on(EVENTS.blur_surface_stop, this.onBlurChange, this);
  },

  onExit() {
    EventBus.getInstance().off(EVENTS.change_scene, this.onChangeMain, this);

    this._fx.getEventBus().off(EVENTS.caching_screen_setup, this.onCachingSetup, this);
    this._fx.getEventBus().off(EVENTS.caching_surface_setup, this.onCachingSetup, this);
    this._fx.getEventBus().off(EVENTS.caching_screen_start, this.onCachingScreenStart, this);
    this._fx.getEventBus().off(EVENTS.caching_screen_stop, this.onCachingScreenReset, this);
    this._fx.getEventBus().off(EVENTS.caching_screen_dirty, this.onCachingScreenReset, this);

    this._fx.getEventBus().off(EVENTS.blur_screen_start, this.onBlurChange, this);
    this._fx.getEventBus().off(EVENTS.blur_screen_stop, this.onBlurChange, this);
    this._fx.getEventBus().off(EVENTS.blur_surface_start, this.onBlurChange, this);
    this._fx.getEventBus().off(EVENTS.blur_surface_stop, this.onBlurChange, this);

    this.removeAllChildren(true);

    cc.Scene.prototype.onExit.call(this);

    this.getFX().release();
  },

  /* endregion COCOS EVENTS */

  /* region EVENTS */

  _beforeShowOrEmptyLayer() {
    this.getFX().requestStopScreenCache();
    this.getFX().requestStopSurfaceCache();
  },

  _afterShowOrEmptyLayer() {
    // drain all pools
    cc.pool.drainAllPools();

    // don't allow automatic screen cache when not blurring or non cached layer is active
    const blurringScreen = this.getFX().getIsBlurringScreen();
    const blurringSurface = this.getFX().getIsBlurringSurface();
    const contentIsCachable = this.getIsContentCachable();
    if (blurringScreen && contentIsCachable) {
      this.getFX().requestStartScreenCache();
    } else {
      this.getFX().requestStopScreenCache();
    }
    if (blurringSurface && contentIsCachable) {
      this.getFX().requestStartSurfaceCache();
    } else {
      this.getFX().requestStopSurfaceCache();
    }
  },

  onBlurChange() {
    // request start/stop of screen caching automatically when blurring
    const blurringScreen = this.getFX().getIsBlurringScreen();
    const blurringSurface = this.getFX().getIsBlurringSurface();
    const contentIsCachable = this.getIsContentCachable();
    if (blurringScreen && contentIsCachable) {
      this.getFX().requestStartScreenCache();
    } else {
      this.getFX().requestStopScreenCache();
    }
    if (blurringSurface && contentIsCachable) {
      this.getFX().requestStartSurfaceCache();
    } else {
      this.getFX().requestStopSurfaceCache();
    }
  },

  onCachingSetup() {
    this.setVisible(true);
  },

  onCachingScreenStart() {
    this.setVisible(false);
  },

  onCachingScreenReset() {
    this.setVisible(true);
  },

  /* endregion EVENTS */

  /* region GETTERS / SETTERS */

  getEventBus() {
    return this._eventBus;
  },

  getFX() {
    return this._fx;
  },

  getIsContentCachable() {
    return this.getGameLayer() == null && (this._overlayPromise == null || this._overlayPromise.isFulfilled()) && (this._contentOnlyPromise == null || this._contentOnlyPromise.isFulfilled());
  },

  /* endregion GETTERS / SETTERS */

  /* region HELPERS */

  resize() {
    // get app size
    const $app = $(CONFIG.APP_SELECTOR);
    const width = $app.width();
    const height = $app.height();

    // set resolution
    cc.view.enableRetina(CONFIG.hiDPIEnabled);
    cc.view.setDesignResolutionSize(width, height, cc.ResolutionPolicy.SHOW_ALL);
    CONFIG.pixelScaleEngine = CONFIG.globalScale * cc.view.getDevicePixelRatio();
    CONFIG.resourceScaleEngine = 1;
    for (let i = 0, il = CONFIG.RESOURCE_SCALES.length; i < il; i++) {
      const resourceScale = CONFIG.RESOURCE_SCALES[i];
      const scaleDiff = Math.abs(CONFIG.pixelScaleEngine - resourceScale);
      const currentScaleDiff = Math.abs(CONFIG.pixelScaleEngine - CONFIG.resourceScaleEngine);
      if (scaleDiff < currentScaleDiff || (scaleDiff === currentScaleDiff && resourceScale > CONFIG.resourceScaleEngine)) {
        CONFIG.resourceScaleEngine = resourceScale;
      }
    }

    // rebuild engine utils
    UtilsEngine.rebuild();

    // set projection
    cc.director.setDelegate(Scene.projection);
    cc.director.setProjection(cc.Director.PROJECTION_CUSTOM);

    // resize fx so all the render passes get updated
    this.getFX().resize();

    // push resize event to stream for the rest of the scene
    this.getEventBus().trigger(EVENTS.resize, { type: EVENTS.resize });
  },

  /**
   * Shows a content layer. Returns a promise that resolves when the content has been fully swapped.
   * @param {cc.Layer} layer
   * @param [withoutOverlay=false] whether to clear overlay
   * @returns {Promise}
   */
  showContent(layer, withoutOverlay) {
    this._beforeShowOrEmptyLayer();
    this._contentPromise = this._contentOnlyPromise = this._contentContainer.show(layer);
    this._contentOnlyPromise.nodeify(this._afterShowOrEmptyLayer.bind(this));

    if (withoutOverlay && this._overlay.getCurrentLayer() != null) {
      this._contentPromise = Promise.all([this._contentOnlyPromise, this.destroyOverlay()]);
    }

    return this._contentPromise;
  },

  /**
   * Shows content layer if it not already showing content of layerClass and returns a promise that resolves when the content has been fully swapped.
   * @param layerClass
   * @param [withoutOverlay=false] whether to clear overlay
   * @returns {Promise}
   */
  showContentByClass(layerClass, withoutOverlay) {
    if (layerClass != null && !(this._contentContainer.getCurrentLayer() instanceof layerClass)) {
      return this.showContent(new layerClass(), withoutOverlay);
    }
    if (withoutOverlay && this._overlay.getCurrentLayer() != null) {
      this._contentPromise = Promise.all([this._contentPromise, this.destroyOverlay()]);
    }
    return this._contentPromise;
  },

  /**
   * Destroys content layer and returns a promise that resolves when the layer has been destroyed.
   * @returns {Promise}
   */
  destroyContent() {
    this._beforeShowOrEmptyLayer();
    const destroyPromise = this._contentContainer.empty();
    destroyPromise.nodeify(this._afterShowOrEmptyLayer.bind(this));
    return destroyPromise;
  },

  /**
   * Destroys content layer if it matches layerClass and returns a promise that resolves when the layer has been destroyed.
   * @returns {Promise}
   */
  destroyContentByClass(layerClass) {
    if (layerClass != null && this._contentContainer.getCurrentLayer() instanceof layerClass) {
      return this.destroyContent();
    }
    return Promise.resolve();
  },

  getContent() {
    return this._contentContainer.getCurrentLayer();
  },

  /**
   * Shows an overlay layer. Returns a promise that resolves when the content has been fully swapped.
   * @param {cc.Layer} layer
   * @returns {Promise}
   */
  showOverlay(layer) {
    this._beforeShowOrEmptyLayer();
    this._overlayPromise = this._overlay.show(layer);
    this._overlayPromise.nodeify(this._afterShowOrEmptyLayer.bind(this));
    return this._overlayPromise;
  },

  /**
   * Shows overlay layer if it not already showing overlay of layerClass and returns a promise that resolves when the overlay has been fully swapped.
   * @param layerClass
   * @returns {Promise}
   */
  showOverlayByClass(layerClass) {
    if (layerClass != null && !(this._overlay.getCurrentLayer() instanceof layerClass)) {
      return this.showOverlay(new layerClass());
    }
    return this._overlayPromise;
  },

  /**
   * Destroys overlay layer and returns a promise that resolves when the layer has been destroyed.
   * @returns {Promise}
   */
  destroyOverlay() {
    this._beforeShowOrEmptyLayer();
    const destroyPromise = this._overlay.empty();
    destroyPromise.nodeify(this._afterShowOrEmptyLayer.bind(this));
    return destroyPromise;
  },

  /**
   * Destroys overlay layer if it matches layerClass and returns a promise that resolves when the layer has been destroyed.
   * @returns {Promise}
   */
  destroyOverlayByClass(layerClass) {
    if (layerClass != null && this._overlay.getCurrentLayer() instanceof layerClass) {
      return this.destroyOverlay();
    }
    return Promise.resolve();
  },

  getOverlay() {
    return this._overlay.getCurrentLayer();
  },

  /* endregion HELPERS */

  /* region LAYERS */

  /* region LOAD */

  showLoad() {
    return this.showContent(new LoadLayer(), true);
  },
  getLoadLayer() {
    return this._contentContainer.getLayerByClass(LoadLayer);
  },

  /* endregion LOAD */

  /* region MAIN */

  showMain() {
    const selectedSceneData = SDK.CosmeticsFactory.sceneForIdentifier(CONFIG.selectedScene);
    const selectedSceneId = selectedSceneData.id;
    if (selectedSceneId === SDK.CosmeticsLookup.Scene.MagaariEmberHighlands) {
      this._mainLayerClass = MainMagaariEmberHighlandsLayer;
    } else if (selectedSceneId === SDK.CosmeticsLookup.Scene.ObsidianWoods) {
      this._mainLayerClass = MainObsidianWoodsLayer;
    } else if (selectedSceneId === SDK.CosmeticsLookup.Scene.Frostfire) {
      this._mainLayerClass = MainFrostfireLayer;
    } else if (selectedSceneId === SDK.CosmeticsLookup.Scene.Vetruvian) {
      this._mainLayerClass = MainVetruvianLayer;
    } else if (selectedSceneId === SDK.CosmeticsLookup.Scene.Shimzar) {
      this._mainLayerClass = MainShimzarLayer;
    } else {
      throw new Error(`Scene.showMain -> Invalid selected scene: ${CONFIG.selectedScene}`);
    }

    return this.showContentByClass(this._mainLayerClass, true);
  },
  getMainLayer() {
    return this._contentContainer.getLayerByClass(this._mainLayerClass);
  },
  onChangeMain() {
    if (this._mainLayerClass != null && this.getContent() instanceof this._mainLayerClass) {
      this.showMain();
    }
  },

  /* endregion MAIN */

  /* region MATCHMAKING */

  showMatchmaking() {
    return this.showOverlayByClass(MatchmakingLayer);
  },
  getMatchmakingLayer() {
    return this._overlay.getLayerByClass(MatchmakingLayer);
  },
  showFindingGame(myPlayerFactionId, myPlayerGeneralId) {
    const showMatchmakingPromise = this.showMatchmaking();
    const matchmakingLayer = this.getMatchmakingLayer();
    return Promise.all([
      showMatchmakingPromise,
      matchmakingLayer && matchmakingLayer.showFindingGame(myPlayerFactionId, myPlayerGeneralId),
    ]);
  },
  showVsForGame(myPlayerFactionId, opponentPlayerFactionId, myPlayerIsPlayer1, animationDuration, myPlayerGeneralId, opponentGeneralFactionId) {
    const showMatchmakingPromise = this.showMatchmaking();
    const matchmakingLayer = this.getMatchmakingLayer();
    return Promise.all([
      showMatchmakingPromise,
      matchmakingLayer && matchmakingLayer.showVsForGame(myPlayerFactionId, opponentPlayerFactionId, myPlayerIsPlayer1, animationDuration, myPlayerGeneralId, opponentGeneralFactionId),
    ]);
  },
  showNewGame(player1GeneralId, player2GeneralId) {
    const showMatchmakingPromise = this.showMatchmaking();
    const matchmakingLayer = this.getMatchmakingLayer();
    return Promise.all([
      showMatchmakingPromise,
      matchmakingLayer && matchmakingLayer.showNewGame(player1GeneralId, player2GeneralId),
    ]);
  },

  /* endregion MATCHMAKING */

  /* region GAME */

  showGame() {
    return this.showContent(new GameLayer());
  },
  getGameLayer() {
    return this._contentContainer.getLayerByClass(GameLayer);
  },

  /* endregion GAME */

  /* endregion LAYERS */
});
