// pragma PKGS: codex

'use strict';

var CONFIG = require('app/common/config');
var RSX = require('app/data/resources');
var Animations = require('app/ui/views/animations');
var SlidingPanelSelectCompositeView = require('app/ui/views/composite/sliding_panel_select');
var audio_engine = require('../../../audio/audio_engine');
var CodexChapterPreviewItemView = require('./codex_chapter_preview');
var CodexChapterSelectTmpl = require('./templates/codex_chapter_select.hbs');

var CodexChapterSelectCompositeView = SlidingPanelSelectCompositeView.extend({

  className: 'sliding-panel-select codex-chapter-select',

  template: CodexChapterSelectTmpl,

  childView: CodexChapterPreviewItemView,

  animateIn: Animations.fadeIn,
  animateOut: Animations.fadeOut,

  slidingPanelsStack: false,

  setSelectedChildView: function () {
    // make selection
    SlidingPanelSelectCompositeView.prototype.setSelectedChildView.apply(this, arguments);

    // play audio
    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_confirm.audio, CONFIG.CONFIRM_SFX_PRIORITY);
  },

});

// Expose the class either via CommonJS or the global object
module.exports = CodexChapterSelectCompositeView;
