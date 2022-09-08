// pragma PKGS: tutorial_support
const Scene = require('app/view/Scene');
const BaseParticleSystem = require('app/view/nodes/BaseParticleSystem');
const CONFIG = require('app/common/config');
const EventBus = require('app/common/eventbus');
const EVENTS = require('app/common/event_types');
const RSX = require('app/data/resources');
const PKGS = require('app/data/packages');
const Animations = require('app/ui/views/animations');
const FXRipplingGlowImageMapSprite = require('app/view/nodes/fx/FXRipplingGlowImageMapSprite');

/**
 * Abstract view for tutorial support UI such as intro, restart, etc.
 */
const TutorialSupportView = Backbone.Marionette.ItemView.extend({

  className: 'status tutorial-support',

  animateIn: Animations.fadeIn,
  animateOut: Animations.fadeOut,

  _engineParticles: null,
  _engineGlow: null,

  /* region EVENTS */

  onShow() {
    // listen to global events
    this.listenTo(EventBus.getInstance(), EVENTS.resize, this.onResize);
    this.onResize();

    // show engine nodes
    this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // resources invalidated
      this._showEngineNodes(CONFIG.VIEW_TRANSITION_DURATION);
    });
  },

  onPrepareForDestroy() {
    // destroy engine nodes
    this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // resources invalidated
      this._destroyEngineNodes(CONFIG.VIEW_TRANSITION_DURATION);
    });
  },

  onDestroy() {
    // destroy engine nodes
    this._destroyEngineNodes();
  },

  onResize() {
    this._resizeEngineNodes();
  },

  /* endregion EVENTS */

  /* region RESOURCES */

  getRequiredResources() {
    return PKGS.getPkgForIdentifier('tutorial_support').slice(0);
  },

  /* endregion RESOURCES */

  /* region ENGINE */

  _showEngineNodes() {
    // glow
    this._engineGlow = new FXRipplingGlowImageMapSprite({
      type: 'CardGlow',
      spriteIdentifier: RSX.challenge_dialog_plate_glow.img,
      scale: 1.0,
      levelsInWhite: 200,
      gamma: 0.75,
      intensity: 0.75,
    });

    // particles
    this._engineParticles = new BaseParticleSystem(RSX.challenge_dialog_plate_glow_particles.plist);

    // add nodes
    Scene.getInstance().getGameLayer().addChild(this._engineParticles);
    Scene.getInstance().getGameLayer().addChild(this._engineGlow);

    this._resizeEngineNodes();
  },

  _resizeEngineNodes() {
    if (this._engineGlow != null) {
      this._engineGlow.setPosition(cc.winSize.width * 0.5 + 10.0, cc.winSize.height * 0.5 - 20.0);
    }
    if (this._engineParticles != null) {
      this._engineParticles.setPosition(cc.winSize.width * 0.5, cc.winSize.height * 0.5 + 40.0);
    }
  },

  _destroyEngineNodes() {
    if (this._engineGlow != null) {
      this._engineGlow.destroy();
      this._engineGlow = null;
    }
    if (this._engineParticles != null) {
      this._engineParticles.destroy();
      this._engineParticles = null;
    }
  },

  /* endregion ENGINE */

});

// Expose the class either via CommonJS or the global object
module.exports = TutorialSupportView;
