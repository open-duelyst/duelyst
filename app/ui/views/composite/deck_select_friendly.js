// pragma PKGS: game

'use strict';

var _ = require('underscore');
var SDK = require('app/sdk');
var UtilsJavascript = require('app/common/utils/utils_javascript');
var CONFIG = require('app/common/config');
var audio_engine = require('app/audio/audio_engine');
var RSX = require('app/data/resources');
var GamesManager = require('app/ui/managers/games_manager');
var ProfileManager = require('app/ui/managers/profile_manager');
var DeckSelectFriendlyTmpl = require('app/ui/templates/composite/deck_select_friendly.hbs');
var DeckSelectCompositeView = require('./deck_select');

var DeckSelectFriendlyCompositeView = DeckSelectCompositeView.extend({

  className: 'sliding-panel-select deck-select deck-select-friendly',

  template: DeckSelectFriendlyTmpl,

  _showRiftDecks: false,
  _showGauntletDecks: true,

  onConfirmSelection: function (event) {
    if (this._selectedDeckModel != null) {
      this.ui.$deckSelectConfirm.addClass('disabled');
      audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_confirm.audio, CONFIG.CONFIRM_SFX_PRIORITY);
      var generalId = null;
      var deck = null;
      var ticketId = null;
      if (this._selectedDeckModel.get('isRift')) {
        generalId = this._selectedDeckModel.get('general_id');
        deck = _.map(this._selectedDeckModel.get('deck'), function (cardId) { return { id: cardId }; });
        ticketId = this._selectedDeckModel.get('ticket_id');
      } else if (this._selectedDeckModel.get('isGauntlet')) {
        generalId = this._selectedDeckModel.get('general_id');
        deck = _.map(this._selectedDeckModel.get('deck'), function (cardId) { return { id: cardId }; });
        ticketId = this._selectedDeckModel.get('ticket_id');
        if (ticketId == null) {
          ticketId = this._selectedDeckModel.get('id');
        }
      } else {
        generalId = this._selectedDeckModel.get('cards')[0].id;
        deck = UtilsJavascript.deepCopy(this._selectedDeckModel.get('cards'));
      }
      GamesManager.getInstance().findNewGame(
        deck,
        this._selectedDeckModel.get('faction_id'),
        SDK.GameType.Friendly,
        generalId,
        this._selectedDeckModel.get('card_back_id'),
        ProfileManager.getInstance().get('battle_map_id'),
        ticketId,
      );
    } else {
      audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_error.audio, CONFIG.ERROR_SFX_PRIORITY);
      this._showSelectDeckWarningPopover(this.ui.$deckSelectConfirm);
    }
  },

});

// Expose the class either via CommonJS or the global object
module.exports = DeckSelectFriendlyCompositeView;
