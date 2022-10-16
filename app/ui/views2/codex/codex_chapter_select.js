// pragma PKGS: codex

const CONFIG = require('app/common/config');
const RSX = require('app/data/resources');
const Animations = require('app/ui/views/animations');
const SlidingPanelSelectCompositeView = require('app/ui/views/composite/sliding_panel_select');
const audio_engine = require('../../../audio/audio_engine');
const CodexChapterPreviewItemView = require('./codex_chapter_preview');
const CodexChapterSelectTmpl = require('./templates/codex_chapter_select.hbs');

const CodexChapterSelectCompositeView = SlidingPanelSelectCompositeView.extend({

  className: 'sliding-panel-select codex-chapter-select',

  template: CodexChapterSelectTmpl,

  childView: CodexChapterPreviewItemView,

  animateIn: Animations.fadeIn,
  animateOut: Animations.fadeOut,

  slidingPanelsStack: false,

  setSelectedChildView() {
    // make selection
    SlidingPanelSelectCompositeView.prototype.setSelectedChildView.apply(this, arguments);

    // play audio
    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_confirm.audio, CONFIG.CONFIRM_SFX_PRIORITY);
  },

});

// Expose the class either via CommonJS or the global object
module.exports = CodexChapterSelectCompositeView;
