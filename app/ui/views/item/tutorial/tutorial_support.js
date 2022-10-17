'use strict';

// pragma PKGS: tutorial_support
var Scene = require('app/view/Scene');
var BaseParticleSystem = require('app/view/nodes/BaseParticleSystem');
var CONFIG = require('app/common/config');
var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');
var RSX = require('app/data/resources');
var PKGS = require('app/data/packages');
var Animations = require('app/ui/views/animations');
var FXRipplingGlowImageMapSprite = require('app/view/nodes/fx/FXRipplingGlowImageMapSprite');

/**
 * Abstract view for tutorial support UI such as intro, restart, etc.
 */
var TutorialSupportView = Backbone.Marionette.ItemView.extend({

  className: 'status tutorial-support',

  animateIn: Animations.fadeIn,
  animateOut: Animations.fadeOut,

  _engineParticles: null,
  _engineGlow: null,

  /* region EVENTS */

  onShow: function () {
    // listen to global events
    this.listenTo(EventBus.getInstance(), EVENTS.resize, this.onResize);
    this.onResize();

    // show engine nodes
    this.whenRequiredResourcesReady().then(function (requestId) {
      if (!this.getAreResourcesValid(requestId)) return; // resources invalidated
      this._showEngineNodes(CONFIG.VIEW_TRANSITION_DURATION);
    }.bind(this));
  },

  onPrepareForDestroy: function () {
    // destroy engine nodes
    this.whenRequiredResourcesReady().then(function (requestId) {
      if (!this.getAreResourcesValid(requestId)) return; // resources invalidated
      this._destroyEngineNodes(CONFIG.VIEW_TRANSITION_DURATION);
    }.bind(this));
  },

  onDestroy: function () {
    // destroy engine nodes
    this._destroyEngineNodes();
  },

  onResize: function () {
    this._resizeEngineNodes();
  },

  /* endregion EVENTS */

  /* region RESOURCES */

  getRequiredResources: function () {
    return PKGS.getPkgForIdentifier('tutorial_support').slice(0);
  },

  /* endregion RESOURCES */

  /* region ENGINE */

  _showEngineNodes: function () {
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

  _resizeEngineNodes: function () {
    if (this._engineGlow != null) {
      this._engineGlow.setPosition(cc.winSize.width * 0.5 + 10.0, cc.winSize.height * 0.5 - 20.0);
    }
    if (this._engineParticles != null) {
      this._engineParticles.setPosition(cc.winSize.width * 0.5, cc.winSize.height * 0.5 + 40.0);
    }
  },

  _destroyEngineNodes: function () {
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
