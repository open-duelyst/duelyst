// pragma PKGS: nongame

'use strict';

var Scene = require('app/view/Scene');
var CONFIG = require('app/common/config');
var RSX = require('app/data/resources');
var generatePushID = require('app/common/generate_push_id');
var Animations = require('app/ui/views/animations');
var PlayModeItemView = require('app/ui/views/item/play_mode');
var PlayLayer = require('app/view/layers/pregame/PlayLayer');
var audio_engine = require('../../../audio/audio_engine');
var SlidingPanelSelectCompositeView = require('./sliding_panel_select');
var PlayModeSelectTmpl = require('../../templates/composite/play_mode_select.hbs');

var PlayModeSelectCompositeView = SlidingPanelSelectCompositeView.extend({

  className: 'sliding-panel-select play-mode-select',

  template: PlayModeSelectTmpl,

  childView: PlayModeItemView,

  animateIn: Animations.fadeIn,
  animateOut: Animations.fadeOut,

  slidingPanelsStack: false,
  _requestId: null,

  initialize: function () {
    // generate unique id for requests
    this._requestId = generatePushID();

    SlidingPanelSelectCompositeView.prototype.initialize.call(this);
  },

  onShow: function () {
    SlidingPanelSelectCompositeView.prototype.onShow.call(this);

    // show play layer
    Scene.getInstance().showContentByClass(PlayLayer, true);

    // change fx
    Scene.getInstance().getFX().showGradientColorMap(this._requestId, CONFIG.ANIMATE_FAST_DURATION, {
      r: 194, g: 203, b: 230, a: 255,
    }, {
      r: 26, g: 31, b: 50, a: 255,
    });
  },

  onPrepareForDestroy: function () {
    // reset fx
    Scene.getInstance().getFX().clearGradientColorMap(this._requestId, CONFIG.ANIMATE_MEDIUM_DURATION);
  },

  setSelectedChildView: function () {
    // make selection
    SlidingPanelSelectCompositeView.prototype.setSelectedChildView.apply(this, arguments);

    // play audio
    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_confirm.audio, CONFIG.CONFIRM_SFX_PRIORITY);
  },

});

// Expose the class either via CommonJS or the global object
module.exports = PlayModeSelectCompositeView;
