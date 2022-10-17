// pragma PKGS: codex

'use strict';

var SlidingPanelItemView = require('app/ui/views/item/sliding_panel');
var ProgressionManager = require('app/ui/managers/progression_manager');
var CodexChapterPreviewTmpl = require('./templates/codex_chapter_preview.hbs');

var CodexChapterPreviewItemView = SlidingPanelItemView.extend({

  className: 'sliding-panel codex-chapter-preview',

  template: CodexChapterPreviewTmpl,

  /* region INITIALIZE */

  initialize: function () {
    // add unlock message for not enough games
    if (this.model.get('enabled') && !this.hasUnlockedChapter()) {
      var gamesRequiredToUnlock = this.model.get('gamesRequiredToUnlock');

      this.model.set('unlockMessage', 'Play ' + (gamesRequiredToUnlock - ProgressionManager.getInstance().getGameCount()) + ' more games to unlock.');
    }
  },

  serializeModel: function (model) {
    var data = model.toJSON.apply(model, _.rest(arguments));
    data.description = model.get('description').replace(/\n|\r/g, '<br/>');
    return data;
  },

  /* endregion INITIALIZE */

  /* region EVENTS */

  onRender: function () {
    SlidingPanelItemView.prototype.onRender.call(this);

    if (!this.model.get('enabled') || !this.hasUnlockedChapter()) {
      this.$el.addClass('disabled');
    } else {
      this.$el.removeClass('disabled');
    }
  },

  onDestroy: function () {
  },

  onClick: function () {
    if (this.model.get('enabled') && this.hasUnlockedChapter()) {
      this.trigger('select');
    }
  },

  /* endregion EVENTS */

  /* region HELPERS */

  hasUnlockedChapter: function () {
    return InventoryManager.getInstance().hasUnlockedCodexChapter(this.model.get('id'));
  },

  /* endregion HELPERS */

});

// Expose the class either via CommonJS or the global object
module.exports = CodexChapterPreviewItemView;
