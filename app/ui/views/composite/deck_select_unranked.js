// pragma PKGS: game

'use strict';

var SDK = require('app/sdk');
var UtilsJavascript = require('app/common/utils/utils_javascript');
var CONFIG = require('app/common/config');
var audio_engine = require('app/audio/audio_engine');
var RSX = require('app/data/resources');
var DeckSelectSandboxTmpl = require('app/ui/templates/composite/deck_select_unranked.hbs');
var NewPlayerManager = require('app/ui/managers/new_player_manager');
var DeckSelectCompositeView = require('./deck_select');

var DeckSelectUnrankedCompositeView = DeckSelectCompositeView.extend({

  template: DeckSelectSandboxTmpl,

  _showNewPlayerUI: function () {
    DeckSelectCompositeView.prototype._showNewPlayerUI.call(this);

    if (NewPlayerManager.getInstance().getEmphasizeStarterDecksTab()) {
      var item = this.ui.$deckGroups.children('[data-value="starter"]');
      item.popover({
        content: 'Find your starter decks here.',
        container: this.$el,
        placement: 'bottom',
      });
      item.popover('show');
    }

    var newPlayerManager = NewPlayerManager.getInstance();

    // This currently shouldn't be reached and be disabled, but good safety
    if (!newPlayerManager.canPlayQuickMatch()) {
      this.ui.$deckSelectConfirmCasual.addClass('disabled');
    } else {
      this.ui.$deckSelectConfirmCasual.removeClass('disabled');
    }

    // note: checking if they can play RANKED even though this is for unranked...
    // jank put in place temporarily while holiday mode uses unranked (disabled mode)
    if (!newPlayerManager.canPlayRanked()) {
      this.ui.$deckSelectConfirm.addClass('disabled');
      this.ui.$deckSelectConfirmCasual.addClass('disabled');
    } else {
      this.ui.$deckSelectConfirm.addClass('disabled');
      this.ui.$deckSelectConfirmCasual.removeClass('disabled');
    }
  },

});

// Expose the class either via CommonJS or the global object
module.exports = DeckSelectUnrankedCompositeView;
