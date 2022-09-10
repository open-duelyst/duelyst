// pragma PKGS: codex

const SlidingPanelItemView = require('app/ui/views/item/sliding_panel');
const ProgressionManager = require('app/ui/managers/progression_manager');
const CodexChapterPreviewTmpl = require('./templates/codex_chapter_preview.hbs');

const CodexChapterPreviewItemView = SlidingPanelItemView.extend({

  className: 'sliding-panel codex-chapter-preview',

  template: CodexChapterPreviewTmpl,

  /* region INITIALIZE */

  initialize() {
    // add unlock message for not enough games
    if (this.model.get('enabled') && !this.hasUnlockedChapter()) {
      const gamesRequiredToUnlock = this.model.get('gamesRequiredToUnlock');

      this.model.set('unlockMessage', `Play ${gamesRequiredToUnlock - ProgressionManager.getInstance().getGameCount()} more games to unlock.`);
    }
  },

  serializeModel(model) {
    const data = model.toJSON.apply(model, _.rest(arguments));
    data.description = model.get('description').replace(/\n|\r/g, '<br/>');
    return data;
  },

  /* endregion INITIALIZE */

  /* region EVENTS */

  onRender() {
    SlidingPanelItemView.prototype.onRender.call(this);

    if (!this.model.get('enabled') || !this.hasUnlockedChapter()) {
      this.$el.addClass('disabled');
    } else {
      this.$el.removeClass('disabled');
    }
  },

  onDestroy() {
  },

  onClick() {
    if (this.model.get('enabled') && this.hasUnlockedChapter()) {
      this.trigger('select');
    }
  },

  /* endregion EVENTS */

  /* region HELPERS */

  hasUnlockedChapter() {
    return InventoryManager.getInstance().hasUnlockedCodexChapter(this.model.get('id'));
  },

  /* endregion HELPERS */

});

// Expose the class either via CommonJS or the global object
module.exports = CodexChapterPreviewItemView;
