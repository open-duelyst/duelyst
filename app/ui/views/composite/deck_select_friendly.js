// pragma PKGS: game

const _ = require('underscore');
const SDK = require('app/sdk');
const UtilsJavascript = require('app/common/utils/utils_javascript');
const CONFIG = require('app/common/config');
const audio_engine = require('app/audio/audio_engine');
const RSX = require('app/data/resources');
const GamesManager = require('app/ui/managers/games_manager');
const ProfileManager = require('app/ui/managers/profile_manager');
const DeckSelectFriendlyTmpl = require('app/ui/templates/composite/deck_select_friendly.hbs');
const DeckSelectCompositeView = require('./deck_select');

const DeckSelectFriendlyCompositeView = DeckSelectCompositeView.extend({

  className: 'sliding-panel-select deck-select deck-select-friendly',

  template: DeckSelectFriendlyTmpl,

  _showRiftDecks: false,
  _showGauntletDecks: true,

  onConfirmSelection(event) {
    if (this._selectedDeckModel != null) {
      this.ui.$deckSelectConfirm.addClass('disabled');
      audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_confirm.audio, CONFIG.CONFIRM_SFX_PRIORITY);
      let generalId = null;
      let deck = null;
      let ticketId = null;
      if (this._selectedDeckModel.get('isRift')) {
        generalId = this._selectedDeckModel.get('general_id');
        deck = _.map(this._selectedDeckModel.get('deck'), (cardId) => ({ id: cardId }));
        ticketId = this._selectedDeckModel.get('ticket_id');
      } else if (this._selectedDeckModel.get('isGauntlet')) {
        generalId = this._selectedDeckModel.get('general_id');
        deck = _.map(this._selectedDeckModel.get('deck'), (cardId) => ({ id: cardId }));
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
