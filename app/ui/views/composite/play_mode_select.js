// pragma PKGS: nongame

const Scene = require('app/view/Scene');
const CONFIG = require('app/common/config');
const RSX = require('app/data/resources');
const generatePushID = require('app/common/generate_push_id');
const Animations = require('app/ui/views/animations');
const PlayModeItemView = require('app/ui/views/item/play_mode');
const PlayLayer = require('app/view/layers/pregame/PlayLayer');
const audio_engine = require('../../../audio/audio_engine');
const SlidingPanelSelectCompositeView = require('./sliding_panel_select');
const PlayModeSelectTmpl = require('../../templates/composite/play_mode_select.hbs');

const PlayModeSelectCompositeView = SlidingPanelSelectCompositeView.extend({

  className: 'sliding-panel-select play-mode-select',

  template: PlayModeSelectTmpl,

  childView: PlayModeItemView,

  animateIn: Animations.fadeIn,
  animateOut: Animations.fadeOut,

  slidingPanelsStack: false,
  _requestId: null,

  initialize() {
    // generate unique id for requests
    this._requestId = generatePushID();

    SlidingPanelSelectCompositeView.prototype.initialize.call(this);
  },

  onShow() {
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

  onPrepareForDestroy() {
    // reset fx
    Scene.getInstance().getFX().clearGradientColorMap(this._requestId, CONFIG.ANIMATE_MEDIUM_DURATION);
  },

  setSelectedChildView() {
    // make selection
    SlidingPanelSelectCompositeView.prototype.setSelectedChildView.apply(this, arguments);

    // play audio
    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_confirm.audio, CONFIG.CONFIRM_SFX_PRIORITY);
  },

});

// Expose the class either via CommonJS or the global object
module.exports = PlayModeSelectCompositeView;
