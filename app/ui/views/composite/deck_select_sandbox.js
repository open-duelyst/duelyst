// pragma PKGS: game

'use strict';

var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');
var CONFIG = require('app/common/config');
var SDK = require('app/sdk');
var RSX = require('app/data/resources');
var UtilsJavascript = require('app/common/utils/utils_javascript');
var audio_engine = require('app/audio/audio_engine');
var VirtualCollection = require('backbone-virtual-collection');
var ProfileManager = require('app/ui/managers/profile_manager');
var DeckSelectSandboxTmpl = require('app/ui/templates/composite/deck_select_sandbox.hbs');
var CosmeticsFactory = require('app/sdk/cosmetics/cosmeticsFactory');
var _ = require('underscore');
var DeckSelectCompositeView = require('./deck_select');

var DeckSelectSandboxCompositeView = DeckSelectCompositeView.extend({

  className: 'sliding-panel-select deck-select deck-select-sandbox',

  template: DeckSelectSandboxTmpl,

  _selectedDeckModelPlayer1: null,
  _selectedDeckModelPlayer2: null,
  _selectingForPlayer2: false,

  initialize: function () {
    DeckSelectCompositeView.prototype.initialize.apply(this, arguments);

    // update title
    this.model.set('title', 'Select Decks');
  },

  /* region SELECTION */

  setStartingSelectedDeckModel: function () {
    // player 1
    var lastSelectedPlayer1DeckId = CONFIG.lastSelectedSandboxPlayer1DeckId;
    if (lastSelectedPlayer1DeckId) {
      var collectionToSearch = this.collection instanceof VirtualCollection ? this.collection.collection : this.collection;
      var lastSelectedDeckModel = collectionToSearch.find(function (model) { return model.get('id') === lastSelectedPlayer1DeckId; });
      if (lastSelectedDeckModel != null) {
        this._selectedDeckModelPlayer1 = lastSelectedDeckModel;
        this._selectingForPlayer2 = true;
        if (!lastSelectedDeckModel.get('isStarter')) {
          this.selectedDeckGroup = 'custom';
        } else {
          this.selectedDeckGroup = 'starter';
        }
      }
    }

    // player 2
    var lastSelectedPlayer2DeckId = CONFIG.lastSelectedSandboxPlayer2DeckId;
    if (lastSelectedPlayer2DeckId) {
      var collectionToSearch = this.collection instanceof VirtualCollection ? this.collection.collection : this.collection;
      var lastSelectedDeckModel = collectionToSearch.find(function (model) { return model.get('id') === lastSelectedPlayer2DeckId; });
      if (lastSelectedDeckModel != null) {
        this._selectedDeckModelPlayer2 = lastSelectedDeckModel;
        this._selectingForPlayer2 = false;
      }
    }
  },

  getSelectedDeckModelInSelectedDeckGroup: function () {
    if (this.selectedDeckGroup === 'starter') {
      if (this._selectingForPlayer2 && this._selectedDeckModelPlayer2 != null && this._selectedDeckModelPlayer2.get('isStarter')) {
        return this._selectedDeckModelPlayer2;
      } else if (!this._selectingForPlayer2 && this._selectedDeckModelPlayer1 != null && this._selectedDeckModelPlayer1.get('isStarter')) {
        return this._selectedDeckModelPlayer1;
      }
    } else if (this.selectedDeckGroup === 'custom') {
      if (this._selectingForPlayer2 && this._selectedDeckModelPlayer2 != null && !this._selectedDeckModelPlayer2.get('isStarter')) {
        return this._selectedDeckModelPlayer2;
      } else if (!this._selectingForPlayer2 && this._selectedDeckModelPlayer1 != null && !this._selectedDeckModelPlayer1.get('isStarter')) {
        return this._selectedDeckModelPlayer1;
      }
    }
  },

  setSelectedDeck: function (selectedDeckModel) {
    if (selectedDeckModel != null) {
      var selected = false;
      if ((this._selectingForPlayer2 && this._selectedDeckModelPlayer2 !== selectedDeckModel) || this._selectedDeckModelPlayer1 === selectedDeckModel) {
        if (this._selectedDeckModelPlayer2 !== selectedDeckModel) {
          this._selectedDeckModelPlayer2 = selectedDeckModel;
          this._selectingForPlayer2 = false;
          selected = true;

          // store selected deck
          CONFIG.lastSelectedSandboxPlayer2DeckId = this._selectedDeckModelPlayer2.get('id');
        }
      } else if (this._selectedDeckModelPlayer1 !== selectedDeckModel || this._selectedDeckModelPlayer2 === selectedDeckModel) {
        this._selectedDeckModelPlayer1 = selectedDeckModel;
        this._selectingForPlayer2 = true;
        selected = true;

        // store selected deck
        CONFIG.lastSelectedSandboxPlayer1DeckId = this._selectedDeckModelPlayer1.get('id');
      }

      if (selected) {
        // play select sound
        audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_select.audio, CONFIG.SELECT_SFX_PRIORITY);

        // tag selected decks as active
        this._updateDecks();

        // emit select event
        this.trigger('select_deck', selectedDeckModel);
      }
    }
  },

  onConfirmSelection: function () {
    var selectedDeckModelPlayer1 = this._selectedDeckModelPlayer1;
    var selectedDeckModelPlayer2 = this._selectedDeckModelPlayer2;
    if (selectedDeckModelPlayer1 != null && selectedDeckModelPlayer2 != null) {
      audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_confirm.audio, CONFIG.CONFIRM_SFX_PRIORITY);
      var challengeType = this.model.get('developer') ? SDK.SandboxDeveloper.type : SDK.Sandbox.type;
      var challenge = SDK.ChallengeFactory.challengeForType(challengeType);
      challenge.setPlayer1DeckData(UtilsJavascript.deepCopy(selectedDeckModelPlayer1.get('cards')));
      challenge.setPlayer2DeckData(UtilsJavascript.deepCopy(selectedDeckModelPlayer2.get('cards')));
      var battleMapId = ProfileManager.getInstance().get('battle_map_id');
      if (battleMapId != null) {
        var cosmeticData = CosmeticsFactory.cosmeticForIdentifier(battleMapId);
        challenge.battleMapTemplateIndex = cosmeticData && cosmeticData.battleMapTemplateIndex;
      }
      EventBus.getInstance().trigger(EVENTS.start_challenge, challenge);
    } else {
      audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_error.audio, CONFIG.ERROR_SFX_PRIORITY);
      this._showSelectDeckWarningPopover(this.ui.$deckSelectConfirm, 'You must select 2 decks!');
    }
  },

  _updateDecks: function () {
    var selectedDeckModelPlayer1 = this._selectedDeckModelPlayer1;
    var selectedDeckModelPlayer2 = this._selectedDeckModelPlayer2;
    if (selectedDeckModelPlayer1 != null || selectedDeckModelPlayer2 != null) {
      var player1DeckId = selectedDeckModelPlayer1 && selectedDeckModelPlayer1.get('id');
      var player2DeckId = selectedDeckModelPlayer2 && selectedDeckModelPlayer2.get('id');

      // update decks based on currently selected decks
      this.children.each(function (view) {
        var model = view.model;
        var id = model.get('id');
        if ((player1DeckId != null && id === player1DeckId) && (player2DeckId != null && id === player2DeckId)) {
          view.$el.addClass('active player1 player2');
        } else if ((player1DeckId != null && id === player1DeckId)) {
          view.$el.removeClass('player2').addClass('active player1');
        } else if (player2DeckId != null && id === player2DeckId) {
          view.$el.removeClass('player1').addClass('active player2');
        } else {
          view.$el.removeClass('active player1 player2');
        }
      });
    }
  },

  /* endregion SELECTION */

});

// Expose the class either via CommonJS or the global object
module.exports = DeckSelectSandboxCompositeView;
