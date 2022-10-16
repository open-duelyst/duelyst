// pragma PKGS: game

const SDK = require('app/sdk');
const UtilsJavascript = require('app/common/utils/utils_javascript');
const CONFIG = require('app/common/config');
const audio_engine = require('app/audio/audio_engine');
const RSX = require('app/data/resources');
const NewPlayerManager = require('app/ui/managers/new_player_manager');
const DeckSelectCompositeView = require('./deck_select');

const DeckSelectRankedCompositeView = DeckSelectCompositeView.extend({

  filterLegacy: false,

  _showNewPlayerUI() {
    DeckSelectCompositeView.prototype._showNewPlayerUI.call(this);

    if (NewPlayerManager.getInstance().getEmphasizeStarterDecksTab()) {
      const item = this.ui.$deckGroups.children('[data-value="starter"]');
      item.popover({
        content: 'Find your starter decks here.',
        container: this.$el,
        placement: 'bottom',
      });
      item.popover('show');
    }

    const newPlayerManager = NewPlayerManager.getInstance();

    // This currently shouldn't be reached and be disabled, but good safety
    if (!newPlayerManager.canPlayQuickMatch()) {
      this.ui.$deckSelectConfirmCasual.addClass('disabled');
    } else {
      this.ui.$deckSelectConfirmCasual.removeClass('disabled');
    }

    if (!newPlayerManager.canPlayRanked()) {
      // TODO: This needs to also grey out the button
      this.ui.$deckSelectConfirm.addClass('disabled');
    } else {
      this.ui.$deckSelectConfirm.removeClass('disabled');
    }
  },

});

// Expose the class either via CommonJS or the global object
module.exports = DeckSelectRankedCompositeView;
